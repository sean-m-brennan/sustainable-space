import React, {Component, ContextType, createRef, RefObject} from "react";
import {extend, useFrame} from "@react-three/fiber"
import {Clock, DirectionalLight, Group, Object3D, SphereGeometry, Vector3} from 'three'
import {v4 as uuid4} from 'uuid'

import '../util/extDate'
import {SpaceContext, SystemAccessors} from "./SpaceContext"
import {clamp, tempToColor} from "../util/textures"
import {SunConstants, SunState} from "../planetarium/sun"
import {randomSunConsts} from "../planetarium/orbital_data"
import {OrbitalType} from "../planetarium/orrery_state"
import {firmamentPositionScale} from "../planetarium/firmament"
import {EarthConsts} from "../planetarium/constants"
import {vector2array} from "../util/coordinates"
import {distance} from "../util/elliptical"
import {PropsOptional} from "../util/typing"


export type SunProps = SunConstants

class SunImpl extends Object3D {
	context: SystemAccessors
	state: SunState
	color: number
	size: number
	intensity: number
	scaling: number
	brightness: number
	// fixme geo, material

	constructor(context: SystemAccessors, props: SunProps = randomSunConsts()) {
		super()
		this.context = context
		const initialPosition = new Vector3(-5, 0, 3)  // FIXME wrong //new Vector(props.distance / access.system.consts.scale, 0, 0))
		this.state = {
			type: OrbitalType.SUN,
			orbit: props,
			flux: {uuid: uuid4(), position: initialPosition}
		} as SunState
		this.context.addSun(this.state)  // FIXME?
		this.color = tempToColor(props.temperature)
		this.size = props.radius / this.context.system.consts.scale
		const rawDistance = props.distance / this.context.system.consts.scale
		const originDistance = clamp(rawDistance, 2 * this.size, this.context.system.consts.maxDistance)
		if (originDistance < rawDistance)
			this.size = 0.0001
		this.intensity = 5.0 // FIXME
		this.brightness = this.intensity
		this.scaling = 1.0

		console.log(`Sun ${props.name} actual size ${this.size}`)
		console.log(`Sun position ${initialPosition.x} ${initialPosition.y} ${initialPosition.z}`)
		const dir = initialPosition.normalize()
		console.log(`Sun direction ${dir.x} ${dir.y} ${dir.z}`)
	}

	update(clock: Clock): boolean {
		const frequency = 360000.0 / this.context.system.flux.speed  // msec
		if (this.context.system.flux.paused)
			return false
		if (clock.elapsedTime < frequency)
			return false
		console.log(clock.elapsedTime)
		clock.getElapsedTime()  // sets oldTime

		// FIXME populate flux sunStates (ref?)
		// FIXME change position via propagation
		const doy = this.context.system.flux.currentTime.getFracDayOfYear()
		const pos = new EarthConsts().solarPosition(doy)
		const [newSize, newPos] = firmamentPositionScale(this.state.orbit.radius, pos, this.context.system.consts.scale, this.context.system.camera)
		const [x, y, z] = vector2array(newPos)
		if (this.state.flux.position)
			this.state.flux.position.set(x, y, z)
		this.scaling = newSize / this.size
		const dist = distance(newPos, new Vector3(0, 0, 0))
		this.brightness = this.intensity / (dist * dist)
		console.log(`Sun pos ${x}, ${y}, ${z}, scale ${newSize}`)
		return true
	}
}

/*
export function Sun(props: SunProps = randomSunConsts()) {
	const access = useContext(SpaceContext)
	const whole = useRef<Group>(null)
	const geo = useRef<SphereGeometry>(null)
	const light = useRef<DirectionalLight>(null)

	const impl = useMemo(() => new SunImpl(access, props), [])

	useFrame(({clock}) => {
		if (impl.update(clock)) {
			if (whole.current)
				whole.current.position.set(...vector2array(impl.position))
			if (geo.current)
				geo.current.scale(impl.scaling, impl.scaling, impl.scaling)
			if (light.current)
				light.current.intensity = impl.brightness
		}
	})

	const effects = <></>  // FIXME

	//return useMemo(() => {
		return (
			<group ref={whole} position={impl.position}>
				{effects}
				<mesh>
					<sphereGeometry ref={geo} args={[impl.size, 32, 32]}/>
					<meshBasicMaterial color={impl.color}/>
				</mesh>
				<directionalLight ref={light} color={impl.color} intensity={impl.brightness}
								  castShadow={access.system.consts.shadows}/>
			</group>
		)
	//}, [currentTime, currentPlanet, paused])
}
*/

interface SunFrameProps {
	impl: SunImpl
	whole: RefObject<Group>
	geo: RefObject<SphereGeometry>
	light: RefObject<DirectionalLight>
}

const SunFrame = (props: SunFrameProps) => {
	useFrame(({clock}) => {
		if (props.impl.update(clock)) {
			if (props.whole.current)
				props.whole.current.position.set(...vector2array(props.impl.position))
			if (props.geo.current)
				props.geo.current.scale(props.impl.scaling, props.impl.scaling, props.impl.scaling)
			if (props.light.current)
				props.light.current.intensity = props.impl.brightness
		}
	})
	return null
}

export class Sun extends Component<PropsOptional<SunProps>, SunState> {
	static classname = 'Sun'

	static contextType = SpaceContext
	declare context: ContextType<typeof SpaceContext>

	renderImpl(props: SunProps) {
		const ctx = this.context
		const impl = new SunImpl(ctx, props)
		const whole = createRef<Group>()
		const geo = createRef<SphereGeometry>()
		const light = createRef<DirectionalLight>()
		//const dirLight = (props.primary) ? access.system.primarySunlight : new DirectionalLight(color, 5.0)

		const effects = <></>  // FIXME
		impl.position.set(4, 0, 4)  // FIXME remove
		// FIXME align with sunStates [getLightDirections()]
		console.log(`Sun position == (${impl.position.x}, ${impl.position.y}, ${impl.position.z})`)
		return (
			<group ref={whole} position={impl.position}>
				{effects}
				<mesh>
					<sphereGeometry ref={geo} args={[impl.size, 32, 32]}/>
					<meshBasicMaterial color={impl.color}/>
				</mesh>
				<directionalLight ref={light} color={impl.color} intensity={impl.brightness}
								  castShadow={ctx.system.consts.shadows}/>
				<SunFrame impl={impl} whole={whole} geo={geo} light={light}/>
			</group>
		)
	}

	render() {
		const props = {...randomSunConsts(), ...this.props}
		return this.renderImpl(props)
	}
}

extend({Sun})
