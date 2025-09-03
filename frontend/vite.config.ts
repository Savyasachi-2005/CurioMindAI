import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
  '/explain': 'http://localhost:8000',
  '/chat': 'http://localhost:8000',
  '/notes': 'http://localhost:8000',
  '/export': 'http://localhost:8000'
    }
  }
})
