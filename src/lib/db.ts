import { seedObjects, type EditorObject, type ObjectsByLayout } from './editor'
import { LAYOUT_IDS, type LayoutId } from './layout'
import { supabase } from './supabase'

/** Shape of a row in public.objects (see supabase/schema.sql). */
export type ObjectRow = {
  room: string
  layout_id: LayoutId
  id: string
  num: number | null
  name: string
  category: string
  shape: 'box' | 'cylinder'
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
    locked: r.locked,
  }
}

function db() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export async function fetchRoom(room: string): Promise<ObjectsByLayout> {
  const { data, error } = await db().from('objects').select('*').eq('room', room).order('id')
  if (error) throw new Error(error.message)
  const out = Object.fromEntries(LAYOUT_IDS.map((id) => [id, [] as EditorObject[]])) as ObjectsByLayout
  for (const r of data as ObjectRow[]) out[r.layout_id]?.push(fromRow(r))
  return out
}

export async function upsertObjects(room: string, layoutId: LayoutId, objs: EditorObject[], updatedBy: string) {
  const rows = objs.map((o) => toRow(room, layoutId, o, updatedBy))
  const { error } = await db().from('objects').upsert(rows, { onConflict: 'room,layout_id,id' })
  if (error) throw new Error(error.message)
}

export async function deleteObjects(room: string, layoutId: LayoutId, ids: string[]) {
  const { error } = await db().from('objects').delete().eq('room', room).eq('layout_id', layoutId).in('id', ids)
  if (error) throw new Error(error.message)
}

/** Fill a new room with the seed design for every layout option. Existing rows are left alone. */
export async function seedRoom(room: string) {
  const rows = LAYOUT_IDS.flatMap((l) => seedObjects().map((o) => toRow(room, l, o, 'seed')))
  const { error } = await db()
    .from('objects')
    .upsert(rows, { onConflict: 'room,layout_id,id', ignoreDuplicates: true })
  if (error) throw new Error(error.message)
}
