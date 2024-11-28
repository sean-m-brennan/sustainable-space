import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
// @ts-expect-error 'types could not be resolved when respecting package.json "exports"'
import eslint from 'vite-plugin-eslint'
import path from "node:path"

const plugins = [
    react(),
]
// vite-plugin-eslint is incompatible with turbo
if (process.env.TURBO_HASH === undefined) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-argument
    plugins.push(eslint())
}
/*
let resolve = {}
if (!import.meta.env.PROD)
    resolve = {
        resolve: {
            alias: {
                "space-sim": path.resolve(__dirname, "../../packages/space-sim/src"),
            },
        }
    }
*/
// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            "locate-user/": path.resolve(__dirname, "../../packages/locate-user/src/"),
            "space-data-api/": path.resolve(__dirname, "../../packages/space-data-api/src/"),
            "space-sim/": path.resolve(__dirname, "../../packages/space-sim/"),
        },
    },
    plugins: plugins,
    base: "/sustainable-space/",
})
