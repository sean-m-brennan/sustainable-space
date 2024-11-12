import {RefObject} from "react"
import {Color, IUniform, Mesh, Texture, TextureLoader, Vector3} from "three"
import { v4 as uuid4 } from 'uuid'

import "../util/extDate.ts"
import {CoordSys, rotateVector, X_AXIS} from "../util/coordinates"
import {generateDataTexture} from "../util/textures"
import {ellipseCircumference, ellipticalOrbit} from "../util/elliptical"
import {OrreryState} from "./orrery"
import {SunState} from "./sun"


/*********************/
// Constants

export type ShaderUniforms = {[p: string]: IUniform}  // FIXME

declare const __brand: unique symbol
type Branded<T, B> = T & { [__brand]: B }
export type ObjectName  = Branded<string, 'ObjectName'>

const objectNameSize = 46
//export const isObjectName = (str: string): str is ObjectName => str.length >= 1 && str.length <= objectNameSize
export const ObjectName = (str: string): ObjectName => {
    if (str.length > objectNameSize)
        throw new Error(`ObjectNames cannot exceed length ${objectNameSize}, given ${str} of length ${str.length}`)
    return str as ObjectName
}

export interface OrbitConstsParams {
    name: ObjectName
    coordSys?: CoordSys  // equatorial, planet ecliptic, solar ecliptic
    vernalEquinox: number  // day of year
    atmosphere?: boolean
}

export abstract class OrbitConsts {
    abstract radius: number  // km
    abstract siderealDay: number  // seconds
    abstract daysPerYear: number  // sidereal days per revolution
    abstract axialTilt: number  // degrees
    abstract orbitalTilt: number  // degrees
    abstract semiMajorAxis: number  // km
    abstract eccentricity: number  // dimensionless
    abstract raan: number  // radians; right ascension of the ascending node
    abstract inclination: number  // radians
    abstract orbitalPeriod: number  // seconds
    abstract orbitalSpeed: number  // km/sec
    abstract atmosphereThickness: number  // km
    abstract cloudHeight: number  // km
    name: ObjectName
    coordSys: CoordSys
    vernalEquinox: number
    eclipticRef: Vector3  // zero point of ecliptic longitude
    atmosphere: boolean

    get circumference() {  // km
        return 2 * Math.PI * this.radius
    }

    get rotationSpeed() { // km/sec
        return this.circumference / this.siderealDay
    }

    get revolutionSpeed(): number {  // km/sec
        return ellipseCircumference(this.semiMajorAxis, this.eccentricity) / this.orbitalPeriod
    }

    constructor({coordSys = CoordSys.PLANETARY_ECLIPTIC, atmosphere = false, ...params}: OrbitConstsParams) {
        this.name = params.name
        this.coordSys = coordSys
        this.vernalEquinox = params.vernalEquinox
        this.eclipticRef = this.solarPosition(this.vernalEquinox)
        this.atmosphere = atmosphere
    }

    solarPosition(dayOfYear: number): Vector3 {
        if (this.coordSys.valueOf() == CoordSys.SOLAR_ECLIPTIC.valueOf())
            return new Vector3(0, 0, 0);
        else {
            const ratio = ((dayOfYear / this.daysPerYear) * 2 * Math.PI) + this.orbitalTilt;
            const ecc = this.eccentricity;
            const a = this.semiMajorAxis;
            const b = this.semiMajorAxis * Math.sqrt(1 - ecc * ecc);

            let ellipse = new Vector3(0, 0, 0);
            ellipse.x = b * Math.sin(ratio);
            ellipse.z = a * Math.cos(ratio);

            if (this.coordSys.valueOf() === CoordSys.PLANETARY_EQUATORIAL.valueOf())
                ellipse = rotateVector(ellipse, this.axialTilt, X_AXIS);
            return ellipse;
        }
    }
}

