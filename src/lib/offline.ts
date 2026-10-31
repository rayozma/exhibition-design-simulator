import { useEffect, useState } from 'react'
import { brochurePage, imageSrc } from '../components/Markdown'
import type { BriefingSection } from './briefing'

/**
 * Offline use of the team briefing (e.g. on an iPad at the booth without internet):
 * public/sw.js serves the app and the saved files; this module saves them and keeps a copy of the
 * briefing text on the device.
 */

const MEDIA_CACHE = 'media-v1' // must match MEDIA in public/sw.js
const STATUS_KEY = 'ndt-adipec.offline'
const COPY_KEY = 'ndt-adipec.briefing-copy'

export const offlineSupported = () => 'serviceWorker' in navigator && 'caches' in window

export function registerServiceWorker() {
  if (!import.meta.env.PROD || !offlineSupported()) return
  navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').catch(() => {
    // no offline support in this browser — the site still works online
  })
}

/** true while the device has a connection (as far as the browser knows). */
export function useOnline() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return online
}

// ─── Copy of the briefing text ──────────────────────────────────────────────────────────────

export type BriefingCopy = { at: string; sections: BriefingSection[] }

export function saveBriefingCopy(sections: BriefingSection[]) {
  try {
    localStorage.setItem(COPY_KEY, JSON.stringify({ at: new Date().toISOString(), sections }))
  } catch {
    // storage full or blocked — the briefing just won't open without internet
  }
}

export function loadBriefingCopy(): BriefingCopy | null {
  try {
    const v = JSON.parse(localStorage.getItem(COPY_KEY) ?? 'null')
    return v && Array.isArray(v.sections) ? v : null
  } catch {
    return null
  }
}

// ─── Files to save ──────────────────────────────────────────────────────────────────────────

