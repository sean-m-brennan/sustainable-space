import React from 'react'

import RepoBlog, {configureRepoBlog, RepoBlogConfig} from "repoblog"

import Header from './Header.tsx'
import {pages, router} from "../pages.tsx"
import css from "./style.module.css"
import blogSpec from "/repoblog_config.json?url"

export default function Blog() {
    const config = configureRepoBlog(blogSpec) as RepoBlogConfig

    return (
        <div className={`${css.backgrounded} ${css.page}`} >
            <Header pages={pages}>Blog</Header>
            <RepoBlog config={config} css={css} serverBasename={router.basename}/>
        </div>
    )
}
