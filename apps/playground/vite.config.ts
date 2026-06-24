import vue from '@vitejs/plugin-vue'
import UnoCSS from '@unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  plugins: [vue(), UnoCSS()],
  server: {
    hmr: mode === 'e2e' ? false : undefined,
  },
}))
