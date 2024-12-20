import React from 'react'

import {imageFiles} from "space-sim/components/images"

export default function App() {
    console.log(imageFiles.splash)
    return (
        <div style={{backgroundImage: imageFiles.splash, width: "100%", height: "100%", backgroundSize: "contain"}}>
            <h1>Sustainable Space</h1>
            <a href={"./tour.html"}>Tour</a>&nbsp;
            <a href={"./explore.html"}>Explore</a>&nbsp;
            <a href={"./blog.html"}>Blog</a>&nbsp;
            <a href={"./about.html"}>About</a>
        </div>
    )
}
