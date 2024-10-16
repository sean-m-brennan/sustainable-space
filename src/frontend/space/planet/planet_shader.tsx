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

import {Color, ShaderMaterial, ShaderMaterialParameters, Texture, Vector2, Vector3} from "three"
import {extend, MaterialNode} from '@react-three/fiber'

import {generateDataTexture} from "../util/textures"
import vertexShader from "./planet_vertex.glsl"
import fragmentShader from "./planet_fragment.glsl"


export class PlanetShader extends ShaderMaterial {
    static defaultUniforms = {
        dayTexture: { value: generateDataTexture(
                1024, 512, new Color( 0xffffff ) ) as Texture },
        nightTexture: { value: generateDataTexture(
                1024, 512, new Color( 0xffffff ) ) as Texture },

        diffuseTexture: { value: generateDataTexture(
                1024, 512, new Color( 0xffffff ) ) as Texture },
        diffuseColor: { value: new Color( 0xffffff ) },
        enableDiffuse: { value: false },

        elevTexture: { value: generateDataTexture(
                1024, 512, new Color( 0xffffff ) ) as Texture },
        elevScale: { value: new Vector2(1, 1) },

        specularTexture: { value: generateDataTexture(
                1024, 512, new Color( 0xffffff ) ) as Texture },
        specularColor: { value: new Color( 0xffffff ) },
        specularShininess: { value: 1 },
        enableSpecular: { value: false },

        dirPrimary: { value: new Vector3( 1, 0, -1 ) },
        magPrimary: { value: 0.0 },
        dirSecondary: { value: new Vector3( -1, 0, -1 ) },
        magSecondary: { value: 0.0 },
        dirTertiary: { value: new Vector3( 1, 1, 0 ) },
        magTertiary: { value: 0.0 },
    }

    constructor(params?: ShaderMaterialParameters) {
        if (params === undefined || params === null)
            params = {}
        if (params.uniforms === undefined || params.uniforms === null)
            params.uniforms = PlanetShader.defaultUniforms

        params.vertexShader = vertexShader
        params.fragmentShader = fragmentShader
        super(params)
    }
}

export declare type PlanetShaderProps = MaterialNode<PlanetShader, [ShaderMaterialParameters]>

extend({PlanetShader})
