import React, {Suspense, useRef, useState} from 'react'
import { Canvas } from '@react-three/fiber'
import {Html, OrbitControls} from "@react-three/drei"
import {Button} from "primereact/button"
import {ListBox} from "primereact/listbox"

import 'primeicons/primeicons.css'
import {Sidebar} from "primereact/sidebar"

import Sun from "./space/sun"
import {Orrery} from "./space/orrery"
import {Earth} from "./space/earth"
import {Moon} from "./space/moon"

import css from "./space/space.module.css"


export default function App() {
    const[destination, setDestination] = useState(null)
    interface DestItem {
        label: string
        icon: string
    }
    const destinations: DestItem[] = [
        {label: 'Earth', icon: 'pi pi-globe'},
        {label: 'Moon', icon: 'pi pi-globe'},
    ]
    const sidebarRef = useRef<Sidebar>(null)
    const [visible, setVisible] = useState(false)

    const destTemplate = (option: DestItem) => {
        return (
            <div className="flex align-items-center">
                <i className={option.icon}></i>&nbsp;&nbsp;
                <div>{option.label}</div>
            </div>
        );
    }

    const hud = (
        <div className={css.topbar}>
            <div className={css.title}>Sustainable Space</div>
            <div className={css.options}>
                <Sidebar ref={sidebarRef} className={css.sidebar}
                         style={{top: '-25%', height: '50%', backgroundColor: 'rgba(255, 255, 255, .85)'}}
                         visible={visible} position={'right'}
                         onHide={() => setVisible(false)}
                >
                    <div className={css.sbtitle} style={{fontSize:'32px'}}>
                        Destinations
                    </div>
                    <ListBox value={destination} options={destinations}
                             onChange={(e) => {
                                 setDestination(e.value)
                                 const sidebar = sidebarRef.current
                                 if (sidebar)
                                     sidebar.getMask().hidePopover()
                             }}
                             itemTemplate={destTemplate}
                             //filter filterBy={"label"}
                    />
                </Sidebar>
                <Button icon="pi pi-ellipsis-v" rounded outlined
                        aria-label={"Destinations"}
                        onClick={() => setVisible(true)}
                />
            </div>
        </div>
    )
    const controls = (<OrbitControls minDistance={.57}/>)
    //const controls = (<FlyControls/>)

    return (
        <>
            <div className={css.scene}>
                <Suspense fallback={null}>
                    <Canvas className={css.canvas}
                            camera={{position: [0, 0, 1], fov: 90,}}>
                        <color attach="background" args={["#fff"]}/>
                        <Orrery>
                            {controls}
                            <Sun/>
                            <Earth>
                                <Moon/>
                            </Earth>
                        </Orrery>
                        <Html>
                            {hud}
                        </Html>
                    </Canvas>
                </Suspense>
            </div>
        </>
    )
}
