import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base = repo name, so the built site works under https://<user>.github.io/exhibition-design-simulator/
export default defineConfig({
  base: '/exhibition-design-simulator/',
  plugins: [react()],
  // Also run on older iPads / iPhones (Safari 14+), not only the latest browsers
  build: { target: ['es2020', 'safari14', 'chrome87', 'firefox78', 'edge88'] },
  // Listen on IPv4 localhost; on Windows the default can bind to IPv6 (::1) only.
  server: { host: '127.0.0.1' },
})
