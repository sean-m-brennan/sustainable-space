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

import {extend, MaterialNode} from "@react-three/fiber"
import {
    AdditiveBlending,
    BackSide,
    Color, GLSL1,
    GLSL3,
    MeshStandardMaterialParameters,
    ShaderMaterial,
    ShaderMaterialParameters,
    Vector3
} from "three"

import {getLightDirections, OrreryState} from "../../planetarium/orrery"
import {OrbitalMaterial} from "../../planetarium/orbital_data"

import vertexShader from "./atmosphere_vertex.glsl?raw"
import fragmentShader from "./atmosphere_fragment.glsl?raw"


export interface AtmosphereParameters {
    enable: boolean
    coefficient?: number
	power?: number
	color?: Color
    opacity?: number
    diffusion?: Vector3
    lightDirections: Vector3[]  // normalized
}


export const defaultAtmosphere = (system?: OrreryState): AtmosphereParameters => {
    return {
        enable: false,
        coefficient: 0.6,
        power: 6.0,
        color: new Color(0xffffff),
        opacity: 0.7,
        diffusion: new Vector3(0.222, 0.222, 0.0),
        lightDirections: getLightDirections(system)
    }
}

export type AtmosphereMaterialParameters = AtmosphereParameters | MeshStandardMaterialParameters

export class AtmosphereMaterial extends ShaderMaterial implements OrbitalMaterial {
    enabled: boolean

    constructor(params: AtmosphereParameters = defaultAtmosphere()) {
        const matParams = {} as ShaderMaterialParameters
        matParams.blending = AdditiveBlending
        matParams.side = BackSide

        const hasLight = params.lightDirections && params.lightDirections.length > 0
        matParams.uniforms = {
            enableAtmosphere: {value: params.enable && hasLight},
        }
        if (params.enable && hasLight) {
            matParams.uniforms.atmoCoefficient = {value: params.coefficient}
            matParams.uniforms.atmoPower = {value: params.power}
            matParams.uniforms.atmoColor = {value: params.color}
            matParams.uniforms.atmoOpacity = {value: params.opacity}
            matParams.uniforms.atmoDiffusion = {value: params.diffusion}
            matParams.uniforms.atmoLights = {value: params.lightDirections.length}
            if (params.lightDirections.length > 0) {
                const dir = params.lightDirections[0]  // FIXME
                console.log(`Atmo direction ${dir.x} ${dir.y} ${dir.z}`)
                matParams.uniforms.atmoLightDirection = {value: params.lightDirections[0]}

                matParams.uniforms.atmoLightDirections = {value: params.lightDirections}
            }
        }
        //matParams.depthTest = false
        //matParams.depthWrite = false
        matParams.vertexShader = vertexShader
        matParams.fragmentShader = fragmentShader
        super(matParams)
        this.enabled = params.enable
    }

    update(_delta: number, _state: OrreryState, _position?: Vector3) {
        // nothing
        // FIXME update directions?
    }
}

export declare type AtmosphereMaterialProps = MaterialNode<AtmosphereMaterial, [AtmosphereMaterialParameters]>

extend({AtmosphereMaterial})
