import {Vector3} from 'three'

import {angleBetweenVectors, array2vector, rotateVector, X_AXIS, Y_AXIS, Z_AXIS} from './coordinates.ts'
import {OrbitConsts} from "../planetarium/orbital_data.ts"
import {PlanetState} from "../planetarium/planet.ts"


export const ellipseCircumference = (a: number, e: number): number => {
    const b = a * Math.sqrt(1 - e * e)
    let x = Math.max(a, b)
    let y = Math.min(a, b)
    const digits = 53
    const tol = Math.sqrt(Math.pow(0.5, digits))
    if (digits * y < tol * x)
        return 4 * x
    let s = 0
    let m = 1
    while (x - y > tol * y) {
        x = 0.5 * (x + y)
        y = Math.sqrt(x * y)
        m *= 2
        s += m * Math.pow(x - y, 2)
    }
    return Math.PI * (Math.pow(a + b, 2) - s) / (x + y)
}

type ArrayVector = Vector3 | [number, number, number]

export const ellipticalOrbit = (a: number, ecc: number, incl: number, raan: number,
                                center: ArrayVector, refX: ArrayVector, refZ: ArrayVector, t: number) => {
    const centerV = array2vector(center)
    const refXv = array2vector(refX).normalize()
    const refZv = array2vector(refZ).normalize()

    // semi-minor axis
    const b = a * Math.sqrt(1 - ecc * ecc)

    // compute ellipse step
    let ellipse = new Vector3(0, 0, 0)
    ellipse.x = centerV.x + b * Math.sin(t)
    ellipse.z = centerV.z + a * Math.cos(t)

    // rotate about y-axis to get new x-axis relative to world axes
    const phi = angleBetweenVectors(rotateVector(refXv, raan, Y_AXIS), X_AXIS)
    ellipse = rotateVector(ellipse, phi, Y_AXIS)

    // rotate about x axis to get new z axis relative to world axes
    const theta = angleBetweenVectors(rotateVector(refZv, incl, X_AXIS), Z_AXIS)
    return rotateVector(ellipse, theta, X_AXIS)
}

export const ellipticalPropagation = (data: PlanetState, hostSpeed: number, speed: number, center: ArrayVector, refDir: ArrayVector, refAngle: ArrayVector) => {
    const obj = {...data}  // copy
    const orbit = obj.orbit as OrbitConsts
    obj.flux.travelled += speed * (hostSpeed / (2 * Math.PI)) * 100.0
    if (obj.flux.travelled >= (2 * Math.PI))
        obj.flux.travelled -= (2 * Math.PI)

    obj.flux.position = ellipticalOrbit(orbit.semiMajorAxis, orbit.eccentricity,
        orbit.inclination, orbit.raan, center, refDir, refAngle,
        obj.flux.travelled)

    return obj
}

export function distance(v1: Vector3, v2: Vector3 = new Vector3(0, 0, 0)): number {
    const xDiff = v1.x - v2.x
    const yDiff = v1.y - v2.y
    const zDiff = v1.z - v2.z
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff + zDiff * zDiff)
}

export function distancesSum(a: [Vector3, Vector3]): number {
    let dist = 0
    for (let i = 1; i < a.length; i++)
        dist += distance(a[i - 1], a[i])
    return dist
}

export function dotProduct(a: number[], b: number[]) {
    return a.reduce((acc, n, i) => acc + (n * b[i]), 0)
}


export function boxMuller(): [number, number] {
    const u1 = Math.random()
    const u2 = Math.random()

    const x1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    const x2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2)

    return [x1, x2]
}

export function marsaglia(): [number, number] {
    let x1, x2 = 0
    let r
    do {
        x1 = Math.random() * 2 - 1
        x2 = Math.random() * 2 - 1
        r = x1 * x1 + x2 * x2
    } while (r === 0 || r >= 1)

    const c = Math.sqrt(-2 * Math.log(r) / r)
    x1 *= c
    x2 *= c

    return [x1, x2]
}
