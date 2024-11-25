import {PlanetMaterial, PlanetMaterialProps} from "./components/shaders/planet_material.tsx"
import {AtmosphereMaterial, AtmosphereMaterialProps} from "./atmosphere/atmosphere_shader"
import {CloudMaterial, CloudMaterialProps} from "./components/shaders/cloud_material.tsx"
import {Orrery, OrreryProps} from "./components/Orrery"
import {Sun, SunProps} from "./components/Sun"
import {Planet, PlanetProps} from "./components/Planet"
import {Satellite, SatelliteProps} from "./components/Satellite"
import {Earth, EarthProps} from "./Earth"
import {Moon, MoonProps} from "./Moon"
import {Sol} from "./Sol"
import {EmptyProps, PropsOptional} from "./util/typing"

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'planetMaterial': PlanetMaterial<PlanetMaterialProps>
            'atmosphereMaterial': AtmosphereMaterial<AtmosphereMaterialProps>
            'cloudMaterial': CloudMaterial<CloudMaterialProps>
            'orrery': Orrery<OrreryProps>
            'planet': Planet<PlanetProps>
            'satellite': Satellite<SatelliteProps>
            'sun': Sun<PropsOptional<SunProps>>
            'earth': Earth<EarthProps>
            'moon': Moon<MoonProps>
            'sol': Sol<EmptyProps>
        }
    }
}
