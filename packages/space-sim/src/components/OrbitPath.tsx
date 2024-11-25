import {Vector3, CubicBezierCurve3, Color} from "three"
import {useEffect, useRef} from "react"
import {Geometry} from "three-stdlib"

export interface OrbitPathProps {
    start: Vector3
    control1: Vector3
    control2: Vector3
    end: Vector3
}

export function OrbitPath(props: OrbitPathProps) {
    const numPoints = 100
    const geometryRef = useRef(new Geometry())
    useEffect(() => {
        const curve = new CubicBezierCurve3(props.start, props.control1, props.control2, props.end)
        const curvePoints = curve.getPoints(numPoints)
        const colors: Color[] = []
        for (let i=0; i < curvePoints.length; i++) {
            geometryRef.current.vertices.push(curvePoints[i])
            colors.push(new Color(0xffffff00 & (0xff / (i+1))))
        }
        geometryRef.current.colors = colors
    }, [props])

    return (
        <mesh>
            <primitive object={geometryRef.current} attach={"geometry"}/>
            <lineBasicMaterial vertexColors={true}/>
        </mesh>
    )
}
