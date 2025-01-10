import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: './build',
    emptyOutDir: true, // also necessary
  },
  resolve: {
    alias: {
      // Polyfill Node.js stream modules
      stream: 'stream-browserify',
      buffer: 'buffer',
    }
  },
  optimizeDeps: {
    include: ['buffer', 'stream-browserify']
  }
})
