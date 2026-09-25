import type { EditorObject } from '../lib/editor'
import { wallFootprint, type Footprint } from '../lib/geometry'
import { activeZones, DEG, inRects, layouts, type Entrance, type LayoutId, type Rect } from '../lib/layout'

export const CELL = 0.25 // m
export const AGENT_RADIUS = 0.2 // obstacles are inflated by this for walking
const GOAL_RING = 0.8 // an attraction is "visited" from within this distance of its footprint
const ENTRANCE_REACH = 0.35 // cells this close to an entrance segment count as that entrance
export const MIN_CLEARANCE = 1.2 // passages narrower than this are flagged
const SQRT2 = Math.SQRT2

/** Walking distance (m) from every cell to the nearest source cell, plus the next cell to step to. */
export type FlowField = { dist: Float64Array; next: Int32Array; sources: number[] }

export type NavGrid = {
  cols: number
  rows: number
  /** 1 = an agent can stand here (walkable, and clear of obstacles by AGENT_RADIUS). */
  free: Uint8Array
  freeCells: number[]
  /** For every cell, the closest free cell (to rescue agents that end up inside an obstacle). */
  nearestFree: Int32Array
  /** 1 = walkable cell in a passage narrower than MIN_CLEARANCE. */
  narrow: Uint8Array
  narrowArea: number
  /** Walkable area (m²): walkable zones + NDT footprint, before obstacles. */
  walkableArea: number
  footprint: Rect[]
  platformH: number
  attractions: { id: string; field: FlowField }[]
  entrances: { id: string; aisle?: string; field: FlowField }[]
}

export const cellOf = (nav: NavGrid, x: number, z: number) => {
  const i = Math.floor(x / CELL)
  const j = Math.floor(z / CELL)
  return i < 0 || j < 0 || i >= nav.cols || j >= nav.rows ? -1 : j * nav.cols + i
}
export const cellX = (nav: NavGrid, c: number) => ((c % nav.cols) + 0.5) * CELL
export const cellZ = (nav: NavGrid, c: number) => (Math.floor(c / nav.cols) + 0.5) * CELL

/** A footprint with its rotation precomputed, for fast signed-distance queries. */
type Shape = { x: number; z: number; c: number; s: number; hw: number; hd: number; reach: number }

const shapeOf = (f: Footprint): Shape => ({
  x: f.x,
  z: f.z,
  c: Math.cos(f.rotY * DEG),
  s: Math.sin(f.rotY * DEG),
  hw: f.w / 2,
  hd: f.d / 2,
  reach: Math.hypot(f.w, f.d) / 2,
})

/** Signed distance from (x, z) to the shape (negative inside). Same math as geometry.distToFootprint. */
function sdf(o: Shape, x: number, z: number) {
  const dx = x - o.x
  const dz = z - o.z
  const qu = Math.abs(dx * o.c - dz * o.s) - o.hw
  const qv = Math.abs(dx * o.s + dz * o.c) - o.hd
  return Math.hypot(Math.max(qu, 0), Math.max(qv, 0)) + Math.min(Math.max(qu, qv), 0)
}

// 8 neighbors; the last 4 are diagonals.
const DI = [1, -1, 0, 0, 1, 1, -1, -1]
const DJ = [0, 0, 1, -1, 1, -1, 1, -1]
const COST = [1, 1, 1, 1, SQRT2, SQRT2, SQRT2, SQRT2].map((k) => k * CELL)

/**
 * Dijkstra from the source cells over free cells. `next` is each cell's parent in the
 * shortest-path tree, i.e. the neighbor to step to. Diagonals may not cut corners.
 */
