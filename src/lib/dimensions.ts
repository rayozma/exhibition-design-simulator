import type { Design } from './design'
import type { EditorObject } from './editor'
import { halfExtents, wallFootprint, type Footprint } from './geometry'
import { corners as rectCorners, type Pt } from './layoutEdit'
import { DEG } from './layout'

/** Clearances further than this (m) aren't shown. */
export const MAX_CLEARANCE = 6

type Box = { minX: number; maxX: number; minZ: number; maxZ: number }
const boxOf = (f: Footprint): Box => {
  const { hx, hz } = halfExtents(f)
  return { minX: f.x - hx, maxX: f.x + hx, minZ: f.z - hz, maxZ: f.z + hz }
}

export type Clearance = { from: Pt; to: Pt; gap: number }

/**
 * Free space from an object to the nearest other object, wall or booth edge, in the four compass
 * directions (using the axis-aligned box around each footprint). Only gaps up to MAX_CLEARANCE.
 */
export function clearances(obj: EditorObject, objects: EditorObject[], design: Design): Clearance[] {
  const me = boxOf(obj)
  const others: Box[] = [
    ...objects.filter((o) => o.id !== obj.id).map(boxOf),
    ...design.booth.walls.map((w) => boxOf(wallFootprint(w, design.booth.wallT))),
  ]
  // The booth area the object stands in: its edges count as limits too.
  const area = design.booth.footprint.find((r) => obj.x >= r.x && obj.x <= r.x + r.w && obj.z >= r.z && obj.z <= r.z + r.d)
  const out: Clearance[] = []

  // along x (east / west): other boxes whose z-range overlaps ours
  for (const dir of [1, -1] as const) {
    const edge = dir > 0 ? me.maxX : me.minX
    let best = Infinity
    let lineZ = obj.z
    for (const b of others) {
      const lo = Math.max(me.minZ, b.minZ)
      const hi = Math.min(me.maxZ, b.maxZ)
      if (hi - lo <= 0.001) continue
      const gap = dir > 0 ? b.minX - edge : edge - b.maxX
      if (gap >= -0.001 && gap < best) {
        best = gap
        lineZ = (lo + hi) / 2
      }
    }
    if (area) {
      const gap = dir > 0 ? area.x + area.w - edge : edge - area.x
      if (gap >= -0.001 && gap < best) {
        best = gap
        lineZ = obj.z
      }
    }
    if (best > 0.005 && best <= MAX_CLEARANCE) out.push({ from: { x: edge, z: lineZ }, to: { x: edge + dir * best, z: lineZ }, gap: best })
  }

  // along z (south / north)
  for (const dir of [1, -1] as const) {
    const edge = dir > 0 ? me.maxZ : me.minZ
    let best = Infinity
    let lineX = obj.x
    for (const b of others) {
      const lo = Math.max(me.minX, b.minX)
      const hi = Math.min(me.maxX, b.maxX)
      if (hi - lo <= 0.001) continue
      const gap = dir > 0 ? b.minZ - edge : edge - b.maxZ
      if (gap >= -0.001 && gap < best) {
        best = gap
        lineX = (lo + hi) / 2
      }
    }
    if (area) {
      const gap = dir > 0 ? area.z + area.d - edge : edge - area.z
      if (gap >= -0.001 && gap < best) {
        best = gap
        lineX = obj.x
      }
    }
    if (best > 0.005 && best <= MAX_CLEARANCE) out.push({ from: { x: lineX, z: edge }, to: { x: lineX, z: edge + dir * best }, gap: best })
  }
  return out
}

/** Corners of a rotated footprint, in world coordinates. */
export function footprintCorners(f: Footprint): Pt[] {
  const a = f.rotY * DEG
  const c = Math.cos(a)
  const s = Math.sin(a)
  return [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ].map(([su, sv]) => {
    const u = (su * f.w) / 2
    const v = (sv * f.d) / 2
    return { x: f.x + u * c + v * s, z: f.z - u * s + v * c }
  })
}

/** Points the measure tool snaps to: object corners and centers, wall ends, booth / zone / hall corners. */
export function snapPoints(objects: EditorObject[], design: Design): Pt[] {
  return [
    ...objects.flatMap((o) => [...footprintCorners(o), { x: o.x, z: o.z }]),
    ...design.booth.walls.flatMap((w) => [
      { x: w.x1, z: w.z1 },
      { x: w.x2, z: w.z2 },
    ]),
    ...design.booth.footprint.flatMap(rectCorners),
    ...design.zones.flatMap(rectCorners),
    ...rectCorners({ x: 0, z: 0, w: design.hall.w, d: design.hall.d }),
  ]
}

/** The nearest snap point within `radius`, else the point itself rounded to 1 cm. */
export function snapToPoints(p: Pt, points: Pt[], radius = 0.2): Pt {
  let best: Pt | null = null
  let bestD = radius
  for (const q of points) {
    const d = Math.hypot(q.x - p.x, q.z - p.z)
    if (d <= bestD) {
      bestD = d
      best = q
    }
  }
  return best ?? { x: Math.round(p.x * 100) / 100, z: Math.round(p.z * 100) / 100 }
}
