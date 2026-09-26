import { adipecTemplate, parseDesign, type Design } from './design'
import { hasInfo, type CompositeParts, type ObjectInfo, type ShapeKind } from './layout'
import { seedObjects, type EditorObject, type ObjectsByLayout } from './editor'

/** Key of a design's objects (Design.layoutId). */
type LayoutId = string
import { NETWORK_ERROR, supabase } from './supabase'

/** Friendlier text for network failures (supabase-js reports them as "TypeError: Failed to fetch"). */
export const clean = (msg: string) =>
  /failed to fetch|networkerror|load failed/i.test(msg) ? NETWORK_ERROR : msg.replace(/^TypeError: /, '')

/** Shape of a row in public.objects (see supabase/schema.sql). */
export type ObjectRow = {
  room: string
  layout_id: LayoutId
  id: string
  num: number | null
  name: string
  category: string
  shape: ShapeKind
  text: string | null
  kind: string | null
  elev: number | null
  parts: CompositeParts | null
  info: ObjectInfo | null
  w: number
  d: number
  h: number
  x: number
  z: number
  rot_y: number
  material: string | null
  attraction: boolean
  note: string | null
  model_url: string | null
  model_fit: boolean
  color: string | null
  locked: boolean
  updated_by: string | null
  updated_at?: string
}

export function toRow(room: string, layoutId: LayoutId, o: EditorObject, updatedBy: string): ObjectRow {
  return {
    room,
    layout_id: layoutId,
    id: o.id,
    num: o.num ?? null,
    name: o.name,
    category: o.category,
    shape: o.shape ?? 'box',
    text: o.text ?? null,
    kind: o.kind ?? null,
    elev: o.elev ? o.elev : null,
    parts: o.parts ?? null,
    info: hasInfo(o.info) ? o.info : null,
    w: o.w,
    d: o.d,
    h: o.h,
    x: o.x,
    z: o.z,
    rot_y: o.rotY,
    material: o.material ?? null,
    attraction: o.attraction ?? false,
    note: o.note ?? null,
    model_url: o.modelUrl ?? null,
    model_fit: o.modelFit ?? true,
    color: o.color ?? null,
    locked: o.locked,
    updated_by: updatedBy,
  }
}

export function fromRow(r: ObjectRow): EditorObject {
  return {
    id: r.id,
    num: r.num ?? undefined,
    name: r.name,
    category: r.category,
    shape: r.shape,
    text: r.text ?? undefined,
    kind: r.kind ?? undefined,
    elev: r.elev ?? undefined,
    parts: r.parts && Array.isArray(r.parts.items) ? r.parts : undefined,
    info: r.info && typeof r.info === 'object' ? r.info : undefined,
    w: r.w,
    d: r.d,
    h: r.h,
    x: r.x,
    z: r.z,
    rotY: r.rot_y,
    material: r.material ?? undefined,
    attraction: r.attraction,
    note: r.note ?? undefined,
    modelUrl: r.model_url,
    modelFit: r.model_fit ?? true,
    color: r.color ?? undefined,
    locked: r.locked,
  }
}

function db() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export async function fetchRoom(room: string): Promise<ObjectsByLayout> {
  const { data, error } = await db().from('objects').select('*').eq('room', room).order('id')
  if (error) throw new Error(clean(error.message))
  const out: ObjectsByLayout = {}
  for (const r of data as ObjectRow[]) (out[r.layout_id] ??= []).push(fromRow(r))
  return out
}

export async function upsertObjects(room: string, layoutId: LayoutId, objs: EditorObject[], updatedBy: string) {
  const rows = objs.map((o) => toRow(room, layoutId, o, updatedBy))
  const { error } = await db().from('objects').upsert(rows, { onConflict: 'room,layout_id,id' })
  if (error) throw new Error(clean(error.message))
}

export async function deleteObjects(room: string, layoutId: LayoutId, ids: string[]) {
  const { error } = await db().from('objects').delete().eq('room', room).eq('layout_id', layoutId).in('id', ids)
  if (error) throw new Error(clean(error.message))
}

export type Room = {
  id: string
  name: string
  /** The design document (hall, zones, booth, …); null for rooms made before designs existed. */
  design: unknown | null
  created_by: string | null
  created_at: string
  updated_at: string
}

/** All rooms, most recently edited first. */
export async function fetchRooms(): Promise<Room[]> {
  const { data, error } = await db().from('rooms').select('*').order('updated_at', { ascending: false }).limit(200)
  if (error) throw new Error(roomsError(error.message))
  return data as Room[]
}

export async function createRoom(id: string, name: string, by: string, design: Design) {
  const { error } = await db().from('rooms').insert({ id, name, created_by: by, design })
  if (error) throw new Error(roomsError(error.message))
}

/**
 * Load a room with its design. Rooms made before the rooms table get a row with a default name;
 * rooms made before designs existed were all ADIPEC rooms, so they get the ADIPEC design (layout B,
 * where their objects already are) saved on first open.
 */
