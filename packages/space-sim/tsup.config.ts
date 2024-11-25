import { defineConfig } from 'tsup'
import { glob } from 'glob'

const sources = glob.sync('src/**/*.{ts,tsx}', {
    ignore: ["src/**/*.d.ts"],
})

export default defineConfig({
    entry: sources,
    splitting: false,
    //sourcemap: true,
    clean: true,
    //treeshake: true,
    //dts: true,
    dts: {only: true},
    format: "esm"
})
