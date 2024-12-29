import React from 'react'

import RepoBlog, {configureRepoBlog, RepoBlogConfig} from "repoblog"

import ErrorBoundary from "./ErrorBoundary"
import Header from './Header.tsx'
import {PageProps, pages} from "../pages.tsx"
import css from "./style.module.css"
import blogSpec from "/repoblog_config.json?url"


export default function Blog({base = ''}: PageProps) {
    const config = configureRepoBlog(blogSpec) as RepoBlogConfig

    return (
         <ErrorBoundary>
             <div className={`${css.backgrounded} ${css.page}`} >
                 <Header pages={pages} baseName={base}>Blog</Header>
                 <RepoBlog config={config} css={css} serverBasename={base}/>
             </div>
         </ErrorBoundary>
    )
}
