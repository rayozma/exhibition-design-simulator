import { useCallback, useEffect, useState } from 'react'
import { deleteSnapshot, fetchSnapshots, saveSnapshot, type Snapshot } from '../lib/db'
import type { EditorObject } from '../lib/editor'
import { downloadBlob, downloadLayoutJson, exportName } from '../lib/exportLayout'
import { useDesign } from '../lib/DesignContext'
import type { ObjectOps } from '../lib/useObjectOps'
import { TAB_ID, type User } from '../lib/user'
import type { CaptureFn } from '../scene/Capture'

type Props = {
  room: string | null
  objects: EditorObject[]
  me: User | null
  ops: ObjectOps
  capture: () => CaptureFn | null
  onClose: () => void
}

const when = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

const defaultName = () =>
  `Snapshot – ${new Date().toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`

/** Save / restore named snapshots of the current layout option, and export JSON / PNG. */
export function SnapshotsDialog({ room, objects, me, ops, capture, onClose }: Props) {
  const design = useDesign()
  const layoutId = design.layoutId
  const [name, setName] = useState(defaultName)
  const [list, setList] = useState<Snapshot[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!room) return
    try {
      setList(await fetchSnapshots(room, layoutId))
    } catch (e) {
      setError(`Could not load snapshots: ${(e as Error).message}`)
    }
  }, [room, layoutId])

  useEffect(() => {
    load()
  }, [load])

  const run = async (fn: () => Promise<void>) => {
    setBusy(true)
    setError(null)
    try {
      await fn()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const save = () =>
    run(async () => {
      await saveSnapshot(room!, layoutId, name.trim(), objects, `${me?.name ?? 'anon'}#${TAB_ID}`)
      setName(defaultName())
      await load()
    })

  const restore = (s: Snapshot) => {
    if (!window.confirm(`Replace all objects with snapshot "${s.name}" for everyone in this design? (You can undo this.)`))
      return
    ops.restore(s.data.objects)
    onClose()
  }

  const remove = (s: Snapshot) => {
    if (!window.confirm(`Delete snapshot "${s.name}"?`)) return
    run(async () => {
      await deleteSnapshot(room!, s.id)
      await load()
    })
  }

  const png = () =>
    run(async () => {
      const blob = await capture()?.()
      if (!blob) throw new Error('Could not capture the 3D view.')
      downloadBlob(blob, `${exportName(design)}.png`)
    })

  return (
    <div className="overlay">
      <div className="card wide">
        <h2>Snapshots</h2>
        <p className="muted small">Saved versions of this design's objects.</p>

        {room ? (
          <>
            <form
              className="save-row"
              onSubmit={(e) => {
                e.preventDefault()
                if (name.trim()) save()
              }}
            >
              <input value={name} maxLength={80} onChange={(e) => setName(e.target.value)} aria-label="Snapshot name" />
              <button className="primary" type="submit" disabled={busy || !name.trim()}>
                Save snapshot
              </button>
            </form>

            <div className="snapshot-list">
              {list === null && !error && <p className="muted small">Loading…</p>}
              {list?.length === 0 && <p className="muted small">No snapshots yet.</p>}
              {list?.map((s) => (
                <div key={s.id} className="snapshot">
                  <div>
                    <strong>{s.name}</strong>
                    <div className="muted small">
                      {when(s.created_at)} · {s.created_by?.split('#')[0] ?? 'unknown'} · {s.data.objects.length} objects
                    </div>
                  </div>
                  <button disabled={busy} onClick={() => restore(s)}>
                    Restore
                  </button>
                  <button className="danger" disabled={busy} onClick={() => remove(s)} aria-label={`Delete ${s.name}`}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="muted small">Snapshots need Supabase (see .env). Export below works in local mode too.</p>
        )}

        {error && <p className="status overlap">{error}</p>}

        <h4>Export</h4>
        <div className="actions tight">
          <button onClick={() => downloadLayoutJson(design, objects, room)}>Download JSON</button>
          <button disabled={busy} onClick={png}>
            Download PNG
          </button>
          <span className="spacer" />
          <button onClick={onClose} disabled={busy}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
