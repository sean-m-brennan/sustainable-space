import {Vector3} from "three"

import {OrbitConsts} from "./orbital_data"
import {SunConstants} from "./sun"


export enum OrbitalType {
    SUN,
    PLANET,
    SATELLITE,
}

export interface BasicFlux {  // can only be plain-old-data
    uuid: string
    position: Vector3 | null
}
export const basicFluxSize = 62  // bytes

export interface BasicState {
    type: OrbitalType
    orbit: OrbitConsts | SunConstants
    flux: BasicFlux
}
