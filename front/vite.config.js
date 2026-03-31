import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // FIX: was literal string 'import.meta.env.VITE_API_URL' — that's not valid.
      // In dev, proxy /api to the local backend.
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // Enable code splitting for better performance
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['react-toastify', 'axios'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  define: {
    global: 'globalThis',
  },
})
