import type { Design } from './design'
import type { EditorObject } from './editor'
import { halfExtents, wallFootprint, type Footprint } from './geometry'
import type { ShapeKind } from './layout'

/** A thing that can be added from the Add tab. */
export type CatalogItem = {
  id: string
  name: string
  /** Built-in model (see ProcModels), or none for a basic shape. */
  kind?: string
  shape?: ShapeKind
  category: string
  w: number
  d: number
  h: number
  color?: string
  material?: string
  /** Visitors in the crowd simulation stop here. */
  attraction?: boolean
  text?: string
}

export const BASIC_SHAPES: CatalogItem[] = [
  { id: 'box', name: 'Box', shape: 'box', category: 'shape', w: 1, d: 1, h: 1, color: '#e5e7eb' },
  { id: 'cylinder', name: 'Cylinder', shape: 'cylinder', category: 'shape', w: 0.8, d: 0.8, h: 1, color: '#e5e7eb' },
  { id: 'sphere', name: 'Sphere', shape: 'sphere', category: 'shape', w: 0.8, d: 0.8, h: 0.8, color: '#e5e7eb' },
  { id: 'cone', name: 'Cone', shape: 'cone', category: 'shape', w: 0.8, d: 0.8, h: 1.2, color: '#e5e7eb' },
  { id: 'wedge', name: 'Ramp', shape: 'wedge', category: 'shape', w: 1, d: 1.5, h: 0.5, color: '#e5e7eb' },
  { id: 'panel', name: 'Panel', shape: 'panel', category: 'shape', w: 2, d: 0.05, h: 2, color: '#f3f4f6' },
  { id: 'sign', name: 'Sign', shape: 'sign', category: 'shape', w: 1.2, d: 0.05, h: 0.5, color: '#1d4ed8', text: 'Your text' },
]

const WHITE = '#f3f2ee'

export const ITEMS: CatalogItem[] = [
  { id: 'plinth', name: 'Display plinth', kind: 'plinth', category: 'display', w: 0.9, d: 0.6, h: 1.0, color: WHITE, attraction: true },
  { id: 'deskSim', name: 'Demo desk + monitor', kind: 'deskSim', category: 'display', w: 1.0, d: 0.7, h: 1.0, color: WHITE, attraction: true },
  { id: 'deskTraining', name: 'Desk + large TV', kind: 'deskTraining', category: 'display', w: 1.0, d: 0.7, h: 1.0, color: WHITE, attraction: true },
  { id: 'counter', name: 'Reception counter', kind: 'counter', category: 'counter', w: 1.4, d: 0.7, h: 1.0, color: WHITE, attraction: true },
  { id: 'tvStand', name: 'TV on floor stand', kind: 'tvStand', category: 'screen', w: 1.2, d: 0.6, h: 2.0, color: '#1c1c1c', attraction: true },
  { id: 'ledWall', name: 'LED video wall', kind: 'ledWall', category: 'screen', w: 3.0, d: 0.1, h: 2.2, color: '#1c1c1c', attraction: true },
  { id: 'diorama', name: 'Model / diorama table', kind: 'diorama', category: 'display', w: 1.0, d: 1.0, h: 0.8, color: WHITE, attraction: true },
  { id: 'droneStand', name: 'Drone display table', kind: 'droneStand', category: 'display', w: 0.8, d: 0.8, h: 1.5, color: WHITE, attraction: true },
  { id: 'robotPlinth', name: 'Plinth with robot', kind: 'robotPlinth', category: 'display', w: 0.9, d: 0.55, h: 0.5, color: WHITE, attraction: true },
  { id: 'irisPlinth', name: 'Plinth with equipment case', kind: 'irisPlinth', category: 'display', w: 0.9, d: 0.55, h: 1.0, color: WHITE, attraction: true },
  { id: 'rollup', name: 'Roll-up banner', kind: 'rollup', category: 'display', w: 0.85, d: 0.25, h: 2.0, color: '#1d4ed8' },
  { id: 'roundTable', name: 'Round meeting table', kind: 'roundTable', category: 'furniture', shape: 'cylinder', w: 1.0, d: 1.0, h: 0.75, color: '#fbfbf9', attraction: true },
  { id: 'highTable', name: 'Cocktail table', kind: 'highTable', category: 'furniture', shape: 'cylinder', w: 0.6, d: 0.6, h: 1.1, color: '#fbfbf9' },
  { id: 'chair', name: 'Armchair', kind: 'chair', category: 'furniture', w: 0.55, d: 0.55, h: 0.8, color: '#f7f7f5' },
  { id: 'stool', name: 'Bar stool', kind: 'stool', category: 'furniture', shape: 'cylinder', w: 0.4, d: 0.4, h: 0.8, color: '#f5f5f3' },
  { id: 'plant', name: 'Potted plant', kind: 'plant', category: 'decor', shape: 'cylinder', w: 0.6, d: 0.6, h: 1.4, color: '#2f7d32' },
]

