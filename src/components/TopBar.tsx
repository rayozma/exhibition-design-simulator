import type { ReactNode } from 'react'
import { LAYOUT_IDS, layouts, type LayoutId } from '../lib/layout'
import type { ViewMode } from '../scene/Scene'

type Props = {
  layoutId: LayoutId
  onLayout: (id: LayoutId) => void
  view: ViewMode
  onView: (v: ViewMode) => void
  showVolumes: boolean
  onVolumes: (v: boolean) => void
  showWalls: boolean
  showPavilion: boolean
  onPavilion: (v: boolean) => void
  onWalls: (v: boolean) => void
  snap: boolean
  onSnap: (v: boolean) => void
  canUndo: boolean
  onUndo: () => void
  onReset: () => void
  onSnapshots: () => void
  /** Current room's name (shared mode); undefined in local-only mode. */
  roomName?: string | null
  onRename?: () => void
  onHome?: () => void
  /** Rendered at the right end (presence / connection). */
  children?: ReactNode
}

export function TopBar(p: Props) {
  return (
    <header className="topbar">
      {p.onHome && (
        <button onClick={p.onHome} title="Back to the list of rooms">
          ← Rooms
        </button>
      )}
      <strong className="title" title={p.onHome ? 'Room name' : undefined}>
        {p.roomName ?? (p.onHome ? '…' : layouts.meta.title)}
      </strong>
      {p.onRename && (
        <button className="link" onClick={p.onRename} title="Rename this room" aria-label="Rename room">
          ✎
        </button>
      )}

      <div className="group" role="group" aria-label="Layout option">
        {LAYOUT_IDS.map((id) => (
          <button
            key={id}
            className={id === p.layoutId ? 'active' : ''}
            onClick={() => p.onLayout(id)}
            title={layouts.options[id].note ?? layouts.options[id].label}
          >
            <b>{id}</b> {layouts.options[id].label}
          </button>
        ))}
      </div>

      <div className="group" role="group" aria-label="View">
        {(
          [
            ['perspective', '3D'],
            ['top', '2D plan'],
            ['walk', 'Walk'],
          ] as const
        ).map(([v, label]) => (
          <button key={v} className={p.view === v ? 'active' : ''} onClick={() => p.onView(v)}>
            {label}
          </button>
        ))}
      </div>

      <label className="toggle">
        <input type="checkbox" checked={p.showVolumes} onChange={(e) => p.onVolumes(e.target.checked)} />
        Zone volumes
      </label>
      <label className="toggle" title="Approximate look of the whole Al Masaood pavilion (from event photos)">
        <input type="checkbox" checked={p.showPavilion} onChange={(e) => p.onPavilion(e.target.checked)} />
        Pavilion
      </label>
      <label className="toggle">
        <input type="checkbox" checked={p.showWalls} onChange={(e) => p.onWalls(e.target.checked)} />
        Walls
      </label>
      <label className="toggle">
        <input type="checkbox" checked={p.snap} onChange={(e) => p.onSnap(e.target.checked)} />
        Snap
      </label>

      <span className="spacer" />
      <button onClick={p.onUndo} disabled={!p.canUndo} title="Ctrl+Z">
        Undo
      </button>
      <button onClick={p.onReset} title="Restore the original positions for this layout">
        Reset to design
      </button>
      <button onClick={p.onSnapshots} title="Save / restore named versions, export JSON or PNG">
        Snapshots & export
      </button>
      {p.children}
    </header>
  )
}
