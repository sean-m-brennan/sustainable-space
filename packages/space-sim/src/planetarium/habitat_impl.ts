import {Euler, EulerOrder, Vector3} from "three"
import {HabitatSpec} from "../components/Habitat"

type HabitatJson = {
    name: string
    radius: number
    shape: string
    position: {
        x: number
        y: number
        z: number
    }
    rotation: {
        x: number
        y: number
        z: number
        order: EulerOrder
    }
}

export const habitatSpecsFromJson = (json: string): HabitatSpec[] => {
    const specs: HabitatSpec[] = []
    const array = JSON.parse(json) as HabitatJson[]
    for (const spec of array) {
        specs.push({
            name: spec.name, radius: spec.radius, shape: spec.shape,
            position: new Vector3(spec.position.x, spec.position.y, spec.position.z),
            rotation: new Euler(spec.rotation.x, spec.rotation.y, spec.rotation.z, spec.rotation.order),
        } as HabitatSpec)
    }
    return specs
}