/** Axis-aligned overlap test with a small gap, for finding a free spot. */
function overlaps(a: { x: number; z: number; hx: number; hz: number }, others: Footprint[]) {
  return others.some((o) => {
    const { hx, hz } = halfExtents(o)
    return Math.abs(a.x - o.x) < a.hx + hx + 0.05 && Math.abs(a.z - o.z) < a.hz + hz + 0.05
  })
}

/**
 * A free spot for a new w × d object: spiralling out from the booth's center (or the hall's),
 * preferring spots inside the booth, never outside the hall.
 */
export function findSpot(design: Design, objects: EditorObject[], w: number, d: number): { x: number; z: number } {
  const area = design.booth.footprint[0]
  const cx = area ? area.x + area.w / 2 : design.hall.w / 2
  const cz = area ? area.z + area.d / 2 : design.hall.d / 2
  const hx = w / 2
  const hz = d / 2
  // Existing objects and the booth walls are taken.
  const taken: Footprint[] = [...objects, ...design.booth.walls.map((wl) => wallFootprint(wl, design.booth.wallT))]
  const inHall = (x: number, z: number) => x - hx >= 0 && x + hx <= design.hall.w && z - hz >= 0 && z + hz <= design.hall.d
  const inBooth = (x: number, z: number) =>
    design.booth.footprint.some((r) => x - hx >= r.x && x + hx <= r.x + r.w && z - hz >= r.z && z + hz <= r.z + r.d)
  let fallback: { x: number; z: number } | null = null
  for (let ring = 0; ring <= 40; ring++) {
    const step = 0.25
    for (let i = -ring; i <= ring; i++) {
      for (const [dx, dz] of [
        [i, -ring],
        [i, ring],
        [-ring, i],
        [ring, i],
      ]) {
        const x = Math.round((cx + dx * step) * 100) / 100
        const z = Math.round((cz + dz * step) * 100) / 100
        if (!inHall(x, z) || overlaps({ x, z, hx, hz }, taken)) continue
        if (inBooth(x, z) || !design.booth.footprint.length) return { x, z }
        fallback ??= { x, z }
      }
    }
  }
  return fallback ?? { x: cx, z: cz }
}

/** A new editor object from a saved library template, placed in a free spot. */
export function fromTemplate(t: Omit<EditorObject, 'id' | 'x' | 'z' | 'locked'>, design: Design, objects: EditorObject[]): EditorObject {
  const { x, z } = findSpot(design, objects, t.w, t.d)
  const slug = t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 20) || 'item'
  return { ...t, id: `${slug}-${crypto.randomUUID().slice(0, 8)}`, x, z, rotY: 0, locked: false }
}

/** A new editor object from a catalog item, placed in a free spot. */
export function makeObject(item: CatalogItem, design: Design, objects: EditorObject[]): EditorObject {
  const { x, z } = findSpot(design, objects, item.w, item.d)
  return {
    id: `${item.id}-${crypto.randomUUID().slice(0, 8)}`,
    name: item.name,
    category: item.category,
    ...(item.kind && { kind: item.kind }),
    ...(item.shape && { shape: item.shape }),
    ...(item.text && { text: item.text }),
    ...(item.material && { material: item.material }),
    ...(item.color && { color: item.color }),
    ...(item.attraction && { attraction: true }),
    x,
    z,
    w: item.w,
    d: item.d,
    h: item.h,
    rotY: 0,
    locked: false,
  }
}
