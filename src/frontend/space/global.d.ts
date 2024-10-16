import {PlanetShader, PlanetShaderProps} from "./planet/planet_shader"
import {AtmosphereShader, AtmosphereShaderProps} from "./atmosphere/atmosphere_shader"
import {Planet, PlanetProps} from "./planet/planet"
import {Earth, EarthProps} from "./earth"
import {Moon, MoonProps} from "./moon.tsx"

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'planetShader': PlanetShader<PlanetShaderProps>
            'atmosphereShader': AtmosphereShader<AtmosphereShaderProps>
            'planet': Planet<PlanetProps>

            'earth': Earth<EarthProps>
            'moon': Moon<MoonProps>
        }
    }
}
