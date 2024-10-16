/*
  Copyright 2024 Sean M. Brennan and contributors

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

import React, {useContext, useRef} from "react"
import {useFrame,} from "@react-three/fiber"
import {Mesh, Vector3} from "three"

import {ellipseCircumference} from "./util/elliptical"
import {Satellite, SatelliteProps} from "./planet/satellite"
import {OrbitalImages, OrbitConsts, SurfaceParameters} from "./planet/orbital_data"
import {SpaceContext} from "./orrery"

import mapDay from './images/moon_2048.jpg?url'
import mapNight from './images/moon_dark_2048.jpg?url'
import mapNormal from './images/moon_elev_2048.jpg?url'


class MoonConsts extends OrbitConsts {
    //radius = 1737.10  // km
    radius = 100000
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
        super({vernalEquinox: 173, atmosphere: false})
    }
}

export declare type MoonProps = SatelliteProps

export function Moon({name="Moon", consts=new MoonConsts(), ...props}: MoonProps) {
    const {system} = useContext(SpaceContext)
    const images: OrbitalImages = {
        daytime: [mapDay],
        nighttime: mapNight,
        elevation: mapNormal,
    }
    const surfParams: SurfaceParameters = {
        indexer: (_: Date) => 0,
        elevation: false,  // FIXME
        // elevationScale
        diffuse: false,
        specular: false,
    }
    const surfaceMeshRef = useRef<Mesh>(null)
    const positionRef = useRef<Vector3>(new Vector3(2,0,0))

    useFrame(() => {
        if (!system.paused) {
            // FIXME
            //setUniforms(updateLights(system.sunStates, uniforms))
            // Note: satellite useFrame takes care of position

            // convert cartesian to polar coords plus initial turn for lunar face
            if (surfaceMeshRef.current && positionRef.current)
                surfaceMeshRef.current.rotation.y = Math.PI - Math.atan2(positionRef.current.z, positionRef.current.x)
        }
    })

    return Satellite({consts: new MoonConsts(), images: images,
        surfParams: surfParams, surfaceMeshRef: surfaceMeshRef, positionRef: positionRef,
        rotationOverride: true, ...props})
}
