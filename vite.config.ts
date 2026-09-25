import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base = repo name, so the built site works under https://<user>.github.io/exhibition-design-simulator/
export default defineConfig({
  base: '/exhibition-design-simulator/',
  plugins: [react()],
  // Listen on IPv4 localhost; on Windows the default can bind to IPv6 (::1) only.
  server: { host: '127.0.0.1' },
})
