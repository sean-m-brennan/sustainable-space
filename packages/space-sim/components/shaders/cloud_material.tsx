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
    RepeatWrapping,
    SRGBColorSpace,
    Texture,
    TextureLoader,
    Vector3,
    WebGLProgramParametersWithUniforms
} from "three"

import {generateDataTexture} from "../../util/textures.ts"
import {OrreryState} from "../../planetarium/orrery.ts"
import {OrbitalMaterial} from "../../planetarium/orbital_data.ts"


export interface CloudParameters {
    enable: boolean
    transparent: boolean
    shadows: boolean
    image?: string
    texture?: Texture
    speed: number
    enableDiffuse: boolean
    diffuseColor: Color
    diffuseIntensity: number
}

export const defaultClouds = {
    enable: false,
    transparent: true,
    shadows: false,
    speed: 0,
    enableDiffuse: false,
    diffuseColor: new Color(0x909090),
    diffuseIntensity: 1,
} as CloudParameters

export type CloudMaterialParameters = CloudParameters

export class CloudMaterial extends MeshLambertMaterial implements OrbitalMaterial {
    speed: number
    enabled: boolean

    constructor(params: CloudParameters) {
        const matParams = {transparent: params.transparent} as MeshLambertMaterialParameters
        if (params.enable) {
            const loader = new TextureLoader()
            let texture = params.texture
            if (!texture) {
                if (params.image)
                    texture = loader.load(params.image)
                else
                    texture = generateDataTexture(2048, 1024, new Color('white'))
                // TODO *research* perlin noise for procedural clouds
            }
            texture.colorSpace = SRGBColorSpace
            matParams.map = texture
            matParams.transparent = params.transparent
            if (params.transparent)
                matParams.blending = AdditiveBlending
        }
        super(matParams)
        this.enabled = params.enable
        this.speed = params.speed

        this.onBeforeCompile = function (shader: WebGLProgramParametersWithUniforms) {
            const computeShadows = params.enable && params.shadows
            if (computeShadows) {
                const texture = {...matParams.map}
                texture.wrapS = RepeatWrapping
                shader.uniforms.tClouds = {value: texture}
                shader.uniforms.uv_xOffset = {value: 0}
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
                uniform sampler2D tClouds;
                uniform float uv_xOffset;
                #define USE_CLOUD_SHADOWS ${computeShadows ? 1: 0}
                
                varying vec3 vNormel;
                varying vec3 eyeVector;
                `)

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <emissivemap_fragment>',
                // language=glsl prefix="void main() {" suffix="}"
                `
                #include <emissivemap_fragment>
                #if USE_CLOUD_SHADOWS
                    // FIXME confirm
                    // Methodology explanation:
                    //
                    // Our goal here is to use a “negative light map” approach to cast cloud shadows,
                    // the idea is on any uv point on earth map(Point X),
                    // we find the corresponding uv point(Point Y) on clouds map that is directly above Point X,
                    // then we extract color value at Point Y.
                    // We then darken the color value at Point X depending on the color value at Point Y,
                    // that is the intensity of the clouds at Point Y.
                    //
                    // Since the clouds are made to spin twice as fast as the earth,
                    // in order to get the correct shadows(clouds) position in this earth's fragment shader
                    // we need to minus earth's UV.x coordinate by uv_xOffset,
                    // which is calculated and explained in the updateScene()
                    // after minus by uv_xOffset, the result would be in the range of -1 to 1,
                    // we need to set RepeatWrapping for wrapS of the clouds texture so that texture2D still works for -1 to 0

                    float cloudsMapValue = texture2D(tClouds, vec2(vMapUv.x - uv_xOffset, vMapUv.y)).r;
        
                    // The shadow should be more intense where the clouds are more intense,
                    // thus we do 1.0 minus cloudsMapValue to obtain the shadowValue, which is multiplied to diffuseColor
                    // we also clamp the shadowValue to a minimum of 0.2 so it doesn't get too dark
        
                    diffuseColor.rgb *= max(1.0 - cloudsMapValue, 0.2);
                #endif
                `)

            this.userData.shader = shader  // save for access later
        }
    }

    update(delta: number, _state: OrreryState, _?: Vector3) {
        const shader = this.userData.shader as WebGLProgramParametersWithUniforms
        if (this.enabled && shader && shader.uniforms) {  // FIXME confirm
            const offset = (delta * 0.005 * this.speed) / (2 * Math.PI)
            //shader.uniforms.uv_xOffset.value += offset % 1 // FIXME
        }
    }
}

export declare type CloudMaterialProps = MaterialNode<CloudMaterial, [CloudMaterialParameters]>

extend({CloudMaterial})