export async function ensureRoom(id: string): Promise<Room & { design: Design }> {
  const client = db()
  const { error: upErr } = await client
    .from('rooms')
    .upsert({ id, name: `Room ${id.slice(0, 6)}` }, { onConflict: 'id', ignoreDuplicates: true })
  if (upErr) throw new Error(roomsError(upErr.message))
  const { data, error } = await client.from('rooms').select('*').eq('id', id).single()
  if (error) throw new Error(roomsError(error.message))
  const room = data as Room
  const parsed = parseDesign(room.design)
  if (parsed) return { ...room, design: parsed }
  const design = adipecTemplate()
  await saveDesign(id, design)
  return { ...room, design }
}

/** Save a room's design document (hall, zones, booth, entrances…). */
export async function saveDesign(id: string, design: Design) {
  const { error } = await db().from('rooms').update({ design }).eq('id', id)
  if (error) throw new Error(roomsError(error.message))
}

export async function renameRoom(id: string, name: string) {
  const { error } = await db().from('rooms').update({ name }).eq('id', id)
  if (error) throw new Error(roomsError(error.message))
}

/** Delete a room with everything in it. Returns false if the password is wrong. */
export async function deleteRoom(id: string, password: string): Promise<boolean> {
  const { data, error } = await db().rpc('delete_room', { p_room: id, p_password: password })
  if (error) {
    throw new Error(
      /delete_room|function .* does not exist|schema cache/i.test(error.message) && !/not set up/i.test(error.message)
        ? 'Room deletion is not set up. Run supabase/delete-room.sql in the Supabase SQL Editor.'
        : error.message,
    )
  }
  return data === true
}

const roomsError = (raw: string, msg = clean(raw)) =>
  /column .*design.* does not exist|could not find the .design. column/i.test(msg)
    ? 'The design column is missing. Run supabase/designs.sql in the Supabase SQL Editor.'
    : /relation .*rooms.* does not exist|schema cache/i.test(msg)
    ? 'The rooms table is missing. Run supabase/rooms-and-colors.sql in the Supabase SQL Editor.'
    : msg

/** A reusable object shared by all designs: everything except where it stands. */
export type LibraryTemplate = Omit<EditorObject, 'id' | 'x' | 'z' | 'locked' | 'note'>
export type LibraryItem = { id: string; name: string; item: LibraryTemplate; created_by: string | null; created_at: string }

/** The template of an object, for saving to the library. */
export function toTemplate(o: EditorObject): LibraryTemplate {
  const { id: _id, x: _x, z: _z, locked: _locked, note: _note, ...rest } = o
  return { ...rest, rotY: 0 }
}

const libraryError = (raw: string, msg = clean(raw)) =>
  /relation .*library_items.* does not exist|could not find the table|schema cache/i.test(msg)
    ? 'The library is not set up. Run supabase/library.sql in the Supabase SQL Editor.'
    : msg

export async function fetchLibrary(): Promise<LibraryItem[]> {
  const { data, error } = await db().from('library_items').select('*').order('created_at', { ascending: false }).limit(300)
  if (error) throw new Error(libraryError(error.message))
  return data as LibraryItem[]
}

export async function saveLibraryItem(name: string, item: LibraryTemplate, by: string) {
  const { error } = await db().from('library_items').insert({ name, item, created_by: by })
  if (error) throw new Error(libraryError(error.message))
}

export async function deleteLibraryItem(id: string) {
  const { error } = await db().from('library_items').delete().eq('id', id)
  if (error) throw new Error(libraryError(error.message))
}

/** Tell open library lists to reload (after saving or deleting). */
export const LIBRARY_CHANGED = 'library-changed'

export type Snapshot = {
  id: string
  name: string
  created_by: string | null
  created_at: string
  data: { objects: EditorObject[] }
}

export async function fetchSnapshots(room: string, layoutId: LayoutId): Promise<Snapshot[]> {
  const { data, error } = await db()
    .from('snapshots')
    .select('id, name, created_by, created_at, data')
    .eq('room', room)
    .eq('layout_id', layoutId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(clean(error.message))
  return data as Snapshot[]
}

export async function saveSnapshot(room: string, layoutId: LayoutId, name: string, objects: EditorObject[], by: string) {
  const { error } = await db()
    .from('snapshots')
    .insert({ room, layout_id: layoutId, name, data: { objects }, created_by: by })
  if (error) throw new Error(clean(error.message))
}

export async function deleteSnapshot(room: string, id: string) {
  const { error } = await db().from('snapshots').delete().eq('room', room).eq('id', id)
  if (error) throw new Error(clean(error.message))
}

/** Fill a new room with its design's starting objects. Existing rows are left alone. */
export async function seedRoom(room: string, design: Design) {
  const rows = seedObjects(design.seed).map((o) => toRow(room, design.layoutId, o, 'seed'))
  if (!rows.length) return
  const { error } = await db()
    .from('objects')
    .upsert(rows, { onConflict: 'room,layout_id,id', ignoreDuplicates: true })
  if (error) throw new Error(clean(error.message))
}
