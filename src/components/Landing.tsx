import { useEffect, useState } from 'react'
import { createRoom, fetchRooms, seedRoom, type Room } from '../lib/db'
import { layouts } from '../lib/layout'
import { loadUser, newRoomId } from '../lib/user'

const when = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

const open = (id: string) => {
  location.search = `?room=${id}`
}

/** Home page: the list of existing rooms, plus a form to create a new one (seeded with the design). */
export function Landing() {
  const [rooms, setRooms] = useState<Room[] | null>(null)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRooms()
      .then(setRooms)
      .catch((e: Error) => setError(e.message))
  }, [])

  const create = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    setBusy(true)
    setError(null)
    try {
      const id = newRoomId()
      await createRoom(id, trimmed, loadUser()?.name ?? 'anon')
      await seedRoom(id)
      open(id)
    } catch (e) {
      setError(`Could not create the room: ${(e as Error).message}`)
      setBusy(false)
    }
  }

  return (
    <div className="center-screen">
      <div className="card wide">
        <h1>{layouts.meta.title}</h1>
        <p className="muted">{layouts.meta.event}</p>

        <form
          className="save-row"
          onSubmit={(e) => {
            e.preventDefault()
            create()
          }}
        >
          <input
            placeholder="New room name, e.g. Option B – marketing review"
            value={name}
            maxLength={80}
            disabled={busy}
            onChange={(e) => setName(e.target.value)}
            aria-label="New room name"
          />
          <button className="primary" type="submit" disabled={busy || !name.trim()}>
            {busy ? 'Creating…' : 'Create room'}
          </button>
        </form>

        <h4>Rooms</h4>
        <div className="snapshot-list">
          {rooms === null && !error && <p className="muted small">Loading…</p>}
          {rooms?.length === 0 && <p className="muted small">No rooms yet. Create the first one above.</p>}
          {rooms?.map((r) => (
            <button key={r.id} className="room-row" onClick={() => open(r.id)}>
              <strong>{r.name}</strong>
              <span className="muted small">
                edited {when(r.updated_at)}
                {r.created_by && r.created_by !== 'migration' ? ` · created by ${r.created_by}` : ''}
              </span>
            </button>
          ))}
        </div>

        {error && <p className="status overlap">{error}</p>}
        <p className="muted small">
          Every room is a shared, live layout. Anyone who opens this page can join any room and edit it.
        </p>
      </div>
    </div>
  )
}
