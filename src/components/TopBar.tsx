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
  onWalls: (v: boolean) => void
  snap: boolean
  onSnap: (v: boolean) => void
  canUndo: boolean
  onUndo: () => void
  onReset: () => void
  /** Rendered at the right end (presence / connection). */
  children?: ReactNode
}

export function TopBar(p: Props) {
  return (
    <header className="topbar">
      <strong className="title">{layouts.meta.title}</strong>

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

      <button onClick={() => p.onView(p.view === 'top' ? 'perspective' : 'top')}>
        {p.view === 'top' ? '3D view' : '2D plan'}
      </button>

      <label className="toggle">
        <input type="checkbox" checked={p.showVolumes} onChange={(e) => p.onVolumes(e.target.checked)} />
        Zone volumes
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
      {p.children}
    </header>
  )
}
