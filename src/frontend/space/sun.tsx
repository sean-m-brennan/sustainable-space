import React, {useContext, useMemo, useRef, useState} from "react";
import {useFrame} from "@react-three/fiber";
import { Bloom, BrightnessContrast, EffectComposer, Vignette } from '@react-three/postprocessing'
import {Color, DirectionalLight, Mesh, MeshBasicMaterial, SphereGeometry, Vector3} from 'three'

//import { folder, useControls } from 'leva'

import './util/extDate.ts'
import {SpaceContext} from "./orrery"
import {clamp, tempToColor} from "./util/textures"
import {updateStates} from "./sunlight.tsx";


export interface SunProps {
	primary: boolean
	radius: number
	distance: number  // FIXME should be zero
	magnitude: number
	temperature: number
}

const solProps: SunProps = {primary:true, radius:695700, distance:149597870, magnitude:1.0, temperature:5800}


export default function Sun(props: SunProps = solProps) {
	const {system, dispatch} = useContext(SpaceContext)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const index = useMemo(() => system.sunStates.length + 1, [])
	const [size, setSize] = useState(props.radius / system.scale)
	const rawDistance = props.distance / system.scale
	const originDistance = clamp(rawDistance, 2 * size, system.maxDistance)
	if (originDistance < rawDistance)
		setSize(1)
	const [color] = useState(tempToColor(props.temperature))
	const [dirLight] = useState(new DirectionalLight(color))
	//const [direction, setDirection] = useState<Vector3>(null)
	const doy = system.currentTime.getFracDayOfYear()
	let position: Vector3
	if (props.primary)
		position = new Vector3(originDistance, 0, 0)
	else
		position = new Vector3(-originDistance, 0, 0)
	const meshRef = useRef<Mesh>(new Mesh(
		new SphereGeometry(size), new MeshBasicMaterial({color: color})
	))

	/*const lensFlareProps = useControls({
		LensFlare: folder(
			{
				enabled: { value: true, label: 'enabled?' },
				opacity: { value: 1.0, min: 0.0, max: 1.0, label: 'opacity' },
				position: {
					value: { x: -25, y: 6, z: -60 },
					step: 1,
					label: 'position'
				},
				glareSize: {
					value: 0.35,
					// step : 10,
					min: 0.01,
					max: 1.0,
					label: 'glareSize'
				},
				starPoints: {
					value: 6.0,
					step: 1.0,
					min: 0,
					max: 32.0,
					label: 'starPoints'
				},
				animated: {
					value: true,
					label: 'animated?'
				},
				followMouse: {
					value: false,
					label: 'followMouse?'
				},
				anamorphic: {
					value: false,
					label: 'anamorphic?'
				},
				colorGain: {
					value: new Color(56, 22, 11),
					label: 'colorGain'
				},
				Flare: folder({
					flareSpeed: {
						value: 0.4,
						step: 0.001,
						min: 0.0,
						max: 1.0,
						label: 'flareSpeed'
					},
					flareShape: {
						value: 0.1,
						step: 0.001,
						min: 0.0,
						max: 1.0,
						label: 'flareShape'
					},
					flareSize: {
						value: 0.005,
						step: 0.001,
						min: 0.0,
						max: 0.01,
						label: 'flareSize'
					}
				}),

				SecondaryGhosts: folder({
					secondaryGhosts: {
						value: true,
						label: 'secondaryGhosts?'
					},
					ghostScale: {
						value: 0.1,
						// step : 10,
						min: 0.01,
						max: 1.0,
						label: 'ghostScale'
					},
					aditionalStreaks: {
						value: true,
						label: 'aditionalStreaks?'
					}
				}),
				StartBurst: folder({
					starBurst: {
						value: true,
						label: 'starBurst?'
					},
					haloScale: {
						value: 0.5,
						step: 0.01,
						min: 0.3,
						max: 1.0
					}
				})
			},
			{
				collapsed: true
			}
		)
	})*/


	const changeDirection = () => {
		const doy = system.currentTime.getFracDayOfYear();
		const pos = system.currentPlanet?.orbit.solarPosition(doy);
		if (pos !== undefined) {
			const direction = pos.clone().normalize()
			updateStates(index, system.sunStates, dispatch, props.magnitude, direction)
			dirLight.position.set(pos.x, pos.y, pos.z)
			if (meshRef.current)
				meshRef.current.position.set(pos.x, pos.y, pos.z)
		}
	};

	/*useFrame(() => {
		if (! system.paused)
			changeDirection();
	})*/

	return (
		<>
			<EffectComposer multisampling={0}>
				<Vignette />
				<Bloom mipmapBlur radius={0.9} luminanceThreshold={0.966} intensity={2} levels={4} />
				{/* <LensFlare {...lensFlareProps} /> */}
				<BrightnessContrast contrast={0.2} />
			</EffectComposer>
			<primitive object={meshRef.current} position={position}/>
			<ambientLight color={color}/>
			<directionalLight color={color} position={position} intensity={45}
							  castShadow={system.shadows}/>
		</>
	)
}
