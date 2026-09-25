import { useMemo } from 'react'
import { Line, Text } from '@react-three/drei'
import { ExtrudeGeometry, MeshStandardMaterial, Path, Shape } from 'three'
import { walkableRects } from '../lib/design'
import { useDesign } from '../lib/DesignContext'
import { inRects, type PavilionSpec, type Rect, type Zone } from '../lib/layout'

/**
 * Visual-only approximation of the Al Masaood Energy pavilion (from event photos): a ship-like
 * structure with rounded ends and an upper deck, white booth shells for the neighbouring
 * exhibitors, portal arches over the walkway entrances and a blue LED "waterline".
 * Nothing here is selectable or affects the crowd.
 */

type Colors = PavilionSpec['colors']
const noRaycast = () => {}

/** Rounded rectangle in the x/z plane (Shape x = world x, Shape y = world z), grown by `grow` m. */
function roundedRect(r: Rect, radius: number, grow = 0): Shape {
  const x0 = r.x - grow
  const z0 = r.z - grow
  const x1 = r.x + r.w + grow
  const z1 = r.z + r.d + grow
  const k = Math.max(0.01, Math.min(radius + grow, (x1 - x0) / 2, (z1 - z0) / 2))
  const s = new Shape()
  s.moveTo(x0 + k, z0)
  s.lineTo(x1 - k, z0)
  s.quadraticCurveTo(x1, z0, x1, z0 + k)
  s.lineTo(x1, z1 - k)
  s.quadraticCurveTo(x1, z1, x1 - k, z1)
  s.lineTo(x0 + k, z1)
  s.quadraticCurveTo(x0, z1, x0, z1 - k)
  s.lineTo(x0, z0 + k)
  s.quadraticCurveTo(x0, z0, x0 + k, z0)
  return s
}

/** Extrude a plan shape upward: occupies y from `y` to `y + h`. */
function slab(shape: Shape, h: number, y: number) {
  const g = new ExtrudeGeometry(shape, { depth: h, bevelEnabled: false, curveSegments: 10 })
  g.rotateX(Math.PI / 2) // extrusion now points down, shape y -> world z
  g.translate(0, y + h, 0)
  return g
}

const outline = (shape: Shape, y: number): [number, number, number][] =>
  shape.getPoints(10).map((p) => [p.x, y, p.y])

const mat = (color: string, extra: ConstructorParameters<typeof MeshStandardMaterial>[0] = {}) =>
  new MeshStandardMaterial({ color, roughness: 0.4, ...extra })

function Deck({ P }: { P: PavilionSpec }) {
  const C = P.colors
  const d = P.deck
  const parts = useMemo(() => {
    const top = d.y + d.thickness
    const railOuter = roundedRect(d, d.radius, -0.05)
    railOuter.holes.push(roundedRect(d, d.radius, -0.11) as unknown as Path)
    return {
      body: slab(roundedRect(d, d.radius), d.thickness, d.y),
      stripe: slab(roundedRect(d, d.radius, 0.02), 0.07, d.y + d.thickness * 0.3),
      under: slab(roundedRect(d, d.radius, -0.01), 0.02, d.y - 0.02),
      rail: slab(railOuter, 1.0, top),
      led: outline(roundedRect(d, d.radius, -0.08), d.y - 0.03),
      mats: {
        caps: mat('#e5e7eb'),
        sides: mat(C.hull, { roughness: 0.25 }),
        accent: mat(C.accent, { metalness: 0.2 }),
        under: mat(C.underside),
        glass: mat(C.glass, { transparent: true, opacity: 0.28, depthWrite: false, roughness: 0.05 }),
        column: mat(C.hull, { roughness: 0.3 }),
      },
    }
  }, [d, C])

  const columns = useMemo(() => {
    const xs: number[] = []
    for (let x = d.x + 2; x <= d.x + d.w - 2 + 1e-6; x += d.columnsEvery) xs.push(x)
    return xs
  }, [d])

  return (
    <group>
      <mesh geometry={parts.body} material={[parts.mats.caps, parts.mats.sides]} raycast={noRaycast} />
      <mesh geometry={parts.stripe} material={parts.mats.accent} raycast={noRaycast} />
      <mesh geometry={parts.under} material={parts.mats.under} raycast={noRaycast} />
      <mesh geometry={parts.rail} material={parts.mats.glass} raycast={noRaycast} />
      <Line points={parts.led} color={C.led} lineWidth={2.5} raycast={noRaycast} />
      {columns.map((x) => (
        <mesh key={x} position={[x, d.y / 2, d.z + d.d - 0.45]} material={parts.mats.column} raycast={noRaycast}>
          <cylinderGeometry args={[0.15, 0.15, d.y, 16]} />
        </mesh>
      ))}
      <Text
        position={[d.x + d.w / 2, d.y + d.thickness * 0.62, d.z + d.d + 0.03]}
        fontSize={0.26}
        letterSpacing={0.15}
        color={C.underside}
        anchorX="center"
        anchorY="middle"
        raycast={noRaycast}
      >
        {P.name}
      </Text>
    </group>
  )
}

