import { DEG, inRects, layouts, type LayoutOption, type Rect, type Wall } from './layout'

/** Anything with a rotated w × d footprint centered at (x, z). */
export type Footprint = { x: number; z: number; w: number; d: number; rotY: number }

/** Snap step for dragging: 0.25 m, so centers land on grid lines or cell centers. */
export const SNAP_STEP = 0.25
/** Overlaps smaller than this (m) are treated as touching, not overlapping. */
const TOLERANCE = 0.01

export const snapTo = (v: number, step = SNAP_STEP) => Math.round(v / step) * step

/** Normalize degrees to [-180, 180). */
export const normDeg = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180

/** Half extents of the axis-aligned box around the rotated footprint. */
export function halfExtents(f: Footprint) {
  const c = Math.abs(Math.cos(f.rotY * DEG))
  const s = Math.abs(Math.sin(f.rotY * DEG))
  return { hx: (c * f.w + s * f.d) / 2, hz: (s * f.w + c * f.d) / 2 }
}

const clamp = (v: number, lo: number, hi: number) => (lo > hi ? (lo + hi) / 2 : Math.min(hi, Math.max(lo, v)))

/** Move the footprint's center so the whole footprint stays inside the hall. */
export function clampToHall<T extends Footprint>(f: T): T {
  const { hx, hz } = halfExtents(f)
  const { w, d } = layouts.hall
  return { ...f, x: clamp(f.x, hx, w - hx), z: clamp(f.z, hz, d - hz) }
}

/** Oriented rectangle: center, half sizes, rotation (radians, same sense as three.js rotation.y). */
type OBB = { cx: number; cz: number; hw: number; hd: number; a: number }

const obbOf = (f: Footprint): OBB => ({ cx: f.x, cz: f.z, hw: f.w / 2, hd: f.d / 2, a: f.rotY * DEG })

/** A wall as a footprint: length + t (walls are extended by t, as rendered) by t thick. */
export function wallFootprint(wall: Wall, t: number): Footprint {
  const dx = wall.x2 - wall.x1
  const dz = wall.z2 - wall.z1
  return {
    x: (wall.x1 + wall.x2) / 2,
    z: (wall.z1 + wall.z2) / 2,
    w: Math.hypot(dx, dz) + t,
    d: t,
    rotY: -Math.atan2(dz, dx) / DEG,
  }
}

const obbOfWall = (wall: Wall, t: number): OBB => obbOf(wallFootprint(wall, t))

/** Signed distance (m) from point (x, z) to the rotated footprint: negative inside. */
export function distToFootprint(f: Footprint, x: number, z: number): number {
  const a = f.rotY * DEG
  const c = Math.cos(a)
  const s = Math.sin(a)
  const dx = x - f.x
  const dz = z - f.z
  // world -> local (inverse of three.js rotation.y)
  const qu = Math.abs(dx * c - dz * s) - f.w / 2
  const qv = Math.abs(dx * s + dz * c) - f.d / 2
  return Math.hypot(Math.max(qu, 0), Math.max(qv, 0)) + Math.min(Math.max(qu, qv), 0)
}

/** World-space local axes. three.js rotation.y by a maps local x to (cos a, -sin a). */
const axesOf = (b: OBB) => [
  [Math.cos(b.a), -Math.sin(b.a)],
  [Math.sin(b.a), Math.cos(b.a)],
]

/** Separating-axis test for two oriented rectangles. */
function obbOverlap(p: OBB, q: OBB): boolean {
  const ap = axesOf(p)
  const aq = axesOf(q)
  const dx = q.cx - p.cx
  const dz = q.cz - p.cz
  for (const [ax, az] of [...ap, ...aq]) {
    const rp = p.hw * Math.abs(ap[0][0] * ax + ap[0][1] * az) + p.hd * Math.abs(ap[1][0] * ax + ap[1][1] * az)
    const rq = q.hw * Math.abs(aq[0][0] * ax + aq[0][1] * az) + q.hd * Math.abs(aq[1][0] * ax + aq[1][1] * az)
    if (Math.abs(dx * ax + dz * az) >= rp + rq - TOLERANCE) return false
  }
  return true
}

/** True if the whole rotated footprint lies inside the rects (sampled on a 5×5 grid). */
export function insideRects(f: Footprint, rects: Rect[]): boolean {
  const b = obbOf(f)
  const [[ux, uz], [vx, vz]] = axesOf(b)
  const inset = 0.005
  for (let i = 0; i <= 4; i++) {
    for (let j = 0; j <= 4; j++) {
      const u = (i / 2 - 1) * (b.hw - inset)
      const v = (j / 2 - 1) * (b.hd - inset)
      if (!inRects(rects, b.cx + u * ux + v * vx, b.cz + u * uz + v * vz)) return false
    }
  }
  return true
}

export type Status = 'ok' | 'outside' | 'overlap'

type Named = Footprint & { id: string; name: string; category: string }

const isSeat = (o: Named) => /chair|stool/i.test(o.name)
const isTable = (o: Named) => o.category === 'furniture' && /table/i.test(o.name)
/** Chairs and stools tucked under a table overlap it on plan by design, so that isn't a clash. */
const tuckedIn = (a: Named, b: Named) => (isSeat(a) && isTable(b)) || (isSeat(b) && isTable(a))

/** Per object: 'overlap' (hits another object or a wall) beats 'outside' (leaves the NDT footprint). */
export function computeStatuses(objs: Named[], option: LayoutOption): Map<string, Status> {
  const boxes = objs.map(obbOf)
  const walls = option.walls.map((w) => obbOfWall(w, option.wallT))
  const result = new Map<string, Status>()
  objs.forEach((o, i) => {
    const hit =
      boxes.some((b, j) => j !== i && !tuckedIn(o, objs[j]) && obbOverlap(boxes[i], b)) ||
      walls.some((w) => obbOverlap(boxes[i], w))
    result.set(o.id, hit ? 'overlap' : insideRects(o, option.ndtFootprint) ? 'ok' : 'outside')
  })
  return result
}
