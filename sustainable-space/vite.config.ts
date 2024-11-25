import { defineConfig } from 'vite'
//import react from '@vitejs/plugin-react-swc'
// @ts-expect-error 'types could not be resolved when respecting package.json "exports"'
import eslint from 'vite-plugin-eslint'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    eslint(),
  ],
  base: "/sustainable-space/",
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
    proxy: {
      '/nasa/eo': {
        target: 'https://eoimages.gsfc.nasa.gov',
        rewrite: (path) => path.replace(/^\/nasa\/eo/, 'https://eoimages.gsfc.nasa.gov'),
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
        },
      },
      '/nasa/svs': {
        target: 'https://svs.gsfc.nasa.gov',
        rewrite: (path) => path.replace(/^\/nasa\/svs/, 'https://svs.gsfc.nasa.gov'),
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
        },
      },
    }
  }
})
