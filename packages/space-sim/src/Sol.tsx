import {extend} from "@react-three/fiber"

import {Sun} from "./components/Sun"
import {solConsts} from "./planetarium/constants"

export class Sol extends Sun {
    render() {
        return super.renderImpl(solConsts)
    }
}

extend({Sol})
