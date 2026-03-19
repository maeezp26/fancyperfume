import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
<<<<<<< HEAD
        target: 'http://localhost:5000',
=======
        target: 'import.meta.env.VITE_API_URL',
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9
        changeOrigin: true,
        secure: false,
      },
    },
  },
  define: {
    global: 'globalThis',
  },
})

