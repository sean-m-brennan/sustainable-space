import {Vector3} from "three"

import {
    defaultOrreryParams,
    fluxMsg,
    incrSeq,
    initialOrreryConsts,
    initialOrreryFlux, initialOrreryState,
    MsgEncodeType,
    OrreryConstants,
    OrreryFlux,
    OrreryMsgType,
    OrreryParams,
    OrreryService, OrreryState,
    parseMsg
} from "./orrery"
import {EarthConsts} from "./constants"
import {BasicState} from "./orrery_state"
import {changeOrbiterPosition, changeSunPosition, OrbitConsts} from "./orbital_data"
import {PLANETS, SATELLITES} from "./naif_objects"
import {SunState} from "./sun"
import {PlanetState} from "./planet"
import {SatelliteState} from "./satellite"
import {SpaceData} from "./space_data_service"


/********************
 * Web worker functionality
 * - either computes planetary propagation
 *   or requests/receives it from server
 */

const minSpeed = 0.01  // tenth of a sec
const maxSpeed = 3600.0  // one hr per sec
export const defaultSpeed: number = 60.0

export default class Propagator implements OrreryService {
    readonly stepTime = 1000.0 / 60  // milliseconds per step/frame
    readonly earthOrbit = new EarthConsts()

    state: OrreryState
    //consts: OrreryConstants
    //flux: OrreryFlux

    private started: boolean
    private timer: number
    private count: number
    private elapsed: number
    private rawSpeed: number
    private timestepUpdates: (()=>void)[]
    private done: boolean
    private service: SpaceData | null
    private initialized: boolean

    constructor(params: OrreryParams = defaultOrreryParams) {
        this.service = null
        if (params.host !== null)
            this.service = new SpaceData(params.host, params.port)
        this.done = false
        this.started = false
        this.initialized = false

        this.state = initialOrreryState(params)
        //this.consts = initialOrreryConsts(params)
        //this.flux = initialOrreryFlux(params)

        this.timer = Date.now()
        this.count = 0
        this.elapsed = 0
        this.rawSpeed = defaultSpeed
        this.timestepUpdates = []
    }

    async sleep(ms: number) {
        await new Promise(resolve => setTimeout(resolve, ms));
    }

    fps() {
        const ms = Date.now() - this.timer
        return this.count / (ms / 1000.0)
    };

    defaultTimestep() {
        this.state.flux.speed = defaultSpeed / this.fps()
    }

    incrementTime(secs: number) {
        this.elapsed += secs
        this.state.flux.currentTime = new Date(this.state.flux.currentTime.getTime() + secs * 1000)
        for (let i = 0; i < this.timestepUpdates.length; i++)
            this.timestepUpdates[i]()
    }

    setTime(){  // set to elapsed
        this.state.flux.currentTime = new Date(this.state.consts.start.getTime() + this.elapsed * 1000)
        for (let i = 0; i < this.timestepUpdates.length; i++)
            this.timestepUpdates[i]()
    }

    increaseTimestep = () => {
        this.rawSpeed *= 10
        if (this.rawSpeed > maxSpeed)
            this.rawSpeed = maxSpeed
        this.state.flux.speed = this.rawSpeed / this.fps()
        console.debug(`Speed ${this.state.flux.speed}`)
    }

    decreaseTimestep = () => {
        this.rawSpeed /= 10
        if (this.rawSpeed < minSpeed)
            this.rawSpeed = minSpeed
        this.state.flux.speed = this.rawSpeed / this.fps()
        console.debug(`Speed ${this.state.flux.speed}`)
    }

    forwardTime(){
        this.rawSpeed = Math.abs(this.rawSpeed)
        this.state.flux.speed = this.rawSpeed / this.fps()
        console.debug(`Speed ${this.state.flux.speed}`)
    }

    backwardTime = () => {
        this.rawSpeed = -Math.abs(this.rawSpeed)
        this.state.flux.speed = this.rawSpeed / this.fps()
        console.debug(`Speed ${this.state.flux.speed}`)
    }

    togglePlay = () => {
        this.state.flux.paused = !this.state.flux.paused
        console.debug(`Propagator running: ${!this.state.flux.paused}`)
    }

    //registerTimeUpdate(funct: () => void){
    //    this.timestepUpdates.push(funct)
    //};

