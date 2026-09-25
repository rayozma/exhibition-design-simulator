import { useMemo } from 'react'
import { BufferGeometry, Float32BufferAttribute } from 'three'
import { useDesign } from '../lib/DesignContext'
import { theme } from '../lib/layout'

const STEP = 0.5
const MAJOR_EVERY = 10 // every 5 m

/** Grid line geometry over the hall; major = every 5 m, minor = the rest. */
function gridGeometry(w: number, d: number, major: boolean) {
  const pts: number[] = []
  for (let i = 0; i <= w / STEP; i++) {
    if ((i % MAJOR_EVERY === 0) !== major) continue
    const x = i * STEP
    pts.push(x, 0, 0, x, 0, d)
  }
  for (let i = 0; i <= d / STEP; i++) {
    if ((i % MAJOR_EVERY === 0) !== major) continue
    const z = i * STEP
    pts.push(0, 0, z, w, 0, z)
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pts, 3))
  return g
}

export function HallFloor() {
  const { w, d } = useDesign().hall
  const minor = useMemo(() => gridGeometry(w, d, false), [w, d])
  const major = useMemo(() => gridGeometry(w, d, true), [w, d])

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[w / 2, 0, d / 2]} raycast={() => null}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color={theme.floor} />
      </mesh>
      {/* grid sits just above the zone rects so it stays visible on them */}
      <lineSegments geometry={minor} position-y={0.012} raycast={() => null}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.12} />
      </lineSegments>
      <lineSegments geometry={major} position-y={0.013} raycast={() => null}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.35} />
      </lineSegments>
    </group>
  )
}
