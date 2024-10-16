import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import eslint from 'vite-plugin-eslint'
import multipage from 'vite-plugin-multipage'
import glsl from 'vite-plugin-glsl'
import vercel from 'vite-plugin-vercel'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: process.env.PORT as unknown as number,
  },
  plugins: [
    react(),
    glsl(),
    eslint(),
    vercel(),
    multipage({
      pageDir: 'src/frontend/pages',
      rootPage: 'index.html'
    }),
  ],
})
