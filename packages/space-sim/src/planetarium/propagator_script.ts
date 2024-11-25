/**
 * Web worker entry point - pushes propagation updates to main thread
 */

import Propagator from "./propagator.ts"

(async () => {
    const prop = new Propagator()
    self.addEventListener('message', prop.onMessage)
    try {
        await prop.main()
    } catch (e) {
        console.error(e)
    }
})().catch(e => {
    console.error(`Propagator exception: ${e}`)
})
