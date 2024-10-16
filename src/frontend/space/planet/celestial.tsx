import React, {RefObject, useContext, useMemo, useState} from "react"
import {AdditiveBlending, BackSide, Mesh, Vector2} from "three"

import {
    bareSurface,
    createAtmosphereUniforms,
    createSurfaceUniforms,
    loadTextures,
    OrbitalProps, randomName, RandomOrbitConsts,
    ShaderUniforms
} from "./orbital_data"
import {OrbitalSurface} from "./orbital"
import {SpaceContext} from "../orrery"


export interface CelestialProps extends OrbitalProps {
    surfaceMeshRef?: RefObject<Mesh>
    atmoGlowMeshRef?: RefObject<Mesh> | null
    cloudMeshRef?: RefObject<Mesh> | null
}

export function Celestial({name=randomName(), consts=new RandomOrbitConsts(), images=null, surfParams=bareSurface,
                              atmoGlowMeshRef=null, cloudMeshRef=null, ...props}: CelestialProps) {
    const {system} = useContext(SpaceContext)
    const [orbit] = useState(consts)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const textures = useMemo(() => loadTextures(images), [])
    const surfUni = createSurfaceUniforms(surfParams, textures, system.currentTime)
    let atmoUni: ShaderUniforms | null = null
    const surfaceSize = orbit.radius / system.scale
    let atmosphereSize = 0
    let cloudsSize = 0
    if (props.atmoParams) {
        atmoUni = createAtmosphereUniforms(props.atmoParams)
        atmosphereSize = surfaceSize + (orbit.atmosphereThickness / system.scale)
        cloudsSize = surfaceSize + (orbit.cloudHeight / system.scale)
    }
    const segmentSize = new Vector2(32, 32)

    const surfMesh = OrbitalSurface({
        textures: textures, surfaceUniforms: surfUni, surfaceSize: surfaceSize,
        segmentSize: segmentSize, surfaceRef: props.surfaceMeshRef // FIXME
    })

    let atmoMesh = (<></>)
    let cloudMesh = (<></>)
    if (atmoUni && atmoGlowMeshRef && cloudMeshRef) {
        atmoMesh = (
            <>
                {/* @ts-expect-error 'Ref == MutableRef' */}
                <mesh ref={atmoGlowMeshRef}>
                    <sphereGeometry args={[atmosphereSize, segmentSize.x, segmentSize.y]}/>
                    <atmosphereShader uniforms={atmoUni} side={BackSide} lights={true}
                                      blending={AdditiveBlending} transparent={true}/>
                </mesh>
            </>
        )
        cloudMesh = (
            <>
                <mesh ref={cloudMeshRef}>
                    <sphereGeometry args={[cloudsSize, segmentSize.x, segmentSize.y]}/>
                    <meshLambertMaterial color={0xffffff} map={textures.clouds}
                                         transparent={true}/>
                </mesh>
            </>
        )
    }

    return (
        <>
            {surfMesh}
            {atmoMesh}
            {cloudMesh}
        </>
    )
}