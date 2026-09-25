import { useEffect, useMemo, useRef } from 'react'
import { Billboard, Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { MeshStandardMaterial, type Group } from 'three'
import { inRects, layouts, type LayoutId } from '../lib/layout'
import type { Walker } from '../lib/useRoomSync'
import { avatarOutfit } from '../sim/outfits'
import { partColor, partGeometries, PARTS } from './CrowdFigures'

const noRaycast = () => {}

/** One other user's avatar: their chosen outfit, name tag, and a ring in their color. */
function Avatar({ walker, geos }: { walker: Walker; geos: ReturnType<typeof partGeometries> }) {
  const outfit = useMemo(() => avatarOutfit(walker.name, walker.avatar), [walker.name, walker.avatar])
  const mats = useMemo(
    () =>
      PARTS.map((part) => {
        const c = partColor(part, outfit)
        return c === null ? null : new MeshStandardMaterial({ color: c, roughness: part === 'head' ? 0.6 : 0.85 })
      }),
    [outfit],
  )
  useEffect(() => () => mats.forEach((m) => m?.dispose()), [mats])

  const ref = useRef<Group>(null)
  const opt = layouts.options[walker.layoutId as LayoutId]

  // Glide between the ~10 Hz position updates.
  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    const k = Math.min(1, dt * 10)
    const y = inRects(opt.ndtFootprint, walker.x, walker.z) ? opt.platformH : 0
    if (g.userData.placed) {
      g.position.x += (walker.x - g.position.x) * k
      g.position.z += (walker.z - g.position.z) * k
      g.position.y += (y - g.position.y) * k
      const diff = Math.atan2(Math.sin(walker.heading - g.rotation.y), Math.cos(walker.heading - g.rotation.y))
      g.rotation.y += diff * k
    } else {
      g.position.set(walker.x, y, walker.z) // first update: jump there
      g.rotation.y = walker.heading
      g.userData.placed = true
    }
  })

  return (
    <group ref={ref}>
      {PARTS.map((part, i) =>
        mats[i] ? <mesh key={part} geometry={geos[part]} material={mats[i]!} raycast={noRaycast} /> : null,
      )}
      <mesh rotation-x={-Math.PI / 2} position-y={0.02} raycast={noRaycast}>
        <ringGeometry args={[0.28, 0.36, 24]} />
        <meshBasicMaterial color={walker.color} />
      </mesh>
      <Billboard position-y={2.0}>
        <Text fontSize={0.16} color={walker.color} outlineWidth={0.016} outlineColor="#000000" anchorY="bottom" raycast={noRaycast}>
          {walker.name}
        </Text>
      </Billboard>
    </group>
  )
}

/** Avatars of the other users who are in walk mode on this layout option. */
export function Avatars({ walkers, layoutId }: { walkers: Walker[]; layoutId: LayoutId }) {
  const geos = useMemo(partGeometries, [])
  useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos])
  return (
    <group>
      {walkers
        .filter((w) => w.layoutId === layoutId)
        .map((w) => (
          <Avatar key={w.tabId} walker={w} geos={geos} />
        ))}
    </group>
  )
}
