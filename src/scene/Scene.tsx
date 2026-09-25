import { OrbitControls, OrthographicCamera, PerspectiveCamera } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import type { EditorObject } from '../lib/editor'
import type { Status } from '../lib/geometry'
import { activeZones, HALL_CENTER, inRects, layouts, theme, type LayoutId } from '../lib/layout'
import type { ObjectOps } from '../lib/useObjectOps'
import type { CrowdSettings, CrowdStats } from '../sim/crowd'
import { Booth } from './Booth'
import { Crowd } from './Crowd'
import { HallFloor } from './HallFloor'
import { SceneObject } from './SceneObject'
import { WalkMode } from './WalkMode'
import { Zones } from './Zones'

export type ViewMode = 'perspective' | 'top' | 'walk'

export type SceneProps = {
  layoutId: LayoutId
  view: ViewMode
  showVolumes: boolean
  showWalls: boolean
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
}

/** Orthographic camera looking straight down, north (-z) at the top, zoomed to fit the hall. */
function TopCamera() {
  const size = useThree((s) => s.size)
  const zoom = Math.min(size.width / (layouts.hall.w + 2), size.height / (layouts.hall.d + 2))
  return (
    <OrthographicCamera
      makeDefault
      position={[HALL_CENTER[0], 50, HALL_CENTER[2]]}
      up={[0, 0, -1]}
      zoom={zoom}
      near={0.1}
      far={200}
    />
  )
}

export function Scene(p: SceneProps) {
  const { layoutId, view, showVolumes, showWalls } = p
  const option = layouts.options[layoutId]
  const top = view === 'top'
  const walk = view === 'walk'
  const selected = new Set(p.selectedIds)

  return (
    <>
      <color attach="background" args={[theme.hall]} />
      {/* Soft, bright lighting so white lacquer reads as white, not gray. */}
      <hemisphereLight args={['#ffffff', '#9aa3b2', 1.0]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[8, 22, 16]} intensity={1.2} />
      <directionalLight position={[28, 12, -4]} intensity={0.45} />

      {walk ? (
        <WalkMode layoutId={layoutId} objects={p.objects} onLockChange={p.onWalkLock} />
      ) : (
        <>
          {top ? (
            <TopCamera />
          ) : (
            <PerspectiveCamera makeDefault position={[HALL_CENTER[0], 18, 30]} fov={45} near={0.1} far={300} />
          )}
          {/* re-mount controls per view so they bind to the new camera */}
          <OrbitControls
            key={view}
            makeDefault
            target={HALL_CENTER}
            enableRotate={!top}
            maxPolarAngle={top ? Math.PI : Math.PI / 2.1}
          />
        </>
      )}

      <HallFloor />
      <Zones zones={activeZones(layoutId)} showVolumes={showVolumes} />
      <Booth option={option} showWalls={showWalls} />
      {p.objects.map((o) => (
        <SceneObject
          key={o.id}
          obj={o}
          baseY={inRects(option.ndtFootprint, o.x, o.z) ? option.platformH : 0}
          status={p.statuses.get(o.id) ?? 'ok'}
          selected={selected.has(o.id)}
          peer={p.peerSelections.get(o.id)}
          mover={p.movers.get(o.id)}
          ops={p.ops}
          onSelect={p.onSelect}
          interactive={!walk}
        />
      ))}
      <Crowd layoutId={layoutId} objects={p.objects} settings={p.crowd} onStats={p.onCrowdStats} />
    </>
  )
}