function flowField(cols: number, rows: number, free: Uint8Array, sources: number[]): FlowField {
  const n = cols * rows
  // Float64 on purpose: Float32 rounding made "d > dist[c]" skip cells that were never expanded.
  const dist = new Float64Array(n).fill(Infinity)
  const next = new Int32Array(n).fill(-1)
  // Binary heap in typed arrays (each cell is pushed at most once per improvement; 8n is plenty).
  const hc = new Int32Array(8 * n + sources.length)
  const hp = new Float64Array(8 * n + sources.length)
  let size = 0
  const push = (cell: number, prio: number) => {
    let i = size++
    while (i > 0) {
      const up = (i - 1) >> 1
      if (hp[up] <= prio) break
      hc[i] = hc[up]
      hp[i] = hp[up]
      i = up
    }
    hc[i] = cell
    hp[i] = prio
  }
  for (const s of sources) {
    dist[s] = 0
    push(s, 0)
  }
  while (size) {
    const c = hc[0]
    const d = hp[0]
    // pop: move the last item down from the root
    const lc = hc[--size]
    const lp = hp[size]
    let i = 0
    for (;;) {
      let m = 2 * i + 1
      if (m >= size) break
      if (m + 1 < size && hp[m + 1] < hp[m]) m++
      if (hp[m] >= lp) break
      hc[i] = hc[m]
      hp[i] = hp[m]
      i = m
    }
    hc[i] = lc
    hp[i] = lp

    if (d > dist[c]) continue
    const ci = c % cols
    const cj = (c - ci) / cols
    for (let k = 0; k < 8; k++) {
      const ni = ci + DI[k]
      const nj = cj + DJ[k]
      if (ni < 0 || nj < 0 || ni >= cols || nj >= rows) continue
      const nb = nj * cols + ni
      if (!free[nb]) continue
      if (k >= 4 && (!free[cj * cols + ni] || !free[nj * cols + ci])) continue
      const nd = d + COST[k]
      if (nd < dist[nb]) {
        dist[nb] = nd
        next[nb] = c
        push(nb, nd)
      }
    }
  }
  return { dist, next, sources }
}

function distToSegment(e: Entrance, x: number, z: number) {
  const dx = e.x2 - e.x1
  const dz = e.z2 - e.z1
  const t = Math.max(0, Math.min(1, ((x - e.x1) * dx + (z - e.z1) * dz) / (dx * dx + dz * dz || 1)))
  return Math.hypot(x - (e.x1 + t * dx), z - (e.z1 + t * dz))
}

/** For each open cell, how many open cells in a row end at it coming from direction -(di, dj). */
function runs(cols: number, rows: number, open: Uint8Array, di: number, dj: number): Int32Array {
  const out = new Int32Array(cols * rows)
  for (let jj = 0; jj < rows; jj++) {
    const j = dj < 0 ? rows - 1 - jj : jj
    for (let ii = 0; ii < cols; ii++) {
      const i = di < 0 ? cols - 1 - ii : ii
      const c = j * cols + i
      if (!open[c]) continue
      const pi = i - di
      const pj = j - dj
      out[c] = 1 + (pi >= 0 && pj >= 0 && pi < cols && pj < rows ? out[pj * cols + pi] : 0)
    }
  }
  return out
}

/** Walkable = walkable zones (walkway, open gap) + the NDT footprint. */
const walkableRects = (layoutId: LayoutId): Rect[] => [
  ...activeZones(layoutId).filter((z) => z.walkable),
  ...layouts.options[layoutId].ndtFootprint,
]

/** Walkable area in m² (before subtracting objects); the base for "people per m²". */
export const walkableArea = (layoutId: LayoutId) => walkableRects(layoutId).reduce((s, r) => s + r.w * r.d, 0)

