import React, {createContext, Dispatch, SetStateAction, useReducer, useState} from "react";
import {Camera, useFrame, useThree} from "@react-three/fiber";
import {PerspectiveCamera} from "three"

import Stars from "./stars"
import {Cameras} from "./cameras"
import {Coordinates, CoordSys} from "./util/coordinates"
import {SunState} from "./sunlight"
import {PlanetState} from "./planet/planet"


export interface OrreryState {
    scale: number
    maxDistance: number
    shadows: boolean
    paused: boolean
    ended: boolean
    start: Date
    currentTime: Date
    coordinateSys: Coordinates
    speed: number
    activeCamera: Camera
    propFreq: number
    currentPlanet: PlanetState | null
    sunStates: SunState[]
}

const initialState = (startAt: Date = new Date(),
                      coordType: CoordSys = CoordSys.PLANETARY_EQUATORIAL,
                      camera = new PerspectiveCamera(),
                      scale: number = 10000): OrreryState => {
    return {
        scale: scale,
        maxDistance: 999,
        shadows: true,
        paused: false,
        ended: false,
        start: startAt,
        currentTime: startAt,
        coordinateSys: new Coordinates(coordType),
        speed: 60.0,
        activeCamera: camera,
        propFreq: 10.0,
        currentPlanet: null,
        sunStates: []
    }
}

/********************/

type SystemDispatch = {
    system: OrreryState,
    dispatch: Dispatch<SetStateAction<any>>
}

export const SpaceContext =
    createContext<SystemDispatch>({system: initialState(), dispatch: () => null})

const reducer = (state: OrreryState, action: SetStateAction<any>) => {
    return { ...state, ...action }
}

/********************/

export interface OrreryProps {
    children: any | any[]
    cameras?: Cameras
    start?: Date
    duration?: number
    coordType?: CoordSys
    scale?: number
}

export function Orrery({start=new Date(), coordType=CoordSys.PLANETARY_ECLIPTIC, duration = 10 * 24 * 60 * 60 * 1000, ...props}: OrreryProps) {
    const minSpeed = 0.01  // tenth of a sec
    const maxSpeed = 3600.0 // one hr per sec
    const defaultSpeed = 60.0

    const state = initialState(start, coordType)
    state.activeCamera = useThree().camera  // FIXME not working
    const [system, dispatch] = useReducer(reducer, state)

    const end = new Date(system.start.getTime() + duration)
    const stars = Stars()

    const [timestepUpdates, setTimestepUpdates] = useState<(() => void)[]>([])
    const [timer] = useState(Date.now())
    const [elapsed, setElapsed] = useState(0)
    const [rawSpeed, setRawSpeed] = useState(defaultSpeed)

    const [count, setCount] = useState(0)
    const incrementCount = () => {
        setCount(count + 1)
    }

    const fps = () => {
        const time = Date.now();
        const ms = time - timer;
        return count / (ms / 1000.0);
    };

    const defaultTimestep = () => {
        dispatch({speed: defaultSpeed / fps()})
    };

    const incrementTime = (secs: number) => {
        setElapsed(elapsed + secs)
        dispatch({currentTime: new Date(system.currentTime.getTime() + secs * 1000)})
        for (let i = 0; i < timestepUpdates.length; i++)
            timestepUpdates[i]()
    };

    const setTime = () => {  // set to elapsed
        dispatch({currentTime: new Date(system.start.getTime() + elapsed * 1000)})
        for (let i = 0; i < timestepUpdates.length; i++)
            timestepUpdates[i]()
    };

    const increaseTimestep = () => {
        const raw = rawSpeed * 10
        if (raw > maxSpeed)
            setRawSpeed(maxSpeed)
        else
            setRawSpeed(raw)
        dispatch({speed: raw / fps()})
        console.debug("Speed " + (raw / fps()).toString())
    };

    const decreaseTimestep = () => {
        const raw = rawSpeed / 10
        if (raw < minSpeed)
            setRawSpeed(minSpeed)
        else
            setRawSpeed(raw)
        dispatch({speed: raw / fps()})
        console.debug("Speed " + (raw / fps()).toString())
    };

    const forwardTime = () => {
        const raw = Math.abs(rawSpeed)
        setRawSpeed(raw)
        dispatch({speed: raw / fps()})
    };

    const backwardTime = () => {
        const raw = -Math.abs(rawSpeed)
        setRawSpeed(raw)
        dispatch({speed: raw / fps()})
    };

    const play = () => {
        dispatch({paused: false})
    };

    const pause = () => {
        dispatch({paused: true})
    };

    const registerTimeUpdate= (funct: () => void) => {
        const updates = timestepUpdates
        updates.push(funct)
        setTimestepUpdates(updates)
    };

    useFrame(() => {
        incrementCount()
        if (!system.paused) {
            incrementTime(system.speed);
            if (system.currentTime > end)
                dispatch({paused: true})
        }
    })

    // FIXME <OrbitControls minDistance={.77}/>
    return (
        <SpaceContext.Provider value={{ system, dispatch }}>
            {stars}
            {props.children}
        </SpaceContext.Provider>
    )
}
