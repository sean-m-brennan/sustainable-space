import React, { useRef, useState, CSSProperties } from "react"
import { Button } from "primereact/button"
import { Sidebar } from "primereact/sidebar"

import { Page } from "../pages"
import { PageLinks } from "./PageLinks.tsx"
import css from "./style.module.css"
import icon2 from "/icons/icon2.svg"


export type HeaderProps = {
    pages: Page[]
    additional?: (css: CSSProperties) => React.ReactNode
    children?: React.ReactNode
}

export default function Header({pages, additional=()=>(<></>), children}: HeaderProps) {
    const sidebarRef = useRef<Sidebar>(null)
    const buttonRef = useRef<Button>(null)
    const [sidebarVisible, setSidebarVisible] = useState(false)
    const [buttonVisible, setButtonVisible] = useState(true)

    return (
        <>
            <div className={css.header}>
                <img src={icon2} className={css.title_icon}/>
                <div className={css.title}>Sustainable Space</div>
                <div className={css.options}>
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
                            <PageLinks pages={pages} routed action={() => {
                                setSidebarVisible(false)
                            }}/>
                        </nav>
                        {additional(css)}
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
