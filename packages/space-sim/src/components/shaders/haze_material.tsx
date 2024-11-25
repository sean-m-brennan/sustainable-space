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
    Color,
    MeshLambertMaterial,
    MeshLambertMaterialParameters,
    Vector3,
    WebGLProgramParametersWithUniforms
} from "three"

import {OrreryState} from "../../planetarium/orrery_impl.ts"
import {OrbitalMaterial} from "../../planetarium/orbital_data.ts"


export interface HazeParameters {
    enable: boolean
    color: Color
    intensity: number
}

export const defaultHaze = {
    enable: false,
    color: new Color(0x909090),
    intensity: 1,
} as HazeParameters

export type HazeMaterialParameters = HazeParameters

export class HazeMaterial extends MeshLambertMaterial implements OrbitalMaterial {
    enabled: boolean

    constructor(params: HazeParameters) {
        const matParams = {transparent: false} as MeshLambertMaterialParameters
        matParams.blending = AdditiveBlending
        matParams.depthWrite = false
        super(matParams)
        this.enabled = params.enable

        this.onBeforeCompile = function (shader: WebGLProgramParametersWithUniforms) {
            shader.uniforms.enableHaze = {value: params.enable}
            if (params.enable) {
                console.log("Haze enabled")
                shader.uniforms.hazeColor = {value: params.color}
                shader.uniforms.hazeIntensity = {value: params.intensity}
            }

            shader.vertexShader = shader.vertexShader.replace(
                '#include <common>',
                // language=glsl
                `#include <common>

                varying vec3 vNormel;
                varying vec3 eyeVector;
                `)

            shader.vertexShader = shader.vertexShader.replace(
                '#include <fog_vertex>',
                // language=glsl prefix="void main() {" suffix="}"
                `#include <fog_vertex>

                    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
                    vNormel = normalize(normalMatrix * normal);
                    eyeVector = normalize(mvPos.xyz);
                    gl_Position = projectionMatrix * mvPos;
                `)

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <common>',
                // language=glsl
                `#include <common>
                uniform bool enableHaze;
                uniform float hazeIntensity;
                uniform vec3 hazeColor;
                
                varying vec3 vNormel;
                varying vec3 eyeVector;
                `)

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <emissivemap_fragment>',
                // language=glsl prefix="void main() {" suffix="}"
                `
                #include <emissivemap_fragment>
                // atmospheric diffusion with fresnel across the body on lit side
                if (enableHaze) {
                    float intensity = hazeIntensity * dot( normal, eyeVector );
                    diffuseColor += vec4(hazeColor, 1.0) * clamp(intensity, -1.0, 1.0);
                }
                `)

            this.userData.shader = shader  // save for access later
        }
    }

    update(_delta: number, _state: OrreryState, _?: Vector3) {
        // static, do nothing
    }
}

export declare type HazeMaterialProps = MaterialNode<HazeMaterial, [HazeMaterialParameters]>

extend({HazeMaterial})
