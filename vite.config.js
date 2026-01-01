import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // Importante per Capacitor
  build: {
    minify: true,
    sourcemap: false
  },
  resolve: {
    alias: {
      stream: 'stream-browserify',
      buffer: 'buffer',
      events: 'events'
    }
  },
  define: {
    'global': 'globalThis',
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
})