import {Vector3} from "three"
import { v4 as uuid4 } from 'uuid'

import config from '@/space-sim/orrery_config.json?raw'


export const defaultOrreryConfig = JSON.parse(config) as OrreryConfig

export interface OrreryConfig {
    host: string | null
    port: number
    secure: boolean
}

interface ServerResponses {
    ident: string
    error: string
    coordinates: Vector3
    position: Vector3
}

export class SpaceData {
    baseUrl: string

    constructor(host_cfg?: string | OrreryConfig, port?: number, secure: boolean = false) {
        if (port === undefined) {
            const config = host_cfg as OrreryConfig
            const cfg = {...defaultOrreryConfig, ...config}  // manual override
            const proto = cfg.secure ? 'https' : 'http'
            this.baseUrl = `${proto}://${cfg.host}:${cfg.port}`
        } else {
            const host = host_cfg as string
            const proto = secure ? 'https' : 'http'
            this.baseUrl = `${proto}://${host}:${port}`
        }
    }

    async check(): Promise<SpaceData | null> {
        try {
            await fetch(`${this.baseUrl}/check`)
        } catch (e) {
            return null
        }
        return this
    }

    noLoading = (_: boolean) => {}

    genericError = (err: unknown) => {
        console.error(err)
    }

    async dataFromServer(ident: string, url: string,
                         setData: ((data: ServerResponses) => void) | null = null,
                         isLoading: (on: boolean) => void = this.noLoading,
                         onError: (err: unknown) => void = this.genericError): Promise<ServerResponses> {
        let error: unknown
        try {
            isLoading(true)
            const response = await fetch(url)
            // FIXME graceful degrade
            try {
                const json = await response.json() as ServerResponses
                if (json.ident !== ident) {
                    error = `Out-of-order messaging (expected ${ident} got ${json.ident}`
                    console.debug(json)
                    onError(error)
                } else if (json.error) {
                    error = json.error
                    onError(json.error)
                } else {
                    if (setData)
                        setData(json)
                    return json
                }
            } catch (err) {
                error = err
                onError(err)
                console.debug(response);  // FIXME remove
            }
        } catch (err) {
            console.log("Handle fetch error")
            error = err
            onError(err)
            console.debug(url);  // FIXME remove
        } finally {
            isLoading(false)
        }
        return {error: error} as ServerResponses
    }

    conversionUrl(ident: string, coords: Vector3, datetime: Date) {
        return `${this.baseUrl}/convert/?ident=${ident}&coords=[${coords.x},${coords.y},${coords.z}]&dt_str=${datetime.toISOString()}`
    }

    llaToJ2000Url(ident: string, lat: number, lon: number, alt: number, datetime: Date) {
        return `${this.baseUrl}/fixed2j2k/?ident=${ident}&lat=${lat}&lon=${lon}&alt=${alt}&dt_str=${datetime.toISOString()}`
    }

    currentPositionUrl(ident: string, objName: string, datetime: Date) {
        return `${this.baseUrl}/position/?ident=${ident}&body=${objName}&dt_str=${datetime.toISOString()}`
    }

    async fixedToJ2000(datetime: Date, lat: number, lon: number, alt: number,
                       onError: (err: unknown) => void = this.genericError): Promise<Vector3> {
        const ident = uuid4()
        const url =  this.llaToJ2000Url(ident, lat, lon, alt, datetime)
        const data = await this.dataFromServer(ident, url, null, this.noLoading, onError)
        if (data.error)
            throw new Error(data.error)
        return new Vector3(...data.coordinates)
    }

    async currentPosition(datetime: Date, objName: string,
                          onError: (err: unknown) => void = this.genericError): Promise<Vector3> {
        const ident = uuid4()
        const url = this.currentPositionUrl(ident, objName, datetime)
        const data = await this.dataFromServer(ident, url, null, this.noLoading, onError)
        if (data.error)
            throw new Error(data.error)
        return data.position
    }
}