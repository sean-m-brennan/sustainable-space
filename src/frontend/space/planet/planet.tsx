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

import React, {createContext, Dispatch, RefObject, SetStateAction, useReducer, useRef, useState} from "react"
import {Mesh, Vector3} from "three"
import {useFrame} from "@react-three/fiber"

import {
    bareSurface,
    OrbitalProps, OrbitConsts,
    RandomOrbitConsts,
} from "./orbital_data"
import {Celestial} from "./celestial"


// three types of info
// 1. never changes: OrbitConsts
// 2. time-dependent change (every frame): position, rotation
// 3. state-dependent change (detected): UI, materials (uniforms)

export interface PlanetProps extends OrbitalProps {
    children?: any
}

export interface PlanetState {
    orbit: OrbitConsts
    position: Vector3
    velocity: Vector3
}

export type PlanetDispatch = {
    planet: PlanetState,
    dispatch: Dispatch<SetStateAction<any>>
}

const reducer = (state: PlanetState, action: SetStateAction<any>) => {
    return { ...state, ...action }
}

export function Planet({consts=new RandomOrbitConsts(), images=null, surfParams=bareSurface, ...props}: PlanetProps) {
    const [orbit] = useState(consts)
    const [position, setPosition] = useState(new Vector3(0, 0, 0)) // FIXME
    const [velocity, setVelocity] = useState(new Vector3(0, 0, 0)) // FIXME

    const state: PlanetState = {orbit, position, velocity}
    const context = createContext<PlanetDispatch>({planet: state, dispatch: () => null})
    const [planet, dispatch] = useReducer(reducer, state);

    const surfaceMeshRef = useRef<Mesh>(null)
    const atmoGlowMeshRef = useRef<Mesh>(null)
    const cloudMeshRef = useRef<Mesh>(null)

    useFrame(() => {
        // FIXME set my position, do I move?
        const meshRefs = [surfaceMeshRef, atmoGlowMeshRef, cloudMeshRef]
        //changeMeshPositions(meshRefs, orbit, props.system.speed, orbit, position)  // send system?
        //meshRefs.forEach((ref, index) => {
        //    changeMeshRotation(ref) // rotate how? (index)
        //})
    })

    const meshes = Celestial({consts, images, surfParams,
        surfaceMeshRef, atmoGlowMeshRef, cloudMeshRef, ...props})

    // children are satellites, need my orbit and my position
    const additional = {context: context}
    const children = React.Children.map(props.children,
        (child) => {
        if (child !== undefined) {
            const props = {...child.props, ...additional}
            React.cloneElement(child, props)
        }
    });

    return (
        <context.Provider value={{ planet, dispatch }}>
            {meshes}
            {children}
        </context.Provider>
    )
}
