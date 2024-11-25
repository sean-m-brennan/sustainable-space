import React, {MutableRefObject, ReactNode, useEffect, useMemo, useRef, useState} from "react"
import {Html, KeyboardControls, KeyboardControlsEntry, useKeyboardControls} from "@react-three/drei"
import {useFrame, useThree} from "@react-three/fiber"
import {PointerLockControls} from 'three-stdlib'
import {Sidebar} from "primereact/sidebar";

enum ControlActions {
    forward = 'forward',
    backward = 'backward',
    left = 'left',
    right = 'right',
    leftRoll = 'leftRoll',
    rightRoll = 'rightRoll',
    quick = 'plus',
    slow = 'minus',
    reset = 'reset',
}

type ActionsProps = {
    ptrCtrl: MutableRefObject<PointerLockControls>
    enabled: boolean
    scrollScale?: number
    keyScale?: number
}

function Actions(props: ActionsProps) {
    const [subscribeKeys, getKeys] = useKeyboardControls<ControlActions>()
    let speed = useMemo(() => props.keyScale ? props.keyScale : 0.05, [props.keyScale])
    const {camera} = useThree()

    useEffect(() => {
        const scale = props.scrollScale ? props.scrollScale : 1000
        if (!props.enabled) {  // no user input
            // FIXME script input
            return () => {}
        }
        window.addEventListener('click', () => {
            if (props.ptrCtrl.current.isLocked)
                props.ptrCtrl.current.unlock()
        })
        window.addEventListener('blur', () => {
            props.ptrCtrl.current.unlock()
        })
        window.addEventListener('wheel', (event: WheelEvent) => {
            if (props.ptrCtrl.current.isLocked)
                props.ptrCtrl.current.moveForward(event.deltaY / scale)
        })
        const unsubscribeAny = subscribeKeys(() => {
            props.ptrCtrl.current.lock()
        })
        return () => {
            window.removeEventListener('blur', () => {})
            window.removeEventListener('click', () => {})
            unsubscribeAny()
        };
    }, [subscribeKeys, props])

    useFrame((_state, delta) => {
        const {forward, backward, left, right, leftRoll, rightRoll, plus, minus, reset} = getKeys()
        if (forward)
            props.ptrCtrl.current.moveForward(delta * speed)
        if (backward)
            props.ptrCtrl.current.moveForward(-delta * speed)
        if (left)
            props.ptrCtrl.current.moveRight(-delta * speed)
        if (right)
            props.ptrCtrl.current.moveRight(delta * speed)
        if (leftRoll)
            camera.rotation.z -= (delta * speed) / Math.PI
        if (rightRoll)
            camera.rotation.z += (delta * speed) / Math.PI
        if (plus)
            speed += delta  // FIXME
        if (minus)
            speed -= delta
        if (reset)
            speed = 0.5
    })
    return (<></>)
}


export type MovementControlsProps = {
    children: ReactNode
    onTrack: boolean
    pointerControlRef: MutableRefObject<PointerLockControls>
}

export function MovementControls(props: MovementControlsProps) {
    const keymap = useMemo<KeyboardControlsEntry<ControlActions>[]>(()=>[
        { name: ControlActions.forward, keys: ['KeyW', 'ArrowUp'] },
        { name: ControlActions.backward, keys: ['KeyS', 'ArrowDown'] },
        { name: ControlActions.left, keys: ['KeyA', 'ArrowLeft'] },
        { name: ControlActions.right, keys: ['KeyD', 'ArrowRight'] },
        { name: ControlActions.leftRoll, keys: ['KeyQ'] },
        { name: ControlActions.rightRoll, keys: ['KeyE'] },
        { name: ControlActions.quick, keys: ['+'] },
        { name: ControlActions.slow, keys: ['-'] },
        { name: ControlActions.reset, keys: ['KeyR'] },
    ], [])
    const {camera, gl} = useThree()
    props.pointerControlRef.current = new PointerLockControls(camera, gl.domElement)
    useEffect(() => {
        props.pointerControlRef.current.pointerSpeed = 0.5
    }, [props.pointerControlRef])

    return (
        <>
            <KeyboardControls map={keymap}>
                <Actions ptrCtrl={props.pointerControlRef} enabled={!props.onTrack}/>
                {props.children}
            </KeyboardControls>
        </>
    )
}
