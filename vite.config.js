import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { apiPlugin } from './vite-api-plugin.js'

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  return {
    plugins: [react(), apiPlugin()],
    server: { host: true, allowedHosts: true },
  }
})
