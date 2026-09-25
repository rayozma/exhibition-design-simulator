import { createClient } from '@supabase/supabase-js'

// Accept the project URL with a pasted API path or trailing slash ("…supabase.co/rest/v1/").
const url = import.meta.env.VITE_SUPABASE_URL?.trim().replace(/\/(rest\/v1)?\/?$/, '')
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const SUPABASE_URL = url ?? ''
export const SUPABASE_KEY = key ?? ''

/** null when .env is missing — the app then runs in local-only mode. */
export const supabase =
  url && key
    ? createClient(url, key, {
        auth: { persistSession: false }, // no sign-in in this app
        realtime: {
          params: { eventsPerSecond: 20 }, // room for ~10 Hz drag broadcasts + presence
          // Send keep-alive heartbeats from a Web Worker: browsers throttle timers in background
          // tabs, which made the connection drop ("Offline — reconnecting") after switching tabs.
          worker: true,
          heartbeatIntervalMs: 15000,
        },
      })
    : null
