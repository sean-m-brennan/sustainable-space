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

import React, {RefObject, useContext, useEffect, useMemo, useState} from "react"
import {useFrame} from "@react-three/fiber"
import {
    Euler,
    Mesh,
    SphereGeometry,
    Vector2,
    Vector3
} from "three"

import {OrbitConsts} from "../planetarium/orbital_data"
import {SpaceContext} from "./SpaceContext"
import {PlanetMaterial, SurfaceParameters} from "./shaders/planet_material"
import {AtmosphereParameters} from "./shaders/atmosphere_material"
import {CloudParameters} from "./shaders/cloud_material"
import {HazeParameters} from "./shaders/haze_material"


/*********************/
// Base properties

export interface OrbitalProps {
    orbit?: OrbitConsts
    surfParams?: SurfaceParameters
    atmoParams?: AtmosphereParameters
    cloudParams?: CloudParameters
    hazeParams?: HazeParameters
    position?: Vector3
    rotation?: Euler
}

/*********************/

export interface OrbitalSurfaceProps {
    surface: SurfaceParameters

    surfaceSize: number
    segmentSize: Vector2

    surfaceRef: RefObject<Mesh>

    position?: Vector3
    rotation?: Euler
}

export const OrbitalSurface = (props: OrbitalSurfaceProps) => {
    const access = useContext(SpaceContext)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const geometry = useMemo(() => new SphereGeometry(props.surfaceSize, props.segmentSize.x, props.segmentSize.y), [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
    //const material = useMemo(() => new PlanetMaterial(props.surface), [])
    const [material] = useState(new PlanetMaterial(props.surface))

    useFrame((_, delta: number) => {
        material.update(delta, access.system, props.position)
        // FIXME does position track?
        // FIXME orbital rotation
    })

    return (
        <>
            <mesh ref={props.surfaceRef}
                  geometry={geometry} material={material}
                  castShadow={true} receiveShadow={true}
                  position={props.position} rotation={props.rotation}/>
        </>
    )
}