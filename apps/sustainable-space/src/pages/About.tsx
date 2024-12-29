import React from 'react'

import ErrorBoundary from "./ErrorBoundary"
import Header from './Header'
import {PageProps, pages} from "../pages"
import css from "./style.module.css"


export default function About({base = ''}: PageProps) {
    return (
        <ErrorBoundary>
            <div className={`${css.backgrounded} ${css.page}`}>
                <Header pages={pages} baseName={base}>About</Header>
                <div className={css.about}>
                    Founded in 2024, Sustainable Space
                </div>
            </div>
        </ErrorBoundary>
    )
}
