import { useRef, useState } from 'react'
import { checkPin, PIN_LENGTH } from '../lib/access'
import { APP_TITLE } from '../lib/design'

/** Asks for the team PIN before anything else is shown. One box per digit; typing or pasting fills them. */
export function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [digits, setDigits] = useState<string[]>(() => Array(PIN_LENGTH).fill(''))
  const [wrong, setWrong] = useState(false)
  const boxes = useRef<(HTMLInputElement | null)[]>([])

  const fill = (from: number, text: string) => {
    const typed = text.replace(/\D/g, '').split('')
    if (!typed.length) return
    const next = [...digits]
    typed.slice(0, PIN_LENGTH - from).forEach((d, k) => (next[from + k] = d))
    setDigits(next)
    setWrong(false)
    const pin = next.join('')
    if (pin.length === PIN_LENGTH) {
      if (checkPin(pin)) return onUnlock()
      setWrong(true)
      setDigits(Array(PIN_LENGTH).fill(''))
      boxes.current[0]?.focus()
      return
    }
    boxes.current[Math.min(from + typed.length, PIN_LENGTH - 1)]?.focus()
  }

  return (
    <div className="center-screen">
      <form className="card pin-card" onSubmit={(e) => e.preventDefault()}>
        <h2>{APP_TITLE}</h2>
        <p className="muted small">Enter the 4-digit team PIN.</p>
        <div className={`pin-boxes ${wrong ? 'wrong' : ''}`}>
          {digits.map((d, k) => (
            <input
              key={k}
              ref={(el) => {
                boxes.current[k] = el
              }}
              autoFocus={k === 0}
              inputMode="numeric"
              autoComplete="off"
              maxLength={PIN_LENGTH}
              value={d}
              aria-label={`PIN digit ${k + 1}`}
              onChange={(e) => {
                const v = e.target.value
                if (!v) return setDigits(digits.map((x, j) => (j === k ? '' : x)))
                fill(k, d ? v.replace(d, '') || v : v) // typing into a filled box replaces its digit
              }}
              onPaste={(e) => {
                e.preventDefault()
                fill(0, e.clipboardData.getData('text'))
              }}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !d && k > 0) {
                  const next = [...digits]
                  next[k - 1] = ''
                  setDigits(next)
                  boxes.current[k - 1]?.focus()
                  e.preventDefault()
                }
              }}
            />
          ))}
        </div>
        {wrong && <p className="status overlap">Wrong PIN. Try again.</p>}
      </form>
    </div>
  )
}