const IMAGE = /!\[[^\]]*\]\((\S+)\)/g
const VIDEO_LINE = /^\s*(\S+\.(?:mp4|webm))\s*$/gim
// Linked files (videos, photos, brochures); a brochure may say how many pages it has: x.pdf#pages=5
const DOC_LINK = /\[[^\]]+\]\(([^)\s#]+\.(pdf|pptx?|docx?|xlsx?|mp4|webm|jpe?g|png|webp))(?:#pages=(\d+))?\)/gi
const YOUTUBE = /^\s*https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:\S*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/gim

/** Every picture, video and document the briefing shows, as full addresses. */
export function briefingFiles(sections: BriefingSection[]): string[] {
  const urls = new Set<string>()
  const add = (src: string | null) => src && urls.add(new URL(src, location.href).href)
  for (const s of sections) {
    for (const [, src] of s.body.matchAll(IMAGE)) add(imageSrc(src))
    for (const [, src] of s.body.matchAll(VIDEO_LINE)) add(imageSrc(src))
    for (const [, src, ext, pages] of s.body.matchAll(DOC_LINK)) {
      const file = imageSrc(src)
      add(file)
      // a brochure is shown as its page pictures
      if (file && ext.toLowerCase() === 'pdf') for (let n = 1; n <= Number(pages ?? 1); n++) add(brochurePage(file, n))
    }
    // YouTube needs internet; keep at least its picture
    for (const [, id] of s.body.matchAll(YOUTUBE)) add(`https://img.youtube.com/vi/${id}/hqdefault.jpg`)
    s.images.forEach((src) => add(imageSrc(src)))
  }
  if (sections.some((s) => s.body.includes('[[exhibitor-finder]]'))) add(import.meta.env.BASE_URL + 'briefing/exhibitors.json')
  return [...urls]
}

/** The app itself: the page and its script and style files. */
function appFiles(): string[] {
  const own = (u: string) => new URL(u, location.href).origin === location.origin
  return [
    new URL(import.meta.env.BASE_URL, location.href).href,
    ...[...document.querySelectorAll<HTMLScriptElement>('script[src]')].map((s) => s.src).filter(own),
    ...[...document.querySelectorAll<HTMLLinkElement>('link[rel=stylesheet]')].map((l) => l.href),
  ]
}

// ─── Saving ────────────────────────────────────────────────────────────────────────────────

export type OfflineStatus = { at: string; files: number; bytes: number; failed: string[]; complete?: boolean }

// Crash safety (older iPads restart the page when it runs out of memory): the file being saved is
// written down first; if it is still written down on the next save, that file crashed the page and is
// skipped from then on, so the rest can be saved.
const CURRENT_KEY = 'ndt-adipec.offline-current'
const SKIP_KEY = 'ndt-adipec.offline-skip'

function readList(key: string): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

function store(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // storage blocked: no crash safety, saving still works
  }
}

/** Files skipped because saving them restarted the page (see above). */
function skippedFiles(): Set<string> {
  const skip = new Set(readList(SKIP_KEY))
  const crashed = localStorage.getItem(CURRENT_KEY)
  if (crashed) {
    skip.add(crashed)
    store(SKIP_KEY, JSON.stringify([...skip]))
    store(CURRENT_KEY, null)
  }
  return skip
}

export function loadOfflineStatus(): OfflineStatus | null {
  try {
    return JSON.parse(localStorage.getItem(STATUS_KEY) ?? 'null')
  } catch {
    return null
  }
}

/** Files of the briefing that are not saved on this device yet. */
export async function missingFiles(sections: BriefingSection[]): Promise<string[]> {
  if (!offlineSupported()) return []
  const cache = await caches.open(MEDIA_CACHE)
  const skip = skippedFiles()
  const out: string[] = []
  for (const url of briefingFiles(sections)) if (!skip.has(url) && !(await cache.match(url, { ignoreVary: true }))) out.push(url)
  return out
}

/** Pictures and brochures first, videos (the largest files) last. */
const videosLast = (a: string, b: string) => Number(/\.(mp4|webm)$/i.test(a)) - Number(/\.(mp4|webm)$/i.test(b))

export type SaveProgress = { done: number; total: number; bytes: number; current: string }

/**
 * Save the app and every file of the briefing on this device. Files already saved are kept
 * (pass refresh to download them again); files no longer in the briefing are removed.
 */
export async function saveForOffline(
  sections: BriefingSection[],
  onProgress: (p: SaveProgress) => void,
  refresh = false,
): Promise<OfflineStatus> {
  await navigator.storage?.persist?.().catch(() => false)
  const shell = await caches.open('shell-v1')
  for (const url of appFiles()) {
    try {
      const res = await fetch(url, new URL(url).origin === location.origin ? { cache: 'reload' } : { mode: 'no-cors' })
      if (res.ok || res.type === 'opaque') await shell.put(url, res)
    } catch {
      // the app files are also saved as they load; keep going
    }
  }

  const cache = await caches.open(MEDIA_CACHE)
  const files = briefingFiles(sections).sort(videosLast)
  const keep = new Set(files)
  for (const req of await cache.keys()) if (!keep.has(req.url)) await cache.delete(req)

  // "Download everything again" also retries files skipped after a crash
  if (refresh) store(SKIP_KEY, null)
  const skip = skippedFiles()
  saveBriefingCopy(sections)

  const failed: string[] = []
  let bytes = 0
  const status = (complete: boolean): OfflineStatus => ({
    at: new Date().toISOString(),
    files: files.length - failed.length,
    bytes,
    failed,
    complete,
  })
  for (let k = 0; k < files.length; k++) {
    const url = files[k]
    onProgress({ done: k, total: files.length, bytes, current: url })
    if (skip.has(url)) {
      failed.push(url)
      continue
    }
    const have = !refresh && (await cache.match(url, { ignoreVary: true }))
    if (have) {
      bytes += Number(have.headers.get('content-length')) || 0
      continue
    }
    store(CURRENT_KEY, url)
    // Up to 3 tries: busy exhibition Wi-Fi drops downloads now and then
    let saved = false
    for (let attempt = 0; attempt < 3 && !saved; attempt++) {
      if (attempt) await new Promise((r) => setTimeout(r, 1500 * attempt))
      try {
        const own = new URL(url).origin === location.origin
        // ?offline-save: the service worker lets this download through untouched; it is saved under the plain address
        const res = own
          ? await fetch(url + (url.includes('?') ? '&' : '?') + 'offline-save', { cache: 'reload' })
          : await fetch(url, { mode: 'no-cors' })
        if (!res.ok && res.type !== 'opaque') throw new Error(String(res.status))
        const size = Number(res.headers.get('content-length')) || 0
        await cache.put(url, res)
        bytes += size
        saved = true
      } catch {
        // try again
      }
    }
    if (!saved) failed.push(url)
    store(CURRENT_KEY, null)
    // Keep the progress so far (in case the page restarts) and give the browser a moment to free memory
    store(STATUS_KEY, JSON.stringify(status(false)))
    await new Promise((r) => setTimeout(r, 80))
  }
  onProgress({ done: files.length, total: files.length, bytes, current: '' })
  const done = status(true)
  store(STATUS_KEY, JSON.stringify(done))
  return done
}

export const formatBytes = (n: number) =>
  n >= 1e9 ? `${(n / 1e9).toFixed(1)} GB` : n >= 1e6 ? `${Math.round(n / 1e6)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`

/** iPad / iPhone Safari outside the home-screen app: saved files there don't reach the app. */
/** Running as the installed app (home-screen icon), not in a browser tab. */
export const isInstalledApp = () =>
  !!(navigator as Navigator & { standalone?: boolean }).standalone || matchMedia('(display-mode: standalone)').matches

export const isIos = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
export const isAndroid = () => /Android/i.test(navigator.userAgent)

/** iPad / iPhone Safari outside the home-screen app: saved files there don't reach the app. */
export const isIosBrowserTab = () => isIos() && !isInstalledApp()

// ─── Installing as an app (Chrome / Edge, incl. Android tablets) ──────────────────────────────

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }
let installPrompt: InstallPrompt | null = null
const INSTALL_EVENT = 'briefing-install-change'

// The browser offers installation once, possibly before the page has drawn: keep the offer for later.
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    installPrompt = e as InstallPrompt
    window.dispatchEvent(new Event(INSTALL_EVENT))
  })
  window.addEventListener('appinstalled', () => {
    installPrompt = null
    window.dispatchEvent(new Event(INSTALL_EVENT))
  })
}

/** Whether this browser can install the app right now (Chrome / Edge), updated live. */
export function useCanInstall() {
  const [can, setCan] = useState(!!installPrompt)
  useEffect(() => {
    const update = () => setCan(!!installPrompt)
    window.addEventListener(INSTALL_EVENT, update)
    return () => window.removeEventListener(INSTALL_EVENT, update)
  }, [])
  return can
}

/** Show the browser's "Install app" dialog; true if the person accepted. */
export async function installApp(): Promise<boolean> {
  if (!installPrompt) return false
  const p = installPrompt
  installPrompt = null
  window.dispatchEvent(new Event(INSTALL_EVENT))
  await p.prompt()
  return (await p.userChoice).outcome === 'accepted'
}
