import {RefObject, useEffect, useState } from "react"

export type MaskInfo = {
    maskRef?: RefObject<HTMLDivElement> | null
    margin?: string
    threshold?: number
}

export default function useFade(targetRef: RefObject<HTMLDivElement>, mask: MaskInfo,
                                maxTransparency?: number, maxOpacity?: number) {
    const maxT = maxTransparency ? maxTransparency : 0.0
    const maxO = maxOpacity ? maxOpacity : 1.0
    const [opacity, setOpacity] = useState<number>(maxT)

    useEffect(() => {
        const target = targetRef.current
        const maskRef = mask.maskRef && mask.maskRef.current ? mask.maskRef.current : null
        const margin = mask.margin ? mask.margin.replace(",", "") : "0px 0px 0px 0px"
        const threshold = mask.threshold? mask.threshold : 1.0

        const intersect = (entries: IntersectionObserverEntry[])=> {
            const [entry] = entries
            if (targetRef.current) {
                if (entry.isIntersecting) {
                    setOpacity(maxO)
                } else {
                    setOpacity(maxT)
                }
            }
        }
        const options = {
            root: maskRef,  // NB: root must be an ancestor of target
            rootMargin: margin,
            threshold: threshold  // exec callback when x% of element is intersecting
        }
        const observer = new IntersectionObserver(intersect, options)
        if (target)
            observer.observe(target)
        return () => {
            if (target)
                observer.unobserve(target)
        }
        // eslint-disable-next-line
    }, [mask.margin, mask.maskRef, mask.threshold, targetRef])

    return opacity
}