import React, {Suspense, useRef} from 'react'
import {PointerLockControls} from "three-stdlib"
import {Canvas} from '@react-three/fiber'
import {Preload} from "@react-three/drei"

import {Orrery} from "space-sim/components/mechanics/Orrery.tsx"
import {Sol} from "space-sim/components/Sol.tsx"
import {Earth} from "space-sim/components/Earth.tsx"
import {Moon} from "space-sim/components/Moon.tsx"
import {Habitat} from "space-sim/components/Habitat.tsx"
import {MovementControls, MovementControlsProps} from "space-sim/components/mechanics/MovementControls.tsx"
import {Cameras, CamerasProps} from "space-sim/components/mechanics/Cameras.tsx"
import {habitatSpecsFromJson} from "space-sim/planetarium/habitat_impl.ts"
import {setOrreryConfigFromUrl} from "space-sim/planetarium/orrery_impl.ts"
import css from "../../../../../packages/space-sim/components/space-sim.module.css"

import {ErrorBoundary} from "./ErrorBoundary.tsx"
import {HeadsUpDisplay} from "./HeadsUpDisplay.tsx"

import habitatSpec from "./habitats.json?raw"
import orrerySpec from "/orrery_config.json?url"
import SoundTrack from "./SoundTrack.tsx";


setOrreryConfigFromUrl(orrerySpec)

export type AppProps = {
    tour?: boolean
}

export default function OrreryApp({tour = false}: AppProps) {
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

    if (tour) {
        console.log("Begin tour")
        // FIXME use gesture to start
        // FIXME tour (scripted)
        // FIXME launch movie before script??
    }
    // FIXME scaling

    // FIXME soundtrack
    const sound = "https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg"

    return (
        <div className={css.scene}>
            <ErrorBoundary fallback={errorFallback}>
                <Suspense fallback={waitFallback}>
                    <SoundTrack url={sound}/>
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
