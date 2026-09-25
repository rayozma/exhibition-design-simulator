import type { EditorObject } from './editor'
import { APP_TITLE, type Design } from './design'

/** Save a Blob as a file via a temporary download link. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** "design-2026-09-24-1705" */
export function exportName(_design: Design) {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `design-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`
}

const mm = (v: number) => Math.round(v * 1000) / 1000

/** The design (hall, zones, booth, entrances) and its objects as JSON. */
export function layoutJson(design: Design, objects: EditorObject[], room: string | null) {
  return {
    app: APP_TITLE,
    exportedAt: new Date().toISOString(),
    room,
    units: 'meters, degrees',
    coords: 'origin = hall NW corner; x east, z south, y up. Object x/z = footprint center; rotY rotates the w/d footprint.',
    design: { ...design, seed: undefined },
    objects: objects.map((o) => ({
      id: o.id,
      ...(o.num !== undefined && { num: o.num }),
      name: o.name,
      category: o.category,
      ...(o.shape && { shape: o.shape }),
      ...(o.text && { text: o.text }),
      ...(o.kind && { kind: o.kind }),
      ...(o.elev && { elev: mm(o.elev) }),
      ...(o.parts && { parts: o.parts }),
      x: mm(o.x),
      z: mm(o.z),
      w: mm(o.w),
      d: mm(o.d),
      h: mm(o.h),
      rotY: mm(o.rotY),
      ...(o.material && { material: o.material }),
      ...(o.color && { color: o.color }),
      ...(o.attraction && { attraction: true }),
      ...(o.note && { note: o.note }),
      ...(o.modelUrl && { modelUrl: o.modelUrl, modelFit: o.modelFit ?? true }),
      ...(o.locked && { locked: true }),
    })),
  }
}

export function downloadLayoutJson(design: Design, objects: EditorObject[], room: string | null) {
  const json = JSON.stringify(layoutJson(design, objects, room), null, 2)
  downloadBlob(new Blob([json], { type: 'application/json' }), `${exportName(design)}.json`)
}
