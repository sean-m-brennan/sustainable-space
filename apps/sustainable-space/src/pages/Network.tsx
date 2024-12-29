import React from 'react'

import ITN from "space-sim/components/ITN"
import {setOrreryConfigFromUrl} from "space-sim/planetarium/orrery_impl"

import ErrorBoundary from "./ErrorBoundary"
import Header from './Header'
import {PageProps, pages} from "../pages"
import css from "./style.module.css"
import orrerySpec from "/orrery_config.json?url"


setOrreryConfigFromUrl(orrerySpec)

export default function Network({base = ''}: PageProps) {
    return (
        <ErrorBoundary>
            <div className={`${css.backgrounded} ${css.page}`}>
                <Header pages={pages} baseName={base}>Interplanetary Travel Network</Header>
                <ITN/>
            </div>
        </ErrorBoundary>
    )
}
