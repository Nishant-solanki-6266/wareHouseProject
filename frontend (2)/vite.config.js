import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://vi-custom-warehouse-production.up.railway.app',
        changeOrigin: true,
        secure: false,
      },
    },
    watch: {
      ignored: ['**/*.mp4', '**/*.pdf', '**/*.zip', '**/dist/**', '**/.git/**']
    }
  }
})
