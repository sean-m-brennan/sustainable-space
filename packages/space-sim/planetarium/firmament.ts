import {PerspectiveCamera, Vector3} from "three"

import {distance} from "../util/elliptical.ts"
import {starmapSize} from "./constants.ts"


export const firmamentPositionScale = (actualSize: number, actualPosition: Vector3,
                                       scale: number, camera: PerspectiveCamera, mapSize: number = starmapSize): [number, Vector3] => {
    const actualDist = distance(camera.position, actualPosition)
    const size = (actualSize * (camera.getFocalLength() / actualDist)) / scale
    const dist = (mapSize / scale) - 100
    const position = actualPosition.normalize().multiplyScalar(dist)
    return [size, position]
}
