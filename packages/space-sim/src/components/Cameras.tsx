import {useEffect, useRef} from "react"
import {CameraHelper, Curve, Line, Object3D, PerspectiveCamera, Vector3} from "three"
import {useHelper} from "@react-three/drei/native"
import {useFrame} from "@react-three/fiber";

export interface CamerasProps {
    target?: Object3D
    curve?: Curve<Vector3>
    line?: Line
}

export function Cameras(props: CamerasProps) {
    const camera = useRef(new PerspectiveCamera(90))
    //useHelper(camera, CameraHelper)  // needs target
    useEffect(() => {
        camera.current.position.set(0, 0, 1)
    })

    useFrame(({camera, clock}) => {
        if (!props.target || !props.curve || !props.line)
            return
        const v = new Vector3()
        const t = (clock.getElapsedTime() * 0.05) % 1
        camera.position.copy(props.curve.getPointAt(t, v))
        camera.position.applyMatrix4(props.line.matrixWorld)
        camera.lookAt(props.target.position)
        // FIXME viewport
        // https://stackoverflow.com/questions/70072165/rotating-ellipse-curve-in-three-js
    })

    return (
        <camera ref={camera}/>
    )
}