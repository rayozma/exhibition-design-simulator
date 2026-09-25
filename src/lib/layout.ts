import raw from '../data/layouts.json'

/** Shared geometry types and helpers. The ADIPEC data in layouts.json is only a template (see design.ts). */

export type Rect = { x: number; z: number; w: number; d: number }

export type Zone = Rect & {
  id: string
  name: string
  color: string
  h: number
  walkable?: boolean
  note?: string
}

export type Wall = { id: string; x1: number; z1: number; x2: number; z2: number }

/** Where crowd agents enter/leave. Entrances sharing an `aisle` are the two ends of one corridor. */
export type Entrance = { id: string; aisle?: string; x1: number; z1: number; x2: number; z2: number }

/** Your booth within a design: footprint rectangles, platform and walls. */
export type LayoutOption = {
  label: string
  removeZones: string[]
  footprint: Rect[]
  platformH: number
  walls: Wall[]
  wallH: number
  wallT: number
  note?: string
}

/** Geometric shape of an object without a built-in model or upload. */
export type ShapeKind = 'box' | 'cylinder' | 'sphere' | 'cone' | 'wedge' | 'panel' | 'sign'

export type SeedObject = {
  id: string
  num?: number
  name: string
  category: string
  shape?: ShapeKind
  /** Text on a sign (shape "sign"). */
  text?: string
  /** Built-in model to draw (e.g. "chair"); unset = decided from name / category. */
  kind?: string
  x: number
  z: number
  w: number
  d: number
  h: number
  rotY: number
  material?: string
  /** Display color (hex). Unset = default for the material / category. */
  color?: string
  attraction?: boolean
  note?: string
}

export type Theme = {
  floor: string
  hall: string
  boothFloor: string
  wall: string
  ledEdge: string
  accent: string
}

/** Look of the whole Al Masaood pavilion, for the "Pavilion" view toggle (visual only). */
export type PavilionSpec = {
  name: string
  note?: string
  rect: Rect
  cornerRadius: number
  deck: Rect & { y: number; thickness: number; radius: number; columnsEvery: number }
  portals: { x: number; z1: number; z2: number; h: number }[]
  colors: { hull: string; accent: string; led: string; underside: string; shell: string; carpet: string; glass: string }
}

export type LayoutsFile = {
  meta: { title: string; event: string; units: string; coords: string; sources: string[] }
  hall: { w: number; d: number; note?: string }
  theme: Theme
  entrances: Entrance[]
  pavilion: PavilionSpec
  crowdPresets: { empty: number; low: number; high: number; unit: string; note: string }
  zones: Zone[]
  options: Record<'A' | 'B', LayoutOption>
  objects: SeedObject[]
}

export const layouts = raw as unknown as LayoutsFile
export const theme = layouts.theme

export const DEG = Math.PI / 180

/** True if point (x, z) lies inside any of the rects (edges inclusive). */
export function inRects(rects: Rect[], x: number, z: number): boolean {
  return rects.some((r) => x >= r.x && x <= r.x + r.w && z >= r.z && z <= r.z + r.d)
}

/**
 * Outline of the union of axis-aligned rects, as [x1, z1, x2, z2] segments.
 * Each rect edge is split at every rect breakpoint; a piece is kept only if
 * exactly one side of it is inside the union (so shared inner edges vanish).
 */
export function outlineSegments(rects: Rect[]): [number, number, number, number][] {
  const eps = 1e-4
  const inside = (x: number, z: number) =>
    rects.some((r) => x > r.x && x < r.x + r.w && z > r.z && z < r.z + r.d)
  const xs = [...new Set(rects.flatMap((r) => [r.x, r.x + r.w]))].sort((a, b) => a - b)
  const zs = [...new Set(rects.flatMap((r) => [r.z, r.z + r.d]))].sort((a, b) => a - b)
  const segs: [number, number, number, number][] = []

  for (const r of rects) {
    const x0 = r.x, x1 = r.x + r.w, z0 = r.z, z1 = r.z + r.d
    const xCuts = [x0, ...xs.filter((v) => v > x0 && v < x1), x1]
    const zCuts = [z0, ...zs.filter((v) => v > z0 && v < z1), z1]
    for (const z of [z0, z1]) {
      for (let i = 0; i < xCuts.length - 1; i++) {
        const m = (xCuts[i] + xCuts[i + 1]) / 2
        if (inside(m, z - eps) !== inside(m, z + eps)) segs.push([xCuts[i], z, xCuts[i + 1], z])
      }
    }
    for (const x of [x0, x1]) {
      for (let i = 0; i < zCuts.length - 1; i++) {
        const m = (zCuts[i] + zCuts[i + 1]) / 2
        if (inside(x - eps, m) !== inside(x + eps, m)) segs.push([x, zCuts[i], x, zCuts[i + 1]])
      }
    }
  }
  return segs
}

/** Black or white text, whichever reads better on the given hex color. */
export function textColorOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#111111' : '#ffffff'
}
