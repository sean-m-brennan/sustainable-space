import React from 'react'

import ErrorBoundary from "./ErrorBoundary"
import Header from './Header'
import {PageProps, pages} from "../pages"
import css from "./style.module.css"
import map from "/map-2k.png"  // TODO responsive dynamic import per screen size

// FIXME credits
// https://eol.jsc.nasa.gov/ ISS059-E-104604 - Image courtesy of the Earth Science and Remote Sensing Unit, NASA Johnson Space Center
// https://commons.wikimedia.org/wiki/File:White_Clouds_in_the_Sky_Above_Mountains.jpg
// https://commons.wikimedia.org/wiki/File:Smoky_Mountains_(9354061830).jpg
// https://commons.wikimedia.org/wiki/File:Lush_green_pine_forest_(Unsplash).jpg
// https://commons.wikimedia.org/wiki/File:Stars_Great_Smoky_Mountains_(Unsplash).jpg
// https://commons.wikimedia.org/wiki/File:Stars_Great_Smoky_Mountains_(Unsplash).jpg

export default function Home({base = ''}: PageProps) {
    return (
        <ErrorBoundary>
            <div className={`${css.backgrounded} ${css.page} ${css.home}`}>
                <Header pages={pages} baseName={base}><i>Life out there begins down here.</i></Header>
                <div className={css.home}>
                    {/* FIXME images and text */}
                    <img style={{width: "100%"}} src={map} alt={""}/>

                    {/* FIXME credits */}
                </div>
            </div>
         </ErrorBoundary>
    )
}
