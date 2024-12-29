import React, {RefObject, useContext, useState} from 'react'
import {Vector3} from "three"
import {PointerLockControls} from "three-stdlib"
import {MapControls, OrthographicCamera, View} from "@react-three/drei"
import { useThree } from '@react-three/fiber'

import {Button} from "primereact/button"
import {ListBox, ListBoxChangeEvent} from "primereact/listbox"
import {Sidebar} from "primereact/sidebar"
import {DataTable} from "primereact/datatable"
import {Column} from "primereact/column"
import 'primeicons/primeicons.css'

import {Hud} from "space-sim/components/mechanics/Hud.tsx"
import hudCss from "space-sim/components/mechanics/hud.module.css"
import {SpaceContext} from "space-sim/components/mechanics/SpaceContext.tsx"
import {imageFiles, credits} from "space-sim/components/images.ts"

import Header, { HeaderStyles } from '../Header.tsx'
import {pages} from "../../pages.tsx"


export interface HeadsUpDisplayProps {
    ptrCtrlRef: RefObject<PointerLockControls>
    base?: string
}

export function HeadsUpDisplay(props: HeadsUpDisplayProps) {
    const access = useContext(SpaceContext)

    interface DestItem {
        label: string
        icon?: string
        image?: string
    }
    const destinations: DestItem[] = [  // MUST be kept in sync with Orrery below
        {label: 'Earth', image: imageFiles.icons.earth},
        {label: 'Moon', image: imageFiles.icons.moon},
        {label: 'Habitat1', icon: 'pi pi-globe'},  // FIXME naming, images
        {label: 'Habitat2', icon: 'pi pi-globe'},
        {label: 'Venus', image: imageFiles.icons.venus},
        {label: 'Mercury', image: imageFiles.icons.mercury},
        {label: 'Mars', image: imageFiles.icons.mars},
        {label: 'Jupiter', image: imageFiles.icons.jupiter},
        {label: 'Saturn', image: imageFiles.icons.saturn},
        {label: 'Uranus', image: imageFiles.icons.uranus},
        {label: 'Neptune', image: imageFiles.icons.neptune},

    ]
    const destTemplate = (option: DestItem) => {
        if (option.image)
            // FIXME clickable link to camera??
            return (
                <div className="flex align-items-center">
                    <img src={option.image} alt={option.label} height={"20rem"}/>&nbsp;&nbsp;{option.label}
                </div>
            )
        return (
            <div className="flex align-items-center">
                <i className={option.icon}></i>&nbsp;&nbsp;{option.label}
                {/* FIXME clickable link to camera?? */}
            </div>
        );
    }

    const [destination, setDestination] = useState<DestItem>(destinations[0])
    const [creditsVisible, setCreditsVisible] = useState(false)

    const controlsActivate = () => {
        if (props.ptrCtrlRef.current) {
            if (props.ptrCtrlRef.current.isLocked)
                props.ptrCtrlRef.current.unlock()
            else
                props.ptrCtrlRef.current.lock()
        }
    }

    const to_exp = (n: number)=> {
        return n.toExponential(3);
    }

    // FIXME acquire
    const {camera} = useThree()
    const coordSys = 'J2K ECI'
    let pos = access.system.camera.position // FIXME not correct, plus needs conversion
    pos = camera.position
    const dt = new Date()
    const v = 506.033042
    const rot = [0.394502, 28.039455, 67.403021]
    const statColumns = [
        {field: "datetime", header: "Date/Time"},
        {field: "position", header: "Position"},  // FIXME position coord sys Ra/Dec?
        //{field: "altitude", header: "Altitude"},
        {field: "velocity", header: "Velocity"},
        {field: "rotation", header: "Rotational Vector"},
    ]
    const stats = [{
        position: `${to_exp(pos.x)}, ${to_exp(pos.y)}, ${to_exp(pos.z)} ${coordSys}`,
        datetime: dt.toISOString(),
        velocity: `${v} m/s`,
        rotation: `${rot[0]} ${rot[1]} ${rot[2]}`,
    }]  // FIXME changes during transfer (coord sys, no alt)

    const solSys = (css: HeaderStyles, hide: ()=>void)=> {
        return (
            <>
                <hr/>
                <div className={css.sidebar_header} style={{fontSize: '32px'}}>
                    Destinations
                </div>
                <ListBox value={destination} options={destinations}
                         onChange={(e: ListBoxChangeEvent) => {
                             setDestination(e.value as DestItem)
                             if (hide)
                                 hide()
                         }}
                         itemTemplate={destTemplate}
                    //filter filterBy={"label"}
                />
            </>
        )
    }

    return (
        <>
            <Hud action={controlsActivate}>
                <Header pages={pages} baseName={props.base} extraCss={hudCss}
                        routed={false} additional={solSys}/>
                <div className={hudCss.footer}>
                    <DataTable className={hudCss.stats}
                               value={stats} tableStyle={{minWidth: '50rem'}}>
                        {statColumns.map((col) => (
                            <Column key={col.field} field={col.field} header={col.header}/>
                        ))}
                    </DataTable>
                    <div className={hudCss.credits}>
                        <Sidebar className={hudCss.credits_sidebar}
                                 visible={creditsVisible} position={'right'}
                                 onHide={() => setCreditsVisible(false)}
                        >
                            <div>
                                Images courtesy of:
                                <ul>
                                    {credits.map(({url, label}, i) => (
                                        <li key={i}><a href={url}>{label}</a></li>
                                    ))}
                                </ul>
                            </div>
                        </Sidebar>
                        <Button className={hudCss.credits_button}
                                label={"Credits"} text raised
                                onClick={() => {
                                    console.log("Credits");
                                    setCreditsVisible(true)
                                }}
                        />
                    </div>
                </div>
            </Hud>
            <View style={{position: 'absolute', bottom: 0, right: 0, width: '10%', height: '10%'}}>
                <OrthographicCamera makeDefault position={new Vector3(0, 10, 0)} zoom={100}/>
                {/* FIXME overhead paths (orbits) [dynamic]
                <Scene background="transparent" matrix={matrix} /> */}
                <MapControls makeDefault screenSpacePanning enableRotate={false}/>
            </View>
        </>
    )
}