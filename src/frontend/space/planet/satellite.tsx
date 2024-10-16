import React, {Context, RefObject, useContext, useRef, useState} from "react"
import {extend, useFrame} from "@react-three/fiber"
import {Mesh, Vector3} from "three"

import {changeSatellitePosition, OrbitConsts} from "./orbital_data"
import {Celestial, CelestialProps} from "./celestial"
import {SpaceContext} from "../orrery"
import {PlanetDispatch} from "./planet"


export interface SatelliteState {
    travelled: number
    orbit: OrbitConsts
    position: Vector3
    planetOrbit: OrbitConsts
}

export interface SatelliteProps extends CelestialProps {
    context?: Context<PlanetDispatch>
    positionRef?: RefObject<Vector3>
    movementOverride?: boolean
    rotationOverride?: boolean
}

export function Satellite({movementOverride=false, rotationOverride=false, ...props}: SatelliteProps) {
    const [travelled, setTravelled] = useState(0.0)
    const [orbit] = useState(props.consts)
    const {system} = useContext(SpaceContext)
    const {planet} = useContext(props.context!)
    if (!props.context)
        console.error("Required planet context not given for satellite")
    else
        console.log(planet)

    const surfaceMeshRef = useRef<Mesh>(null)
    const atmoGlowMeshRef = useRef<Mesh>(null)
    const cloudMeshRef = useRef<Mesh>(null)

    useFrame(() => { // FIXME no hooks?
        if (system.paused)
            return
        if (!orbit || //!planet.orbit || !planet.position ||
            !props.positionRef || !props.positionRef.current)
            return

        /*if (!movementOverride) {
            const rawRefs = [props.surfaceMeshRef, props.atmoGlowMeshRef, props.cloudMeshRef]
            const meshRefs: RefObject<Mesh>[] = []
            rawRefs.forEach((ref) => {
                if (ref !== undefined && ref !== null && ref.current != null)
                    meshRefs.push(ref)
            })
            const [moved, position] = changeSatellitePosition(meshRefs, orbit, system.speed, travelled, planet.orbit, planet.position)
            setTravelled(moved)
            props.positionRef.current.set(position.x, position.y, position.z)
        }*/
        if (!rotationOverride) {
            // FIXME?
            //meshRefs.forEach((ref, index) => {
            //    changeMeshRotation(ref) // rotate how? (index)
            //})
        }
    })
    return Celestial({surfaceMeshRef:surfaceMeshRef, atmoGlowMeshRef:atmoGlowMeshRef, cloudMeshRef:cloudMeshRef, ...props})
}

//extend({Satellite})
