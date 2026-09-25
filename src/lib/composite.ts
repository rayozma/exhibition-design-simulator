import type { EditorObject } from './editor'
import { halfExtents, normDeg } from './geometry'
import { DEG, type CompositePart } from './layout'

const r3 = (v: number) => Math.round(v * 1000) / 1000

/** Objects that can become part of a combined object (uploaded 3D files can't). */
export const combinable = (o: EditorObject) => !o.modelUrl

/**
 * Turn several objects into one combined object. Parts keep their size, rotation, color and lift;
 * the new object sits at the center of their footprint with rotation 0. Nested groups are flattened.
 */
export function combine(objs: EditorObject[], name: string, id: string): EditorObject {
  const items: CompositePart[] = []
  let minX = Infinity
  let maxX = -Infinity
  let minZ = Infinity
  let maxZ = -Infinity
  let top = 0
  const flat = objs.flatMap((o) => (o.parts ? breakApart(o, () => o.id) : [o]))
  for (const o of flat) {
    const { hx, hz } = halfExtents(o)
    minX = Math.min(minX, o.x - hx)
    maxX = Math.max(maxX, o.x + hx)
    minZ = Math.min(minZ, o.z - hz)
    maxZ = Math.max(maxZ, o.z + hz)
    top = Math.max(top, (o.elev ?? 0) + o.h)
  }
  // Round the center first, so parts measured from it land back exactly on break apart.
  const cx = r3((minX + maxX) / 2)
  const cz = r3((minZ + maxZ) / 2)
  for (const o of flat) {
    items.push({
      name: o.name,
      category: o.category,
      ...(o.kind && { kind: o.kind }),
      ...(o.shape && { shape: o.shape }),
      x: r3(o.x - cx),
      y: r3(o.elev ?? 0),
      z: r3(o.z - cz),
      w: o.w,
      d: o.d,
      h: o.h,
      rotY: o.rotY,
      ...(o.color && { color: o.color }),
      ...(o.material && { material: o.material }),
      ...(o.text && { text: o.text }),
    })
  }
  const base = { w: r3(maxX - minX), d: r3(maxZ - minZ), h: r3(top) }
  return {
    id,
    name,
    category: 'composite',
    x: cx,
    z: cz,
    ...base,
    rotY: 0,
    locked: false,
    ...(objs.some((o) => o.attraction) && { attraction: true }),
    parts: { base, items },
  }
}

/** The separate objects a combined object is made of, placed where they appear (rotation and size applied). */
export function breakApart(obj: EditorObject, newId: (part: CompositePart) => string): EditorObject[] {
  if (!obj.parts) return [obj]
  const { base, items } = obj.parts
  const sx = base.w ? obj.w / base.w : 1
  const sz = base.d ? obj.d / base.d : 1
  const sy = base.h ? obj.h / base.h : 1
  const a = obj.rotY * DEG
  const c = Math.cos(a)
  const s = Math.sin(a)
  return items.map((p) => {
    const u = p.x * sx
    const v = p.z * sz
    return {
      id: newId(p),
      name: p.name ?? (p.shape ? p.shape[0].toUpperCase() + p.shape.slice(1) : 'Part'),
      category: p.category ?? (p.kind ? 'display' : 'shape'),
      ...(p.kind && { kind: p.kind }),
      ...(p.shape && { shape: p.shape }),
      // Same rotation sense as three.js rotation.y: local (u, v) -> world.
      x: r3(obj.x + u * c + v * s),
      z: r3(obj.z - u * s + v * c),
      w: r3(p.w * sx),
      d: r3(p.d * sz),
      h: r3(p.h * sy),
      rotY: normDeg(obj.rotY + p.rotY),
      ...(obj.elev || p.y ? { elev: r3((obj.elev ?? 0) + p.y * sy) } : {}),
      ...(p.color && { color: p.color }),
      ...(p.material && { material: p.material }),
      ...(p.text && { text: p.text }),
      locked: false,
    }
  })
}
