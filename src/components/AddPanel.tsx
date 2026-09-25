import { BASIC_SHAPES, ITEMS, makeObject, type CatalogItem } from '../lib/catalog'
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
}

/** "Add" tab: basic shapes and ready-made items. Click to add; it appears in a free spot, selected. */
export function AddPanel({ objects, ops, onUpload }: Props) {
  const design = useDesign()
  const add = (item: CatalogItem) => ops.add(makeObject(item, design, objects))

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
