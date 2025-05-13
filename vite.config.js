import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Commenting out proxy as we're now using the deployed Railway backend
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:8000',
    //     changeOrigin: true,
    //     secure: false,
    //   },
    //   '/media': {
    //     target: 'http://localhost:8000',
    //     changeOrigin: true,
    //     secure: false,
    //   },
    //   '/ckeditor': {
    //     target: 'http://localhost:8000',
    //     changeOrigin: true,
    //     secure: false,
    //   }
    // }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'styled-components']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'styled': ['styled-components'],
        }
      }
    }
  },
  // Add enhanced error handling and debugging information
})
