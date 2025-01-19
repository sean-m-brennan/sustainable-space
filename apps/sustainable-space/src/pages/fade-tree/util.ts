
export const px2num = (s: string): number => {
    if (s.endsWith("px"))
        return parseFloat(s.slice(0, -2))
    else if (s.endsWith("%"))
        return parseFloat(s.slice(0, -1))
    else
        return parseFloat(s)
}

export const countLines = (html: string) => {
    return (html.match(/<br/g) || []).length + 1
}

export type ShapeAttrib = {
    stroke: string
    strokeWidth: string
    fill: string
    fillOpacity: number
    points?: string  // polygon
    r?: string  // circle
    rx?: string  // rounded rect or ellipse
    ry?: string  // (curve can be elliptical)
    d?: string  // path
}

export type ShapeInfo = {
    width: string
    height: string
    shape: "circle" | "ellipse" | "rect" | "polygon" | "path"  // closed svg shapes
    textColor?: string
    textSize?: string
    textFontFamily?: string
} & ShapeAttrib

export const defaultShapeInfo = {
    width: "100px",
    height: "100px",
    shape: "circle",
    stroke: "white",
    strokeWidth: "2px",
    fill: "white",
    fillOpacity: 0.8,
    r: "49%",
} as ShapeInfo


export type LineInfo = {
    stroke: string
    strokeWidth: string
}

export const defaultLineInfo = {
    stroke: "white",
    strokeWidth: "4px"
} as LineInfo
