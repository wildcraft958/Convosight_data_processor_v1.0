import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
  ,
  build: {
    // Warn at a higher size only if you want, but we add manualChunks to keep bundles small
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react'
            }
            if (id.includes('xlsx') || id.includes('papaparse') || id.includes('axios')) {
              return 'vendor-data'
            }
            // put other large common deps in a separate vendor chunk
            return 'vendor'
          }
        }
      }
    }
  }
})