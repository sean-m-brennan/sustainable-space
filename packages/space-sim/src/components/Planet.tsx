import {Children, cloneElement, ReactElement, useContext, useEffect, useRef, useState} from "react"
import {useFrame} from "@react-three/fiber"
import {Mesh} from "three"
import {v4 as uuid4} from 'uuid'

import {RandomOrbitConsts} from "../planetarium/orbital_data"
import {PlanetState} from "../planetarium/planet_impl.ts"
import {Celestial} from "./Celestial"
import {SpaceContext} from "./SpaceContext"
import {SatelliteProps} from './Satellite'
import {OrbitalProps} from "./Orbital"
import {OrbitalType} from "../planetarium/orrery_state"
import {bareSurface} from "./shaders/planet_material"
import {euler2array, vector2array} from "../util/coordinates"
import {HabitatProps} from "./Habitat"

export type PlanetChildren = ReactElement<SatelliteProps | HabitatProps> | ReactElement<SatelliteProps | HabitatProps>[]

export interface PlanetProps extends OrbitalProps {
    children?: PlanetChildren
}

export function Planet({orbit=new RandomOrbitConsts(), surfParams=bareSurface(), ...props}: PlanetProps) {
    const access = useContext(SpaceContext)
    const [index, setIndex] = useState(-1)

    useEffect(() => {
        const state: PlanetState = {type: OrbitalType.PLANET, orbit: orbit,
            flux: {uuid: uuid4(), travelled: 0, position: null, velocity: null, rotations: [null, null, null]}}
        setIndex(access.addPlanet(state))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])  // set once

    const surfaceMeshRef = useRef<Mesh>(null)
    const atmoGlowMeshRef = useRef<Mesh>(null)
    const cloudMeshRef = useRef<Mesh>(null)

    const position = access.system.flux.planetStates[index]?.flux.position
    const rotations = access.system.flux.planetStates[index]?.flux.rotations

    console.log(`Planet ${orbit.name} of size ${orbit.radius} (${index})`)

    useFrame(() => {
        if (access.system.flux.paused)
            return
        if (index === -1)
            return
        // FIXME
        //const [newSize, newPos] = firmamentPositionScale(size, pos, access.system.flux.camera)
        const meshRefs = [surfaceMeshRef, atmoGlowMeshRef, cloudMeshRef]
        if (position !== null)
            meshRefs.forEach((ref) => {
                ref.current?.position.set(...vector2array(position))
            })
        if (rotations !== null)
            meshRefs.forEach((ref, idx) => {
                if (rotations[idx] !== null)
                    ref.current?.rotation.set(...euler2array(rotations[idx]))
            })

    })

    const meshes = Celestial({...props, orbit: orbit, surfParams: surfParams,
        surfaceMeshRef: surfaceMeshRef, atmoGlowMeshRef: atmoGlowMeshRef, cloudMeshRef: cloudMeshRef})

    // my children are satellites, need my index
    const additional = {planetIdx: index}
    const children = Children.map(props.children,
        (child) => {
        if (child !== undefined) {
            const props = {...child.props, ...additional}
            return cloneElement(child, props)
        }
    })

    return (
        <>
            {meshes}
            {children}
        </>
    )
}
