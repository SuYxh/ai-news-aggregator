import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES ? '/ai-news-aggregator/' : '/',
  server: {
    port: 3000,
    open: true,
    fs: {
      allow: ['..']
    }
  },
  publicDir: path.resolve(__dirname, '../'),
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    copyPublicDir: false,
  },
})
