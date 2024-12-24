import React, { useRef, useState, CSSProperties } from "react"
import { Button } from "primereact/button"
import { Sidebar } from "primereact/sidebar"

import { Page } from "../pages"
import { PageLinks } from "./PageLinks.tsx"
import css from "./style.module.css"


export type HeaderProps = {
    pages: Page[]
    additional?: (css: CSSProperties) => React.ReactNode
    children?: React.ReactNode
}

export default function Header({pages, additional=()=>(<></>), children}: HeaderProps) {
    const sidebarRef = useRef<Sidebar>(null)
    const [sidebarVisible, setSidebarVisible] = useState(false)

    return (
        <>
            <div className={css.header}>
                <div className={css.title}>Sustainable Space</div>
                <div className={css.options}>
                    <Sidebar ref={sidebarRef} className={css.sidebar}
                             visible={sidebarVisible} position={'right'}
                             onHide={() => setSidebarVisible(false)}
                    >
                        <nav>
                            <PageLinks pages={pages} routed action={()=>{setSidebarVisible(false)}} />
                        </nav>
                        {additional(css)}
                    </Sidebar>
                    <Button icon="pi pi-bars" text className={css.options_button}
                            aria-label={"Destinations"}
                            onClick={() => setSidebarVisible(true)}
                    />
                </div>
            </div>
            <div className={css.subhead}>{children}</div>
        </>
    )
}
