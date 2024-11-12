
export declare type EmptyProps = Record<PropertyKey, never>

export declare type PropsOptional<T> = T | EmptyProps

export function applyDefaultProps<T>(defaults: T, props?: PropsOptional<T>): T {
    if (props === undefined || props === null ||
        Object.keys(props).length == 0)
        return {...defaults}
    return {...defaults, ...props}  // props override defaults
}