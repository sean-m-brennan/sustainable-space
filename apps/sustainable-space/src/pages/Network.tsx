import React from 'react'

import ITN from "space-sim/components/ITN"

import Header from './Header'
import {pages} from "../pages"
import css from "./style.module.css"

export default function Network() {
    const positions = {}  // FIXME get current planet positions

    return (
        <div className={`${css.backgrounded} ${css.page}`}>
            <Header pages={pages}>Interplanetary Travel Network</Header>
            <ITN positions={positions}/>
        </div>
    )
}