    async tick(): Promise<boolean> {
        this.count++
        if (!this.state.flux.paused) {
            this.started = true
            this.incrementTime(this.state.flux.speed);

            const service = await this.service?.check()

            const setFunct = (obj: BasicState) =>
                (coords: Vector3) => {
                    if (obj.flux.position)
                        obj.flux.position.set(coords.x, coords.y, coords.z)
                    else
                        obj.flux.position = coords
                }

            for (const sun of this.state.flux.sunStates) {
                if (service && sun.orbit.name.toUpperCase() == 'SUN') {
                    const coords = await service.currentPosition(this.state.flux.currentTime, sun.orbit.name)
                    setFunct(sun)(new Vector3(...coords))
                } else {
                    // fixme no camera?
                    const coords = changeSunPosition(this.state.flux.currentTime, sun, this.earthOrbit)
                    setFunct(sun)(coords)
                }
            }
            for (const planet of this.state.flux.planetStates) {
                if (planet.orbit.name.toUpperCase() == 'EARTH') {
                    if (!planet.flux.position)
                        planet.flux.position = new Vector3(0,0,0)
                    // FIXME  rotation
                    continue  // center of coordinate system, no movement
                }
                if (service && planet.orbit.name.toUpperCase() in PLANETS) {
                    const coords = await service.currentPosition(this.state.flux.currentTime, planet.orbit.name)
                    setFunct(planet)(new Vector3(...coords))
                } else {
                    const sun = this.state.flux.sunStates[0]  // TODO ideally, barycenter of all suns
                    if (!sun) {
                        console.error(`No suns in the system!`)
                        continue
                    }
                    if (!sun.flux.position) {
                        console.error(`Sun for ${planet.orbit.name} has no position`)
                        continue
                    }
                    const [moved, coords] = changeOrbiterPosition(planet.orbit as OrbitConsts, this.state.flux.speed,
                        planet.flux.travelled, this.earthOrbit.eclipticRef, sun.flux.position)
                    setFunct(planet)(new Vector3(...coords))
                    planet.flux.travelled = moved
                }
            }
            for (const satellite of this.state.flux.satelliteStates) {
                if (service && satellite.orbit.name.toUpperCase() in SATELLITES) {
                    const coords = await service.currentPosition(this.state.flux.currentTime, satellite.orbit.name)
                    setFunct(satellite)(new Vector3(...coords))
                } else {
                    const planet = this.state.flux.planetStates[satellite.planetIdx]
                    if (!planet)
                        console.error(`No associated planet for ${satellite.orbit.name}`)
                    else if (!planet.flux.position)
                        console.error(`Planet for ${satellite.orbit.name} has no position`)
                    else {
                        const [moved, coords] = changeOrbiterPosition(satellite.orbit as OrbitConsts, this.state.flux.speed,
                            satellite.flux.travelled, planet.orbit.eclipticRef, planet.flux.position)
                        setFunct(satellite)(new Vector3(...coords))
                        satellite.flux.travelled = moved
                    }
                }
            }
            if (this.state.flux.currentTime > this.state.consts.end)
                this.state.flux.paused = true
            this.state.flux.stats = this.fps()

            postMessage(fluxMsg(incrSeq(), this.state.flux))  // FIXME no-copy?
        }
        return this.done
    }

    async main() {
        let done: boolean = false
        console.debug("Propagation thread started")
        while (!this.initialized) {
            await this.sleep(this.stepTime)
        }
        console.debug("Propagate")
        while (!done) {
            const begin = Date.now()
            done = await this.tick()
            const elapsed = Date.now() - begin
            if (elapsed < this.stepTime)
                await this.sleep(this.stepTime - elapsed)
        }
        console.debug("Propagator done")
    }

    addSun(sun: SunState) {
        let found = false
        let index = this.state.flux.sunStates.length
        this.state.flux.sunStates.map(sun => sun.orbit.name).forEach((name, idx) => {
            if (name === sun.orbit.name) {
                this.state.flux.sunStates[idx] = sun
                index = idx
                found = true
            }
        })
        if (!found)
            this.state.flux.sunStates.push(sun)
        return index
    }

    addPlanet(planet: PlanetState) {
        let found = false
        let index = this.state.flux.planetStates.length
        this.state.flux.planetStates.map(planet => planet.orbit.name).forEach((name, idx) => {
            if (name === planet.orbit.name) {
                this.state.flux.planetStates[idx] = planet
                index = idx
                found = true
            }
        })
        if (!found)
            this.state.flux.planetStates.push(planet)
        return index
    }

    addSatellite(sat: SatelliteState) {
        let found = false
        let index = this.state.flux.satelliteStates.length
        this.state.flux.satelliteStates.map(sat => sat.orbit.name).forEach((name, idx) => {
            if (name === sat.orbit.name) {
                this.state.flux.satelliteStates[idx] = sat
                index = idx
                found = true
            }
        })
        if (!found)
            this.state.flux.satelliteStates.push(sat)
        return index
    }

    terminate() {
        this.done = true
    }

    onKeyDown(event: KeyboardEvent) {
        switch (event.code) {
            case ' ':
                this.handleControl('>||')
                break
            case 'ArrowRight':
                this.handleControl('>>')
                break
            case 'ArrowLeft':
                this.handleControl('<<')
                break
            case 'ArrowUp':
                this.handleControl('+')
                break
            case 'ArrowDown':
                this.handleControl('-')
                break
            case 'Escape':
                this.handleControl('reset')
                break
            case 'Backspace':
                this.handleControl('restart')
                break
        }
    }

    onMessage = (evt: MessageEvent<MsgEncodeType>) => {  // FIXME pass membuf
        const data = parseMsg(evt.data)
        if (data.source !== OrreryMsgType.Action)
            return
        const msg = data.action
        if (msg.init !== undefined && !this.started) {
            this.state.consts = msg.init
            this.initialized = true
            console.debug('Initialized')
            this.state.flux.initialized = true
            postMessage(fluxMsg(data.seqNum, this.state.flux))
        } else if (msg.end !== undefined && this.started && msg.end)
            this.done = true
        else if (msg.sun !== undefined) {
            this.addSun(msg.sun)
            postMessage(fluxMsg(data.seqNum, this.state.flux))
        } else if (msg.planet !== undefined) {
            this.addPlanet(msg.planet)
            postMessage(fluxMsg(data.seqNum, this.state.flux))
        } else if (msg.satellite !== undefined) {
            this.addSatellite(msg.satellite)
            postMessage(fluxMsg(data.seqNum, this.state.flux))
        } else if ('control' in msg)
            this.handleControl(msg.control)
    }

    private handleControl(ctrl?: string) {
        if (!ctrl)
            return
        switch (ctrl) {
            case '>||':
                this.togglePlay()
                break
            case '>>':
                this.forwardTime()
                break
            case '<<':
                this.backwardTime()
                break
            case '+':
                this.increaseTimestep()
                break
            case '-':
                this.decreaseTimestep()
                break
            case 'reset':
                this.defaultTimestep()
                break
            case 'restart':
                this.setTime()
                break
            default:
                console.error(`Unknown control: ${ctrl}`)
                break
        }
    }
}
