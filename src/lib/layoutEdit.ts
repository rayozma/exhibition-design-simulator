import type { Design } from './design'
import type { Entrance, Rect, Wall, Zone } from './layout'

/** A selectable element of the layout. Booth areas have no id, so they are addressed by index. */
export type LayoutSel =
  | { kind: 'zone'; id: string }
  | { kind: 'area'; index: number }
  | { kind: 'wall'; id: string }
  | { kind: 'entrance'; id: string }
  | null

export type LayoutTool = 'select' | 'zone' | 'walkway' | 'area' | 'wall' | 'entrance'

export type Seg = { x1: number; z1: number; x2: number; z2: number }
export type Pt = { x: number; z: number }

export const MIN_RECT = 0.25 // m
export const MIN_SEG = 0.2 // m

const ZONE_COLORS = ['#60a5fa', '#f472b6', '#34d399', '#fbbf24', '#a78bfa', '#f87171', '#2dd4bf', '#fb923c']

export const newId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 6)}`

export const snap = (v: number, step: number) => Math.round(v / step) * step
export const snapPt = (p: Pt, step: number): Pt => ({ x: snap(p.x, step), z: snap(p.z, step) })

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const r2 = (v: number) => Math.round(v * 1000) / 1000

/** Rectangle spanned by two corner points. */
export function rectFrom(a: Pt, b: Pt): Rect {
  return { x: r2(Math.min(a.x, b.x)), z: r2(Math.min(a.z, b.z)), w: r2(Math.abs(b.x - a.x)), d: r2(Math.abs(b.z - a.z)) }
}

/** Corners of a rect in order NW, NE, SE, SW. */
export const corners = (r: Rect): Pt[] => [
  { x: r.x, z: r.z },
  { x: r.x + r.w, z: r.z },
  { x: r.x + r.w, z: r.z + r.d },
  { x: r.x, z: r.z + r.d },
]

export const segLength = (s: Seg) => Math.hypot(s.x2 - s.x1, s.z2 - s.z1)

/** Keep a moved rect inside the hall. */
export function clampRect(r: Rect, hall: Design['hall']): Rect {
  return { ...r, x: r2(clamp(r.x, 0, Math.max(0, hall.w - r.w))), z: r2(clamp(r.z, 0, Math.max(0, hall.d - r.d))) }
}

export function clampPt(p: Pt, hall: Design['hall']): Pt {
  return { x: r2(clamp(p.x, 0, hall.w)), z: r2(clamp(p.z, 0, hall.d)) }
}

export const sameSel = (a: LayoutSel, b: LayoutSel) =>
  !!a &&
  !!b &&
  a.kind === b.kind &&
  (a.kind === 'area' ? a.index === (b as { index: number }).index : a.id === (b as { id: string }).id)

/** The rectangle of a zone or booth area, if the selection is one. */
export function getRect(d: Design, sel: LayoutSel): Rect | null {
  if (!sel) return null
  if (sel.kind === 'zone') return d.zones.find((z) => z.id === sel.id) ?? null
  if (sel.kind === 'area') return d.booth.footprint[sel.index] ?? null
  return null
}

export function setRect(d: Design, sel: LayoutSel, r: Rect): Design {
  if (sel?.kind === 'zone') return { ...d, zones: d.zones.map((z) => (z.id === sel.id ? { ...z, ...r } : z)) }
  if (sel?.kind === 'area')
    return { ...d, booth: { ...d.booth, footprint: d.booth.footprint.map((a, i) => (i === sel.index ? r : a)) } }
  return d
}

/** The segment of a wall or entrance, if the selection is one. */
export function getSeg(d: Design, sel: LayoutSel): Seg | null {
  if (sel?.kind === 'wall') return d.booth.walls.find((w) => w.id === sel.id) ?? null
  if (sel?.kind === 'entrance') return d.entrances.find((e) => e.id === sel.id) ?? null
  return null
}

export function setSeg(d: Design, sel: LayoutSel, s: Seg): Design {
  const seg = { x1: r2(s.x1), z1: r2(s.z1), x2: r2(s.x2), z2: r2(s.z2) }
  if (sel?.kind === 'wall') return { ...d, booth: { ...d.booth, walls: d.booth.walls.map((w) => (w.id === sel.id ? { ...w, ...seg } : w)) } }
  if (sel?.kind === 'entrance') return { ...d, entrances: d.entrances.map((e) => (e.id === sel.id ? { ...e, ...seg } : e)) }
  return d
}

/** Move a whole element by (dx, dz), starting from how it was in `from`. */
export function moveSel(from: Design, sel: LayoutSel, dx: number, dz: number): Design {
  const r = getRect(from, sel)
  if (r) return setRect(from, sel, clampRect({ ...r, x: r.x + dx, z: r.z + dz }, from.hall))
  const s = getSeg(from, sel)
  if (!s) return from
  // Keep the segment's shape; limit the shift so both ends stay in the hall.
  const minX = Math.min(s.x1, s.x2)
  const maxX = Math.max(s.x1, s.x2)
  const minZ = Math.min(s.z1, s.z2)
  const maxZ = Math.max(s.z1, s.z2)
  const ddx = clamp(dx, -minX, from.hall.w - maxX)
  const ddz = clamp(dz, -minZ, from.hall.d - maxZ)
  return setSeg(from, sel, { x1: s.x1 + ddx, z1: s.z1 + ddz, x2: s.x2 + ddx, z2: s.z2 + ddz })
}

export function updateZone(d: Design, id: string, patch: Partial<Zone>): Design {
  return { ...d, zones: d.zones.map((z) => (z.id === id ? { ...z, ...patch } : z)) }
}

export function updateEntrance(d: Design, id: string, patch: Partial<Entrance>): Design {
  return { ...d, entrances: d.entrances.map((e) => (e.id === id ? { ...e, ...patch } : e)) }
}

/** Add a new element drawn with a tool. Returns the new design and the selection of the new element. */
export function addDrawn(d: Design, tool: LayoutTool, a: Pt, b: Pt): { design: Design; sel: LayoutSel } | null {
  if (tool === 'wall' || tool === 'entrance') {
    const seg = { x1: r2(a.x), z1: r2(a.z), x2: r2(b.x), z2: r2(b.z) }
    if (segLength(seg) < MIN_SEG) return null
    if (tool === 'wall') {
      const w: Wall = { id: newId('wall'), ...seg }
      return { design: { ...d, booth: { ...d.booth, walls: [...d.booth.walls, w] } }, sel: { kind: 'wall', id: w.id } }
    }
    const e: Entrance = { id: newId('entrance'), ...seg }
    return { design: { ...d, entrances: [...d.entrances, e] }, sel: { kind: 'entrance', id: e.id } }
  }
  const r = rectFrom(a, b)
  if (r.w < MIN_RECT || r.d < MIN_RECT) return null
  if (tool === 'area') {
    const index = d.booth.footprint.length
    return { design: { ...d, booth: { ...d.booth, footprint: [...d.booth.footprint, r] } }, sel: { kind: 'area', index } }
  }
  const walkway = tool === 'walkway'
  const count = d.zones.filter((z) => !!z.walkable === walkway).length + 1
  const z: Zone = {
    id: newId(walkway ? 'walkway' : 'zone'),
    name: walkway ? `Walkway ${count}` : `Booth ${count}`,
    ...r,
    color: walkway ? '#ffffff' : ZONE_COLORS[(count - 1) % ZONE_COLORS.length],
    h: walkway ? 0 : 2.5,
    ...(walkway && { walkable: true }),
  }
  return { design: { ...d, zones: [...d.zones, z] }, sel: { kind: 'zone', id: z.id } }
}

export function removeSel(d: Design, sel: LayoutSel): Design {
  if (!sel) return d
  switch (sel.kind) {
    case 'zone':
      return { ...d, zones: d.zones.filter((z) => z.id !== sel.id) }
    case 'area':
      return { ...d, booth: { ...d.booth, footprint: d.booth.footprint.filter((_, i) => i !== sel.index) } }
    case 'wall':
      return { ...d, booth: { ...d.booth, walls: d.booth.walls.filter((w) => w.id !== sel.id) } }
    case 'entrance':
      return { ...d, entrances: d.entrances.filter((e) => e.id !== sel.id) }
  }
}

/** Human label for a selection, e.g. "Walkway 2", "Booth area 1", "Wall", "Entrance". */
export function selLabel(d: Design, sel: LayoutSel): string {
  if (!sel) return ''
  if (sel.kind === 'zone') return d.zones.find((z) => z.id === sel.id)?.name ?? 'Zone'
  if (sel.kind === 'area') return `Booth area ${sel.index + 1}`
  if (sel.kind === 'wall') return 'Wall'
  return 'Entrance'
}
