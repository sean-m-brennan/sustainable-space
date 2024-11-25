import React, {RefObject} from "react";
import {useFrame} from "@react-three/fiber"
import {Clock, DirectionalLight, Group, Object3D, SphereGeometry, Vector3} from 'three'
import {v4 as uuid4} from 'uuid'

import '../util/extDate.ts'
import {SystemAccessors} from "./SpaceContext.tsx"
import {clamp, tempToColor} from "../util/textures.ts"
import {SunConstants, SunState} from "../planetarium/sun_impl.ts"
import {randomSunConsts} from "../planetarium/orbital_data.ts"
import {OrbitalType} from "../planetarium/orrery_state.ts"
import {firmamentPositionScale} from "../planetarium/firmament.ts"
import {EarthConsts} from "../planetarium/constants.ts"
import {vector2array} from "../util/coordinates.ts"
import {distance} from "../util/elliptical.ts"


export type SunProps = SunConstants

export class SunImpl extends Object3D {
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

interface SunFrameProps {
	impl: SunImpl
	whole: RefObject<Group>
	geo: RefObject<SphereGeometry>
	light: RefObject<DirectionalLight>
}

export const SunFrame = (props: SunFrameProps) => {
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
