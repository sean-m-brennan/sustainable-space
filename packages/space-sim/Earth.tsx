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
import {Color, Euler, Vector2} from "three"
import {extend} from "@react-three/fiber"

import "./util/extDate"
import {OrbitalImages} from "./planetarium/orbital_data"
import {Planet, PlanetChildren} from "./components/Planet"
import {EarthConsts} from "./planetarium/constants"
import {SpaceContext} from "./components/SpaceContext"
import {SurfaceParameters} from "./components/shaders/planet_material"
import {AtmosphereParameters, defaultAtmosphere} from "./components/shaders/atmosphere_material"
import {CloudParameters, defaultClouds} from "./components/shaders/cloud_material"
import {defaultHaze, HazeParameters} from "./components/shaders/haze_material"
import {getLightDirections} from "./planetarium/orrery"
import {imageFiles} from './images/files'


export interface EarthProps {
    children?: PlanetChildren
}

export function Earth(props: EarthProps) {
    const access = useContext(SpaceContext)
    const imgSrc = imageFiles.earthAlt
    const images: OrbitalImages = {  // monthly
        daytime: {
            low: imgSrc.small,
            high: imgSrc.large,
        },
        nighttime: imgSrc.night.large,
        elevation: imgSrc.normal,
        clouds: imgSrc.clouds,
        //clouds: mapClouds2,
        specular: imgSrc.specular,
    }
    const surfParams: SurfaceParameters = {
        indexer: (datetime: Date)=> {
            return datetime.getMonth()  // 0 - 11
        },
        images: images,
        normalScale: new Vector2(0.5, 0.5),
        roughness: 1.0,
        metalness: 0.5, // 0.05,
        emissiveColor: new Color(0xfffffa),
        emissiveIntensity: 0.6,
        highRes: true,  // always (no low-res images)
        lightDirections: getLightDirections(access.system),
        hasAtmosphere: true,
    }
    const atmoParams: AtmosphereParameters = {
        ...defaultAtmosphere(access.system),
        enable: true,
        color: new Color(0xaaaaff),
        coefficient: 1.8,
        power: 0.8,
        opacity: 0.4,
    }
    const cloudParams: CloudParameters = {
        ...defaultClouds,
        enable: true,
        image: images.clouds,  // images must have alpha channel
        shadows: true,
        transparent: true,
        speed: 50,  // FIXME
    }
    const hazeParams: HazeParameters = {
        ...defaultHaze,
        enable: true,
        color: new Color(0xfffff88), //(0x9999cc),
        intensity: 2.5,
    }
    const rotation = useRef(new Euler(0, 0, 0))

    return Planet({...props, orbit: new EarthConsts(),
        surfParams: surfParams, atmoParams: atmoParams, cloudParams: cloudParams,
        hazeParams: hazeParams, rotation: rotation.current})
}

extend({Earth})
