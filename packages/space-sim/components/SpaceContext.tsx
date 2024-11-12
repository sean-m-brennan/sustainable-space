import React, {createContext} from "react"
import {initialOrreryState, OrreryState} from "../planetarium/orrery"
import {SunState} from "../planetarium/sun"
import {PlanetState} from "../planetarium/planet"
import {SatelliteState} from "../planetarium/satellite"


export type SystemAccessors = {
    system: OrreryState
    addSun: (state: SunState) => number
    addPlanet: (state: PlanetState) => number
    addSatellite: (state: SatelliteState) => number
}

const nullAccessor = {
    system: initialOrreryState(),
    addSun: (_: SunState) => -1,
    addPlanet: (_: PlanetState) => -1,
    addSatellite: (_: SatelliteState) => -1,
}

export const SpaceContext = createContext<SystemAccessors>(nullAccessor)
