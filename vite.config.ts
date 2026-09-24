import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base = repo name, so the built site works under https://<user>.github.io/ndt-adipec-2026-design/
export default defineConfig({
  base: '/ndt-adipec-2026-design/',
  plugins: [react()],
  // Listen on IPv4 localhost; on Windows the default can bind to IPv6 (::1) only.
  server: { host: '127.0.0.1' },
})
