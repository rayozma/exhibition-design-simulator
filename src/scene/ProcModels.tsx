import { BoxGeometry, CylinderGeometry, MeshStandardMaterial, TorusGeometry } from 'three'
import type { EditorObject } from '../lib/editor'

/**
 * Simplified built-in models that follow the booth design renders (Karya Imaji Warna, 20260912):
 * white glossy lacquer, gold stripe accents, dark plinth bases, chrome stool poles, dark electronics.
 * Each model is built from the object's w/d/h (local x = w, z = d, y up; origin at floor center).
 * Local +z is the object's "front" (the side facing visitors / the table).
 */

export type ProcKind =
  | 'plinth'
  | 'robotPlinth'
  | 'irisPlinth'
  | 'deskSim'
  | 'deskTraining'
  | 'counter'
  | 'droneStand'
  | 'diorama'
  | 'tvStand'
  | 'chair'
  | 'stool'
  | 'roundTable'
  | 'plant'
  | 'rollup'
  | 'ledWall'
  | 'highTable'

export const PROC_KINDS: ProcKind[] = [
  'plinth', 'robotPlinth', 'irisPlinth', 'deskSim', 'deskTraining', 'counter', 'droneStand',
  'diorama', 'tvStand', 'chair', 'stool', 'roundTable', 'plant', 'rollup', 'ledWall', 'highTable',
]

const BY_ID: Record<string, ProcKind> = {
  item1: 'droneStand',
  item2: 'deskSim',
  item3: 'tvStand',
  item4: 'diorama',
  item5: 'robotPlinth',
  item6: 'irisPlinth',
  item7: 'deskTraining',
  item8: 'counter',
  meet_table: 'roundTable',
}

/** Which built-in model to draw, or null for a plain box (e.g. uploaded "model" objects without a file). */
export function kindOf(obj: EditorObject): ProcKind | null {
  if (obj.parts) return null // combined objects draw their parts
  if (obj.kind) return (PROC_KINDS as string[]).includes(obj.kind) ? (obj.kind as ProcKind) : null
  if (obj.category === 'shape') return null // basic shapes are drawn as plain geometry
  const base = obj.id.replace(/-[0-9a-f]{8}$/, '') // duplicates keep their original's look
  if (BY_ID[base]) return BY_ID[base]
  if (/chair/i.test(obj.name)) return 'chair'
  if (/stool/i.test(obj.name)) return 'stool'
  if (obj.category === 'furniture' && /table/i.test(obj.name)) return 'roundTable'
  if (obj.category === 'counter') return 'counter'
  if (obj.category === 'screen') return 'tvStand'
  if (obj.category === 'display') return 'plinth'
  return null
}

// Shared unit geometries (scaled per part) and cached materials keep draw setup cheap.
const BOX = new BoxGeometry(1, 1, 1)
const CYL = new CylinderGeometry(0.5, 0.5, 1, 24)
const RING = new TorusGeometry(0.5, 0.06, 6, 24)

type Finish = 'lacquer' | 'matte' | 'metal' | 'gold' | 'screen'
const materials = new Map<string, MeshStandardMaterial>()
function mat(color: string, finish: Finish = 'lacquer') {
  const key = `${finish}:${color}`
  let m = materials.get(key)
  if (!m) {
    const p: Record<Finish, ConstructorParameters<typeof MeshStandardMaterial>[0]> = {
      lacquer: { color, roughness: 0.22, metalness: 0 },
      matte: { color, roughness: 0.75, metalness: 0 },
      metal: { color, roughness: 0.25, metalness: 0.85 },
      gold: { color, roughness: 0.3, metalness: 0.7 },
      screen: { color: '#0b1320', emissive: color, emissiveIntensity: 0.45, roughness: 0.15 },
    }
    m = new MeshStandardMaterial(p[finish])
    materials.set(key, m)
  }
  return m
}

const DARK = '#1c1c1c'
const GOLD = '#c9a227'
const CHROME = '#d9dde2'
const SCREEN_BLUE = '#3b82c4'

const noRaycast = () => {}
type V3 = [number, number, number]

/** One part: a unit box or cylinder, moved and scaled. Cylinder scale = [diameter, height, diameter]. */
function Part({ cyl, ring, p, s, r, m }: { cyl?: boolean; ring?: boolean; p: V3; s: V3; r?: V3; m: MeshStandardMaterial }) {
  return (
    <mesh geometry={ring ? RING : cyl ? CYL : BOX} material={m} position={p} scale={s} rotation={r} raycast={noRaycast} />
  )
}

