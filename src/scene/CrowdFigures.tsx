import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  Euler,
  Matrix4,
  Quaternion,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  type BufferGeometry,
  type InstancedMesh,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { inRects } from '../lib/layout'
import { MAX_AGENTS, type CrowdSim } from '../sim/crowd'
import { hasHeadCloth, isRobe, type Outfit } from '../sim/outfits'
import type { NavGrid } from '../sim/navGrid'

const noRaycast = () => {}

/**
 * Low-poly person, 1.7 m tall, feet at the origin, facing +z. Drawn as separate parts so each
 * part gets its own per-person color: robe/trousers, torso, head, headcloth, agal, hair.
 */
export function partGeometries(): Record<Part, BufferGeometry> {
  const headcloth = mergeGeometries([
    // Dome over the head, and cloth hanging behind and at the sides (face stays open at +z).
    new SphereGeometry(0.142, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2).translate(0, 1.585, -0.005),
    new BoxGeometry(0.28, 0.32, 0.03).translate(0, 1.44, -0.13),
    new BoxGeometry(0.025, 0.24, 0.17).translate(0.135, 1.48, -0.035),
    new BoxGeometry(0.025, 0.24, 0.17).translate(-0.135, 1.48, -0.035),
  ])!
  return {
    lower: new CylinderGeometry(0.17, 0.2, 0.9, 10).translate(0, 0.45, 0),
    upper: new CylinderGeometry(0.2, 0.17, 0.55, 10).translate(0, 1.175, 0),
    head: new SphereGeometry(0.12, 10, 8).translate(0, 1.58, 0),
    headcloth,
    agal: new TorusGeometry(0.132, 0.016, 6, 16).rotateX(Math.PI / 2).translate(0, 1.645, -0.005),
    hair: new SphereGeometry(0.126, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2.2).translate(0, 1.59, -0.008),
  }
}

export type Part = 'lower' | 'upper' | 'head' | 'headcloth' | 'agal' | 'hair'
export const PARTS: Part[] = ['lower', 'upper', 'head', 'headcloth', 'agal', 'hair']

/** Color of each part for an outfit, or null = this part isn't shown. */
export function partColor(part: Part, o: Outfit): number | null {
  switch (part) {
    case 'lower':
      return o.lower
    case 'upper':
      return o.upper
    case 'head':
      return o.skin
    case 'headcloth':
      return hasHeadCloth(o.look) ? o.head : null
    case 'agal':
      return o.look === 'kandura' ? 0x111111 : null
    case 'hair':
      return hasHeadCloth(o.look) || o.bald ? null : o.head
  }
}

const HIDDEN = new Matrix4().makeScale(0, 0, 0)

/** All crowd figures: one InstancedMesh per body part (6 draw calls for up to MAX_AGENTS people). */
export function CrowdFigures({ sim, nav }: { sim: CrowdSim; nav: NavGrid | null }) {
  const geos = useMemo(partGeometries, [])
  useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos])
  const refs = useRef<Partial<Record<Part, InstancedMesh | null>>>({})

  const tmp = useMemo(
    () => ({ m: new Matrix4(), q: new Quaternion(), e: new Euler(), p: new Vector3(), s: new Vector3(), c: new Color() }),
    [],
  )

  useLayoutEffect(() => {
    // Create each per-instance color buffer up front.
    for (const part of PARTS) {
      const mesh = refs.current[part]
      if (!mesh) continue
      for (let i = 0; i < MAX_AGENTS; i++) mesh.setColorAt(i, tmp.c.set('#ffffff'))
      mesh.count = 0
    }
  }, [tmp])

  useFrame(() => {
    const agents = sim.agents
    const n = Math.min(agents.length, MAX_AGENTS)
    for (let i = 0; i < n; i++) {
      const a = agents[i]
      const y = nav && inRects(nav.footprint, a.x, a.z) ? nav.platformH : 0
      tmp.p.set(a.x, y, a.z)
      tmp.q.setFromEuler(tmp.e.set(0, a.heading, 0))
      const robe = isRobe(a.outfit.look)
      for (const part of PARTS) {
        const mesh = refs.current[part]
        if (!mesh) continue
        const color = partColor(part, a.outfit)
        if (color === null) {
          mesh.setMatrixAt(i, HIDDEN)
          continue
        }
        // Robes flare to the ankle; trousers are slimmer.
        const slim = part === 'lower' && !robe ? 0.72 : 1
        tmp.s.set(slim, 1, slim)
        mesh.setMatrixAt(i, tmp.m.compose(tmp.p, tmp.q, tmp.s))
        mesh.setColorAt(i, tmp.c.setHex(color))
      }
    }
    for (const part of PARTS) {
      const mesh = refs.current[part]
      if (!mesh) continue
      mesh.count = n
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    }
  })

  return (
    <group>
      {PARTS.map((part) => (
        <instancedMesh
          key={part}
          ref={(m) => {
            refs.current[part] = m
          }}
          args={[geos[part], undefined, MAX_AGENTS]}
          frustumCulled={false}
          raycast={noRaycast}
        >
          <meshStandardMaterial roughness={part === 'head' ? 0.6 : 0.85} />
        </instancedMesh>
      ))}
    </group>
  )
}
