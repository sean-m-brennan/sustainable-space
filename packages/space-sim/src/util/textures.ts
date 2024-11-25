import {Color, DataTexture, RGBAFormat} from "three"

// original function from older three.js (r73)
export function generateDataTexture(width: number, height: number, color: Color) {
    const size = width * height
    const data = new Uint8Array(3 * size)
    const r = Math.floor(color.r * 255)
    const g = Math.floor(color.g * 255)
    const b = Math.floor(color.b * 255)
    for (let i = 0; i < size; i++) {
        data[i * 3] = r
        data[i * 3 + 1] = g
        data[i * 3 + 2] = b
    }
    const texture = new DataTexture(data, width, height, RGBAFormat)
    texture.needsUpdate = true
    return texture
}

export function getMaxTextureSize(): number | null {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext("webgl")
    if (gl === null)
        return null
    const maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number
    console.debug("Max texture size " + maxSize)
    return maxSize
}

export function clampToMaxSize(image: HTMLImageElement) {
    const maxSize = getMaxTextureSize()
    if (maxSize === null)
        return null
    if (image.width <= maxSize && image.height <= maxSize) {
        return image
    }

    // Warning: Scaling through the canvas will only work with images that use
    // premultiplied alpha.
    const maxDimension = Math.max(image.width, image.height)
    const newWidth = Math.floor(image.width * maxSize / maxDimension)
    const newHeight = Math.floor(image.height * maxSize / maxDimension)

    const canvas = document.createElement('canvas')
    canvas.width = newWidth
    canvas.height = newHeight
    const ctx = canvas.getContext("2d")
    if (ctx !== null)
        ctx.drawImage(image, 0, 0, image.width, image.height,
            0, 0, newWidth, newHeight)
    return canvas
}

export function HSVtoRGB(h: number, s: number, v: number): [number, number, number] {
    let r, g, b
    const i = Math.floor(h * 6)
    const f = h * 6 - i
    const p = v * (1 - s)
    const q = v * (1 - f * s)
    const t = v * (1 - (1 - f) * s)

    switch (i % 6) {
        case 0:
            r = v
            g = t
            b = p
            break
        case 1:
            r = q
            g = v
            b = p
            break
        case 2:
            r = p
            g = v
            b = t
            break
        case 3:
            r = p
            g = q
            b = v
            break
        case 4:
            r = t
            g = p
            b = v
            break
        default:
            r = v
            g = p
            b = q
            break
    }

    return [r * 255, g * 255, b * 255]
}

export function clamp(num: number, min: number, max: number) {
    return num < min ? min : num > max ? max : num
}

// from https://gist.github.com/EDais/1ba1be0fe04eca66bbd588a6c9cbd666
export function	tempToColor(tempK: number): number {  // 2000K to 45000K
    tempK = clamp(tempK, 2000, 45000) / 100

    const rgb = {
        r: tempK <= 66 ?
            255 :
            clamp(329.698727446 * (Math.pow(tempK - 60, -0.1332047592)), 0, 255),
        g: tempK <= 66 ?
            clamp(99.4708025861 * Math.log(tempK) - 161.1195681661, 0, 255) :
            clamp(288.1221695283 * (Math.pow(tempK - 60, -0.0755148492)), 0, 255),
        b: tempK >= 66 ?
            255 :
            (tempK <= 19 ?
                0 :
                clamp(138.5177312231 * Math.log(tempK - 10) - 305.0447927307, 0, 255))
    }
    return (rgb.r << 16) + (rgb.g << 8) + rgb.b
}

export function getGoldenRatioColor(s: number = 0.99, v: number = 0.99): [number, number, number] {
    const ratio = 0.618033988749895
    let h = Math.random()
    h += ratio
    h %= 1
    return HSVtoRGB(h, s, v)
}

export function randomColor() {
    function c() {
        return Math.floor(Math.random() * 256).toString(16)
    }
    return "#" + c() + c() + c()
}

export function randomColorRatioed() {
    // FIXME not working
    const arr = getGoldenRatioColor(0.3)  // FIXME brighter?
    return "#" + arr[0].toString(16) + arr[1].toString(16) +
        arr[2].toString(16)
}
