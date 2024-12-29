import React from 'react'

import ErrorBoundary from "./ErrorBoundary"
import Header from './Header'
import {PageProps, pages} from "../pages"
import css from "./style.module.css"

export default function NotFound({base = ''}: PageProps) {
    return (
        <ErrorBoundary>
            <div className={`${css.backgrounded} ${css.page}`}>
                <Header pages={pages} baseName={base}>404 - Not Found</Header>
            </div>
        </ErrorBoundary>
    )
}

