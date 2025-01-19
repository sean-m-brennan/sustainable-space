import {CSSProperties, ReactElement, useEffect, useRef, useState} from "react"

import {Position, PositionSize, Rooting, NodeInfo, NavFunc} from "./RecursiveTree"
import {px2num, defaultShapeInfo, defaultLineInfo, ShapeInfo, LineInfo, ShapeAttrib} from "./util"
import { OverlayPanel } from "primereact/overlaypanel"
import FadeText from "./FadeText"
import useFade, {MaskInfo} from "./useFade"


type DivProps = {
    top: number
    left: number
    bottom: number
    right: number
}

type EdgeProps = {
    start: [number, number]
    c1: [number, number]
    c2: [number, number]
    end: [number, number]
    height: number
    width: number
}

export type FadeTreeBranchProps = {
    positionSize: PositionSize
    nodeInfo?: ShapeInfo
    edgeInfo?: LineInfo
    nav?: NavFunc
    style?: CSSProperties
    children?: ReactElement<FadeTreeBranchProps> | ReactElement<FadeTreeBranchProps>[]
    parents?: PositionSize[]
    mask: MaskInfo
    direction?: Rooting
    nodeEasing?: string
    edgeEasing?: string
    edgeDelay?: number
    maxTransparency?: number
    maxOpacity?: number
} & NodeInfo

