import React from "react"
import {Html} from "@react-three/drei"

import {Sidebar} from "primereact/sidebar"

import hudMask from "../images/hud_mask.png?url"
import css from "../space-sim.module.css"

export interface HudProps {
    children?: React.ReactNode
    action: (evt: React.MouseEvent<HTMLDivElement>) => void
}

export function Hud(props: HudProps) {
    return (
        <Html occlude> {/* occlude transform distanceFactor  position */}
            <Sidebar visible fullScreen
                     onHide={()=>{}}
                     showCloseIcon={false}>
                <img src={hudMask} alt="" className={css.hud_mask}/>
                <div className={css.hud}>
                    {props.children}
                </div>
                <div className={css.action} onClick={props.action}/>
            </Sidebar>
        </Html>
    )
}