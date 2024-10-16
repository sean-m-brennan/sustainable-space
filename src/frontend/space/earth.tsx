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

import React, {useContext} from "react"
import {Color} from "three"
import {extend} from "@react-three/fiber"

import {Planet, PlanetProps} from "./planet/planet"
import {AtmosphereParameters, OrbitalImages, OrbitConsts, SurfaceParameters} from "./planet/orbital_data"

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
import mapClouds from './images/earth_clouds_2048.png?url'
import mapLights from './images/earth_lights_2048.jpg?url'
import mapNormal from './images/earth_normal_2048.jpg?url'
import mapSpecular from './images/earth_specular_2048.jpg?url'
import {SpaceContext} from "./orrery.tsx";


class EarthConsts extends OrbitConsts {
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
        super({vernalEquinox: 173, atmosphere: true})
    }
}

export declare type EarthProps = PlanetProps

export function Earth(props: EarthProps) {
    const {system} = useContext(SpaceContext)
    const images: OrbitalImages = {  // monthly
        daytime: [
            mapJanuary, mapFebruary, mapMarch, mapApril, mapMay, mapJune,
            mapJuly, mapAugust, mapSeptember, mapOctober, mapNovember, mapDecember
        ],
        nighttime: mapLights,
        elevation: mapNormal,
        clouds: mapClouds,
        water: mapSpecular,
    }
    const surfParams: SurfaceParameters = {
        indexer: (datetime: Date)=> {
            return datetime.getMonth() - 1
        },
        diffuse: false,
        elevation: false,
        specular: false,
        specularColor: new Color(0x0a0d44),
        specularShininess: 10,
    }
    const atmoParams: AtmosphereParameters = {
        color: new Color(0x8888ff)
    }
    return Planet({name: 'Earth', consts: new EarthConsts(),
        images: images, surfParams: surfParams, ...props})
    //surfParams: surfParams, atmoParams: atmoParams, ...props})  // FIXME
}

extend({Earth})
