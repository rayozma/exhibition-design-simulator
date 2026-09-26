import { OrbitControls, OrthographicCamera, PerspectiveCamera } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import type { EditorObject } from '../lib/editor'
import type { Status } from '../lib/geometry'
import { useMemo, type ComponentProps, type MutableRefObject } from 'react'
import { hallCenter, type Design } from '../lib/design'
import { DesignContext } from '../lib/DesignContext'
import { inRects, theme } from '../lib/layout'
import type { ObjectOps } from '../lib/useObjectOps'
import type { CrowdSettings, CrowdStats } from '../sim/crowd'
import type { Walker } from '../lib/useRoomSync'
import { Avatars } from './Avatars'
import { Booth } from './Booth'
import { Crowd } from './Crowd'
import { HallFloor } from './HallFloor'
import { Pavilion } from './Pavilion'
import { SceneObject } from './SceneObject'
import { MeasureLayer, Rulers, SelectionDims, type Measurement } from './Dimensions'
import { LayoutEditor } from './LayoutEditor'
import { WalkMode } from './WalkMode'
import { Zones } from './Zones'

export type ViewMode = 'perspective' | 'top' | 'walk'

export type SceneProps = {
  design: Design
  view: ViewMode
  showVolumes: boolean
  showWalls: boolean
  /** Show the Al Masaood pavilion structure and booth shells (visual only). */
  showPavilion: boolean
  objects: EditorObject[]
  statuses: Map<string, Status>
  selectedIds: string[]
  /** Other users' selections / drags in this layout, by object id. */
  peerSelections: Map<string, { name: string; color: string }>
  movers: Map<string, { name: string; color: string }>
  onSelect: (id: string, additive: boolean) => void
  ops: ObjectOps
  crowd: CrowdSettings
  onCrowdStats: (s: CrowdStats) => void
  onWalkLock: (locked: boolean) => void
  /** Other users walking in first-person mode. */
  walkers: Walker[]
  onWalkMove: (x: number, z: number, heading: number) => void
  onWalkLeave: () => void
  /** Layout editing (zones, booth areas, walls, entrances); null = editing objects as usual. */
  layout: ComponentProps<typeof LayoutEditor> | null
  /** Open an object's info window; the object with info in the walk-mode crosshair. */
  onInfo: (id: string) => void
  onWalkAim: (id: string | null) => void
  walkLockRef: MutableRefObject<(() => void) | null>
  /** Dimensions overlay and the measure tool. */
  dims: { show: boolean; measuring: boolean; measures: Measurement[]; onMeasure: (m: Measurement) => void }
}

/** Orthographic camera looking straight down, north (-z) at the top, zoomed to fit the hall (+ margin for rulers). */
function TopCamera({ design, margin }: { design: Design; margin: number }) {
  const size = useThree((s) => s.size)
  const zoom = Math.min(size.width / (design.hall.w + margin), size.height / (design.hall.d + margin))
  const c = hallCenter(design)
  return (
    <OrthographicCamera
      makeDefault
      position={[c[0], 50, c[2]]}
      up={[0, 0, -1]}
      zoom={zoom}
      near={0.1}
      far={200}
    />
  )
}

export function Scene(p: SceneProps) {
  const { design, view, showVolumes, showWalls } = p
  const option = design.booth
  const center = useMemo(() => hallCenter(design), [design])
  // Overview camera: back from the hall far enough to see all of it.
  const overview = useMemo<[number, number, number]>(
    () => [center[0], Math.max(12, design.hall.w * 0.55), design.hall.d + Math.max(12, design.hall.w * 0.6)],
    [center, design.hall.w, design.hall.d],
  )
  const top = view === 'top'
  const walk = view === 'walk'
  const selected = new Set(p.selectedIds)
  const selectedOne = p.selectedIds.length === 1 ? p.objects.find((o) => o.id === p.selectedIds[0]) : undefined

  return (
    // The canvas has its own React renderer, so the design is provided again inside it.
    <DesignContext.Provider value={design}>
      <color attach="background" args={[theme.hall]} />
      {/* Soft, bright lighting so white lacquer reads as white, not gray. */}
      <hemisphereLight args={['#ffffff', '#9aa3b2', 1.0]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[8, 22, 16]} intensity={1.2} />
      <directionalLight position={[28, 12, -4]} intensity={0.45} />

      {walk ? (
        <WalkMode
          objects={p.objects}
          onLockChange={p.onWalkLock}
          onMove={p.onWalkMove}
          onLeave={p.onWalkLeave}
          onAim={p.onWalkAim}
          onInteract={p.onInfo}
          lockRef={p.walkLockRef}
        />
      ) : (
        <>
          {top ? (
            <TopCamera design={design} margin={p.dims.show ? 5 : 2} />
          ) : (
            <PerspectiveCamera makeDefault position={overview} fov={45} near={0.1} far={400} />
          )}
          {/* re-mount controls per view so they bind to the new camera */}
          <OrbitControls
            key={view}
            makeDefault
            target={center}
            enableRotate={!top}
            maxPolarAngle={top ? Math.PI : Math.PI / 2.1}
          />
        </>
      )}

      <HallFloor />
      <Zones zones={design.zones} showVolumes={showVolumes} realistic={p.showPavilion && !!design.pavilion} />
      {p.showPavilion && design.pavilion && <Pavilion spec={design.pavilion} />}
      <Booth option={option} showWalls={showWalls} />
      {p.objects.map((o) => (
        <SceneObject
          key={o.id}
          obj={o}
          baseY={inRects(option.footprint, o.x, o.z) ? option.platformH : 0}
          status={p.statuses.get(o.id) ?? 'ok'}
          selected={selected.has(o.id)}
          peer={p.peerSelections.get(o.id)}
          mover={p.movers.get(o.id)}
          ops={p.ops}
          onSelect={p.onSelect}
          interactive={!walk && !p.layout && !p.dims.measuring}
          onInfo={p.layout || p.dims.measuring ? undefined : p.onInfo}
        />
      ))}
      {p.layout && !walk && <LayoutEditor {...p.layout} />}
      {p.dims.show && <Rulers />}
      {p.dims.show && !p.layout && selectedOne && <SelectionDims obj={selectedOne} objects={p.objects} />}
      <MeasureLayer active={p.dims.measuring && !walk} measures={p.dims.measures} onAdd={p.dims.onMeasure} objects={p.objects} />
      <Avatars walkers={p.walkers} layoutId={design.layoutId} />
      <Crowd objects={p.objects} settings={p.crowd} onStats={p.onCrowdStats} />
    </DesignContext.Provider>
  )
}
