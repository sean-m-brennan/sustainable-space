import {useEffect, useState } from "react"

export type SoundTrackProps = {
    url: string
    play?: boolean
}

export default function SoundTrack(props: SoundTrackProps) {
    const [music] = useState(() => new Audio(props.url))
    const [pause] = useState((props.play === undefined) ? true : !props.play)

    useEffect(() => {
        music.currentTime = 0
        music.volume = 0.2
        music.loop = true
        music.play()
            .catch((err) => {console.log(err)})
    }, [music]);

    useEffect(() => {
        if (pause)
            music.pause()
        else
            music.play()
                .catch((err) => {console.log(err)})
    }, [music, pause])

    // FIXME control to setPause(false|true)
    return (<></>)
}