import React from 'react'

import Header from './Header'
import {pages} from "../pages"
import css from "./style.module.css"

export default function About() {
    return (
        <div className={`${css.backgrounded} ${css.page}`}>
            <Header pages={pages}>About</Header>
            <div className={css.about}>
                Founded in 2024, Sustainable Space
            </div>
        </div>
    )
}
