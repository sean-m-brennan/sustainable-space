import {Vector3, Matrix4} from "three"
import { v4 as uuid4 } from 'uuid'

import {OrreryState} from "../orrery"
import {OrbitConsts} from "../planet/orbital_data"


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
    server = '127.0.0.1'
    port = 8000

    constructor(system = CoordSys.PLANETARY_ECLIPTIC) {
        this.system = system
    }

    planetAxis(planet: OrbitConsts) {
        if (this.system === CoordSys.PLANETARY_EQUATORIAL)
            return new Vector3(0, 0, 0)
        else
            return new Vector3(0, 0, planet.axialTilt)
    }

    equatorialToEcliptic(vect: Vector3, obliquity: number): Vector3 {
        return new Vector3(
            vect.x,
            vect.y * Math.cos(obliquity) - vect.z * Math.sin(obliquity),
            vect.y * Math.sin(obliquity) + vect.z * Math.cos(obliquity))
    }


    eclipticToEquatorial(vect: Vector3, obliquity: number): Vector3 {
        return new Vector3(
            vect.x,
            vect.y * Math.cos(obliquity) + vect.z * Math.sin(obliquity),
            -1.0 * vect.y * Math.sin(obliquity) +
            vect.z * Math.cos(obliquity))
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

        const greenwich_angle = angleBetweenVectors(system.sunStates[0].direction, X_AXIS.clone().multiplyScalar(-1))
        const cur_time = system.currentTime.getSecondsOfDay()
        const time_angle = 2 * Math.PI * (cur_time / (24 * 60 * 60))
        const initial_angle = greenwich_angle + time_angle
        return rotateVector(v, initial_angle, X_AXIS)
    }

    sphericalToCartesian(theta: number, phi: number, R: number){
        const x = R * Math.cos(phi) * Math.cos(theta)
        const y = R * Math.cos(phi) * Math.sin(theta)
        const z = R * Math.sin(phi)
        return [x, y, z]
    }

    async dataFromServer(id: string, url: string, setData: (data: any) => void,
                         isLoading: (on: boolean) => void, onError: (err: unknown) => void) {
        try {
            const response = await fetch(url)
            isLoading(true)
            try {
                const json = await response.json()
                if (json.id !== id)
                    onError(`Out-of-order messaging (expected ${id} get ${json.id}`)
                else if (json.error)
                    onError(json.error)
                else
                    setData(json)
                isLoading(false)
            } catch (error) {
                onError(error)
                console.error(error);  // FIXME remove
                console.debug(response);
            }
        } catch (error) {
            onError(error)
            console.error(error);  // FIXME remove
            console.debug(url);
        } finally {
            isLoading(false)
        }

    }

    async fixedToJ2000(datetime: Date, lat: number, lon: number, alt: number,
                       setCoords: (coords: Vector3) => void, isLoading: (on: boolean) => void,
                       onError: (err: unknown) => void) {
        const id = uuid4()
        let url = `https://${this.server}:${this.port}/convert`
        url += `?id=${id}&coords=[${lat},${lon},${alt}]&original=ITRF93&new=J2000&dt_str=${datetime}`
        const setData = (json: any) => {
            setCoords(json.coordinates)
        }
        await this.dataFromServer(id, url, setData, isLoading, onError)
    }

    async currentPosition(datetime: Date, objName: string,
                          setCoords: (coords: Vector3) => void, isLoading: (on: boolean) => void,
                          onError: (err: unknown) => void) {
        const id = uuid4()
        let url = `https://${this.server}:${this.port}/position`
        url += `?id=${id}&body=${objName}&dt_str=${datetime}`
        const setData = (json: any) => {
            setCoords(json.position)
        }
        await this.dataFromServer(id, url, setData, isLoading, onError)
    }
}
