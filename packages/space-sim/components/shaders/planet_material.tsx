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

import {Color, MeshStandardMaterial, MeshStandardMaterialParameters, Vector2, Vector3} from "three"
import {extend, MaterialNode} from '@react-three/fiber'

import "../../util/extDate"
import {loadTextures, OrbitalImages, OrbitalMaterial, reloadTexture} from "../../planetarium/orbital_data"
import {distance} from "../../util/elliptical"
import {getLightDirections, OrreryState} from "../../planetarium/orrery"


export type SeasonalIndex = (dateTime: Date) => number

export interface SurfaceParameters {
    images: OrbitalImages | null
    indexer: SeasonalIndex
    normalScale: Vector2
    roughness: number
    metalness: number
    emissiveColor: Color
    emissiveIntensity: number
    highRes: boolean
    lightDirections: Vector3[]  // normalized
    hasAtmosphere: boolean
}

export const bareSurface = (system?: OrreryState) => {
    return {images:null, indexer:(_: Date): number => 0, normalScale:new Vector2(0.5,0.5),
        roughness:1.0, metalness:0.0, emissiveColor:new Color(0x909090), emissiveIntensity:0.0, highRes:true,
        lightDirections:getLightDirections(system), hasAtmosphere: false} as SurfaceParameters
}

export interface PlanetMaterialParameters extends MeshStandardMaterialParameters {
    enableDiffuse: boolean
}

export class PlanetMaterial extends MeshStandardMaterial implements OrbitalMaterial {
    static resolutionThreshold = 10

    indexer: SeasonalIndex
    images: OrbitalImages | null
    lastIndex: number
    hiRes: boolean

    constructor(params: SurfaceParameters) {
        const textures = loadTextures(params.images, params.highRes)
        const matParams = {map: textures.surface} as PlanetMaterialParameters
        if (textures.elevation !== undefined) {
            matParams.normalMap = textures.elevation
            matParams.normalScale = params.normalScale
        }
        if (textures.specular !== undefined) {
            matParams.roughnessMap = textures.specular
            matParams.roughness = params.roughness
            matParams.metalnessMap = textures.specular
            matParams.metalness = params.metalness
        }
        if (textures.nighttime !== undefined) {
            matParams.emissiveMap = textures.nighttime
            matParams.emissive = params.emissiveColor
            matParams.emissiveIntensity = params.emissiveIntensity
        }

        super(matParams)
        this.indexer = params.indexer
        this.images = params.images
        this.lastIndex = 0
        this.hiRes = true

        this.onBeforeCompile = function (shader) {
            console.log("Surface")
            if (params.lightDirections && params.lightDirections.length > 0) {
                const dir = params.lightDirections[0]
                console.log(`Planet atmo direction ${dir.x} ${dir.y} ${dir.z}`)
            }  // FIXME remove
            const numLights = params.lightDirections.length
            shader.uniforms.atmoLights = {value: numLights}
            if (params.lightDirections && numLights > 0) {
                shader.uniforms.pDirectionalLights = {value: params.lightDirections}
                shader.uniforms.pDirectionalLight = {value: params.lightDirections[0]}
            } else
                console.log("No lights")
            shader.uniforms.sharp = {value: false } //!params.hasAtmosphere}

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <common>',
                // language=glsl
                `#include <common>
                
                #define MAX_LIGHTS 5
                //uniform vec3 pDirectionalLights[MAX_LIGHTS];
                uniform vec3 pDirectionalLight;
                uniform int atmoLights;
                uniform bool sharp;
            `)

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <roughnessmap_fragment>',
                // language=glsl prefix="void main() {" suffix="}"
                `
                float roughnessFactor = roughness;

                #ifdef USE_ROUGHNESSMAP
                    vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
                    texelRoughness = vec4(1.0) - texelRoughness;  // invert specular map for roughness
                    roughnessFactor *= clamp(texelRoughness.g, 0.5, 1.0);
                #endif
                `)

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <emissivemap_fragment>',
                // language=glsl prefix="void main() {" suffix="}"
                `
                #ifdef USE_NORMALMAP
                    // no normals on dark side
                    vec4 normalColor = texture2D( normalMap, vNormalMapUv );
                    //for (int i=0; i < atmoLights; i++) {
                    if (sharp) {
                        //    normalColor *= 1.0 - smoothstep(0.45, -0.0, dot(normal, pDirectionalLights[i]));
                        normalColor *= 1.0 - smoothstep(0.0, 0.0, dot(normal, directionalLights[0].direction));
                    } else {
                        normalColor *= 1.0 - smoothstep(0.45, -0.0, dot(normal, directionalLights[0].direction));
                    }
                    //normalColor *= 1.0 - smoothstep(0.45, -0.0, dot(normal, pDirectionalLight));
                    normal *= normalColor.rgb;
                #endif

                #ifdef USE_EMISSIVEMAP
                    // no emissives on lit side
                    vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
                    //for (int i=0; i < atmoLights; i++) {
                    if (sharp) {
                        //    emissiveColor *= 1.0 - smoothstep(-0.09, 0.1, dot(normal, pDirectionalLights[i]));
                        emissiveColor *= 1.0 - smoothstep(0.0, 0.0, dot(normal, directionalLights[0].direction));
                    } else {
                        emissiveColor *= 1.0 - smoothstep(-0.09, 0.1, dot(normal, directionalLights[0].direction));
                    }
                    //emissiveColor *= 1.0 - smoothstep(-0.09, 0.1, dot(normal, pDirectionalLight));
                    totalEmissiveRadiance *= emissiveColor.rgb;
                #endif
                `)

            this.userData.shader = shader  // save for access later
        }
    }

    update(_delta: number, state: OrreryState, position?: Vector3) {
        const idx = this.indexer(state.flux.currentTime)
        let highRes = false
        let dist = PlanetMaterial.resolutionThreshold
        if (position && state.camera)
            dist = distance(position, state.camera.position)
        if (dist < PlanetMaterial.resolutionThreshold)
            highRes = true
        if (idx !== this.lastIndex || highRes != this.hiRes) {
            this.map = reloadTexture(this.images, highRes, idx)
            this.hiRes = highRes
            this.lastIndex = idx
        }
    }
}

export declare type PlanetMaterialProps = MaterialNode<PlanetMaterial, [PlanetMaterialParameters]>

extend({PlanetMaterial})
