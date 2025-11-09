import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Only use proxy in development
const isDevelopment = process.env.NODE_ENV !== 'production'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Only include server config for development
  ...(isDevelopment && {
    server: {
      port: 5173,
      open: true,
      proxy: {
        '/api': {
          target: 'https://socratic-f2kh.onrender.com/', // Local Django for development
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }),
  build: {
    outDir: 'dist',
  },
})
