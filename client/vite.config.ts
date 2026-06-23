import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        replaceAttrValues: {
          '#000': 'currentColor',
          '#000000': 'currentColor',
          '#202020': 'currentColor',
          '#F13E3E': 'currentColor',
          '#f13e3e': 'currentColor',
          'red': 'currentColor'
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
})