import React, {useContext, useMemo, useRef, useState} from "react"
import {MeshPortalMaterial, PortalMaterialType, useCursor} from "@react-three/drei"
import {useLocation, useRoute} from "wouter"
import {
    CylinderGeometry,
    Euler,
    Group,
    Mesh,
    MeshPhongMaterial,
    SphereGeometry,
    Vector2,
    Vector3
} from "three"

import {OrbitalImages} from "../planetarium/orbital_data"
import {SpaceContext} from "./SpaceContext"
import {imageFiles} from "../images/files"
import {defaultInner, HabitatMaterial, InnerParameters} from "./shaders/habitat_material"


export interface HabitatSpec {
    planetIdx?: number
    name: string
    radius: number  // meters
    shape: string
    position: Vector3
    rotation: Euler
}

export type HabitatProps = HabitatSpec

export function Habitat(props: HabitatProps) {
    const access = useContext(SpaceContext)
    const images: OrbitalImages = {
        daytime: {low: [imageFiles.habitats[0].large], high: [imageFiles.habitats[0].large]},
        nighttime: imageFiles.habitats[0].night,
        //elevation: imageFiles.habitats[0].normal,  // FIXME faulty
    }
    const surfaceSize = props.radius / 1000 / access.system.consts.scale
    console.debug(`Habitat - radius ${props.radius / 1000}, size ${surfaceSize}`)
    const segmentSize = new Vector2(32, 32)
    const surfParams = {
        ...defaultInner(),
        images: images,
        highRes: false,
    } as InnerParameters
    const whole = useRef<Group>()
    const surfaceMeshRef = useRef<Mesh>(null)
    const positionRef = useRef<Vector3>(props.position)
    const rotationRef = useRef<Euler>(props.rotation)

    const outerGeometry = useMemo(() => {
        if (props.shape === 'cylinder') {
            const geo = new CylinderGeometry(surfaceSize*1.1, surfaceSize*1.1, surfaceSize*1.1 * 2)//, 32, 1, true)
            geo.rotateZ(Math.PI / 2)
            geo.rotateY(Math.PI / 4 * 3)
            return geo
        }
        return new SphereGeometry(surfaceSize*1.1, segmentSize.x, segmentSize.y)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const [outerMaterial] = useState(new MeshPhongMaterial({color: '#ffffff'}))
    const portalSize = 1.5 / 1000 / access.system.consts.scale

    const innerGeometry = useMemo(() => {
        if (props.shape === 'cylinder') {
            const geo = new CylinderGeometry(surfaceSize, surfaceSize, surfaceSize * 2)//, 32, 1, true)
            geo.rotateZ(Math.PI / 2)
            geo.rotateY(Math.PI / 4 * 3)
            return geo
        }
        return new SphereGeometry(surfaceSize, segmentSize.x, segmentSize.y)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const [innerMaterial] = useState(new HabitatMaterial(surfParams))
    const lightColor = '#ffcc66'  // FIXME
    const portal = useRef<PortalMaterialType>()
    const [, setLocation] = useLocation()
    const [, params] = useRoute('/item/:id')
    const [hovered, hover] = useState(false)
    useCursor(hovered)

    return (
        <>
            {/* @ts-expect-error('Mutable ref') */}
            <group ref={whole} position={positionRef.current} rotation={rotationRef.current}>
                {/* Use a portal to the inner habitat */}
                <mesh
                    geometry={outerGeometry} material={outerMaterial}
                    castShadow={true} receiveShadow={true}/>
                <mesh
                    onClick={(e) => {
                        e.stopPropagation()
                        setLocation('/item/' + e.object.name)
                    }}
                    onPointerOver={() => hover(true)}
                    onPointerOut={() => hover(false)}>
                    <circleGeometry args={[portalSize, 32]} />
                    {/* @ts-expect-error('Ref type mismatch') */}
                    <MeshPortalMaterial ref={portal}>
                        <group>
                            <mesh ref={surfaceMeshRef}
                                  geometry={innerGeometry} material={innerMaterial}
                                  castShadow={true} receiveShadow={true}/>
                            <directionalLight color={'#ffffff'} intensity={4.0}
                                              castShadow={true} position={positionRef.current}/>
                            <mesh>
                                <sphereGeometry args={[surfaceSize / 50, 32, 32]}/>
                                <meshBasicMaterial color={lightColor}/>
                            </mesh>
                        </group>
                    </MeshPortalMaterial>
                </mesh>
            </group>
        </>
    )
}
