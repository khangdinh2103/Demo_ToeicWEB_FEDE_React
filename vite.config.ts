import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy API requests to backend to avoid CORS during development
      '/api': {
        target: 'http://localhost:3090',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
