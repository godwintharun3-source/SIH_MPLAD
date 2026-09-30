import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const BACKEND_PORT = process.env.VITE_BACKEND_PORT || 8010;
const FRONTEND_PORT = process.env.PORT || 5180;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(FRONTEND_PORT),
    allowedHosts: true,
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${BACKEND_PORT}`,
        changeOrigin: true,
      }
    }
  }
})
