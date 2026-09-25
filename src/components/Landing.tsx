import { useEffect, useState } from 'react'
import { createRoom, deleteRoom, fetchRooms, seedRoom, type Room } from '../lib/db'
import { APP_TITLE, parseDesign, TEMPLATES } from '../lib/design'
import { loadUser, newRoomId } from '../lib/user'

const when = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

const open = (id: string) => {
  location.search = `?room=${id}`
}

/** Home page: all designs (each one a shared, live room), plus a form to create a new one from a template. */
export function Landing() {
  const [rooms, setRooms] = useState<Room[] | null>(null)
  const [name, setName] = useState('')
  const [template, setTemplate] = useState(TEMPLATES[0].id)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<{ id: string; password: string; error: string | null } | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const remove = async (r: Room) => {
    if (!deleting) return
    setDeleteBusy(true)
    try {
      const ok = await deleteRoom(r.id, deleting.password)
      if (!ok) {
        setDeleting({ ...deleting, error: 'Wrong password.' })
        return
      }
      setRooms((list) => list?.filter((x) => x.id !== r.id) ?? null)
      setDeleting(null)
    } catch (e) {
      setDeleting({ ...deleting, error: (e as Error).message })
    } finally {
      setDeleteBusy(false)
    }
  }

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
      const design = (TEMPLATES.find((t) => t.id === template) ?? TEMPLATES[0]).make()
      await createRoom(id, trimmed, loadUser()?.name ?? 'anon', design)
      await seedRoom(id, design)
      open(id)
    } catch (e) {
      setError(`Could not create the design: ${(e as Error).message}`)
      setBusy(false)
    }
  }

  return (
    <div className="center-screen">
      <div className="card wide">
        <h1>{APP_TITLE}</h1>
        <p className="muted">Plan exhibition booths in 3D, together: layout, objects, walk-through and crowd simulation.</p>

        <h4>New design</h4>
        <form
          className="new-design"
          onSubmit={(e) => {
            e.preventDefault()
            create()
          }}
        >
          <input
            placeholder="Design name, e.g. Gulf Expo 2027 – main booth"
            value={name}
            maxLength={80}
            disabled={busy}
            onChange={(e) => setName(e.target.value)}
            aria-label="New design name"
          />
          <div className="templates" role="radiogroup" aria-label="Start from">
            {TEMPLATES.map((t) => (
              <label key={t.id} className={`template ${template === t.id ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="template"
                  checked={template === t.id}
                  disabled={busy}
                  onChange={() => setTemplate(t.id)}
                />
                <strong>{t.name}</strong>
                <span className="muted small">{t.description}</span>
              </label>
            ))}
          </div>
          <button className="primary" type="submit" disabled={busy || !name.trim()}>
            {busy ? 'Creating…' : 'Create design'}
          </button>
        </form>

        <h4>Designs</h4>
        <div className="snapshot-list">
          {rooms === null && !error && <p className="muted small">Loading…</p>}
          {rooms?.length === 0 && <p className="muted small">No designs yet. Create the first one above.</p>}
          {rooms?.map((r) => (
            <div key={r.id} className="room-item">
              <div className="room-line">
                <button className="room-row" onClick={() => open(r.id)}>
                  <strong>{r.name}</strong>
                  {(() => {
                    const d = parseDesign(r.design)
                    return (
                      <span className="muted small">
                        {d ? `${d.hall.w} × ${d.hall.d} m hall` : 'ADIPEC 2026 – NDTCCS booth'}
                        {d?.event ? ` · ${d.event}` : ''}
                      </span>
                    )
                  })()}
                  <span className="muted small">
                    edited {when(r.updated_at)}
                    {r.created_by && r.created_by !== 'migration' ? ` · created by ${r.created_by}` : ''}
                  </span>
                </button>
                <button
                  className="danger"
                  title="Delete this design (password required)"
                  aria-label={`Delete design ${r.name}`}
                  onClick={() => setDeleting(deleting?.id === r.id ? null : { id: r.id, password: '', error: null })}
                >
                  Delete
                </button>
              </div>
              {deleting?.id === r.id && (
                <form
                  className="save-row"
                  onSubmit={(e) => {
                    e.preventDefault()
                    remove(r)
                  }}
                >
                  <input
                    type="password"
                    autoFocus
                    placeholder="Password to delete this design"
                    value={deleting.password}
                    disabled={deleteBusy}
                    onChange={(e) => setDeleting({ ...deleting, password: e.target.value, error: null })}
                    aria-label="Delete password"
                  />
                  <button className="danger" type="submit" disabled={deleteBusy || !deleting.password}>
                    {deleteBusy ? 'Deleting…' : 'Delete for everyone'}
                  </button>
                  {deleting.error && <p className="status overlap">{deleting.error}</p>}
                </form>
              )}
            </div>
          ))}
        </div>

        {error && <p className="status overlap">{error}</p>}
        <p className="muted small">
          Every design is shared and live: anyone who opens this page can open any design and edit it together with others.
        </p>
      </div>
    </div>
  )
}