/** Rasterize the walkable area for a layout option and precompute routes to every attraction and entrance. */
export function buildNav(layoutId: LayoutId, objects: EditorObject[]): NavGrid {
  const opt = layouts.options[layoutId]
  const cols = Math.round(layouts.hall.w / CELL)
  const rows = Math.round(layouts.hall.d / CELL)
  const n = cols * rows
  const walkRects = walkableRects(layoutId)
  const obstacles = [...objects, ...opt.walls.map((w) => wallFootprint(w, opt.wallT))].map(shapeOf)

  const free = new Uint8Array(n) // walkable and clear by AGENT_RADIUS
  const open = new Uint8Array(n) // walkable and not inside an obstacle (for clearance)
  const freeCells: number[] = []
  for (let c = 0; c < n; c++) {
    const x = ((c % cols) + 0.5) * CELL
    const z = (Math.floor(c / cols) + 0.5) * CELL
    if (!inRects(walkRects, x, z)) continue
    let d = Infinity
    for (const o of obstacles) {
      // quick reject: far outside the shape's bounding circle
      if (Math.abs(x - o.x) > o.reach + AGENT_RADIUS || Math.abs(z - o.z) > o.reach + AGENT_RADIUS) continue
      d = Math.min(d, sdf(o, x, z))
    }
    if (d > 0) open[c] = 1
    if (d > AGENT_RADIUS) {
      free[c] = 1
      freeCells.push(c)
    }
  }

  // Nearest free cell for every cell (4-neighbor BFS outward from all free cells).
  const nearestFree = new Int32Array(n).fill(-1)
  const queue = new Int32Array(n)
  let qEnd = 0
  for (const c of freeCells) {
    nearestFree[c] = c
    queue[qEnd++] = c
  }
  for (let q = 0; q < qEnd; q++) {
    const c = queue[q]
    const i = c % cols
    const nbs = [i > 0 ? c - 1 : -1, i < cols - 1 ? c + 1 : -1, c - cols, c + cols]
    for (const nb of nbs) {
      if (nb < 0 || nb >= n || nearestFree[nb] >= 0) continue
      nearestFree[nb] = nearestFree[c]
      queue[qEnd++] = nb
    }
  }

  const cx = (c: number) => ((c % cols) + 0.5) * CELL
  const cz = (c: number) => (Math.floor(c / cols) + 0.5) * CELL

  const attractions = objects
    .filter((o) => o.attraction)
    .map((o) => {
      const sh = shapeOf(o)
      return { id: o.id, sources: freeCells.filter((c) => sdf(sh, cx(c), cz(c)) <= GOAL_RING) }
    })
    .filter((a) => a.sources.length)
    .map((a) => ({ id: a.id, field: flowField(cols, rows, free, a.sources) }))

  const entrances = layouts.entrances
    .map((e) => ({
      id: e.id,
      aisle: e.aisle,
      sources: freeCells.filter((c) => distToSegment(e, cx(c), cz(c)) <= ENTRANCE_REACH),
    }))
    .filter((e) => e.sources.length)
    .map((e) => ({ id: e.id, aisle: e.aisle, field: flowField(cols, rows, free, e.sources) }))

  // Passage width through each open cell = shortest straight run of open cells (4 directions).
  const narrow = new Uint8Array(n)
  let narrowCells = 0
  const dirs = [
    [1, 0, 1],
    [0, 1, 1],
    [1, 1, SQRT2],
    [1, -1, SQRT2],
  ] as const
  const widths = dirs.map(([di, dj, len]) => {
    const a = runs(cols, rows, open, di, dj)
    const b = runs(cols, rows, open, -di, -dj)
    return { a, b, len }
  })
  for (let c = 0; c < n; c++) {
    if (!open[c]) continue
    let min = Infinity
    for (const w of widths) min = Math.min(min, (w.a[c] + w.b[c] - 1) * CELL * w.len)
    if (min < MIN_CLEARANCE) {
      narrow[c] = 1
      narrowCells++
    }
  }

  return {
    cols,
    rows,
    free,
    freeCells,
    nearestFree,
    narrow,
    narrowArea: narrowCells * CELL * CELL,
    walkableArea: walkRects.reduce((s, r) => s + r.w * r.d, 0),
    footprint: opt.ndtFootprint,
    platformH: opt.platformH,
    attractions,
    entrances,
  }
}
