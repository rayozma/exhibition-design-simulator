/**
 * Team PIN for the whole site. It only keeps casual visitors out: the app is a static build,
 * so anyone who reads its code can find the PIN, and the data stays readable with the public key.
 */
const SITE_PIN = '0101'
export const PIN_LENGTH = SITE_PIN.length

const ACCESS_KEY = 'ndt-adipec.access'

export const checkPin = (pin: string) => pin === SITE_PIN

/** Entered on this device before (and the PIN has not changed since). */
export function isUnlocked(): boolean {
  try {
    return localStorage.getItem(ACCESS_KEY) === SITE_PIN
  } catch {
    return false
  }
}

export function rememberUnlock() {
  try {
    localStorage.setItem(ACCESS_KEY, SITE_PIN)
  } catch {
    // storage blocked (private mode) — the PIN is asked again next time
  }
}
