import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use '/' for local dev. Change to '/Alumni-intrac/' before deploying to GitHub Pages.
  base: '/',
})