export default function FadeTreeBranch(props: FadeTreeBranchProps) {
    const targetRef = useRef<HTMLDivElement>(null)
    const opRef = useRef<OverlayPanel>(null)

    const direction = props.direction ? props.direction : "top"
    const nodeEasing = props.nodeEasing ? props.nodeEasing : "1s"
    const edgeEasing = props.edgeEasing ? props.edgeEasing : `${Number(nodeEasing.slice(0, -1)) * 2.}s`
    const edgeDelay = props.edgeDelay ? props.edgeDelay : `${Number(nodeEasing.slice(0, -1)) * .5}s`
    const miniTextSize = props.nodeInfo && props.nodeInfo.textSize ? props.nodeInfo.textSize : "normal"
    const miniTextColor = props.nodeInfo && props.nodeInfo.textColor ? props.nodeInfo.textColor : "#000"
    const miniFontFamily = props.nodeInfo && props.nodeInfo.textFontFamily ? props.nodeInfo.textFontFamily : "Verdana, Helvetica, Arial, sans-serif"

    const [shape, setShape] = useState<JSX.Element>()
    const [edgeDivProps, setEdgeDivProps] = useState<DivProps[]>([])
    const [edges, setEdges] = useState<EdgeProps[]>([])
    const [hoverCount, setHoverCount] = useState<number>(0)
    const [midpoint, setMidpoint] = useState<PositionSize>({x:0, y:0, w:0, h:0})

    const opacity = useFade(targetRef, props.mask, props.maxTransparency, props.maxOpacity)
    const navigate = props.nav ? props.nav : (url: string) => {window.location.href = url}

    const nodeInfo = {...defaultShapeInfo, ...props.nodeInfo}
    const edgeInfo = {...defaultLineInfo, ...props.edgeInfo}

    const hover = () => {
        setHoverCount(() => 1)
    }

    const out = () => {
        setHoverCount(() => Math.max(hoverCount-1, 0))
    }

    useEffect(() => {
        if (opRef.current && targetRef.current) {
            if (hoverCount === 0)
                opRef.current.hide()
            else
                opRef.current.show(null, targetRef.current)
        }
    }, [hoverCount])

    const click = () => {
        if (props.more)
            navigate(props.more.link)
    }

    useEffect(() => {
        let nodeShape: JSX.Element
        const nodeAttr = nodeInfo as ShapeAttrib
        switch (nodeInfo.shape) {
            case "rect":
                nodeShape = (<rect x={"0"} y={"0"} width={"100%"} height={"100%"} {...nodeAttr}/>)
                break
            case "polygon":
                nodeShape = (<polygon {...nodeAttr}/>)
                break
            case "path":
                nodeShape = (<path {...nodeAttr}/>)
                break
            case "ellipse":
                nodeShape = (<ellipse cx={"50%"} cy={"50%"} {...nodeAttr}/>)
                break
            case "circle":
            default:
                nodeShape = (<circle cx={"50%"} cy={"50%"} {...nodeAttr}/>)
        }
        setShape(nodeShape)
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        const selfCenter = {x: props.positionSize.x,  y: props.positionSize.y}
        if (direction === "left" || direction === "right")
            selfCenter.y += props.positionSize.h / 2
        else
            selfCenter.x += props.positionSize.w / 2
        let ctrY = selfCenter.y - props.positionSize.h
        if (direction === "bottom")
            ctrY = selfCenter.y + props.positionSize.h * 2
        setMidpoint({
            x: selfCenter.x,
            y: ctrY,
            w: props.positionSize.w,
            h: props.positionSize.h * 2,
        })

        if (props.parents) {
            const edgeDivList = []
            const edgeList = []
            for (const parent of props.parents) {
                // Position edge div
                const sw = px2num(edgeInfo.strokeWidth)
                let xOffset = 0
                let yOffset = 0
                let parentPoint: Position
                let selfPoint: Position
                if (direction === "left") {
                    parentPoint = {
                        x: parent.x + parent.w,
                        y: parent.y + parent.h / 2.
                    }
                    selfPoint = {
                        x: props.positionSize.x,
                        y: props.positionSize.y + props.positionSize.h / 2.
                    }
                    yOffset = sw
                } else if (direction === "right") {
                    parentPoint = {
                        x: parent.x,
                        y: parent.y + parent.h / 2.
                    }
                    selfPoint = {
                        x: props.positionSize.x + props.positionSize.w,
                        y: props.positionSize.y + props.positionSize.h / 2.
                    }
                    yOffset = sw
                } else if (direction === "bottom") {  // parent beneath child
                    parentPoint = {
                        x: parent.x + parent.w / 2.,
                        y: parent.y
                    }
                    selfPoint = {
                        x: props.positionSize.x + props.positionSize.w / 2.,
                        y: props.positionSize.y + props.positionSize.h
                    }
                    xOffset = sw
                } else {  // top, default; child beneath parent
                    parentPoint = {
                        x: parent.x + parent.w / 2.,
                        y: parent.y + parent.h
                    }
                    selfPoint = {
                        x: props.positionSize.x + props.positionSize.w / 2.,
                        y: props.positionSize.y
                    }
                    xOffset = sw
                }
                edgeDivList.push({
                    top: (selfPoint.y < parentPoint.y ? selfPoint.y : parentPoint.y) - yOffset,
                    bottom: (selfPoint.y > parentPoint.y ? selfPoint.y : parentPoint.y) + yOffset,
                    left: (selfPoint.x < parentPoint.x ? selfPoint.x : parentPoint.x) - xOffset,
                    right: (selfPoint.x > parentPoint.x ? selfPoint.x : parentPoint.x) + xOffset
                })

                // Create svg path
                const parentCenter = {x: parent.x, y: parent.y}
                if (direction === "left" || direction === "right")
                    parentCenter.y += parent.h / 2
                else
                    parentCenter.x += parent.w / 2
                let xDist = Math.abs(selfCenter.x - parentCenter.x)
                let yDist = Math.abs(selfCenter.y - parentCenter.y)
                setMidpoint({
                    x: Math.min(selfCenter.x, parentCenter.x) + xDist / 2,
                    y: Math.min(selfCenter.y, parentCenter.y) + yDist / 2,
                    w: xDist,
                    h: yDist,
                })
                let start: [number, number]
                let c1: [number, number]
                let c2: [number, number]
                let end: [number, number]
                if (direction === "left" || direction === "right") {
                    yDist += sw * 2
                    if (direction === "left")
                        xDist -= parent.w
                    else
                        xDist -= props.positionSize.w
                    if ((direction === "left" && parent.y > props.positionSize.y) ||
                        (direction === "right" && parent.y < props.positionSize.y)) {
                        start = [0, yDist - sw]
                        end = [xDist, sw]
                    } else {
                        start = [0, sw]
                        end = [xDist, yDist - sw]
                    }
                    c1 = [xDist / 3., start[1]]
                    c2 = [xDist / 3. * 2, end[1]]
                } else {
                    xDist += sw * 2
                    if (direction === "bottom")
                        yDist -= props.positionSize.h
                    else
                        yDist -= parent.h
                    if ((direction === "bottom" && parent.x > props.positionSize.x) ||
                        (direction === "top" && parent.x < props.positionSize.x)) {
                        start = [sw, 0]
                        end = [xDist - sw, yDist]
                    } else {
                        start = [xDist - sw, 0]
                        end = [sw, yDist]
                    }
                    c1 = [start[0], yDist / 3.]
                    c2 = [end[0], yDist / 3. * 2]
                }
                edgeList.push({start: start, c1: c1, c2: c2, end: end, width: xDist, height: yDist})
            }
            setEdgeDivProps(edgeDivList)
            setEdges(edgeList)
        }
    }, [edgeInfo.strokeWidth, direction, props.parents, props.positionSize])

    let edgeDivs = (<></>)
    if (edgeDivProps.length && edges.length) {
        const divs = edgeDivProps.map((edgeDivProps, i) => {
            const edge = edges[i]
            const curve = `M${edge.start.join(",")} C${edge.c1.join(",")} ${edge.c2.join(",")} ${edge.end.join(",")}`
            const path = (<path d={curve} fill={"none"} {...edgeInfo}/>)
            return (
                <div key={i} style={{opacity: opacity, transition: `opacity ${edgeEasing} ease-in-out ${edgeDelay}`,
                    zIndex: 500, position: "absolute", ...edgeDivProps}}>
                    <svg xmlns="http://www.w3.org/2000/svg"
                         width={edge.width} height={edge.height}>
                        {path}
                    </svg>
                </div>
            )
        })
        edgeDivs = (<>{divs}</>)
    }
    let intertext = (<></>)
    if (props.interlogue && !(direction === "left" || direction === "right")) {
        // NB: vertical text not supported
        let tWidth = midpoint.w * 2
        let tLeft = midpoint.x - tWidth / 2
        if (props.interlogue.span === true) {
            tWidth = window.innerWidth * .8
            tLeft = window.innerWidth * .1
        }
        const tHeight = midpoint.h / 4
        const tTop = midpoint.y - tHeight / 2

        intertext = (<FadeText content={props.interlogue.text} top={tTop} left={tLeft}
                               textFontSize={props.interlogue.size}
                               textFontColor={props.interlogue.color}
                               textFontFamily={props.interlogue.family}
                               width={tWidth} height={tHeight} mask={props.mask}/>)
    }
    let popup = (<></>)
    if (props.description)
        popup = (
            <OverlayPanel ref={opRef} style={{width: "20%", backgroundColor: "#000000"}}>
                <div dangerouslySetInnerHTML={{__html: props.description}}/>
            </OverlayPanel>
        )

    return (
        <>
            <div ref={targetRef}
                 style={{position: "absolute", zIndex: 999, top: props.positionSize.y, left: props.positionSize.x,
                     opacity: opacity, transition: `opacity ${nodeEasing} ease-in-out`, ...props.style}}
                 onMouseOut={out} onMouseOver={hover} onClick={click}>
                <svg xmlns="http://www.w3.org/2000/svg" style={{zIndex: 900}}
                     width={nodeInfo.width} height={nodeInfo.height}
                     onMouseOut={out} onMouseOver={hover} onClick={click}>
                    {shape}
                    <text dominantBaseline={"middle"} textAnchor={"middle"} x={"50%"} y={"50%"}
                          fill={miniTextColor} fontSize={miniTextSize} fontFamily={miniFontFamily}>
                        {props.name}
                    </text>
                </svg>
            </div>
            {edgeDivs}
            {intertext}
            {popup}
            {props.children}
        </>
    )
}