import React, {RefObject, useContext, useRef, useState} from 'react'
import {Vector3} from "three"
import {PointerLockControls} from "three-stdlib"
import {MapControls, OrthographicCamera, View} from "@react-three/drei"
import {Button} from "primereact/button"
import {ListBox, ListBoxChangeEvent} from "primereact/listbox"

import 'primeicons/primeicons.css'
import {Sidebar} from "primereact/sidebar"
import {DataTable} from "primereact/datatable"
import {Column} from "primereact/column"

import {Hud} from "space-sim/components/mechanics/Hud.tsx"
import hudCss from "space-sim/components/mechanics/hud.module.css"
import {SpaceContext} from "space-sim/components/mechanics/SpaceContext.tsx"
import {imageFiles, credits} from "space-sim/components/images.ts"


export interface HeadsUpDisplayProps {
    ptrCtrlRef: RefObject<PointerLockControls>
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
    const sidebarRef = useRef<Sidebar>(null)
    const [sidebarVisible, setSidebarVisible] = useState(false)
    const [creditsVisible, setCreditsVisible] = useState(false)

    const controlsActivate = (_: React.MouseEvent<HTMLDivElement>) => {
        if (props.ptrCtrlRef.current) {
            if (props.ptrCtrlRef.current.isLocked)
                props.ptrCtrlRef.current.unlock()
            else
                props.ptrCtrlRef.current.lock()
        }
    }

    // FIXME acquire
    const coordSys = 'J2K ECI'
    const pos = [34.569558, 100.334320, 395.303021]
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
        position: `${pos[0]} ${pos[1]}, ${pos[2]} ${coordSys}`,
        datetime: dt.toISOString(),
        velocity: `${v} m/s`,
        rotation: `${rot[0]} ${rot[1]} ${rot[2]}`,
    }]  // FIXME changes during transfer (coord sys, no alt)

    return (
        <>
            <Hud action={controlsActivate}>
                <div className={hudCss.title}>Sustainable Space</div>
                <div className={hudCss.options}>
                    <Sidebar ref={sidebarRef} className={hudCss.sidebar}
                             style={{top: '-25%', height: '50%', backgroundColor: 'rgba(255, 255, 255, .85)'}}
                             visible={sidebarVisible} position={'right'}
                             onHide={() => setSidebarVisible(false)}
                    >
                        <div className={hudCss.sbtitle} style={{fontSize: '32px'}}>
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
                    <Button icon="pi pi-bars" text
                            style={{fontSize: 26, borderColor: "transparent", backgroundColor: "transparent"}}
                            aria-label={"Destinations"}
                            onClick={() => setSidebarVisible(true)}
                    />
                </div>
                {/********************/}
                <div style={{position: "relative"}}>
                    <DataTable value={stats} tableStyle={{minWidth: '50rem'}}
                               style={{position: "absolute", bottom: 0, left: 0}}>
                        {statColumns.map((col) => (
                            <Column key={col.field} field={col.field} header={col.header}/>
                        ))}
                    </DataTable>
                </div>
                {/* Credits button not working; position incorrect */}
                <div className={hudCss.credits}>
                    <Sidebar
                        style={{bottom: 0, height: '25%', backgroundColor: 'rgba(255, 255, 255, .85)'}}
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
                    <Button label={"Credits"} text raised
                            style={{position: "absolute", bottom: 0, right: 0, fontSize: 10, backgroundColor: "transparent"}}
                            onClick={() => {
                                console.log("Credits");
                                setCreditsVisible(true)
                            }}
                    />
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