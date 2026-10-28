import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    watch: {
      // Never walk build output, deploy artefacts or screenshot captures.
      // Anything with live file locks in here kills the watcher with EBUSY.
      ignored: ['**/dist/**', '**/.wrangler/**', '**/screenshots/**', '**/.chrome-shots/**'],
    },
  },
})
