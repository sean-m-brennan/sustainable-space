import {Vector3, Matrix4, Matrix3, Euler, EulerOrder} from "three"


import {OrreryState} from "../planetarium/orrery_impl.ts"
import {OrbitConsts} from "../planetarium/orbital_data.ts"


export const rotateVector = (vect: Vector3, angle: number, axis: Vector3) => {
    const newVect = vect.clone()
    const matrix = new Matrix4()
    matrix.makeRotationAxis(axis, angle)
    newVect.applyMatrix4(matrix)
    return newVect
}

export const angleBetweenVectors = (v1: Vector3, v2: Vector3) => {
    return Math.acos(v2.dot(v1) / v1.length() / v2.length())
}

export const array2vector = (a: [number, number, number] | Vector3): Vector3 => {
    if (a instanceof Vector3)
        return a
    return new Vector3(a[0], a[1], a[2])
}

export const vector2array = (a: Vector3 | [number, number, number]): [number, number, number] => {
    if (a instanceof Vector3)
        return [a.x, a.y, a.z]
    return a
}

export const euler2array = (a: Euler | [number, number, number, EulerOrder]): [number, number, number, EulerOrder] => {
    if (a instanceof Euler)
        return [a.x, a.y, a.z, a.order]
    return a
}

export const X_AXIS = new Vector3(1, 0, 0)
export const Y_AXIS = new Vector3(0, 1, 0)
export const Z_AXIS = new Vector3(0, 0, 1)


export enum CoordSys {
    PLANETARY_EQUATORIAL = 0,
    PLANETARY_ECLIPTIC = 1,
    SOLAR_ECLIPTIC = 2
}

export class Coordinates {
    ellipsoid = true
    system: CoordSys

    constructor(system = CoordSys.PLANETARY_ECLIPTIC) {
        this.system = system
    }

    planetAxis(planet: OrbitConsts) {
        if (this.system === CoordSys.PLANETARY_EQUATORIAL)
            return new Vector3(0, 0, 0)
        else
            return new Vector3(0, 0, planet.axialTilt)
    }

    geodeticToEci(system: OrreryState, planet: OrbitConsts, lat: number, lon: number, alt: number, scale: number = 1.0): Vector3 {
        if (typeof scale === 'undefined')
            scale = 1.0
        const ecc = planet.eccentricity
        const a = planet.semiMajorAxis
        const sinTheta = Math.sin(lat)
        let R, polar
        if (this.ellipsoid) {
            R = (a / Math.sqrt(1.0 - ecc * ecc * sinTheta * sinTheta)) + alt
            polar = R * (1.0 - ecc * ecc)
        } else {
            R = planet.radius + alt
            polar = R
        }

        /* NOTE: Geodetic z axis == three.js y-axis */
        const v = new Vector3(
            R * Math.cos(lat) * Math.cos(lon),
            -1.0 * polar * Math.sin(lat),
            R * Math.cos(lat) * Math.sin(lon)
        )
        v.multiplyScalar(1.0 / (scale * Math.PI))  /* with correction */

        if (!system.flux.sunStates[0])
            throw new Error('No suns in the system!')
        if (!system.flux.sunStates[0].flux.position)
            throw new Error('Primary sun has no position')
        const greenwich_angle = angleBetweenVectors(array2vector(system.flux.sunStates[0].flux.position), X_AXIS.clone().multiplyScalar(-1))
        const cur_time = system.flux.currentTime.getSecondsOfDay()
        const time_angle = 2 * Math.PI * (cur_time / (24 * 60 * 60))
        const initial_angle = greenwich_angle + time_angle
        return rotateVector(v, initial_angle, X_AXIS)
    }
}

export function equatorialToEcliptic(vect: Vector3, obliquity: number): Vector3 {
    return new Vector3(
        vect.x,
        vect.y * Math.cos(obliquity) - vect.z * Math.sin(obliquity),
        vect.y * Math.sin(obliquity) + vect.z * Math.cos(obliquity))
}


export function eclipticToEquatorial(vect: Vector3, obliquity: number): Vector3 {
    return new Vector3(
        vect.x,
        vect.y * Math.cos(obliquity) + vect.z * Math.sin(obliquity),
        -1.0 * vect.y * Math.sin(obliquity) +
        vect.z * Math.cos(obliquity))
}

export function sphericalToCartesian(theta: number, phi: number, rho: number): [number, number, number] {
    // theta - longitude, phi - latitude
    const x = rho * Math.cos(phi) * Math.cos(theta)
    const y = rho * Math.cos(phi) * Math.sin(theta)
    const z = rho * Math.sin(phi)
    return [x, y, z]
}

export function j2kToThreeJs(x: number, y: number, z: number, scale: number): Vector3 {
    // J2k is Z-up, 3js is Y-up
    const coords = new Vector3(x, z, y)
    //coords.multiplyScalar(1.0/scale)
    coords.divideScalar(scale)
    return coords
}

export function equatorialToGalactic(coords: Vector3): Vector3 {
    const galacticTransform = new Matrix3(
        -0.054876, -0.873437, -0.483835,
        +0.494109, -0.444830, +0.746982,
        -0.867666, -0.198076, +0.455984
    )
    return coords.applyMatrix3(galacticTransform)
}

