import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // --- START: Django Proxy Configuration ---
  server: {
    // Run Vite on a specific port (optional, 5173 is default)
    port: 5173, 
    // Automatically open the app in the browser
    open: true, 
    proxy: {
      // Whenever the frontend tries to access /api, redirect it to Django
      '/api': {
        target: 'http://127.0.0.1:8000', // Your Django server address
        changeOrigin: true, // Needed for virtual hosting
        // Rewrite /api to just / (optional, depending on DRF setup)
        // rewrite: (path) => path.replace(/^\/api/, '')
      },
    }
  }
  // --- END: Django Proxy Configuration ---
})