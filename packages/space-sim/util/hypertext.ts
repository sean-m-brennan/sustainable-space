
export const suggestedFov = (typeof window !== 'undefined') ? 2 * Math.atan(Math.tan(Math.PI/4) * window.innerHeight / window.innerWidth) : 90

export function hasURLParameter(name: string): boolean {
    const re = new RegExp('[?|&]' + name)
    return re.test(location.search)
}

export function getURLParameter(name: string): string | null {
    const re = new RegExp('[?|&]' + name + '=' + '([^&]+?)(&|#||$)')
    return decodeURIComponent((re.exec(location.search) || [", "])[1].replace(/\+/g, '%20')) || null
}

export function insertVideoFallback(container: Element, sources: string[][], width: number) {
    if (typeof window === 'undefined' || typeof document === 'undefined')
        return

    if (typeof width === "undefined")
        width = window.innerWidth
    if (width > window.innerWidth)
        width = window.innerWidth

    const vid = document.createElement('video')
    vid.setAttribute('controls', 'true')
    vid.width = width
    // height is automatic

    for (const source of sources) {
        const src = document.createElement('source')
        src.src = source[0]
        src.type = source[1]
        vid.appendChild(src)
    }
    container.appendChild(vid)
}
