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

import {Satellite} from "./components/Satellite"
import {OrbitalImages} from "./planetarium/orbital_data"
import {SpaceContext} from "./components/SpaceContext"
import {MoonConsts} from "./planetarium/constants"
import {bareSurface, SurfaceParameters} from "./components/shaders/planet_material.tsx"

import mapDay from './images/moon_lroc_color_poles_4k.png?url'
import hiMapDay from './images/moon_lroc_color_poles_8k.png?url'
import mapNight from './images/moon_dark_2048.jpg?url'  // FIXME modify with lights
import mapNormal from './images/moon_ldem_3_8bit.jpg?url'


export interface MoonProps {
    planetIdx?: number
}

export function Moon(props: MoonProps) {
    const access = useContext(SpaceContext)
    const images: OrbitalImages = {
        daytime: {low: [mapDay], high: [hiMapDay]},
        nighttime: mapNight,
        //elevation: mapNormal,  // FIXME faulty
    }
    const surfParams = {
        ...bareSurface(access.system),
        images: images,
        // elevationScale // FIXME
    } as SurfaceParameters
    const surfaceMeshRef = useRef<Mesh>(null)
    const positionRef = useRef<Vector3>(new Vector3(2,0,2))

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
