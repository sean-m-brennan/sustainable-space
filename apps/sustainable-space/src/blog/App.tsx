import React from 'react'

import {imageFiles} from "space-sim/components/images"
import RepoBlog from "repoblog"

import blogSpec from "/repoblog_config.json?url"


export default function App() {
    console.log(imageFiles.splash)

    return (
        <div style={{backgroundImage: imageFiles.splash, width: "100%", height: "100%", backgroundSize: "contain"}}>
            <h1>Sustainable Space</h1>
            <h3>Blog</h3>
            <RepoBlog configFile={blogSpec}/>
        </div>
    )
}