export const randomInt = (min: number, max: number): number => { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export const randomFloat= (min: number, max: number): number => {
    return parseFloat((Math.random() * (max - min) + min).toFixed(4))
}

export const randomBool= (): boolean => {
    return Math.random() > 0.5
}

export const randomName = (): ObjectName => {
    return ObjectName(`object-${uuid4()}`)
}

export class RandomOrbitConsts extends OrbitConsts {
    axialTilt = randomFloat(0.0, 2.0 * Math.PI)
    daysPerYear = randomInt(30, 30000)
    eccentricity = randomFloat(0.0, 2.0 * Math.PI)
    inclination = randomFloat(0.0, 2.0 * Math.PI)
    orbitalPeriod = randomInt(10000000, 10000000000)
    orbitalSpeed = randomFloat(2, 200)
    orbitalTilt = randomFloat(0.0, 2.0 * Math.PI)
    raan = randomFloat(0.0, 2.0 * Math.PI)
    radius = randomInt(2500, 50000)
    semiMajorAxis = randomInt(5000000, 5000000000)
    siderealDay = randomInt(12 * 60 * 60, 1000 * 60 * 60)
    atmosphereThickness = randomInt(2000, 200000)
    cloudHeight = randomInt(1000, 70000)

    constructor() {
        super({name: randomName(), vernalEquinox: 1, atmosphere: randomBool()})
        if (!this.atmosphere) {
            this.atmosphereThickness = 0
            this.cloudHeight = 0
        }
    }
}

export const randomSunConsts = () => {
	return {name: randomName(), primary: false, radius: randomInt(1000, 2_000_000_000),
		distance: randomInt(1_000_000, 5_000_000_000_000_000),
		magnitude: 0.5, temperature: randomInt(2000, 50000),
		eclipticRef: new Vector3(randomFloat(0, 2 * Math.PI), randomFloat(0, 2 * Math.PI), randomFloat(0, 2 * Math.PI))}
}


/*********************/
// Textures

export interface OrbitalMaterial {
    update: (delta: number, state: OrreryState, position?: Vector3) => void
}

export interface OrbitalImages {
    daytime: { low: string[], high?: string[] }
    nighttime?: string | undefined
    clouds?: string | undefined
    elevation?: string | undefined
    specular?: string | undefined
}

export interface OrbitalTextures {
    surface: Texture
    nighttime?: Texture | undefined
    clouds?: Texture | undefined
    elevation?: Texture | undefined
    specular?: Texture | undefined
}

export const reloadTexture = (images: OrbitalImages | null, highRes: boolean,
                              index: number, loader: TextureLoader | null = null): Texture => {
    if (images === null) {
        // FIXME generate random terrain instead
        return generateDataTexture(2048, 1024, new Color('blue')) as Texture
    }
    if (loader === null)
        loader = new TextureLoader()
    if (highRes && images.daytime.high)
        return loader.load(images.daytime.high[index])
    return loader.load(images.daytime.low[index])
}

export const loadTextures = (images: OrbitalImages | null, highRes: boolean = true) => {
    const textures = { surface: {} } as OrbitalTextures
    const loader = new TextureLoader()

    textures.surface = reloadTexture(images, highRes, 0, loader)
    if (images === null)
        return textures

    if (images.nighttime)
        textures.nighttime = loader.load(images.nighttime)
    if (images.elevation)
        textures.elevation = loader.load(images.elevation)
    if (images.clouds)
        textures.clouds = loader.load(images.clouds)
    if (images.specular)
        textures.specular = loader.load(images.specular)
    return textures
}

/*********************/
// Dynamics

export const changeSunPosition = (datetime: Date, sun: SunState, origin: OrbitConsts) => {
    const doy = datetime.getFracDayOfYear()
    const pointer = origin.solarPosition(doy)
    const direction = pointer.clone().normalize()
    return direction.multiplyScalar(sun.orbit.distance)
}

export const changeOrbiterPosition = (orbit: OrbitConsts,
                                      speed: number, travelled: number,
                                      eclipticRef: Vector3, hostPosition: Vector3): [number, Vector3] => {
    let moved = travelled + 2 * Math.PI / orbit.orbitalPeriod * speed
    if (moved >= (2 * Math.PI))
        moved -= (2 * Math.PI)

    const newPos = ellipticalOrbit(orbit.semiMajorAxis,
        orbit.eccentricity, orbit.inclination, orbit.raan,
        hostPosition, X_AXIS, eclipticRef, moved)
    // FIXME getting NaN
    return [moved, newPos]
}

export const changeOrbitalRotation = (meshRef: RefObject<Mesh>, position: Vector3) => {
    if (meshRef.current !== null)
        meshRef.current.rotation.y = Math.PI - Math.atan2(position.z, position.x)  // FIXME speed and no mesh
}
