import { useState } from 'react'
import { seedRoom } from '../lib/db'
import { layouts } from '../lib/layout'
import { newRoomId } from '../lib/user'

/** Shown when the URL has no ?room=. Creates a room filled with the seed design and opens it. */
export function Landing() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async () => {
    setBusy(true)
    setError(null)
    try {
      const id = newRoomId()
      await seedRoom(id)
      location.search = `?room=${id}`
    } catch (e) {
      setError(`Could not create the room: ${(e as Error).message}`)
      setBusy(false)
    }
  }

  return (
    <div className="center-screen">
      <div className="card">
        <h1>{layouts.meta.title}</h1>
        <p className="muted">{layouts.meta.event}</p>
        <button className="primary" onClick={create} disabled={busy}>
          {busy ? 'Creating…' : 'Create a new room'}
        </button>
        <p className="muted small">
          A room is a private link. Share it with your team: everyone with the link can view and edit the layout together.
        </p>
        {error && <p className="status overlap">{error}</p>}
      </div>
    </div>
  )
}
