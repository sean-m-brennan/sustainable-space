import {ObjectName, OrbitConsts} from "./orbital_data.ts"
import {ellipseCircumference} from "../util/elliptical.ts"
import {SunConstants} from "./sun.ts"

export const starmapSize = 10_000_000

export class EarthConsts extends OrbitConsts {
    radius = 6371.0  // km (avg)
    /*
    siderealDay  = 86164.0905  // seconds
    daysPerYear = 364.24219647
    */
    siderealDay  = 24 * 60 * 60  // faking due to datetime clock
    daysPerYear = 364.25

    orbitalPeriod = 31558149.504000004  // seconds
    semiMajorAxis = 149597885.651  // km
    eccentricity = 0.01671022
    raan = 6.08665006318  // radians
    inclination = 0.0  // radians from ecliptic


    axialTilt = 0.408  // radians
    orbitalTilt = 0.408407  // radians relative to the ecliptic
    orbitalSpeed = 29.78  // km/sec

    cloudHeight = 8.0  // too close will create artifacts
    cloudSpeed = 1.5  // relative to ground
    atmosphereThickness = 500.0  // km

    constructor() {
        super({name: ObjectName("Earth"), vernalEquinox: 173, atmosphere: true})
    }
}

export class MoonConsts extends OrbitConsts {
    radius = 1737.10  // km
    siderealDay = 10667.422902652  // seconds
    daysPerYear = 354  // lunation cycle
    axialTilt = 0.026  // radians
    orbitalTilt = 0.08988446  // radians relative to ecliptic

    semiMajorAxis = 384748.0  // km
    eccentricity = 0.0549006
    raan = 2.1831  // radians, changes due to precession (18yrs)
    inclination = 0.0897099236  // radians from *ecliptic*
    orbitalPeriod = 2360594.88  // seconds

    orbitDistance = ellipseCircumference(this.semiMajorAxis, this.eccentricity)  // km
    orbitalSpeed = this.orbitDistance / this.orbitalPeriod  // km/s
    // FIXME
    //override rotationSpeed = this.orbitalSpeed  // tidal lock
    //revolutionSpeed = 1

    atmosphereThickness = 0
    cloudHeight = 0

    constructor() {
        super({name: ObjectName("Moon"), vernalEquinox: 173, atmosphere: false})
    }
}

export const solConsts: SunConstants = {
	name: ObjectName('Sun'),
	primary: true,
	radius: 695700,
	distance: 149597870,
	magnitude: 1.0,
	temperature: 5800,
	eclipticRef: (new EarthConsts()).eclipticRef
}
