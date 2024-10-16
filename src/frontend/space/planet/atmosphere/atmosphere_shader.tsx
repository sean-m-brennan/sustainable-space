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
import {Color, NormalBlending, ShaderMaterial, ShaderMaterialParameters, Vector3} from "three"

import vertexShader from "./atmosphere.vert"
import fragmentShader from "./atmosphere.frag"


export class AtmosphereShader extends ShaderMaterial {
    static defaultUniforms = {
        glowView : { value: new Vector3( 0, 0, 1 ) },
	    glowCoefficient:   { value: 0.6 },
	    glowPower:   { value: 6.0 },
	    glowColor : { value: new Color( 0xffffff ) },
    }

    constructor(params?: ShaderMaterialParameters) {
        if (params === undefined || params === null)
            params = {
                blending: NormalBlending,
                depthWrite: false,
                transparent: true
            }
        if (params.uniforms === undefined || params.uniforms === null)
            params.uniforms = AtmosphereShader.defaultUniforms

        params.vertexShader = vertexShader
        params.fragmentShader = fragmentShader
        super(params)
    }
}

export declare type AtmosphereShaderProps = MaterialNode<AtmosphereShader, [ShaderMaterialParameters]>

extend({AtmosphereShader})
