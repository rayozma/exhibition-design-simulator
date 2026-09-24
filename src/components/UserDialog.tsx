import { useState } from 'react'
import { USER_COLORS, type User } from '../lib/user'

type Props = { initial: User | null; onSave: (u: User) => void; onCancel?: () => void }

/** Asks for a display name and color (stored in localStorage by the caller). */
export function UserDialog({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [color, setColor] = useState(initial?.color ?? USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)])
  const trimmed = name.trim().slice(0, 30)

  return (
    <div className="overlay">
      <form
        className="card"
        onSubmit={(e) => {
          e.preventDefault()
          if (trimmed) onSave({ name: trimmed, color })
        }}
      >
        <h2>Who are you?</h2>
        <p className="muted small">Shown to others in this room. No account needed.</p>
        <label className="field">
          <span>Display name</span>
          <input autoFocus value={name} maxLength={30} onChange={(e) => setName(e.target.value)} />
        </label>
        <div className="field">
          <span>Color</span>
          <div className="swatches">
            {USER_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`swatch ${c === color ? 'active' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
                aria-label={c}
              />
            ))}
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} title="Custom color" />
          </div>
        </div>
        <div className="actions">
          <button className="primary" type="submit" disabled={!trimmed}>
            Continue
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
