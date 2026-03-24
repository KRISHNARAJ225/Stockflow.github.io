import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      allowedHosts: ['https://5thq69dw-8080.inc1.devtunnels.ms/'],
      proxy: {
        '/api/v1': {
          target: 'https://5thq69dw-8080.inc1.devtunnels.ms/',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})
