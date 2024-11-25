import {Euler, Vector2, Vector3} from "three"

type ObjArgs = any[]
interface extJsonObj {
    $type: string
    args: ObjArgs
}

export const replacer = (_key: any, value: any): any => {
    if (value instanceof Date)
        return JSON.stringify({$type: 'Date', args: [value.getTime()]})
    if (value instanceof Vector3)
        return JSON.stringify({$type: 'Vector3', args: [value.x, value.y, value.z]})
    if (value instanceof Vector2)
        return JSON.stringify({$type: 'Vector2', args: [value.x, value.y]})
    if (value instanceof Euler)
        return JSON.stringify({$type: 'Euler', args: [value.x, value.y, value.z, value.order]})
    return value
}

export const reviver = (_key: any, value: any): any => {
    if (value !== null && typeof value === 'string' && value.includes('$type')) {
        const val = JSON.parse(value) as extJsonObj
        switch(val['$type']) {
            case 'Date':
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                return new Date(val.args[0])
            case 'Vector3':
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                return new Vector3(...val.args)
            case 'Vector2':
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                return new Vector2(...val.args)
            case 'Euler':
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                return new Euler(...val.args)
            default:
                return value
        }
    }
    return value
}