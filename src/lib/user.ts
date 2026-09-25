import type { AvatarLook } from '../sim/outfits'

/** avatar = look of your figure in walk mode (others see it). */
export type User = { name: string; color: string; avatar?: AvatarLook }

const USER_KEY = 'ndt-adipec.user'

/** Random per browser tab, so two tabs of the same person are separate participants. */
export const TAB_ID = crypto.randomUUID().slice(0, 8)

export const USER_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899']

export function loadUser(): User | null {
  try {
    const u = JSON.parse(localStorage.getItem(USER_KEY) ?? 'null')
    return u && typeof u.name === 'string' && typeof u.color === 'string' ? u : null
  } catch {
    return null
  }
}

export function saveUser(u: User) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(u))
  } catch {
    // storage blocked (private mode) — the name just won't be remembered
  }
}

/** 16 random bytes as base64url = 22 unguessable characters. */
export function newRoomId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function roomFromUrl(): string | null {
  const r = new URLSearchParams(location.search).get('room')
  return r && /^[A-Za-z0-9_-]{16,64}$/.test(r) ? r : null
}
