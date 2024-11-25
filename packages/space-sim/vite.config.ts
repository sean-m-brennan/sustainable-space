import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
// @ts-expect-error 'types could not be resolved when respecting package.json "exports"'
import eslint from 'vite-plugin-eslint'
import glsl from 'vite-plugin-glsl'
import { extname, relative } from 'path'
import { fileURLToPath } from 'node:url'
import { glob } from 'glob'

const sources = glob.sync('src/**/*.{ts,tsx}', {
    ignore: ["src/**/*.d.ts"],
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    glsl(),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    eslint(),
  ],
  base: "/space-sim/",
  build: {
    lib: {
      entry: sources,
      formats: ["es"],
    },
    emptyOutDir: false,
    rollupOptions: {
        external: ['react', 'react/jsx-runtime'],
        input: Object.fromEntries(
            glob.sync('src/**/*.{ts,tsx}', {
                ignore: ["src/**/*.d.ts"],
            }).map(file => [
                relative(
                    'src',
                    file.slice(0, file.length - extname(file).length)
                ),
                fileURLToPath(new URL(file, import.meta.url))
            ])
        ),
        output: {
            assetFileNames: (assetInfo) => {
                //if (/\.css$/.test(assetInfo.names[0]))
                    return "space-sim.[ext]"
                //return assetInfo.names[0]
            }
        },
    },
  },
})
