import {
  layouts,
  type Entrance,
  type LayoutOption,
  type PavilionSpec,
  type Rect,
  type SeedObject,
  type Zone,
} from './layout'

export const APP_TITLE = 'Exhibition Design & Simulator'

/**
 * Everything that describes one exhibition design, stored as JSON on its room row
 * (rooms.design). Objects are stored separately (objects table, layout_id = design.layoutId)
 * so they can be edited and synced one by one.
 */
export type Design = {
  version: 1
  /** Partition key of this design's objects in the objects table ("B" for ADIPEC rooms, "main" for new ones). */
  layoutId: string
  /** Short description shown under the name, e.g. the event. */
  event?: string
  hall: { w: number; d: number }
  /** Surrounding areas: other exhibitors' booths, walkways, aisles, open space. */
  zones: Zone[]
  /** Your booth: footprint (one or more rectangles), platform height and walls. */
  booth: LayoutOption
  /** Where crowd agents enter / leave. */
  entrances: Entrance[]
  crowdPresets: { empty: number; low: number; high: number }
  /** Optional look of a surrounding pavilion structure ("Pavilion" toggle); null = none. */
  pavilion: PavilionSpec | null
  /** Objects a new room starts with, and what "Reset to design" restores. */
  seed: SeedObject[]
  /** Id of the save that produced this version (lets a client recognize its own saves coming back). */
  rev?: string
}

export const NEW_LAYOUT_ID = 'main'

/** The NDTCCS booth at ADIPEC 2026 (Al Masaood pavilion), layout B of 23 Sep, from layouts.json. */
export function adipecTemplate(): Design {
  const b = layouts.options.B
  const removed = new Set(b.removeZones)
  return {
    version: 1,
    layoutId: 'B',
    event: layouts.meta.event,
    hall: { w: layouts.hall.w, d: layouts.hall.d },
    zones: layouts.zones.filter((z) => !removed.has(z.id)),
    booth: { ...b, label: 'NDTCCS booth', removeZones: [] },
    entrances: layouts.entrances,
    crowdPresets: { empty: layouts.crowdPresets.empty, low: layouts.crowdPresets.low, high: layouts.crowdPresets.high },
    pavilion: layouts.pavilion,
    seed: layouts.objects,
  }
}

/** A plain hall with one aisle and an empty 6 × 4 m booth, to start a design from scratch. */
export function blankTemplate(): Design {
  return {
    version: 1,
    layoutId: NEW_LAYOUT_ID,
    hall: { w: 24, d: 16 },
    zones: [{ id: 'aisle', name: 'Aisle', x: 0, z: 0, w: 24, d: 3, color: '#ffffff', h: 0, walkable: true }],
    booth: {
      label: 'My booth',
      removeZones: [],
      footprint: [{ x: 9, z: 3, w: 6, d: 4 }],
      platformH: 0.1,
      walls: [
        { id: 'back', x1: 9, z1: 7, x2: 15, z2: 7 },
        { id: 'left', x1: 9, z1: 3, x2: 9, z2: 7 },
      ],
      wallH: 2.5,
      wallT: 0.1,
    },
    entrances: [
      { id: 'aisle_west', aisle: 'aisle', x1: 0, z1: 0, x2: 0, z2: 3 },
      { id: 'aisle_east', aisle: 'aisle', x1: 24, z1: 0, x2: 24, z2: 3 },
    ],
    crowdPresets: { empty: 0, low: 0.15, high: 0.8 },
    pavilion: null,
    seed: [],
  }
}

export const TEMPLATES: { id: string; name: string; description: string; make: () => Design }[] = [
  { id: 'blank', name: 'Blank hall', description: '24 × 16 m hall with one aisle and an empty 6 × 4 m booth', make: blankTemplate },
  {
    id: 'adipec',
    name: 'ADIPEC 2026 – NDTCCS booth',
    description: 'Al Masaood Energy pavilion, NDTCCS booth layout of 23 Sep, with all items',
    make: adipecTemplate,
  },
]

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object'

/** Accept a stored design if it has the essential parts; fill anything optional. null = unusable. */
export function parseDesign(raw: unknown): Design | null {
  if (!isObj(raw) || !isObj(raw.hall) || !isObj(raw.booth) || !Array.isArray(raw.zones)) return null
  const d = raw as unknown as Design
  if (!(d.hall.w > 0 && d.hall.d > 0) || !Array.isArray(d.booth.footprint)) return null
  return {
    ...blankTemplate(),
    ...d,
    version: 1,
    layoutId: typeof d.layoutId === 'string' && d.layoutId ? d.layoutId : NEW_LAYOUT_ID,
    booth: { ...blankTemplate().booth, ...d.booth, walls: d.booth.walls ?? [], removeZones: [] },
    entrances: Array.isArray(d.entrances) ? d.entrances : [],
    pavilion: d.pavilion ?? null,
    seed: Array.isArray(d.seed) ? d.seed : [],
  }
}

export const hallCenter = (d: Design): [number, number, number] => [d.hall.w / 2, 0, d.hall.d / 2]

/** Walkable = walkable zones (walkways, aisles, open gaps) + your booth's footprint. */
export const walkableRects = (d: Design): Rect[] => [...d.zones.filter((z) => z.walkable), ...d.booth.footprint]

/** Walkable area in m² (before subtracting objects); the base for "people per m²". */
export const walkableArea = (d: Design) => walkableRects(d).reduce((s, r) => s + r.w * r.d, 0)
