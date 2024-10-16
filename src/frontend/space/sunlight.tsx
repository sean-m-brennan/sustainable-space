import {Dispatch} from "react"
import {Vector3} from "three"

import {ShaderUniforms} from "./planet/orbital_data"


export const SolarDirections = [
	"dirPrimary", "dirSecondary", "dirTertiary",
]

export const SolarMagnitudes = [
	"magPrimary", "magSecondary", "magTertiary",
]

export function updateStates(index: number, sunStates: SunState[], dispatch: Dispatch<any>, magnitude: number, direction: Vector3) {
	const states = [...sunStates]
	if (states.length <= index)
		states.push({magnitude: magnitude, direction: direction})
	else
		states[index] = {magnitude: magnitude, direction: direction}
	dispatch({sunStates: states})
}

export function updateLights(sunInfo: SunState[], uniforms: ShaderUniforms): ShaderUniforms {
    for (let i = 0; i < sunInfo.length && i < SolarDirections.length; i++) {
        uniforms[SolarDirections[i]].value = sunInfo[i].direction
        uniforms[SolarMagnitudes[i]].value = sunInfo[i].magnitude
    }
    return uniforms
}

export interface SunState {
	direction: Vector3
	magnitude: number
}

