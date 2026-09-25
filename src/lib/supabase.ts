import { createClient } from '@supabase/supabase-js'

// Accept the project URL with a pasted API path or trailing slash ("…supabase.co/rest/v1/").
const url = import.meta.env.VITE_SUPABASE_URL?.trim().replace(/\/(rest\/v1)?\/?$/, '')
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const SUPABASE_URL = url ?? ''
export const SUPABASE_KEY = key ?? ''

const NETWORK_RETRIES = [500, 1500, 3000] // ms to wait before each retry

/** Shown instead of the browser's bare "TypeError: Failed to fetch". */
export const NETWORK_ERROR =
  "Couldn't reach the server. Check your internet connection; an ad blocker or company firewall blocking supabase.co can also cause this."

/**
 * fetch that retries when the request never got a response (network drop, VPN or Wi-Fi switching,
 * laptop waking up). HTTP errors (4xx/5xx) are real answers and are not retried.
 */
async function fetchWithRetry(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fetch(input, init)
    } catch (e) {
      const aborted = init?.signal?.aborted
      if (aborted || attempt >= NETWORK_RETRIES.length || !(e instanceof TypeError)) {
        throw aborted || !(e instanceof TypeError) ? e : new TypeError(NETWORK_ERROR)
      }
      await new Promise((r) => setTimeout(r, NETWORK_RETRIES[attempt]))
    }
  }
}

/** null when .env is missing — the app then runs in local-only mode. */
export const supabase =
  url && key
    ? createClient(url, key, {
        auth: { persistSession: false }, // no sign-in in this app
        global: { fetch: fetchWithRetry },
        realtime: {
          params: { eventsPerSecond: 20 }, // room for ~10 Hz drag broadcasts + presence
          // Send keep-alive heartbeats from a Web Worker: browsers throttle timers in background
          // tabs, which made the connection drop ("Offline — reconnecting") after switching tabs.
          worker: true,
          heartbeatIntervalMs: 15000,
        },
      })
    : null
