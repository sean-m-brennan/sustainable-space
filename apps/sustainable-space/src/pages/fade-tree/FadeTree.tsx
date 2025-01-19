import {CSSProperties, RefObject, useEffect, useState} from "react"

import RecursiveTree, {TreeNodeInfo, Branches, Rooting, NavFunc} from "./RecursiveTree"
import {countLines, LineInfo, px2num, ShapeInfo} from "./util"
import FadeText from "./FadeText"


export type FadeTreeProps = {
    data?: TreeNodeInfo  // either
    children?: Branches  // or

    container?: RefObject<HTMLDivElement>
    height: number
    width: number
    rooted?: Rooting
    style?: CSSProperties
    maskRef?: RefObject<HTMLDivElement>
    maskMargins?: string
    maskThreshold?: number
    nodeInfo?: ShapeInfo
    edgeInfo?: LineInfo
    textFontSize?: string
    textFontColor?: string
    textFontFamily?: string
    nav?: NavFunc
    overview?: string
}

type FadeTreeDataProps = FadeTreeProps & {
    data: TreeNodeInfo
    children?: never  // N/A
}

type FadeTreeChildrenProps = FadeTreeProps & {
    data?: never  // N/A
    children?: Branches
}

function FadeTree(props: FadeTreeDataProps): JSX.Element
function FadeTree(props: FadeTreeChildrenProps): JSX.Element
function FadeTree(props: FadeTreeDataProps | FadeTreeChildrenProps): JSX.Element {
    const [tree, setTree] = useState<Branches>()
    const [top, setTop] = useState<number>(0)
    const maskInfo = {maskRef: props.maskRef, margin: props.maskMargins, threshold: props.maskThreshold}

    useEffect(() => {
        // initialize, from either json data or children
        if (props.data) {
            let offsets = {}
            if (props.container && props.container.current)
                offsets = {
                    top: props.container.current.offsetTop,
                    left: props.container.current.offsetLeft
                }
            const tc = new RecursiveTree({...offsets, ...props})
            tc.init(props.data)
            setTree(tc.recur(props.data, maskInfo))
            setTop(tc.nodeTop)
        }
        else
            setTree(props.children)
        // eslint-disable-next-line
    }, [props])

    let overview = (<></>)
    if (props.overview) {
        const tWidth = window.innerWidth * .8
        const tLeft = window.innerWidth * .1
        const lineHeight = (props.textFontSize ? px2num(props.textFontSize) : 32) + 4
        const tHeight = lineHeight * countLines(props.overview)
        const tTop = top - (tHeight + lineHeight * 2)
        overview = <FadeText content={props.overview} top={tTop} left={tLeft}
                             textFontColor={props.textFontColor}
                             textFontSize={props.textFontSize}
                             textFontFamily={props.textFontFamily}
                             width={tWidth} height={tHeight} mask={maskInfo}/>
    }

    return (
        <>
            {overview}
            {tree}
        </>
    )
}
export default FadeTree
export type {TreeNodeInfo}
