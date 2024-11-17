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

import React, {useContext, useEffect, useRef} from "react"
import {useFrame,} from "@react-three/fiber"
import {Color, Mesh, Vector2, Vector3} from "three"

import {Satellite} from "./components/Satellite"
import {OrbitalImages} from "./planetarium/orbital_data"
import {SpaceContext} from "./components/SpaceContext"
import {MoonConsts} from "./planetarium/constants"
import {bareSurface, SurfaceParameters} from "./components/shaders/planet_material.tsx"
import {imageFiles} from './images/files'


export interface MoonProps {
    planetIdx?: number
}

export function Moon(props: MoonProps) {
    const access = useContext(SpaceContext)
    const images: OrbitalImages = {
        daytime: {low: [imageFiles.moon.small], high: [imageFiles.moon.large]},
        nighttime: imageFiles.moon.night,
        //elevation: imageFiles.moon.normal,  // FIXME faulty
    }
    const surfParams = {
        ...bareSurface(access.system),
        images: images,
        highRes: false,
        normalScale: new Vector2(0.0001, 0.0001), // FIXME
        emissiveColor: new Color(0xffffff),
        emissiveIntensity: 0.8,  // stronger intensity from no atmosphere
    } as SurfaceParameters
    const surfaceMeshRef = useRef<Mesh>(null)
    const positionRef = useRef<Vector3>(new Vector3(4,0,4))

    useFrame(() => {
        if (!access.system.flux.paused) {
            // FIXME
            //setUniforms(updateLights(system.sunStates, uniforms))
            // Note: satellite useFrame takes care of position

            // convert cartesian to polar coords plus initial turn for lunar face
            if (surfaceMeshRef.current && positionRef.current)
                surfaceMeshRef.current.rotation.y = Math.PI - Math.atan2(positionRef.current.z, positionRef.current.x)
        }
    })
    const orbit = new MoonConsts()
    console.log(`Moon of size ${orbit.radius}`)
    return Satellite({...props, orbit: orbit, position: positionRef.current,
        surfParams: surfParams, surfaceMeshRef: surfaceMeshRef, rotationOverride: true})
}