/** Lacquered display block: dark recessed base, white body, gold stripe near the top. */
function Plinth({ w, d, h, c }: { w: number; d: number; h: number; c: string }) {
  const baseH = Math.min(0.06, h * 0.1)
  return (
    <>
      <Part p={[0, baseH / 2, 0]} s={[w - 0.04, baseH, d - 0.04]} m={mat(DARK, 'matte')} />
      <Part p={[0, baseH + (h - baseH) / 2, 0]} s={[w, h - baseH, d]} m={mat(c)} />
      <Part p={[0, h - Math.min(0.12, h * 0.2), 0]} s={[w + 0.006, 0.015, d + 0.006]} m={mat(GOLD, 'gold')} />
    </>
  )
}

function Laptop({ x, z, y }: { x: number; z: number; y: number }) {
  return (
    <group position={[x, y, z]}>
      <Part p={[0, 0.01, 0]} s={[0.32, 0.02, 0.22]} m={mat('#2a2a2a', 'metal')} />
      <Part p={[0, 0.115, 0.11]} s={[0.32, 0.21, 0.01]} r={[-0.25, 0, 0]} m={mat(SCREEN_BLUE, 'screen')} />
    </group>
  )
}

/** Screen on a post at the back (+z) edge, facing the front (-z). */
function BackScreen({ w, h, d, sw, sh }: { w: number; h: number; d: number; sw: number; sh: number }) {
  const z = d / 2 - 0.06
  const post = 0.35
  return (
    <group position={[0, h, z]}>
      <Part p={[0, post / 2, 0]} s={[0.05, post, 0.05]} m={mat(DARK, 'matte')} />
      <Part p={[0, post + sh / 2, 0]} s={[Math.min(sw, w), sh, 0.04]} m={mat(DARK, 'matte')} />
      <Part p={[0, post + sh / 2, -0.021]} s={[Math.min(sw, w) - 0.03, sh - 0.03, 0.002]} m={mat(SCREEN_BLUE, 'screen')} />
    </group>
  )
}

function Drone({ y }: { y: number }) {
  const arm = 0.28
  return (
    <group position={[0, y, 0]}>
      <Part p={[0, 0.04, 0]} s={[0.22, 0.08, 0.3]} m={mat(DARK, 'matte')} />
      {[0.785, -0.785, 2.356, -2.356].map((a) => (
        <group key={a} rotation={[0, a, 0]}>
          <Part p={[arm / 2, 0.06, 0]} s={[arm, 0.025, 0.025]} m={mat(DARK, 'matte')} />
          <Part cyl p={[arm, 0.08, 0]} s={[0.26, 0.008, 0.26]} m={mat('#333333', 'matte')} />
        </group>
      ))}
      <Part p={[0, -0.04, 0]} s={[0.28, 0.02, 0.02]} m={mat(DARK, 'matte')} />
    </group>
  )
}

// Skyline blocks on the diorama: [x, z as fractions of the top, height in m].
const TOWERS: [number, number, number][] = [
  [-0.3, -0.25, 0.32], [-0.2, -0.3, 0.2], [-0.1, -0.22, 0.26], [0, -0.3, 0.16], [0.12, -0.25, 0.22],
  [0.25, -0.3, 0.14], [0.32, -0.18, 0.18], [-0.34, -0.05, 0.12], [0.3, 0.05, 0.1],
]

