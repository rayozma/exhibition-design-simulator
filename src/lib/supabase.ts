import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

/** null when .env is missing — the app then runs in local-only mode. */
export const supabase =
  url && key
    ? createClient(url, key, {
        auth: { persistSession: false }, // no sign-in in this app
        realtime: { params: { eventsPerSecond: 20 } }, // room for ~10 Hz drag broadcasts + presence
      })
    : null
