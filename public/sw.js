/*
 * Offline support for the team briefing (registered by src/lib/offline.ts).
 * - Pages: network first, else the saved copy of the app (index.html).
 * - Built app files (assets/) and fonts: from the cache, else the network (then cached).
 * - Pictures, videos and brochures saved with "Save for offline" (MEDIA cache): from the cache,
 *   answering the byte-range requests that video players (iPad Safari) make; else the network.
 */
const SHELL = 'shell-v1'
const MEDIA = 'media-v1' // must match MEDIA_CACHE in src/lib/offline.ts
const BASE = new URL('./', self.location).pathname

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (e) =>
  e.waitUntil(
    (async () => {
      for (const k of await caches.keys()) if (k !== SHELL && k !== MEDIA) await caches.delete(k)
      await self.clients.claim()
    })(),
  ),
)

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (/\.supabase\.co$/.test(url.hostname)) return // live data: the app keeps its own copy
  if (url.searchParams.has('offline-save')) return // "Save for offline" downloads go straight to the network (less memory)
  const own = url.origin === self.location.origin
  // Pages of the app (not files opened directly, like a video or brochure link)
  const appPage = own && url.pathname.startsWith(BASE) && !/\.[a-z0-9]+$/i.test(url.pathname)
  if (req.mode === 'navigate' && appPage) e.respondWith(page(req))
  else if (own && url.pathname.startsWith(BASE + 'assets/')) e.respondWith(cacheFirst(req))
  else if (/^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) e.respondWith(cacheFirst(req))
  else e.respondWith(media(req))
})

// Storage problems (full, blocked, private mode) must never break the page: caching is best effort.
const keep = (key, res) =>
  caches
    .open(SHELL)
    .then((c) => c.put(key, res))
    .catch(() => {})
// ignoreVary: a file saved by "Save for offline" (a plain download) must also answer the page's own
// requests for it, whose headers differ (e.g. a script request sends Origin; servers send "Vary").
const saved = (key, opts) => caches.match(key, { ignoreVary: true, ...opts }).catch(() => undefined)

async function page(req) {
  try {
    const res = await fetch(req)
    if (res.ok) keep(BASE, res.clone())
    return res
  } catch {
    return (await saved(BASE)) || Response.error()
  }
}

async function cacheFirst(req) {
  const hit = await saved(req)
  if (hit) return hit
  const res = await fetch(req)
  if (res.ok || res.type === 'opaque') keep(req, res.clone())
  return res
}

async function media(req) {
  const hit = await saved(req.url, { cacheName: MEDIA, ignoreVary: true })
  if (!hit) return fetch(req)
  const range = req.headers.get('range')
  if (!range || hit.type === 'opaque') return hit
  return partial(hit, range)
}

/** A 206 answer for "Range: bytes=a-b" from a saved full file. */
async function partial(res, range) {
  const blob = await res.blob()
  const size = blob.size
  const m = /bytes=(\d*)-(\d*)/.exec(range)
  let start = 0
  let end = size - 1
  if (m && m[1] === '' && m[2]) start = Math.max(0, size - Number(m[2]))
  else if (m) {
    start = Number(m[1] || 0)
    if (m[2]) end = Math.min(Number(m[2]), size - 1)
  }
  if (start >= size || start > end)
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } })
  return new Response(blob.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'application/octet-stream',
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes',
    },
  })
}
