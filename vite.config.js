import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  const env = loadEnv(mode, process.cwd())
  
  // Set default API URL if not provided in environment
  const API_URL = env.VITE_API_URL || 'https://web-production-f03ff.up.railway.app'

  return {
    plugins: [react()],
    server: {
      port: 3000,
      // Proxy API requests to Django backend
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
        '/media': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
        '/ckeditor': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'styled-components']
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'styled': ['styled-components'],
          }
        }
      }
    },
    // Expose API URL to the app
    define: {
      'process.env.VITE_API_URL': JSON.stringify(API_URL)
    }
  }
})
