/*
  Copyright 2024 Sean M. Brennan and contributors

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

import {Euler, Vector3} from "three"

import {BasicFlux, basicFluxSize, BasicState} from "./orrery_state"


export interface PlanetFlux extends BasicFlux {
    travelled: number
    velocity: Vector3 | null
    rotations: [Euler | null, Euler | null, Euler | null]
}
export const planetFluxSize = basicFluxSize + 52

export interface PlanetState extends BasicState {
    flux: PlanetFlux
}
