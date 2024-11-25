import { defineConfig } from 'vite'
// @ts-expect-error 'types could not be resolved when respecting package.json "exports"'
import eslint from 'vite-plugin-eslint'
import dts from 'vite-plugin-dts'
import {resolve} from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    eslint(),
    dts({
      rollupTypes: true,
      outDir: 'dist',
      tsconfigPath: './tsconfig.app.json',
    }),
  ],
  base: "/locate-user/",
  build: {
    lib: {
      entry: resolve(__dirname, "src/location.ts"),
      formats: ["es"],
    },
  },
})
