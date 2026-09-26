import { useEffect, useRef } from 'react'
import type { EditorObject } from '../lib/editor'
import type { Status } from '../lib/geometry'
import { fmt } from './fields'

type Props = {
  objects: EditorObject[]
  statuses: Map<string, Status>
  selectedIds: string[]
  onSelect: (id: string, additive: boolean) => void
}

const STATUS_TITLE: Record<Status, string> = {
  ok: 'OK',
  outside: 'Outside the NDT booth',
  overlap: 'Overlaps an object or a wall',
}

/** Numbered items first (by number), then the rest by name. */
const byNumberThenName = (a: EditorObject, b: EditorObject) =>
  (a.num ?? Infinity) - (b.num ?? Infinity) || a.name.localeCompare(b.name)

/** "Objects" tab: every object with number, name, size and status. */
export function ObjectList({ objects, statuses, selectedIds, onSelect }: Props) {
  const sorted = [...objects].sort(byNumberThenName)
  const selected = new Set(selectedIds)
  const listRef = useRef<HTMLDivElement>(null)

  // Keep the (first) selected object in view when it's selected in the 3D view.
  useEffect(() => {
    const el = listRef.current?.querySelector('.obj-row.selected')
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedIds])

  return (
    <div className="obj-list" ref={listRef}>
      <p className="muted small">
        {objects.length} objects. Click to select, Ctrl/Shift+click to select several.
      </p>
      {sorted.map((o) => {
        const status = statuses.get(o.id) ?? 'ok'
        return (
          <div key={o.id} className={`obj-row ${selected.has(o.id) ? 'selected' : ''}`}>
            <button className="obj-head" onClick={(e) => onSelect(o.id, e.shiftKey || e.ctrlKey || e.metaKey)}>
              <i className={`dot ${status}`} title={STATUS_TITLE[status]} />
              <span className="obj-name">
                {o.num !== undefined && <b>{o.num}. </b>}
                {o.name}
                {o.locked && <span className="muted"> 🔒</span>}
              </span>
              <span className="muted small obj-dims">
                {fmt(o.w)} × {fmt(o.d)} × {fmt(o.h)} m
              </span>
            </button>
          </div>
        )
      })}
    </div>
  )
}
