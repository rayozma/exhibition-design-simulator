import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { ObjectPanel } from './components/ObjectPanel'
import { PeerList } from './components/PeerList'
import { TopBar } from './components/TopBar'
import { UploadDialog, type UploadMode } from './components/UploadDialog'
import { useEditor } from './lib/editor'
import { computeStatuses } from './lib/geometry'
import { layouts, type LayoutId } from './lib/layout'
import { ROTATE_STEP, useObjectOps, type ObjectOps } from './lib/useObjectOps'
import { moverKey, useRoomSync } from './lib/useRoomSync'
import type { User } from './lib/user'
import { Scene, type ViewMode } from './scene/Scene'

/** R / Shift+R rotate, Delete removes, Ctrl+Z undoes, Esc deselects. Ignored while typing in a field. */
function useShortcuts(ops: ObjectOps, selectedId: string | null, select: (id: string | null) => void) {
  const sel = useRef(selectedId)
  sel.current = selectedId
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea, select')) return
      if (document.querySelector('.overlay')) return // a dialog is open
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

type Props = {
  /** null = local-only mode. */
  room: string | null
  me: User | null
  onEditUser: () => void
}

export function Editor({ room, me, onEditUser }: Props) {
  const [layoutId, setLayoutId] = useState<LayoutId>('B')
  const [view, setView] = useState<ViewMode>('perspective')
  const [showVolumes, setShowVolumes] = useState(false)
  const [showWalls, setShowWalls] = useState(true)
  const [snap, setSnap] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [upload, setUpload] = useState<UploadMode | null>(null)

  const { state, actions } = useEditor()
  const objects = state.objects[layoutId]
  const roomSync = useRoomSync(room, me, actions, layoutId, selectedId)
  const ops = useObjectOps(actions, roomSync.sync, layoutId, objects, state.undo[layoutId], snap, setSelectedId)
  useShortcuts(ops, selectedId, setSelectedId)

  const statuses = useMemo(() => computeStatuses(objects, layouts.options[layoutId]), [objects, layoutId])
  const selected = objects.find((o) => o.id === selectedId) ?? null

  // Other users' selections and drags, for this layout only.
  const peerSelections = useMemo(
    () => new Map(roomSync.peers.filter((p) => p.layoutId === layoutId && p.selectedId).map((p) => [p.selectedId!, p])),
    [roomSync.peers, layoutId],
  )
  const movers = useMemo(() => {
    const prefix = moverKey(layoutId, '')
    return new Map(
      Object.entries(roomSync.movers)
        .filter(([k]) => k.startsWith(prefix))
        .map(([k, m]) => [k.slice(prefix.length), m]),
    )
  }, [roomSync.movers, layoutId])

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
      >
        <PeerList
          status={roomSync.status}
          me={me}
          peers={roomSync.peers}
          objects={state.objects}
          onEditUser={onEditUser}
        />
      </TopBar>
      {roomSync.error && (
        <div className="banner">
          {roomSync.error}
          <button onClick={roomSync.clearError}>Dismiss</button>
        </div>
      )}
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
              peerSelections={peerSelections}
              movers={movers}
              onSelect={setSelectedId}
              ops={ops}
            />
          </Canvas>
          {!roomSync.loaded && <div className="loading">Loading room…</div>}
        </main>
        <ObjectPanel
          obj={selected}
          status={selected ? statuses.get(selected.id) ?? 'ok' : 'ok'}
          busyBy={selected ? movers.get(selected.id)?.name ?? null : null}
          ops={ops}
          onUpload={room ? () => setUpload(selected ? 'attach' : 'new') : undefined}
        />
      </div>
      {upload && (
        <UploadDialog
          room={room}
          layoutId={layoutId}
          selected={selected}
          initialMode={upload}
          ops={ops}
          onClose={() => setUpload(null)}
        />
      )}
    </div>
  )
}
