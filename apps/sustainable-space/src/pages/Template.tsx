import React, {useEffect, useState } from 'react'
import {marked} from "marked"
import {baseUrl} from "marked-base-url"
import DOMPurify from "dompurify"

import ErrorBoundary from "./ErrorBoundary"
import Header from './Header'
import {PageProps, pages} from "../pages"
import css from "./style.module.css"


export type TemplateProps = {
    name: string
    url: string
} & PageProps

export default function Template({base = '', ...props}: TemplateProps) {
    const [html, setHtml] = useState<string>("")

    useEffect(() => {
        marked.use(
            {async: true},
            baseUrl(base),
        )
    }, [base])

    useEffect(() => {
        const url = `${base}/${props.url}`.replace("//", "/")
        if (props.url.endsWith(".md")) {
            fetch(url)
                .then(response => response.blob())
                .then(blob => blob.text())
                .then(markdown => marked.parse(markdown))
                .then(ht => setHtml(DOMPurify.sanitize(ht)))
                .catch((err) => console.error(err))
        } else if (props.url.endsWith(".html")) {
            fetch(url)
                .then(response => response.blob())
                .then(blob => blob.text())
                .then(ht => setHtml(DOMPurify.sanitize(ht)))
                .catch((err) => console.error(err))
        } else
            console.error(`Unsupported content: ${props.url}`)
    }, [base, props.url])

    return (
        <ErrorBoundary>
            <div className={`${css.backgrounded} ${css.page}`}>
                <Header pages={pages} baseName={base}>{props.name}</Header>
                <div className={props.name.toLowerCase()}
                     dangerouslySetInnerHTML={{__html: html}}/>
            </div>
        </ErrorBoundary>
    )
}
