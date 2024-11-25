import {RefObject, useContext, useEffect, useRef, useState} from "react"
import {useFrame} from "@react-three/fiber"
import {Mesh, Vector3} from "three"
import {v4 as uuid4} from 'uuid'

import {Celestial, CelestialProps} from "./Celestial"
import {SpaceContext} from "./SpaceContext"
import {SatelliteState} from "../planetarium/satellite_impl.ts"
import {RandomOrbitConsts} from "../planetarium/orbital_data"
import {OrbitalType} from "../planetarium/orrery_state"
import {euler2array, vector2array} from "../util/coordinates"


export interface SatelliteProps extends CelestialProps {
    planetIdx?: number
    movementOverride?: boolean
    rotationOverride?: boolean
}

export function Satellite({orbit=new RandomOrbitConsts(), movementOverride=false, rotationOverride=false, ...props}: SatelliteProps) {
    const access = useContext(SpaceContext)
    const surfaceMeshRef = useRef<Mesh>(null)
    const atmoGlowMeshRef = useRef<Mesh>(null)
    const cloudMeshRef = useRef<Mesh>(null)

    const [disabled, setDisabled] = useState(false)
    const [index, setIndex] = useState(-1)
    useEffect(() => {
        const state: SatelliteState = {
            type: OrbitalType.SATELLITE, planetIdx: props.planetIdx!, orbit: orbit,
            flux: {uuid: uuid4(), travelled: 0, position: new Vector3(5, 0, 0),  // FIXME
                velocity: null, rotations: [null, null, null]}
        }
        setIndex(access.addSatellite(state))
        console.log(`Satellite state saved for ${state.orbit.name} (${props.planetIdx})`)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.planetIdx])  // set once

    const sat = access.system.flux.satelliteStates[index]
    console.log(`Satellite ${orbit.name} of size ${orbit.radius} (${index})`)

    useFrame(() => {
        if (access.system.flux.paused || disabled)
            return

        // FIXME move into celestial
        if (!sat) {
            setDisabled(true)
            console.error(`No satellite state saved for ${orbit.name}`)
            return
        }

        const rawRefs = [props.surfaceMeshRef, props.atmoGlowMeshRef, props.cloudMeshRef]
        const meshRefs: RefObject<Mesh>[] = []
        rawRefs.forEach((ref) => {
            if (ref !== undefined && ref !== null && ref.current != null)
                meshRefs.push(ref)
        })
        if (!movementOverride) {
            const newPos = sat.flux.position
            if (newPos)
                meshRefs.forEach((meshRef) => {
                    if (meshRef.current !== null)
                        meshRef.current.position.set(...vector2array(newPos))
                })
        }
        if (!rotationOverride) {
            const newRots = sat.flux.rotations
            if (newRots)
                meshRefs.forEach((meshRef, idx) => {
                    const newRot = newRots[idx]  // i.e. radians 3-tuple
                    if (meshRef.current && newRot)
                        meshRef.current.rotation.set(...euler2array(newRot))
                })
        }
    })
    console.log(`Satellite ${orbit?.name} belongs to planet ${props.planetIdx}`)
    return Celestial({...props, orbit: orbit, surfaceMeshRef:surfaceMeshRef, atmoGlowMeshRef:atmoGlowMeshRef, cloudMeshRef:cloudMeshRef})
}
