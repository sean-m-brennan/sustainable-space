
export function hasURLParameter(name: string): boolean {
    const re = new RegExp('[?|&]' + name)
    return re.test(location.search)
}

export function getURLParameter(name: string): string | null {
    const re = new RegExp('[?|&]' + name + '=' + '([^&]+?)(&|#||$)')
    return decodeURIComponent((re.exec(location.search) || [", "])[1].replace(/\+/g, '%20')) || null
}

export function insertVideoFallback(container: Element, sources: string[][], width: number) {
    if (typeof width === "undefined")
        width = window.innerWidth
    if (width > window.innerWidth)
        width = window.innerWidth

    const vid = document.createElement('video')
    vid.setAttribute('controls', 'true')
    vid.width = width
    // height is automatic

    for (const s in sources) {
        const src = document.createElement('source')
        src.src = sources[s][0]
        src.type = sources[s][1]
        vid.appendChild(src)
    }
    container.appendChild(vid)
}
