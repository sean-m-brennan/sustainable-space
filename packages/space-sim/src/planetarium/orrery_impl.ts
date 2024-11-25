import {PerspectiveCamera, Vector3} from "three"

import {replacer, reviver} from "../util/extJson"
import {Coordinates, CoordSys} from "../util/coordinates"
import {sunFluxSize, SunState} from "./sun_impl.ts"
import {planetFluxSize, PlanetState} from "./planet_impl.ts"
import {satelliteFluxSize, SatelliteState} from "./satellite_impl.ts"
import Propagator, {defaultSpeed} from "./propagator"
import {suggestedFov} from "../util/hypertext"

import {SpaceDataConfig} from "space-data-api"
import config from '../orrery_config.json?raw'

export const orreryDataConfig = import.meta.env.PROD
    ? JSON.parse(config) as SpaceDataConfig
    : {"host": "127.0.0.1", "port": 9988, "secure": false} as SpaceDataConfig

export interface OrreryParams extends SpaceDataConfig {
    startAt: Date
    duration: number
    coordType: CoordSys
    scale: number
    camera: PerspectiveCamera
}


/********************/
// Worker comms iface

export interface OrreryActions {
    init?: OrreryConstants
    end?: boolean
    control?: string
    sun?: SunState
    planet?: PlanetState
    satellite?: SatelliteState
}

/********************/
// Exchangeable data

export interface OrreryConstants {
    scale: number
    start: Date
    end: Date
    coordinateSys: Coordinates
    propFreq: number
    skymapSize: number
    maxDistance: number
    shadows: boolean
}

class MaxLenArray<T> extends Array<T> {
    constructor(public readonly max: number) {
        super()
    }
    public push(value: T): number {
        if (super.length !== this.max) {
            return super.push(value);
        }
        throw new Error(`Reached max capacity (${this.max})`);
    }
}

export interface OrreryFlux {
    // 38 bytes
    initialized: boolean
    paused: boolean
    ended: boolean
    currentTime: Date  // represent as timestamp
    speed: number
    currentPlanet: number  // FIXME remove?
    stats: number
    // 64 bytes
    sunStates: MaxLenArray<SunState>
    // 1088 bytes
    planetStates: MaxLenArray<PlanetState>
    // 17340 bytes
    satelliteStates: MaxLenArray<SatelliteState>
}
const numSuns = 4
const numPlanets = 16
const numSats = 255

// 18526 bytes
const mutablesByteSize = 38 + numSuns * sunFluxSize + numPlanets * planetFluxSize + numSats * satelliteFluxSize

export interface OrreryState {
    consts: OrreryConstants
    flux: OrreryFlux
    camera: PerspectiveCamera
}

/********************/


export const getLightDirections = (system?: OrreryState): Vector3[] => {
    console.debug("Get light directions")
    if (!system)
        return [] as Vector3[]
    console.debug(`  from the system (${system.flux.sunStates.length})`)
    return [new Vector3(4, 0, 4)]  // FIXME remove
   /* return system.flux.sunStates.map(state => {
        if (state.flux.position !== null)
            return state.flux.position.normalize()
    }) as Vector3[]*/
}


/********************/
// Client to propagation webworker

export const defaultOrreryParams = {
    suns: 1,
    startAt: new Date(),  // now
    duration: 10 * 24 * 60 * 60 * 1000,  // ten virtual days
    coordType: CoordSys.PLANETARY_EQUATORIAL,
    scale: 10000,
    camera: new PerspectiveCamera(suggestedFov),
    ...orreryDataConfig
} as OrreryParams

export const initialOrreryConsts = (params: OrreryParams = defaultOrreryParams) => {
    return {
        scale: params.scale, start: params.startAt, end: new Date(params.startAt.getTime() + params.duration),
        coordinateSys: new Coordinates(params.coordType), propFreq: orreryDefaults.propagation, shadows: orreryDefaults.shadows,
        skymapSize: orreryDefaults.skymapSize, maxDistance: (orreryDefaults.skymapSize / params.scale) - orreryDefaults.skymapOffset,
    }
}

export const initialOrreryFlux = (params: OrreryParams = defaultOrreryParams): OrreryFlux => {
    return {
        initialized: false, paused: true, ended: false, currentTime: params.startAt, speed: defaultSpeed, currentPlanet: -1, stats: 0,
        sunStates: new MaxLenArray(numSuns), planetStates: new MaxLenArray(numPlanets), satelliteStates: new MaxLenArray(numSats),
    }
}

export const initialOrreryState = (params: OrreryParams = defaultOrreryParams): OrreryState => {
    return {
        consts: initialOrreryConsts(params),
        flux: initialOrreryFlux(params),
        camera: params.camera
    }
}

export enum OrreryMsgType {
    Action = 'Action',
    Flux = 'Flux',
}

export interface OrreryMessage {
    seqNum: number
    source: OrreryMsgType
    action: OrreryActions
    flux: OrreryFlux
}

let SEQUENCE = 0

export const incrSeq = (): number => {
    try {
        SEQUENCE++
    } catch (e) {
        SEQUENCE = 0
    }
    return SEQUENCE
}

// main -> worker
const actionMsg = (act: OrreryActions): string => {
    return JSON.stringify({seqNum: incrSeq(), source: OrreryMsgType.Action, action: act}, replacer)
}

