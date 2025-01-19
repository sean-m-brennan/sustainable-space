import {useRef} from "react"
import useFade, {MaskInfo} from "./useFade"

export type FadeTextProps = {
    content: string
    top: number
    left: number
    width: number
    height: number
    backColor?: string
    padding?: string
    mask: MaskInfo
    easing?: string
    delay?: number
    maxTransparency?: number
    maxOpacity?: number
    textFontSize?: string
    textFontColor?: string
    textFontFamily?: string
}

export default function FadeText(props: FadeTextProps) {
    const background = props.backColor ? props.backColor : "rgba(0, 0, 0, .7)"
    const pad = props.padding ? props.padding : "10px"
    const easing = props.easing ? props.easing : "1s"
    const delay = props.delay ? props.delay : `${Number(easing.slice(0, -1)) * .5}s`
    const fontSize = props.textFontSize ? props.textFontSize : "32px"
    const fontColor = props.textFontColor ? props.textFontColor : "white"
    const fontFamily = props.textFontFamily ? props.textFontFamily : "Verdana, Helvetica, Arial, sans-serif"

    const targetRef = useRef<HTMLDivElement>(null)
    const opacity = useFade(targetRef, props.mask, props.maxTransparency, props.maxOpacity)

    return (
        <div ref={targetRef}
             style={{position: "absolute", top: props.top, left: props.left,
                 width: props.width, height: props.height,
                 textAlign: "center", alignContent: "center",
                 opacity: opacity, transition: `opacity ${easing} ease-in-out ${delay}`,
                 color: fontColor, fontSize: fontSize, fontFamily: fontFamily, zIndex: 1001,
                 backgroundColor: background, padding: pad}}
             dangerouslySetInnerHTML={{__html: props.content}}/>
    )
}
