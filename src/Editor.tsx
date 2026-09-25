import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { CrowdPanel } from './components/CrowdPanel'
import { ObjectList } from './components/ObjectList'
import { ObjectPanel } from './components/ObjectPanel'
import { PeerList } from './components/PeerList'
import { Sidebar } from './components/Sidebar'
import { SnapshotsDialog } from './components/SnapshotsDialog'
import { TopBar } from './components/TopBar'
import { UploadDialog, type UploadMode } from './components/UploadDialog'
import { ensureRoom, renameRoom } from './lib/db'
import { useEditor, type EditorObject } from './lib/editor'
import { computeStatuses } from './lib/geometry'
import { layouts, type LayoutId } from './lib/layout'
import { ROTATE_STEP, useObjectOps, type ObjectOps } from './lib/useObjectOps'
import { moverKey, useRoomSync } from './lib/useRoomSync'
import type { User } from './lib/user'
import { Capture, type CaptureFn } from './scene/Capture'
import { Scene, type ViewMode } from './scene/Scene'
import { WALK_START_ID } from './scene/WalkMode'
import type { CrowdSettings, CrowdStats } from './sim/crowd'

const INITIAL_CROWD: CrowdSettings = {
  density: 0,
  visitorShare: 0.3,
  playing: true,
  showHeat: false,
  showClearance: false,
  restartToken: 0,
}
const NO_STATS: CrowdStats = { inside: 0, peak: 0, total: 0, area: 0, narrowArea: 0 }

/**
 * R / Shift+R rotate, Delete removes, Ctrl+Z undoes, Esc deselects, Ctrl+A selects all.
 * Ignored while typing in a field, while a dialog is open, and in walk mode.
 */
