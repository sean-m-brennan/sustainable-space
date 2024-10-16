import {RefObject} from "react"
import {Color, IUniform, Mesh, Texture, TextureLoader, UniformsUtils, Vector2, Vector3} from "three"
import { v4 as uuid4 } from 'uuid'

import {CoordSys, rotateVector, X_AXIS} from "../util/coordinates"
import {generateDataTexture} from "../util/textures"
import {ellipseCircumference, ellipticalOrbit} from "../util/elliptical"
import {PlanetShader} from "./planet_shader"
import {AtmosphereShader} from "./atmosphere/atmosphere_shader"


/*********************/
// Constants

export type ShaderUniforms = {[p: string]: IUniform}

export interface OrbitConstsParams {
    coordSys?: CoordSys  // equatorial, planet ecliptic, solar ecliptic
    vernalEquinox: number  // day of year
    atmosphere: boolean
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

export const randomName = (): string => {
    return `object-${uuid4()}`
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
        super({vernalEquinox: 1, atmosphere: randomBool()})
        if (!this.atmosphere) {
            this.atmosphereThickness = 0
            this.cloudHeight = 0
        }
    }
}

/*********************/
// Textures

export interface OrbitalImages {
    daytime: string[]
    nighttime?: string | undefined
    elevation?: string | undefined
    water?: string | undefined
    clouds?: string | undefined
}

export interface OrbitalTextures {
    surface: Texture[]
    nighttime?: Texture | undefined
    elevation?: Texture | undefined
    water?: Texture | undefined
    clouds?: Texture | undefined
}

export const loadTextures = (images: OrbitalImages | null) => {
    const textures: OrbitalTextures = { surface: [] }
    if (images === null) {
        textures.surface.push(generateDataTexture(2048, 1024, new Color('blue')))
        // FIXME generate random terrain instead
        return textures
    }
    const loader = new TextureLoader()
    for (const img of images.daytime)
        textures.surface.push(loader.load(img))
    if (images.nighttime)
        textures.nighttime = loader.load(images.nighttime)
    if (images.elevation)
        textures.elevation = loader.load(images.elevation)
    if (images.water)
            textures.water = loader.load(images.water)
        if (images.clouds)
            textures.clouds = loader.load(images.clouds)
    return textures
}

export type SeasonalIndex = (dateTime:Date) => number

/*********************/
// Uniforms

export interface SurfaceParameters {
    indexer: SeasonalIndex
    elevation?: boolean
    elevationScale?: Vector2
    diffuse?: boolean
    diffusionColor?: Color
    specular?: boolean
    specularColor?: Color
    specularShininess?: number
}

export const bareSurface: SurfaceParameters =  {elevation:true, diffuse:false, specular:false, indexer:(_)=>0}

export const createSurfaceUniforms = ({diffuse=false, elevation=false, specular=false, ...params}: SurfaceParameters,
                               textures: OrbitalTextures, datetime: Date): ShaderUniforms => {
    const dayTexture = textures.surface[params.indexer(datetime)]
    const uniforms = UniformsUtils.clone(PlanetShader.defaultUniforms)

    uniforms.dayTexture.value = dayTexture
    if (textures.nighttime !== undefined)
        uniforms.nightTexture.value = textures.nighttime

    if (elevation && textures.elevation !== undefined) {
        uniforms.elevTexture.value = textures.elevation
        uniforms.elevScale.value = params.elevationScale || new Vector2(0.85, 0.85)
    }

    if (diffuse) {  // atmospheric diffusion
        uniforms.diffuseTexture.value = dayTexture
        uniforms.diffuseColor.value = params.diffusionColor || new Color('#fff')
        uniforms.enableDiffuse.value = true
    } else
        uniforms.enableDiffuse.value = false

    if (specular && textures.water !== undefined) {  // reflections from liquids
        uniforms.specularTexture.value = textures.water
        uniforms.specularColor.value = params.specularColor || new Color(0x0a0d44)
        uniforms.specularShininess.value = params.specularShininess || 10
        uniforms.enableSpecular.value = true
    } else
        uniforms.enableSpecular.value = false

    return uniforms //updateLights(system.sunStates, uniforms)  // FIXME
}

export interface AtmosphereParameters {
    color: Color
    bloomPosition?: Vector3
    coefficients?: number
    power?: number
}

export const createAtmosphereUniforms = (params: AtmosphereParameters): ShaderUniforms => {
    const glowUniforms = UniformsUtils.clone(AtmosphereShader.defaultUniforms);
    glowUniforms["glowView"].value = params.bloomPosition || new Vector3(1, 1, 1)
    glowUniforms["glowColor"].value = params.color
    glowUniforms["glowCoefficient"].value = params.coefficients || 0.6
    glowUniforms["glowPower"].value = params.power || 5.0 //6.0
    return glowUniforms
}

/*********************/
// Base properties

export interface OrbitalProps {
    name?: string
    consts?: OrbitConsts
    images?: OrbitalImages | null
    surfParams?: SurfaceParameters
    atmoParams?: AtmosphereParameters
}

/*********************/
// Dynamics

export const changeSatellitePosition = (meshRefs: RefObject<Mesh>[], orbit: OrbitConsts,
                                         speed: number, travelled: number,
                                        hostOrbit: OrbitConsts, hostPosition: Vector3): [number, Vector3] => {
    let moved = travelled + 2 * Math.PI / orbit.orbitalPeriod * speed
    if (moved >= (2 * Math.PI))
        moved -= (2 * Math.PI)

    const newPos = ellipticalOrbit(orbit.semiMajorAxis,
        orbit.eccentricity, orbit.inclination, orbit.raan,
        hostPosition, X_AXIS, hostOrbit.eclipticRef, moved)

    meshRefs.forEach((meshRef) => {
        if (meshRef.current !== null)
            meshRef.current.position.set(newPos.x, newPos.y, newPos.z)
    })
    return [moved, newPos]
}

export const changeMeshRotation = (meshRef: RefObject<Mesh>, position: Vector3) => {
    if (meshRef.current !== null)
        meshRef.current.rotation.y = Math.PI - Math.atan2(position.z, position.x)
}
