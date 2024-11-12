import {Vector3} from "three"

import {ObjectName} from "./orbital_data.ts"
import {BasicFlux, basicFluxSize, BasicState} from "./orrery_state.ts"


export interface SunConstants {
    name: ObjectName
	primary: boolean
	radius: number
	distance: number
	magnitude: number
	temperature: number
    eclipticRef: Vector3
}

export type SunFlux = BasicFlux
export const sunFluxSize = basicFluxSize

export interface SunState extends BasicState {
    orbit: SunConstants
}
