import { useEffect, useState } from 'react'
import { imageSrc } from '../components/Markdown'
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
const DOC_LINK = /\[[^\]]+\]\(([^)\s]+\.(?:pdf|pptx?|docx?|xlsx?|mp4|webm))\)/gi
const YOUTUBE = /^\s*https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:\S*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/gim

/** Every picture, video and document the briefing shows, as full addresses. */
export function briefingFiles(sections: BriefingSection[]): string[] {
  const urls = new Set<string>()
  const add = (src: string | null) => src && urls.add(new URL(src, location.href).href)
  for (const s of sections) {
    for (const [, src] of s.body.matchAll(IMAGE)) add(imageSrc(src))
    for (const [, src] of s.body.matchAll(VIDEO_LINE)) add(imageSrc(src))
    for (const [, src] of s.body.matchAll(DOC_LINK)) add(imageSrc(src))
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

export type OfflineStatus = { at: string; files: number; bytes: number; failed: string[] }

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
  const out: string[] = []
  for (const url of briefingFiles(sections)) if (!(await cache.match(url, { ignoreVary: true }))) out.push(url)
  return out
}

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
  const files = briefingFiles(sections)
  const keep = new Set(files)
  for (const req of await cache.keys()) if (!keep.has(req.url)) await cache.delete(req)

  const failed: string[] = []
  let bytes = 0
  for (let k = 0; k < files.length; k++) {
    const url = files[k]
    onProgress({ done: k, total: files.length, bytes, current: url })
    const have = !refresh && (await cache.match(url, { ignoreVary: true }))
    if (have) {
      bytes += Number(have.headers.get('content-length')) || 0
      continue
    }
    try {
      const own = new URL(url).origin === location.origin
      const res = await fetch(url, own ? { cache: 'reload' } : { mode: 'no-cors' })
      if (!res.ok && res.type !== 'opaque') throw new Error(String(res.status))
      bytes += Number(res.headers.get('content-length')) || 0
      await cache.put(url, res)
    } catch {
      failed.push(url)
    }
  }
  onProgress({ done: files.length, total: files.length, bytes, current: '' })
  const status: OfflineStatus = { at: new Date().toISOString(), files: files.length - failed.length, bytes, failed }
  try {
    localStorage.setItem(STATUS_KEY, JSON.stringify(status))
  } catch {
    // not remembered; the files are still saved
  }
  saveBriefingCopy(sections)
  return status
}

export const formatBytes = (n: number) =>
  n >= 1e9 ? `${(n / 1e9).toFixed(1)} GB` : n >= 1e6 ? `${Math.round(n / 1e6)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`

/** iPad / iPhone Safari outside the home-screen app: saved files there don't reach the app. */
export const isIosBrowserTab = () =>
  (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
  !(navigator as Navigator & { standalone?: boolean }).standalone &&
  !matchMedia('(display-mode: standalone)').matches
