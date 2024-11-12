import {PlanetFlux} from "./planet"
import {basicFluxSize, BasicState} from "./orrery_state"


export type SatelliteFlux = PlanetFlux
export const satelliteFluxSize = basicFluxSize + 52

export interface SatelliteState extends BasicState {
    planetIdx: number
    flux: SatelliteFlux
}
