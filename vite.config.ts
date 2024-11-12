import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
// @ts-expect-error 'types could not be resolved when respecting package.json "exports"'
import eslint from 'vite-plugin-eslint'
import glsl from 'vite-plugin-glsl'
import vercel from 'vite-plugin-vercel'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      {find: "@", replacement: "/packages"},
    ],
  },
  plugins: [
    react(),
    glsl(),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    eslint(),
    vercel(),
  ],
  base: "/sustainable-space/",
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    }
  }
})
