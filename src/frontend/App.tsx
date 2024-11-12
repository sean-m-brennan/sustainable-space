import React, {Suspense, useRef, useState} from 'react'
import { Canvas } from '@react-three/fiber'
import {Html, OrbitControls} from "@react-three/drei"
import {Button} from "primereact/button"
import {ListBox, ListBoxChangeEvent} from "primereact/listbox"

import 'primeicons/primeicons.css'
import {Sidebar} from "primereact/sidebar"

import {Orrery} from "@/space-sim/components/Orrery"
import {Sol} from "@/space-sim/Sol"
import {Earth} from "@/space-sim/Earth"
import {Moon} from "@/space-sim/Moon"

import css from "@/space-sim/space.module.css"
import {Bloom, DepthOfField, EffectComposer, Noise, Vignette} from "@react-three/postprocessing";
import {Sun} from "@/space-sim/components/Sun.tsx";


export default function App() {
    interface DestItem {
        label: string
        icon: string
    }
    const destinations: DestItem[] = [
        {label: 'Earth', icon: 'pi pi-globe'},
        {label: 'Moon', icon: 'pi pi-globe'},
    ]
    const[destination, setDestination] = useState<DestItem>(destinations[0])

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
                             onChange={(e: ListBoxChangeEvent) => {
                                 setDestination(e.value as DestItem)
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
    // FIXME keyboard controls
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
                            <Sol/>
                            <Earth>
                                <Moon/>
                            </Earth>
                        </Orrery>
                        <EffectComposer>
                            {/* <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} height={480} /> */}
                            {/* <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} /> */}
                            <Noise opacity={0.02} />
                            {/* <Vignette eskil={false} offset={0.1} darkness={1.1} /> */}
                        </EffectComposer>
                        <Html>
                            {hud}
                        </Html>
                    </Canvas>
                </Suspense>
            </div>
        </>
    )
}