function useShortcuts(
  ops: ObjectOps,
  selectedIds: string[],
  setSelection: (ids: string[]) => void,
  allIds: string[],
  enabled: boolean,
) {
  const latest = useRef({ selectedIds, allIds, enabled })
  latest.current = { selectedIds, allIds, enabled }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { selectedIds: ids, allIds: all, enabled: on } = latest.current
      if (!on) return
      if ((e.target as HTMLElement).closest('input, textarea, select')) return
      if (document.querySelector('.overlay')) return // a dialog is open
      const k = e.key.toLowerCase()
      if ((e.ctrlKey || e.metaKey) && k === 'z') {
        e.preventDefault()
        ops.undo()
      } else if ((e.ctrlKey || e.metaKey) && k === 'a') {
        e.preventDefault()
        setSelection(all)
      } else if (e.key === 'Escape') {
        setSelection([])
      } else if (ids.length && k === 'r' && !e.ctrlKey && !e.metaKey) {
        ops.rotate(ids, e.shiftKey ? -ROTATE_STEP : ROTATE_STEP)
      } else if (ids.length && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault()
        ops.remove(ids)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ops, setSelection])
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
  const [walkLocked, setWalkLocked] = useState(false)
  const [showVolumes, setShowVolumes] = useState(false)
  const [showWalls, setShowWalls] = useState(true)
  const [showPavilion, setShowPavilion] = useState(false)
  const [snap, setSnap] = useState(true)
  const [selection, setSelection] = useState<string[]>([])
  const [upload, setUpload] = useState<UploadMode | null>(null)
  const [crowd, setCrowd] = useState(INITIAL_CROWD)
  const [crowdStats, setCrowdStats] = useState(NO_STATS)
  const [showSnapshots, setShowSnapshots] = useState(false)
  const capture = useRef<CaptureFn | null>(null)
  const [roomName, setRoomName] = useState<string | null>(null)
  const [roomError, setRoomError] = useState<string | null>(null)

  // Register the room in the rooms list (older rooms get a default name) and show its name.
  useEffect(() => {
    if (!room) return
    ensureRoom(room)
      .then((r) => setRoomName(r.name))
      .catch((e: Error) => setRoomError(e.message))
  }, [room])

  const rename = async () => {
    if (!room) return
    const next = window.prompt('Room name', roomName ?? '')?.trim()
    if (!next || next === roomName) return
    try {
      await renameRoom(room, next.slice(0, 80))
      setRoomName(next.slice(0, 80))
    } catch (e) {
      setRoomError(`Rename failed: ${(e as Error).message}`)
    }
  }

  const { state, actions } = useEditor()
  const objects = state.objects[layoutId]

  // Only ids that exist in the current layout count as selected (objects can be deleted by others).
  const selectedObjs = useMemo(
    () => selection.map((id) => objects.find((o) => o.id === id)).filter((o): o is EditorObject => !!o),
    [selection, objects],
  )
  const selectedIds = useMemo(() => selectedObjs.map((o) => o.id), [selectedObjs])

  /** Plain click: select just this one (keeps a multi-selection if it's part of it, so it can be dragged). */
  const select = useCallback((id: string, additive: boolean) => {
    setSelection((sel) => {
      if (additive) return sel.includes(id) ? sel.filter((s) => s !== id) : [...sel, id]
      return sel.includes(id) && sel.length > 1 ? sel : [id]
    })
  }, [])

  const roomSync = useRoomSync(room, me, actions, layoutId, selectedIds)
  const ops = useObjectOps(actions, roomSync.sync, layoutId, objects, state.undo[layoutId], snap, selectedIds, setSelection)
  const allIds = useMemo(() => objects.map((o) => o.id), [objects])
  useShortcuts(ops, selectedIds, setSelection, allIds, view !== 'walk')

  const statuses = useMemo(() => computeStatuses(objects, layouts.options[layoutId]), [objects, layoutId])

  // Other users' selections and drags, for this layout only.
  const peerSelections = useMemo(() => {
    const m = new Map<string, { name: string; color: string }>()
    for (const p of roomSync.peers) if (p.layoutId === layoutId) for (const id of p.selectedIds) m.set(id, p)
    return m
  }, [roomSync.peers, layoutId])
  const movers = useMemo(() => {
    const prefix = moverKey(layoutId, '')
    return new Map(
      Object.entries(roomSync.movers)
        .filter(([k]) => k.startsWith(prefix))
        .map(([k, m]) => [k.slice(prefix.length), m]),
    )
  }, [roomSync.movers, layoutId])

  const single = selectedObjs.length === 1 ? selectedObjs[0] : null

  return (
    <div className="app">
      <TopBar
        layoutId={layoutId}
        onLayout={setLayoutId}
        view={view}
        onView={(v) => {
          setView(v)
          setWalkLocked(false)
        }}
        showVolumes={showVolumes}
        onVolumes={setShowVolumes}
        showWalls={showWalls}
        onWalls={setShowWalls}
        showPavilion={showPavilion}
        onPavilion={setShowPavilion}
        snap={snap}
        onSnap={setSnap}
        canUndo={state.undo[layoutId].length > 0}
        onUndo={ops.undo}
        onReset={ops.reset}
        onSnapshots={() => setShowSnapshots(true)}
        roomName={room ? roomName : undefined}
        onRename={room ? rename : undefined}
        onHome={room ? () => (location.href = location.pathname) : undefined}
      >
        <PeerList status={roomSync.status} me={me} peers={roomSync.peers} objects={state.objects} onEditUser={onEditUser} />
      </TopBar>
      {(roomSync.error || roomError) && (
        <div className="banner">
          {roomSync.error ?? roomError}
          <button
            onClick={() => {
              roomSync.clearError()
              setRoomError(null)
            }}
          >
            Dismiss
          </button>
        </div>
      )}
      <div className="body">
        <main className="viewport">
          {/* flat = no filmic tone mapping, which would dull whites and the zone colors */}
          <Canvas dpr={[1, 2]} flat onPointerMissed={() => view !== 'walk' && setSelection([])}>
            <Scene
              layoutId={layoutId}
              view={view}
              showVolumes={showVolumes}
              showWalls={showWalls}
              showPavilion={showPavilion}
              objects={objects}
              statuses={statuses}
              selectedIds={selectedIds}
              peerSelections={peerSelections}
              movers={movers}
              onSelect={select}
              ops={ops}
              crowd={crowd}
              onCrowdStats={setCrowdStats}
              onWalkLock={setWalkLocked}
            />
            <Capture register={capture} />
          </Canvas>
          {view === 'walk' && (
            <>
              {/* Kept mounted (only hidden) so the pointer-lock click handler stays attached. */}
              <div className="walk-overlay" hidden={walkLocked}>
                <button id={WALK_START_ID} className="primary">
                  Click to start walking
                </button>
                <p>
                  Mouse: look around · W A S D or arrows: walk · Shift: run · Esc: release the mouse
                </p>
              </div>
              {walkLocked && <div className="walk-hint">WASD walk · Shift run · Esc release mouse</div>}
            </>
          )}
          <CrowdPanel
            layoutId={layoutId}
            settings={crowd}
            onChange={(patch) => setCrowd((c) => ({ ...c, ...patch }))}
            stats={crowdStats}
          />
          {!roomSync.loaded && <div className="loading">Loading room…</div>}
        </main>
        <Sidebar
          selectedCount={selectedObjs.length}
          objectCount={objects.length}
          selected={
            <ObjectPanel
              objs={selectedObjs}
              statuses={statuses}
              busyBy={(id) => movers.get(id)?.name ?? null}
              ops={ops}
              onUpload={room ? () => setUpload(single ? 'attach' : 'new') : undefined}
            />
          }
          list={<ObjectList objects={objects} statuses={statuses} selectedIds={selectedIds} onSelect={select} ops={ops} />}
        />
      </div>
      {upload && (
        <UploadDialog
          room={room}
          layoutId={layoutId}
          selected={single}
          initialMode={upload}
          ops={ops}
          onClose={() => setUpload(null)}
        />
      )}
      {showSnapshots && (
        <SnapshotsDialog
          room={room}
          layoutId={layoutId}
          objects={objects}
          me={me}
          ops={ops}
          capture={() => capture.current}
          onClose={() => setShowSnapshots(false)}
        />
      )}
    </div>
  )
}
