import dotenv from "dotenv"
import React, {Suspense, useRef} from 'react'
import {PointerLockControls} from "three-stdlib"
import {Canvas} from '@react-three/fiber'
import {Preload} from "@react-three/drei"

import {Orrery} from "space-sim/components/mechanics/Orrery"
import {Sol} from "space-sim/components/Sol"
import {Earth} from "space-sim/components/Earth"
import {Moon} from "space-sim/components/Moon"
import {Habitat} from "space-sim/components/Habitat"
import {MovementControls, MovementControlsProps} from "space-sim/components/mechanics/MovementControls"
import {Cameras, CamerasProps} from "space-sim/components/mechanics/Cameras"
import {habitatSpecsFromJson} from "space-sim/planetarium/habitat_impl"
import {setOrreryConfigFromUrl} from "space-sim/planetarium/orrery_impl"
import css from "space-sim/components/space-sim.module.css"

import {ErrorBoundary} from "./ErrorBoundary"
import {HeadsUpDisplay} from "./HeadsUpDisplay"

import habitatSpec from "./habitats.json?raw"
//import orrerySpec from "/orrery_config.json"


setOrreryConfigFromUrl("/orrery_config.json")

export default function App() {
    const ptrCtrl = useRef<PointerLockControls>(null)

    // FIXME static image fallback?
    const errorFallback = (
        <p>Something went wrong</p>
    )
    // FIXME dynamic loading fallback?
    const waitFallback = (
        <p>Loading...</p>
    )

    const habitats = habitatSpecsFromJson(habitatSpec)

    // FIXME dynamic update with target
    const cameraProps = {} as CamerasProps // target={} curve={} line={}
    // FIXME dynamic (onTrack)
    const controlProps = {onTrack: false, pointerControlRef: ptrCtrl} as MovementControlsProps

    // FIXME tour (scripted) vs free (Movement + Hud) [choice popup]
    // FIXME scaling
    // FIXME launch movie before script??

    return (
        <div className={css.scene}>
            <ErrorBoundary fallback={errorFallback}>
                <Suspense fallback={waitFallback}>
                    <Canvas className={css.canvas}>
                        <Cameras {...cameraProps}/>
                        <Preload all />
                        <color attach="background" args={["#000"]}/>
                        <MovementControls {...controlProps}>
                            <Orrery>
                                <HeadsUpDisplay ptrCtrlRef={ptrCtrl}/>
                                <Sol/>
                                <Earth>
                                    <Moon/>
                                    <>
                                        {habitats.map((hab, idx) => (
                                            <Habitat key={idx} {...hab}/>
                                        ))}
                                    </>
                                </Earth>
                                {/* Mars, Jupiter, Venus, asteroid belt */}
                            </Orrery>
                        </MovementControls>
                    </Canvas>
                </Suspense>
            </ErrorBoundary>
        </div>
    )
}
