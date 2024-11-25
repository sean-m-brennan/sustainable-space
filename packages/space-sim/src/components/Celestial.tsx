import React, {RefObject, useContext, useMemo} from "react"
import {Mesh, SphereGeometry, Vector2} from "three"
import {useFrame} from "@react-three/fiber"

import {RandomOrbitConsts} from "../planetarium/orbital_data"
import {OrbitalProps, OrbitalSurface} from "./Orbital"
import {SpaceContext} from "./SpaceContext"
import {bareSurface} from "./shaders/planet_material"
import {AtmosphereMaterial} from "./shaders/atmosphere_material"
import {CloudMaterial} from "./shaders/cloud_material"
import {HazeMaterial} from "./shaders/haze_material"


export interface CelestialProps extends OrbitalProps {
    surfaceMeshRef: RefObject<Mesh>
    atmoGlowMeshRef?: RefObject<Mesh> | null
    cloudMeshRef?: RefObject<Mesh> | null
}

export function Celestial({orbit=new RandomOrbitConsts(), surfParams=bareSurface(),
                              cloudMeshRef=null, ...props}: CelestialProps) {
    const access = useContext(SpaceContext)
    const surfaceSize = orbit.radius / access.system.consts.scale
    const segmentSize = new Vector2(32, 32)

    const surfMesh = OrbitalSurface({
        surface: surfParams, surfaceSize: surfaceSize,
        segmentSize: segmentSize, surfaceRef: props.surfaceMeshRef,
        position: props.position, rotation: props.rotation
    })

    const atmoGeometry = useMemo(() => {
        const atmosphereSize = surfaceSize + (orbit.atmosphereThickness / access.system.consts.scale)
        return new SphereGeometry(atmosphereSize, segmentSize.x, segmentSize.y)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [surfaceSize, orbit.atmosphereThickness])
    const atmoMaterial = useMemo(() => {
        if (!props.atmoParams || !props.atmoParams.enable)
            return null
        return new AtmosphereMaterial(props.atmoParams)
    }, [props.atmoParams])
    let atmoMesh = (<></>)
    if (atmoGeometry !== null && atmoMaterial !== null) {
        atmoMesh = (
            <mesh receiveShadow={false}
                  geometry={atmoGeometry} material={atmoMaterial}/>
        )
    }

    const hazeGeometry = useMemo(() => {
        const hazeSize = surfaceSize + (orbit.cloudHeight / access.system.consts.scale)
        return new SphereGeometry(hazeSize, segmentSize.x, segmentSize.y)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [surfaceSize, orbit.cloudHeight])
    const hazeMaterial = useMemo(() => {
        if (!props.hazeParams || !props.hazeParams.enable)
            return null
        // also *requires* cloud layer
        if (!props.cloudParams || !props.cloudParams.enable)
            return null
        return new HazeMaterial(props.hazeParams)
    }, [props.hazeParams, props.cloudParams])
    let hazeMesh = (<></>)
    if (hazeGeometry !== null && hazeMaterial !== null) {
        hazeMesh = (
            <mesh receiveShadow={false}
                  geometry={hazeGeometry} material={hazeMaterial}/>
        )
    }

    const cloudGeometry = useMemo(() => {
        const cloudsSize = surfaceSize + (orbit.cloudHeight / access.system.consts.scale)
        return new SphereGeometry(cloudsSize, segmentSize.x, segmentSize.y)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [surfaceSize, orbit.cloudHeight])
    const cloudMaterial = useMemo(() => {
        if (!props.cloudParams || !props.cloudParams.enable)
            return null
        return new CloudMaterial(props.cloudParams)
    }, [props.cloudParams])
    let cloudMesh = (<></>)
    if (cloudGeometry !== null && cloudMaterial !== null && cloudMeshRef !== null) {
        cloudMesh = (
            <mesh ref={cloudMeshRef} castShadow={true} receiveShadow={true}
                  geometry={cloudGeometry} material={cloudMaterial}
                  position={props.position} rotation={props.rotation}/>
        )
    }

    useFrame((_, delta: number) => {
        if (cloudMaterial) {
            cloudMaterial.update(delta, access.system, props.position)
            // FIXME cloud rotation
        }
        // FIXME does position track?
    })

    return (
        <>
            {surfMesh}
            {atmoMesh}
            {cloudMesh}
            {hazeMesh}
        </>
    )
}