/** White arch over a walkway entrance, with LED trim on the inside. */
function Portal({ x, z1, z2, h, C }: PavilionSpec['portals'][number] & { C: Colors }) {
  const t = 0.3
  const m = useMemo(() => mat(C.hull, { roughness: 0.25 }), [C.hull])
  const led: [number, number, number][] = [
    [x, 0.05, z1 + t / 2 + 0.01],
    [x, h - 0.51, z1 + t / 2 + 0.01],
    [x, h - 0.51, z2 - t / 2 - 0.01],
    [x, 0.05, z2 - t / 2 - 0.01],
  ]
  return (
    <group>
      <mesh position={[x, h / 2, z1]} material={m} raycast={noRaycast}>
        <boxGeometry args={[t, h, t]} />
      </mesh>
      <mesh position={[x, h / 2, z2]} material={m} raycast={noRaycast}>
        <boxGeometry args={[t, h, t]} />
      </mesh>
      <mesh position={[x, h - 0.25, (z1 + z2) / 2]} material={m} raycast={noRaycast}>
        <boxGeometry args={[t, 0.5, z2 - z1 + t]} />
      </mesh>
      <Line points={led} color={C.led} lineWidth={2.5} raycast={noRaycast} />
    </group>
  )
}

type Wall = { x: number; z: number; w: number; d: number; h: number; accent: string; ax: number; az: number; aw: number; ad: number; by: number }

const THICK = 0.08
const STEP = 0.5 // walls are decided per 0.5 m of each side

/**
 * White shell walls for a neighbour booth: a wall on every stretch of its sides that does not face
 * walkable floor (walkway, aisle, NDT booth). Walls sit just inside the zone so neighbours don't clash.
 * Each wall has a thin band in the exhibitor's color near the top, on the inside.
 */
function shellWalls(zone: Zone, walk: Rect[]): Wall[] {
  const walls: Wall[] = []
  const { x, z, w, d, h } = zone
  const open = (px: number, pz: number) => inRects(walk, px, pz)
  const band = Math.max(0.12, h * 0.05)
  const by = h - band / 2 - 0.08
  // [along x?, fixed coordinate, outward test offset, inward sign]
  const sides: [boolean, number, number, number][] = [
    [true, z, -0.1, 1], // north
    [true, z + d, 0.1, -1], // south
    [false, x, -0.1, 1], // west
    [false, x + w, 0.1, -1], // east
  ]
  for (const [alongX, fixed, out, inward] of sides) {
    const len = alongX ? w : d
    const start = alongX ? x : z
    const n = Math.max(1, Math.round(len / STEP))
    const seg = len / n
    let runStart = -1
    const flush = (end: number) => {
      if (runStart < 0) return
      const a = start + runStart * seg
      const b = start + end * seg
      const mid = (a + b) / 2
      const c = fixed + (inward * THICK) / 2
      const ac = fixed + inward * (THICK + 0.012)
      if (alongX) walls.push({ x: mid, z: c, w: b - a, d: THICK, h, accent: zone.color, ax: mid, az: ac, aw: b - a, ad: 0.02, by })
      else walls.push({ x: c, z: mid, w: THICK, d: b - a, h, accent: zone.color, ax: ac, az: mid, aw: 0.02, ad: b - a, by })
      runStart = -1
    }
    for (let i = 0; i < n; i++) {
      const m = start + (i + 0.5) * seg
      const isOpen = alongX ? open(m, fixed + out) : open(fixed + out, m)
      if (!isOpen && runStart < 0) runStart = i
      if (isOpen) flush(i)
    }
    flush(n)
  }
  return walls
}

function Shells({ C }: { C: Colors }) {
  const design = useDesign()
  const walls = useMemo(() => {
    const walk = walkableRects(design)
    return design.zones
      .filter((z) => !z.walkable && z.h > 0)
      .flatMap((z) => shellWalls(z, walk))
  }, [design])
  const shell = useMemo(() => mat(C.shell, { roughness: 0.5 }), [C.shell])
  const accents = useMemo(() => new Map<string, MeshStandardMaterial>(), [])
  const accentMat = (c: string) => {
    let m = accents.get(c)
    if (!m) accents.set(c, (m = mat(c, { roughness: 0.3 })))
    return m
  }
  return (
    <group>
      {walls.map((wl, i) => (
        <group key={i}>
          <mesh position={[wl.x, wl.h / 2, wl.z]} material={shell} raycast={noRaycast}>
            <boxGeometry args={[wl.w, wl.h, wl.d]} />
          </mesh>
          <mesh position={[wl.ax, wl.by, wl.az]} material={accentMat(wl.accent)} raycast={noRaycast}>
            <boxGeometry args={[wl.aw, Math.max(0.12, wl.h * 0.05), wl.ad]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function Pavilion({ spec: P }: { spec: PavilionSpec }) {
  const C = P.colors
  const waterline = useMemo(() => outline(roundedRect(P.rect, P.cornerRadius, -0.05), 0.03), [P])
  return (
    <group>
      <Shells C={C} />
      <Deck P={P} />
      {P.portals.map((p, i) => (
        <Portal key={i} {...p} C={C} />
      ))}
      <Line points={waterline} color={C.led} lineWidth={3} raycast={noRaycast} />
    </group>
  )
}
