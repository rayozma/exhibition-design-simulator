import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { ObjectPanel } from './components/ObjectPanel'
import { TopBar } from './components/TopBar'
import { useEditor } from './lib/editor'
import { computeStatuses } from './lib/geometry'
import { layouts, type LayoutId } from './lib/layout'
import { ROTATE_STEP, useObjectOps, type ObjectOps } from './lib/useObjectOps'
import { Scene, type ViewMode } from './scene/Scene'

/** R / Shift+R rotate, Delete removes, Ctrl+Z undoes, Esc deselects. Ignored while typing in a field. */
function useShortcuts(ops: ObjectOps, selectedId: string | null, select: (id: string | null) => void) {
  const sel = useRef(selectedId)
  sel.current = selectedId
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea, select')) return
      const id = sel.current
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        ops.undo()
      } else if (e.key === 'Escape') {
        select(null)
      } else if (id && e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey) {
        ops.rotate(id, e.shiftKey ? -ROTATE_STEP : ROTATE_STEP)
      } else if (id && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault()
        ops.remove(id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ops, select])
}

export function App() {
  const [layoutId, setLayoutId] = useState<LayoutId>('B')
  const [view, setView] = useState<ViewMode>('perspective')
  const [showVolumes, setShowVolumes] = useState(false)
  const [showWalls, setShowWalls] = useState(true)
  const [snap, setSnap] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { state, actions } = useEditor()
  const objects = state.objects[layoutId]
  const ops = useObjectOps(actions, layoutId, objects, snap, setSelectedId)
  useShortcuts(ops, selectedId, setSelectedId)

  const statuses = useMemo(() => computeStatuses(objects, layouts.options[layoutId]), [objects, layoutId])
  const selected = objects.find((o) => o.id === selectedId) ?? null

  return (
    <div className="app">
      <TopBar
        layoutId={layoutId}
        onLayout={setLayoutId}
        view={view}
        onView={setView}
        showVolumes={showVolumes}
        onVolumes={setShowVolumes}
        showWalls={showWalls}
        onWalls={setShowWalls}
        snap={snap}
        onSnap={setSnap}
        canUndo={state.undo[layoutId].length > 0}
        onUndo={ops.undo}
        onReset={ops.reset}
      />
      <div className="body">
        <main className="viewport">
          <Canvas dpr={[1, 2]} onPointerMissed={() => setSelectedId(null)}>
            <Scene
              layoutId={layoutId}
              view={view}
              showVolumes={showVolumes}
              showWalls={showWalls}
              objects={objects}
              statuses={statuses}
              selectedId={selectedId}
              onSelect={setSelectedId}
              ops={ops}
            />
          </Canvas>
        </main>
        <ObjectPanel obj={selected} status={selected ? statuses.get(selected.id) ?? 'ok' : 'ok'} ops={ops} />
      </div>
    </div>
  )
}
