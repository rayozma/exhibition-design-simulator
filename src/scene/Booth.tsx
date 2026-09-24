import { useMemo } from 'react'
import { BufferGeometry, Float32BufferAttribute } from 'three'
import { Edges } from '@react-three/drei'
import { outlineSegments, theme, type LayoutOption, type Wall } from '../lib/layout'

function WallMesh({ wall, h, t }: { wall: Wall; h: number; t: number }) {
  const dx = wall.x2 - wall.x1
  const dz = wall.z2 - wall.z1
  const len = Math.hypot(dx, dz)
  return (
    <mesh
      position={[(wall.x1 + wall.x2) / 2, h / 2, (wall.z1 + wall.z2) / 2]}
      rotation-y={-Math.atan2(dz, dx)}
    >
      {/* extend by t so wall corners close */}
      <boxGeometry args={[len + t, h, t]} />
      <meshStandardMaterial color={theme.wall} />
      <Edges color="#64748b" />
    </mesh>
  )
}

export function Booth({ option, showWalls }: { option: LayoutOption; showWalls: boolean }) {
  const { ndtFootprint, platformH, walls, wallH, wallT } = option

  const outline = useMemo(() => {
    const y = platformH + 0.005
    const pts = outlineSegments(ndtFootprint).flatMap(([x1, z1, x2, z2]) => [x1, y, z1, x2, y, z2])
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(pts, 3))
    return g
  }, [ndtFootprint, platformH])

  return (
    <group>
      {ndtFootprint.map((r, i) => (
        <mesh key={i} position={[r.x + r.w / 2, platformH / 2, r.z + r.d / 2]}>
          <boxGeometry args={[r.w, platformH, r.d]} />
          <meshStandardMaterial color={theme.boothFloor} />
        </mesh>
      ))}
      <lineSegments geometry={outline}>
        <lineBasicMaterial color={theme.ledEdge} />
      </lineSegments>
      {showWalls && walls.map((w) => <WallMesh key={w.id} wall={w} h={wallH} t={wallT} />)}
    </group>
  )
}
