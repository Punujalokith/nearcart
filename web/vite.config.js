import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':   ['react', 'react-dom', 'react-router-dom'],
          'vendor-query':   ['@tanstack/react-query', 'zustand', 'axios'],
          'vendor-form':    ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-charts':  ['recharts'],
          'vendor-ui':      ['lucide-react', 'react-hot-toast'],
          'vendor-socket':  ['socket.io-client'],
        },
      },
    },
  },
})
