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

import React, {RefObject} from "react"
import {Mesh, Vector2} from "three"

import {
    OrbitalTextures,
    ShaderUniforms
} from "./orbital_data"


export interface OrbitalSurfaceProps {
    textures: OrbitalTextures  // FIXME remove once shader works
    surfaceUniforms: ShaderUniforms
    surfaceSize: number
    segmentSize: Vector2
    surfaceRef: RefObject<Mesh>
}

export const OrbitalSurface = (props: OrbitalSurfaceProps) => {
    return (
        <>
            <mesh ref={props.surfaceRef} castShadow={true} receiveShadow={true}
                //rotation={rotation} // FIXME initial from props
            >
                <sphereGeometry args={[props.surfaceSize, props.segmentSize.x, props.segmentSize.y]}/>
                {/*FIXME <planetShader uniforms={props.surfaceUniforms} lights={true} fog={true}/>*/}
                <meshBasicMaterial map={props.textures.surface[3]}/>
            </mesh>
        </>
    )
}