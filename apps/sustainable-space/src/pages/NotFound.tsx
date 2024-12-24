import React from 'react'

import Header from './Header'
import {pages} from "../pages"
import css from "./style.module.css"

export default function NotFound() {
    return (
        <div className={`${css.backgrounded} ${css.page}`}>
            <Header pages={pages}>404 - Not Found</Header>
        </div>
    )
}