// worker -> main
export const fluxMsg = (seq: number, flux: OrreryFlux): string => {
    return JSON.stringify({seqNum: seq, source: OrreryMsgType.Flux, flux: flux}, replacer)
}

export const parseMsg = (msg: string): OrreryMessage => {
    return JSON.parse(msg, reviver) as OrreryMessage
}

export type MsgEncodeType = string

export interface OrreryService {
    state: OrreryState
    onMessage: (evt: MessageEvent<MsgEncodeType>) => void
    onKeyDown: (event: KeyboardEvent) => void
    addSun: (sun: SunState) => number
    addPlanet: (planet: PlanetState) => number
    addSatellite: (sat: SatelliteState) => number
    terminate: () => void
}

export function orreryDataServe(): OrreryService {
    let conn: OrreryService
    if (window.Worker) {
        conn = new OrreryConnect(defaultOrreryParams)  // threaded
    } else {
        conn = new Propagator(defaultOrreryParams)  // async
        // FIXME now run it
    }
    return conn
}

export const orreryDefaults = {
    skymapSize: 10_000_000,
    skymapOffset: 1,
    propagation: 10.0,
    shadows: true,
    minSpeed: 0.01,  // tenth of a sec
    maxSpeed: 3600.0,  // one hr per sec
    defaultSpeed: 60.0,
}

class OrreryConnect implements OrreryService {
    worker: Worker
    //shMem: SharedArrayBuffer
    //shArr: Uint8Array
    state: OrreryState
    //consts: OrreryConstants
    //flux: OrreryFlux
    idents: {[id: string]: number}
    initialized: boolean

    constructor(params: OrreryParams = defaultOrreryParams) {
        if (!crossOriginIsolated)
            console.error("Site is not cross-origin isolated. Cannot use shared memory.")
        this.state = initialOrreryState(params)
        this.idents = {}
        this.initialized = false

        const workerUrl = new URL('./propagator_script.ts', import.meta.url)
        this.worker = new Worker(workerUrl, { type: 'module' })

        //this.shMem = new SharedArrayBuffer(mutablesByteSize)
        //this.shArr = new Uint8Array(this.shMem)  // FIXME not used

        this.onKeyDown = this.onKeyDown.bind(this)
        this.onMessage = this.onMessage.bind(this)
        this.addSun = this.addSun.bind(this)
        this.addPlanet = this.addPlanet.bind(this)
        this.addSatellite = this.addSatellite.bind(this)
        this.terminate = this.terminate.bind(this)

        this.worker.addEventListener('message',
            (evt: MessageEvent<string>): void => {this.onMessage(evt)})

        this.worker.postMessage(actionMsg({init: this.state.consts}))
    }

    onKeyDown(event: KeyboardEvent) {
        if (event.code === 'Space') {
            this.worker.postMessage(actionMsg({control: ">||"}))
        }
        else if (event.code === 'ArrowRight') {
            this.worker.postMessage(actionMsg({control: ">>"}))
        }
        else if (event.code === 'ArrowLeft') {
            this.worker.postMessage(actionMsg({control: "<<"}))
        }
        else if (event.code === 'ArrowUp') {
            this.worker.postMessage(actionMsg({control: "+"}))
        }
        else if (event.code === 'ArrowDown') {
            this.worker.postMessage(actionMsg({control: "-"}))
        }
        else if (event.code === 'Escape') {
            this.worker.postMessage(actionMsg({control: "reset"}))
        }
        else if (event.code === 'Backspace') {
            this.worker.postMessage(actionMsg({control: "restart"}))
        }
    }

    onMessage(evt: MessageEvent<MsgEncodeType>) {
        const data = parseMsg(evt.data)
        if (data.source === OrreryMsgType.Flux) {
            this.state.flux = data.flux

            this.initialized = this.state.flux.initialized
            this.state.flux.sunStates.forEach((state, idx) => {
                    this.idents[state.flux.uuid] = idx
                }
            )
            this.state.flux.planetStates.forEach((state, idx) => {
                    this.idents[state.flux.uuid] = idx
                }
            )
            this.state.flux.satelliteStates.forEach((state, idx) => {
                    this.idents[state.flux.uuid] = idx
                }
            )
        }
    }

    getIndex(uuid: string): number {
        let index = -1;
        (async () =>
            await new Promise<number>((resolve, reject) => {
                const interval = 200  // check freq
                let timeOut = 10000  // total time before error
                const timer = setInterval(() => {
                    timeOut -= interval
                    if (timeOut < 1) {
                        clearInterval(timer)
                        reject(new Error('Timeout on orbital index'))
                    }
                    const index = this.idents[uuid]
                    if (index !== undefined) {
                        clearInterval(timer)
                        resolve(index)
                    }
                }, interval)
            })
        )()
            .then(idx => { index = idx })
            .catch(() => { console.error('Timeout on orbital index')})
        return index
    }

    addSun(sun: SunState): number {
        this.worker.postMessage(actionMsg({sun: sun}))
        return this.getIndex(sun.flux.uuid)
    }

    addPlanet(planet: PlanetState): number {
        this.worker.postMessage(actionMsg({planet: planet}))
        return this.getIndex(planet.flux.uuid)
    }

    addSatellite(sat: SatelliteState): number {
        this.worker.postMessage(actionMsg({satellite: sat}))
        return this.getIndex(sat.flux.uuid)
    }

    terminate() {
        console.log("Terminate worker")
        this.worker.terminate()
    }
}
