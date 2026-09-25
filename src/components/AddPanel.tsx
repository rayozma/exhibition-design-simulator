import { useCallback, useEffect, useState } from 'react'
import { BASIC_SHAPES, fromTemplate, ITEMS, makeObject, type CatalogItem } from '../lib/catalog'
import { deleteLibraryItem, fetchLibrary, LIBRARY_CHANGED, type LibraryItem } from '../lib/db'
import { askConfirm } from '../lib/dialogs'
import { useDesign } from '../lib/DesignContext'
import type { EditorObject } from '../lib/editor'
import type { ObjectOps } from '../lib/useObjectOps'
import { fmt } from './fields'

// Small inline icons for the basic shapes (outline drawings, 24 × 24).
const ICONS: Record<string, string> = {
  box: 'M5 8l7-4 7 4v8l-7 4-7-4zM5 8l7 4 7-4M12 12v8',
  cylinder: 'M6 6c0-1.7 12-1.7 12 0v12c0 1.7-12 1.7-12 0zM6 6c0 1.7 12 1.7 12 0',
  sphere: 'M12 4a8 8 0 1 0 0 16a8 8 0 1 0 0-16M4 12c0 2.5 16 2.5 16 0',
  cone: 'M12 4l7 14c0 1.7-14 1.7-14 0zM5 18c0-1.7 14-1.7 14 0',
  wedge: 'M4 18h16l-16-9zM4 9v9',
  panel: 'M7 4h10v16H7z',
  sign: 'M4 7h16v8H4zM12 15v5M8 11h8',
}

type Props = {
  objects: EditorObject[]
  ops: ObjectOps
  /** Uploading a .glb / .obj; undefined = not available (local-only mode). */
  onUpload?: () => void
  /** Show the shared library (needs Supabase). */
  library: boolean
}

/** Items saved with "Save to library", shared by all designs. */
function Library({ onAdd }: { onAdd: (it: LibraryItem) => void }) {
  const [items, setItems] = useState<LibraryItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const load = useCallback(() => {
    fetchLibrary()
      .then((l) => {
        setItems(l)
        setError(null)
      })
      .catch((e: Error) => setError(e.message))
  }, [])
  useEffect(() => {
    load()
    window.addEventListener(LIBRARY_CHANGED, load)
    return () => window.removeEventListener(LIBRARY_CHANGED, load)
  }, [load])

  const remove = async (it: LibraryItem) => {
    const yes = await askConfirm(`Delete "${it.name}" from the library?`, {
      message: 'It disappears from the library for everyone. Objects already placed in designs stay.',
      okLabel: 'Delete',
      danger: true,
    })
    if (!yes) return
    try {
      await deleteLibraryItem(it.id)
      load()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <>
      <h4>Your library</h4>
      {error && <p className="status overlap">{error}</p>}
      {items === null && !error && <p className="muted small">Loading…</p>}
      {items?.length === 0 && (
        <p className="muted small">Empty. Select any object (or a combined one) and click Save to library.</p>
      )}
      <div className="item-list">
        {items?.map((it) => (
          <div key={it.id} className="library-row">
            <button className="catalog-item" onClick={() => onAdd(it)} title={it.created_by ? `Saved by ${it.created_by.split('#')[0]}` : undefined}>
              <i style={{ background: it.item.color ?? '#94a3b8' }} />
              <span>
                {it.name}
                {it.item.parts ? <span className="muted small"> · {it.item.parts.items.length} parts</span> : null}
              </span>
              <span className="muted small">
                {fmt(it.item.w)} × {fmt(it.item.d)} × {fmt(it.item.h)} m
              </span>
            </button>
            <button className="link" onClick={() => remove(it)} title="Delete from the library" aria-label={`Delete ${it.name} from the library`}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </>
  )
}

/** "Add" tab: basic shapes and ready-made items. Click to add; it appears in a free spot, selected. */
export function AddPanel({ objects, ops, onUpload, library }: Props) {
  const design = useDesign()
  const add = (item: CatalogItem) => ops.add(makeObject(item, design, objects))
  const addSaved = (it: LibraryItem) => ops.add(fromTemplate({ ...it.item, name: it.name }, design, objects))

  return (
    <div className="add-panel">
      <p className="muted small">Click to add. It appears in a free spot in your booth, selected: drag it into place.</p>

      <h4>Basic shapes</h4>
      <div className="shape-grid">
        {BASIC_SHAPES.map((s) => (
          <button key={s.id} onClick={() => add(s)} title={`${s.name}: ${fmt(s.w)} × ${fmt(s.d)} × ${fmt(s.h)} m`}>
            <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
              <path d={ICONS[s.id]} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
            <span>{s.name}</span>
          </button>
        ))}
      </div>

      <h4>Ready-made items</h4>
      <div className="item-list">
        {ITEMS.map((it) => (
          <button key={it.id} className="catalog-item" onClick={() => add(it)}>
            <i style={{ background: it.color }} />
            <span>{it.name}</span>
            <span className="muted small">
              {fmt(it.w)} × {fmt(it.d)} × {fmt(it.h)} m
            </span>
          </button>
        ))}
      </div>

      {library && <Library onAdd={addSaved} />}

      {onUpload && (
        <>
          <h4>Your own 3D model</h4>
          <button className="block" onClick={onUpload}>
            Upload .glb / .obj as new object…
          </button>
        </>
      )}
    </div>
  )
}
