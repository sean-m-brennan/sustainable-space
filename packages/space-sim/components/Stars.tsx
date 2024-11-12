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

import React, {useContext, useEffect, useRef, useState} from "react"
import {useFrame, useLoader, useThree} from "@react-three/fiber"
import {
    BackSide,
    Mesh,
    RepeatWrapping,
    SphereGeometry,
    TextureLoader,
} from "three"

import {SpaceContext} from "./SpaceContext"
import {vector2array} from "../util/coordinates"
import {starmapSize} from "../planetarium/constants"

//import skymapSmall from '../images/TychoSkymapII.t4_04096x02048.jpg?url'
import skymapLarge from '../images/TychoSkymapII.t5_16384x08192.jpg?url'


interface StarsProps {
    size: number
}

const initialProps = {
    size: starmapSize,
}

export default function Stars(props: StarsProps = initialProps) {
    const access = useContext(SpaceContext)
    const [skymap, setSkymap] = useState(skymapLarge)
    const sphereSize = useRef(props.size / access.system.consts.scale)
    const activeCamera = useThree().camera
    const texture = useLoader(TextureLoader, skymap)
    texture.wrapS = RepeatWrapping
    texture.repeat.x = -1
    const sphere = new SphereGeometry(sphereSize.current, 64, 64)
    sphere.computeTangents()
    const meshRef = useRef<Mesh>()

    useFrame(() => {
        if (activeCamera !== null) {
            const xyz = vector2array(activeCamera.position)
            if (meshRef.current)
                meshRef.current.position.set(...xyz)
        }
    })

    return (
        <>
            {/* @ts-expect-error 'Ref == MutableRef' */}
            <mesh ref={meshRef}>
                <primitive object={sphere} attach="geometry"/>
                <meshBasicMaterial map={texture} side={BackSide}/>
            </mesh>
        </>
    )
}
