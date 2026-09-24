import type { EditorObject } from './editor'
import { layouts, type LayoutId } from './layout'

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

/** "ndt-adipec-B-2026-09-24-1705" */
export function exportName(layoutId: LayoutId) {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `ndt-adipec-${layoutId}-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`
}

const mm = (v: number) => Math.round(v * 1000) / 1000

/** Current layout as JSON, with object fields in the same shape as layouts.json. */
export function layoutJson(layoutId: LayoutId, objects: EditorObject[], room: string | null) {
  return {
    title: layouts.meta.title,
    exportedAt: new Date().toISOString(),
    room,
    layoutId,
    layoutLabel: layouts.options[layoutId].label,
    units: layouts.meta.units,
    coords: layouts.meta.coords,
    objects: objects.map((o) => ({
      id: o.id,
      ...(o.num !== undefined && { num: o.num }),
      name: o.name,
      category: o.category,
      ...(o.shape && { shape: o.shape }),
      x: mm(o.x),
      z: mm(o.z),
      w: mm(o.w),
      d: mm(o.d),
      h: mm(o.h),
      rotY: mm(o.rotY),
      ...(o.material && { material: o.material }),
      ...(o.attraction && { attraction: true }),
      ...(o.note && { note: o.note }),
      ...(o.modelUrl && { modelUrl: o.modelUrl, modelFit: o.modelFit ?? true }),
      ...(o.locked && { locked: true }),
    })),
  }
}

export function downloadLayoutJson(layoutId: LayoutId, objects: EditorObject[], room: string | null) {
  const json = JSON.stringify(layoutJson(layoutId, objects, room), null, 2)
  downloadBlob(new Blob([json], { type: 'application/json' }), `${exportName(layoutId)}.json`)
}
