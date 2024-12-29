import React, {useRef, useState } from "react"
import { Button } from "primereact/button"
import { Sidebar } from "primereact/sidebar"

import { Page } from "../pages"
import { PageLinks } from "./PageLinks.tsx"
import css from "./style.module.css"
import icon from "/icons/icon2.svg"

export interface HeaderStyles {
    readonly header?: string
    readonly header_title?: string
    readonly header_title_icon?: string
    readonly options?: string
    readonly sidebar?: string
    readonly sidebar_header?: string
    readonly sidebar_header_text?: string
    readonly options_button?: string
}

export type HeaderProps = {
    pages: Page[]
    baseName?: string
    extraCss?: HeaderStyles
    routed?: boolean
    additional?: (css: HeaderStyles, hide: ()=>void) => React.ReactNode
    children?: React.ReactNode
}

export default function Header({pages, baseName, extraCss, routed=true, additional=()=>(<></>), children}: HeaderProps) {
    const sidebarRef = useRef<Sidebar>(null)
    const buttonRef = useRef<Button>(null)
    const [sidebarVisible, setSidebarVisible] = useState(false)
    const [buttonVisible, setButtonVisible] = useState(true)

    // overrides
    let headerCss = css.header
    let optionCss = css.options
    if (extraCss) {
        headerCss = `${extraCss.header}`
        optionCss = `${css.options} ${extraCss.options}`
    }

    const hideSidebar = () => {
        setButtonVisible(true)
        setSidebarVisible(false)
    }

    return (
        <>
            <div className={headerCss}>
                <img src={icon} className={css.header_title_icon}/>
                <div className={css.header_title}>Sustainable Space</div>
                <div className={optionCss}>
                    <Sidebar ref={sidebarRef} className={css.sidebar}
                             pt={{header: {className: css.sidebar_header}}}
                             header={<div className={css.sidebar_header_text}>Navigation</div>}
                             visible={sidebarVisible} position={'right'}
                             onHide={() => {
                                 setButtonVisible(true)
                                 setSidebarVisible(false)
                             }}
                    >
                        <nav>
                            <PageLinks pages={pages} baseName={baseName} routed={routed} action={() => {
                                setSidebarVisible(false)
                                setButtonVisible(true)
                            }}/>
                        </nav>
                        {additional(css, hideSidebar)}
                    </Sidebar>
                    <Button ref={buttonRef} className={css.options_button}
                            icon="pi pi-bars" text
                            aria-label={"Destinations"}
                            visible={buttonVisible}
                            onClick={() => {
                                setButtonVisible(false)
                                setSidebarVisible(true)
                            }}
                    />
                </div>
            </div>
            <div className={css.subhead}>{children}</div>
        </>
    )
}
