import { resolve } from 'path'
import { defineConfig } from 'vite'
import windiCSS from 'vite-plugin-windicss'
import vue from '@vitejs/plugin-vue'

const r = (...path) => resolve(__dirname, ...path)

export default defineConfig({
  base: './',
  root: r('src/ui'),
  clearScreen: false,
  server: {
    middlewareMode: true
  },
  build: {
    outDir: r('dist/ui'),
    emptyOutDir: false
  },
  plugins: [
    vue(),
    windiCSS({})
  ]
})
