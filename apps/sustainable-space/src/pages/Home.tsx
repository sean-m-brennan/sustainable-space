import {RefObject, SyntheticEvent, useEffect, useRef, useState } from "react"

import {fetchJsonSync} from "fetch-sync"

import ErrorBoundary from "./ErrorBoundary"
import Header from './Header'
import {PageProps, pages, useNavigate} from "../pages"
import FadeTree, {TreeNodeInfo} from "./fade-tree/FadeTree"

import css from "./style.module.css"
import map from "./map-2k.png"
// @ts-expect-error Metadata from vite-imagetools
import {width as mapWidth, height as mapHeight} from "./map-2k.png?as=meta:width;height"
import tree from "/content.json?url"
import { Sidebar } from "primereact/sidebar"
import { Button } from "primereact/button"


export default function Home({base = ''}: PageProps) {
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerWidth * (mapHeight/mapWidth)
    })
    const promptOpacity = 0.3
    const [prompt, setPrompt] = useState<number>(promptOpacity)
    const [org] = useState<TreeNodeInfo>(fetchJsonSync(tree) as TreeNodeInfo)
    const [creditsVisible, setCreditsVisible] = useState<boolean>(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const scrollerRef = useRef<HTMLDivElement>(null)
    const creditsRef = useRef<Sidebar>(null)
    const navigate = useNavigate()

    const handleResize = () => {
        let width = window.innerWidth
        if (containerRef.current)
            width = containerRef.current.offsetWidth
        const height = Math.floor((dimensions.height / dimensions.width) * width)
        setDimensions({width: width, height: height})
    }

    useEffect(() => {
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
        // eslint-disable-next-line
    }, [])

    const scrollHandler = (event: SyntheticEvent<HTMLDivElement>) => {
        if (event.currentTarget.scrollTop > 0)
            setPrompt(0.)
        else
            setPrompt(promptOpacity)
    }

    const scrollToTop = (ref: RefObject<HTMLDivElement>) =>
        () => {
            if (ref.current) {
                ref.current.scrollTo({top: 0, behavior: "smooth"})
            }
        }

    const onImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
        const img = event.target as HTMLImageElement
        setDimensions({width:img.offsetWidth, height:img.offsetHeight})
    }
    const overview = "This is some sample text<br/>bannered across the image"

    return (
        <ErrorBoundary>
            <div className={`${css.backgrounded} ${css.page} ${css.home}`} ref={scrollerRef}
                 style={{position: "relative"}} onScroll={scrollHandler}>
                <Header pages={pages} baseName={base}><i>Life out there begins down here.</i></Header>
                <div id="info" className={css.home} ref={containerRef}>
                    <img onLoad={onImageLoad} style={{zIndex: 0, position: "absolute", width: "100%"}} src={map}
                         alt={""}/>
                    <div style={{textAlign: "center", position: "absolute", top: "80%", width: "100%"}}>
                        <i className={"pi pi-chevron-down"} style={{fontSize: '5rem', opacity: prompt}}/>
                    </div>
                    {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                    <FadeTree data={org} container={containerRef} nav={navigate}
                              width={dimensions.width} height={dimensions.height}
                              maskMargins={"-10% 0px -20% 0px"} maskThreshold={0.25}
                              rooted={"bottom"} overview={overview}/>

                </div>
                <div style={{textAlign: "center", zIndex: 101, backgroundColor: "rgba(0, 0, 0, .2)",
                    position: "absolute", top: `${dimensions.height + 100}px`, right: "2%"}}
                     onClick={scrollToTop(scrollerRef)}>
                    <i className={"pi pi-sort-up-fill"} style={{color: "white", fontSize: '42px', opacity: .5}}/>
                </div>
                <div style={{textAlign: "center", zIndex: 101, color: "white",
                    opacity:.5, backgroundColor: "rgba(0, 0, 0, .3)",
                    position: "absolute", top: `${dimensions.height + 160}px`, right: "1.5%"}}>
                    <Sidebar ref={creditsRef} className={css.home_credits} position={'left'}
                             visible={creditsVisible} onHide={() => setCreditsVisible(false)}
                    >
                        Background image composed from the following Creative Commons or USGov images:
                        <ul>
                            <li>
                                <a className={css.home_credits_link} href={"https://eol.jsc.nasa.gov/SearchPhotos/photo.pl?mission=ISS059&roll=E&frame=104604"}>ISS059-E-104604</a> - Image courtesy of the Earth Science and Remote Sensing Unit, NASA Johnson Space Center
                            </li>
                            <li>
                                <a className={css.home_credits_link} href={"https://commons.wikimedia.org/wiki/File:White_Clouds_in_the_Sky_Above_Mountains.jpg"}>White Clouds in the Sky Above Mountains</a> - Wikimedia
                            </li>
                            <li>
                                <a className={css.home_credits_link} href={"https://commons.wikimedia.org/wiki/File:Smoky_Mountains_(9354061830).jpg"}>Smoky Mountains</a> - Wikimedia
                            </li>
                            <li>
                                <a className={css.home_credits_link} href={"https://commons.wikimedia.org/wiki/File:Lush_green_pine_forest_(Unsplash).jpg"}>Lush green pine forest</a> - Wikimedia
                            </li>
                            <li>
                                <a className={css.home_credits_link} href={"https://commons.wikimedia.org/wiki/File:Cabin_at_Tipton_Place_at_Great_Smoky_Mountains_National_Park.jpg"}>Cabin at Tipton Place at Great Smoky Mountains National Park</a> - Wikimedia
                            </li>
                        </ul>
                    </Sidebar>
                    <Button style={{backgroundColor: "transparent", color: "white"}}
                            onClick={() => setCreditsVisible(true)}>Credits</Button>
                </div>
            </div>
        </ErrorBoundary>
    )
}
