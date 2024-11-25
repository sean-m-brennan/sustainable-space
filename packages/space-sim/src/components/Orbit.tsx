import {useEffect, useRef} from "react"
import {Geometry} from "three-stdlib"
import {Color, EllipseCurve, Euler, Vector3} from "three"


export interface OrbitProps {
    semimajor: number
    semiminor: number
    rotation: Euler
    position: Vector3
}

export function Orbit(props: OrbitProps) {
    const numPoints = 100
    const geometryRef = useRef(new Geometry())
    useEffect(() => {
        const curve = new EllipseCurve(0, 0, props.semimajor, props.semiminor)
        const curvePoints = curve.getSpacedPoints(numPoints)
        const curve3Points = curvePoints.map((pt) => new Vector3(pt.x, pt.y, 0))
        const colors: Color[] = []
        for (let i=0; i < curvePoints.length; i++) {
            geometryRef.current.vertices.push(curve3Points[i])
            colors.push(new Color(0xffffff00 & (0xff / (i+1))))
        }
        geometryRef.current.colors = colors
    }, [props])

    return (
        <mesh rotation={props.rotation} position={props.position}>
            <primitive object={geometryRef.current} attach={"geometry"}/>
            <lineBasicMaterial vertexColors={true}/>
        </mesh>
    )
}