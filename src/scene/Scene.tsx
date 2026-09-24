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
import { Zones } from './Zones'

export type ViewMode = 'perspective' | 'top'

export type SceneProps = {
  layoutId: LayoutId
  view: ViewMode
  showVolumes: boolean
  showWalls: boolean
  objects: EditorObject[]
  statuses: Map<string, Status>
  selectedId: string | null
  /** Other users' selections / drags in this layout, by object id. */
  peerSelections: Map<string, { name: string; color: string }>
  movers: Map<string, { name: string; color: string }>
  onSelect: (id: string) => void
  ops: ObjectOps
  crowd: CrowdSettings
  onCrowdStats: (s: CrowdStats) => void
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

  return (
    <>
      <color attach="background" args={[theme.hall]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 25, 12]} intensity={1.4} />

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

      <HallFloor />
      <Zones zones={activeZones(layoutId)} showVolumes={showVolumes} />
      <Booth option={option} showWalls={showWalls} />
      {p.objects.map((o) => (
        <SceneObject
          key={o.id}
          obj={o}
          baseY={inRects(option.ndtFootprint, o.x, o.z) ? option.platformH : 0}
          status={p.statuses.get(o.id) ?? 'ok'}
          selected={o.id === p.selectedId}
          peer={p.peerSelections.get(o.id)}
          mover={p.movers.get(o.id)}
          ops={p.ops}
          onSelect={p.onSelect}
        />
      ))}
      <Crowd layoutId={layoutId} objects={p.objects} settings={p.crowd} onStats={p.onCrowdStats} />
    </>
  )
}
