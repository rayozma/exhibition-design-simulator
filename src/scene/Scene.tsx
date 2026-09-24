import { OrbitControls, OrthographicCamera, PerspectiveCamera } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { activeZones, HALL_CENTER, inRects, layouts, theme, type LayoutId } from '../lib/layout'
import { Booth } from './Booth'
import { HallFloor } from './HallFloor'
import { SceneObject } from './SceneObject'
import { Zones } from './Zones'

export type ViewMode = 'perspective' | 'top'

export type SceneProps = {
  layoutId: LayoutId
  view: ViewMode
  showVolumes: boolean
  showWalls: boolean
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

export function Scene({ layoutId, view, showVolumes, showWalls }: SceneProps) {
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
      {layouts.objects.map((o) => (
        <SceneObject
          key={o.id}
          obj={o}
          baseY={inRects(option.ndtFootprint, o.x, o.z) ? option.platformH : 0}
        />
      ))}
    </>
  )
}
