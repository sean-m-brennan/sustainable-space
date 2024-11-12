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

import React, {ReactElement, useContext, useRef} from "react"
import {Color, Euler, Vector2} from "three"
import {extend} from "@react-three/fiber"

import "./util/extDate"
import {OrbitalImages} from "./planetarium/orbital_data"
import {Planet} from "./components/Planet"
import {EarthConsts} from "./planetarium/constants"
import {SatelliteProps} from "./components/Satellite"
import {SpaceContext} from "./components/SpaceContext"
import {SurfaceParameters} from "./components/shaders/planet_material"
import {AtmosphereParameters, defaultAtmosphere} from "./components/shaders/atmosphere_material"
import {CloudParameters, defaultClouds} from "./components/shaders/cloud_material"
import {defaultHaze, HazeParameters} from "./components/shaders/haze_material"
import {getLightDirections} from "./planetarium/orrery"


import mapJanuary from './images/world.200401.3x2048x1024.jpg?url'
import mapFebruary from './images/world.200402.3x2048x1024.jpg?url'
import mapMarch from './images/world.200403.3x2048x1024.jpg?url'
import mapApril from './images/world.200404.3x2048x1024.jpg?url'
import mapMay from './images/world.200405.3x2048x1024.jpg?url'
import mapJune from './images/world.200406.3x2048x1024.jpg?url'
import mapJuly from './images/world.200407.3x2048x1024.jpg?url'
import mapAugust from './images/world.200408.3x2048x1024.jpg?url'
import mapSeptember from './images/world.200409.3x2048x1024.jpg?url'
import mapOctober from './images/world.200410.3x2048x1024.jpg?url'
import mapNovember from './images/world.200411.3x2048x1024.jpg?url'
import mapDecember from './images/world.200412.3x2048x1024.jpg?url'

import hiMapJanuary from './images/world.200401.3x5400x2700.jpg?url'
import hiMapFebruary from './images/world.200402.3x5400x2700.jpg?url'
import hiMapMarch from './images/world.200403.3x5400x2700.jpg?url'
import hiMapApril from './images/world.200404.3x5400x2700.jpg?url'
import hiMapMay from './images/world.200405.3x5400x2700.jpg?url'
import hiMapJune from './images/world.200406.3x5400x2700.jpg?url'
import hiMapJuly from './images/world.200407.3x5400x2700.jpg?url'
import hiMapAugust from './images/world.200408.3x5400x2700.jpg?url'
import hiMapSeptember from './images/world.200409.3x5400x2700.jpg?url'
import hiMapOctober from './images/world.200410.3x5400x2700.jpg?url'
import hiMapNovember from './images/world.200411.3x5400x2700.jpg?url'
import hiMapDecember from './images/world.200412.3x5400x2700.jpg?url'

import mapClouds from './images/earth_clouds_1024.png?url'
import mapClouds2 from './images/earth_clouds_2048.png?url'
import mapLights from './images/earth_lights_2400x1200.jpg?url'
import mapNormal from './images/8k_earth_normal_map.jpg?url'
import mapSpecular from './images/8081_earthspec4k.jpg?url'


export interface EarthProps {
    children?: ReactElement<SatelliteProps>
}

export function Earth(props: EarthProps) {
    const access = useContext(SpaceContext)
    const images: OrbitalImages = {  // monthly
        daytime: {
            low: [
                mapJanuary, mapFebruary, mapMarch, mapApril, mapMay, mapJune,
                mapJuly, mapAugust, mapSeptember, mapOctober, mapNovember, mapDecember
            ],
            high: [
                hiMapJanuary, hiMapFebruary, hiMapMarch, hiMapApril, hiMapMay, hiMapJune,
                hiMapJuly, hiMapAugust, hiMapSeptember, hiMapOctober, hiMapNovember, hiMapDecember
            ]
        },
        nighttime: mapLights,
        elevation: mapNormal,
        clouds: mapClouds2,
        specular: mapSpecular,
    }
    const surfParams: SurfaceParameters = {
        indexer: (datetime: Date)=> {
            return datetime.getMonth()  // 0 - 11
        },
        images: images,
        normalScale: new Vector2(0.5, 0.5),
        roughness: 1.0,
        metalness: 0.5, // 0.05,
        emissiveColor: new Color(0xffffff),
        emissiveIntensity: 0.4,
        highRes: true,
        lightDirections: getLightDirections(access.system),
    }
    const atmoParams: AtmosphereParameters = {
        ...defaultAtmosphere(access.system),
        enable: true,
        color: new Color(0x9999ff),
        coefficient: 2.5,
        power: 0.5,
        opacity: 0.4,
    }
    const cloudParams: CloudParameters = {
        ...defaultClouds,
        enable: true,
        image: images.clouds,
        shadows: true,
        transparent: true,
        speed: 50,  // FIXME
    }
    const hazeParams: HazeParameters = {
        ...defaultHaze,
        enable: true,
        color: new Color(0x9999cc),
        intensity: 2.5,
    }
    const rotation = useRef(new Euler(0, 0, 0))

    return Planet({...props, orbit: new EarthConsts(),
        surfParams: surfParams, atmoParams: atmoParams, cloudParams: cloudParams,
        hazeParams: hazeParams, rotation: rotation.current})
}

extend({Earth})