/** The built-in model for one object. Color `c` is the object's own (white by default). */
export function ProcModel({ kind, obj, c }: { kind: ProcKind; obj: EditorObject; c: string }) {
  const { w, d, h } = obj
  switch (kind) {
    case 'plinth':
      return <Plinth w={w} d={d} h={h} c={c} />

    case 'robotPlinth':
      // Display C (low) with the W6 underwater robot on top.
      return (
        <>
          <Plinth w={w} d={d} h={h} c={c} />
          <group position={[0, h, 0]}>
            <Part p={[0, 0.11, 0]} s={[w * 0.6, 0.18, d * 0.6]} m={mat(DARK, 'matte')} />
            {[-1, 1].map((sd) => (
              <Part key={sd} cyl p={[sd * w * 0.34, 0.11, 0]} s={[0.12, 0.1, 0.12]} r={[0, 0, Math.PI / 2]} m={mat('#2b2b2b', 'metal')} />
            ))}
          </group>
        </>
      )

    case 'irisPlinth':
      // Display C (high) with the IRIS array case and probe.
      return (
        <>
          <Plinth w={w} d={d} h={h} c={c} />
          <Part p={[-w * 0.15, h + 0.07, 0]} s={[0.36, 0.14, 0.26]} m={mat(DARK, 'matte')} />
          <Part cyl p={[w * 0.22, h + 0.02, 0]} s={[0.05, 0.04, 0.05]} m={mat(GOLD, 'gold')} />
        </>
      )

    case 'deskSim':
      return (
        <>
          <Plinth w={w} d={d} h={h} c={c} />
          <Laptop x={-w * 0.2} z={-d * 0.1} y={h} />
          <BackScreen w={w} h={h} d={d} sw={0.6} sh={0.36} />
        </>
      )

    case 'deskTraining':
      return (
        <>
          <Plinth w={w} d={d} h={h} c={c} />
          <Laptop x={-w * 0.2} z={-d * 0.1} y={h} />
          <BackScreen w={w} h={h} d={d} sw={1.0} sh={0.56} />
        </>
      )

    case 'counter': {
      // Valsem counter: white body, dark end panel and dark top (page 2).
      const end = Math.min(0.18, w * 0.15)
      return (
        <>
          <Part p={[-end / 2, h * 0.8 / 2, 0]} s={[w - end, h * 0.8, d]} m={mat(c)} />
          <Part p={[w / 2 - end / 2, h / 2, 0]} s={[end, h, d]} m={mat('#2a2a2a', 'matte')} />
          <Part p={[-end / 2, h * 0.8 + 0.015, 0]} s={[w - end, 0.03, d]} m={mat('#303030', 'matte')} />
          <Part p={[-end / 2, h * 0.8 - 0.12, 0]} s={[w - end + 0.006, 0.012, d + 0.006]} m={mat(GOLD, 'gold')} />
        </>
      )
    }

    case 'droneStand': {
      // Display A: tall white table with slanted legs, the Voliro drone on top (page 4).
      const top = 0.04
      const legH = h - top
      return (
        <>
          <Part p={[0, h - top / 2, 0]} s={[w, top, d]} m={mat(c)} />
          {[
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1],
          ].map(([sx, sz]) => (
            <Part
              key={`${sx}${sz}`}
              p={[sx * w * 0.3, legH / 2, sz * d * 0.3]}
              s={[0.05, legH, 0.05]}
              r={[sz * 0.08, 0, -sx * 0.08]}
              m={mat(c)}
            />
          ))}
          <Drone y={h + 0.05} />
        </>
      )
    }

    case 'diorama': {
      // City & site mockup: white plinth, dark frame, sand / water map with a skyline.
      const frameH = 0.06
      const bodyH = h - frameH
      const tw = w - 0.08
      const td = d - 0.08
      return (
        <>
          <Part p={[0, bodyH / 2, 0]} s={[w, bodyH, d]} m={mat(c)} />
          <Part p={[0, bodyH + frameH / 2, 0]} s={[w, frameH, d]} m={mat('#2b2b2b', 'matte')} />
          <Part p={[0, h + 0.005, -td * 0.15]} s={[tw, 0.01, td * 0.7]} m={mat('#d8c8a0', 'matte')} />
          <Part p={[0, h + 0.004, td * 0.35]} s={[tw, 0.008, td * 0.3]} m={mat('#2f7fbf', 'lacquer')} />
          {TOWERS.map(([fx, fz, th], i) => (
            <Part key={i} p={[fx * tw, h + th / 2, fz * td]} s={[0.05, th, 0.05]} m={mat('#8fa3b8', 'metal')} />
          ))}
        </>
      )
    }

    case 'tvStand': {
      // Interactive AI platform: large TV on a floor stand, screen facing +z (page 4).
      const sw = w
      const sh = Math.min(sw * 0.5625, h * 0.45)
      const poleH = h - sh
      return (
        <>
          <Part p={[0, 0.02, 0]} s={[w * 0.6, 0.04, Math.max(0.3, d * 0.8)]} m={mat(DARK, 'matte')} />
          <Part p={[0, poleH / 2, 0]} s={[0.1, poleH, 0.06]} m={mat(DARK, 'matte')} />
          <Part p={[0, poleH + sh / 2, 0]} s={[sw, sh, 0.05]} m={mat(DARK, 'matte')} />
          <Part p={[0, poleH + sh / 2, 0.026]} s={[sw - 0.04, sh - 0.04, 0.002]} m={mat(SCREEN_BLUE, 'screen')} />
        </>
      )
    }

    case 'chair': {
      // White curved armchair (page 4): seat, back at -z, arms, slim legs.
      const seatY = Math.min(0.45, h * 0.55)
      const leg = seatY - 0.06
      return (
        <>
          <Part p={[0, seatY, 0.02]} s={[w * 0.9, 0.1, d * 0.85]} m={mat(c, 'matte')} />
          <Part p={[0, (seatY + h) / 2, -d * 0.4]} s={[w * 0.9, h - seatY, 0.08]} r={[-0.12, 0, 0]} m={mat(c, 'matte')} />
          {[-1, 1].map((sx) => (
            <Part key={sx} p={[sx * w * 0.42, seatY + 0.12, -d * 0.05]} s={[0.06, 0.14, d * 0.65]} m={mat(c, 'matte')} />
          ))}
          {[
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1],
          ].map(([sx, sz]) => (
            <Part key={`${sx}${sz}`} cyl p={[sx * w * 0.35, leg / 2, sz * d * 0.33]} s={[0.035, leg, 0.035]} m={mat(c)} />
          ))}
        </>
      )
    }

    case 'stool': {
      // Bar stool: white seat, chrome pole, foot ring and base disc (page 3).
      const seat = 0.05
      return (
        <>
          <Part p={[0, h - seat / 2, 0]} s={[w, seat, d * 0.85]} m={mat(c)} />
          <Part cyl p={[0, (h - seat) / 2, 0]} s={[0.05, h - seat, 0.05]} m={mat(CHROME, 'metal')} />
          <Part ring p={[0, h * 0.38, 0]} s={[0.26, 0.26, 0.26]} r={[Math.PI / 2, 0, 0]} m={mat(CHROME, 'metal')} />
          <Part cyl p={[0, 0.01, 0]} s={[w * 0.9, 0.02, w * 0.9]} m={mat(CHROME, 'metal')} />
        </>
      )
    }

    case 'plant': {
      // Potted plant: dark pot, soil, rounded foliage.
      const potH = Math.min(0.45, h * 0.35)
      const leaf = h - potH
      return (
        <>
          <Part cyl p={[0, potH / 2, 0]} s={[w * 0.6, potH, d * 0.6]} m={mat('#374151', 'matte')} />
          <Part cyl p={[0, potH - 0.02, 0]} s={[w * 0.55, 0.02, d * 0.55]} m={mat('#3f2a1d', 'matte')} />
          <mesh position={[0, potH + leaf * 0.5, 0]} scale={[w, leaf, d]} material={mat(c || '#2f7d32', 'matte')} raycast={noRaycast}>
            <sphereGeometry args={[0.5, 14, 10]} />
          </mesh>
        </>
      )
    }

    case 'rollup': {
      // Roll-up banner: flat base cassette, pole, printed panel (front = +z).
      return (
        <>
          <Part p={[0, 0.05, 0]} s={[w, 0.1, Math.max(0.2, d)]} m={mat('#9ca3af', 'metal')} />
          <Part p={[0, h / 2, -0.02]} s={[0.025, h, 0.025]} m={mat('#9ca3af', 'metal')} />
          <Part p={[0, 0.1 + (h - 0.1) / 2, 0.01]} s={[w * 0.96, h - 0.1, 0.01]} m={mat(c)} />
          <Part p={[0, h * 0.72, 0.017]} s={[w * 0.8, h * 0.18, 0.002]} m={mat(GOLD, 'gold')} />
        </>
      )
    }

    case 'ledWall': {
      // LED video wall: dark frame with a glowing screen facing +z, on two feet.
      const foot = Math.min(0.3, h * 0.12)
      return (
        <>
          {[-1, 1].map((sx) => (
            <Part key={sx} p={[sx * w * 0.35, foot / 2, 0]} s={[0.12, foot, Math.max(0.4, d * 3)]} m={mat(DARK, 'matte')} />
          ))}
          <Part p={[0, foot + (h - foot) / 2, 0]} s={[w, h - foot, Math.max(0.05, d)]} m={mat(DARK, 'matte')} />
          <Part p={[0, foot + (h - foot) / 2, Math.max(0.05, d) / 2 + 0.002]} s={[w - 0.06, h - foot - 0.06, 0.002]} m={mat(SCREEN_BLUE, 'screen')} />
        </>
      )
    }

    case 'highTable': {
      // Cocktail (standing) table: round top, slim chrome column, round base.
      const top = 0.03
      return (
        <>
          <Part cyl p={[0, h - top / 2, 0]} s={[w, top, d]} m={mat(c)} />
          <Part cyl p={[0, (h - top) / 2, 0]} s={[0.07, h - top, 0.07]} m={mat(CHROME, 'metal')} />
          <Part cyl p={[0, 0.01, 0]} s={[w * 0.7, 0.02, d * 0.7]} m={mat(CHROME, 'metal')} />
        </>
      )
    }

    case 'roundTable': {
      const top = 0.03
      return (
        <>
          <Part cyl p={[0, h - top / 2, 0]} s={[w, top, d]} m={mat(c)} />
          <Part cyl p={[0, (h - top) / 2, 0]} s={[0.1, h - top, 0.1]} m={mat(c)} />
          <Part cyl p={[0, 0.01, 0]} s={[w * 0.5, 0.02, d * 0.5]} m={mat(c)} />
        </>
      )
    }
  }
}
