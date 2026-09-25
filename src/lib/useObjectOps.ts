import { useMemo, useRef } from 'react'
import {
  replaceChanges,
  resetChanges,
  undoChanges,
  type Change,
  type EditorActions,
  type EditorObject,
  type UndoEntry,
} from './editor'
import { clampToHall, normDeg, snapTo } from './geometry'
import { DEG, type LayoutId } from './layout'
import type { SyncApi } from './useRoomSync'

export const ROTATE_STEP = 15

/** "item1-3f9a0c12" -> "item1-<new>", so copies of copies don't grow ids forever. */
const copyId = (id: string) => `${id.replace(/-[0-9a-f]{8}$/, '')}-${crypto.randomUUID().slice(0, 8)}`

/**
 * All edit operations for the current layout. Each one updates local state and saves via `sync`.
 * Operations on several objects are one undo step. Functions are stable (safe for key handlers /
 * memoized scene objects) and read the latest state via a ref.
 */
export function useObjectOps(
  actions: EditorActions,
  sync: SyncApi,
  layoutId: LayoutId,
  objects: EditorObject[],
  undoStack: UndoEntry[],
  snap: boolean,
  selection: string[],
  setSelection: (ids: string[]) => void,
) {
  const latest = useRef({ layoutId, objects, undoStack, snap, selection })
  latest.current = { layoutId, objects, undoStack, snap, selection }
  /** Objects being dragged, as they were when the drag started. */
  const dragGroup = useRef<{ id: string; before: EditorObject[] } | null>(null)

  return useMemo(() => {
    const find = (id: string) => latest.current.objects.find((o) => o.id === id)
    const busy = (id: string) => sync.isBusy(latest.current.layoutId, id)
    /** Not locked and not being dragged by someone else. */
    const editable = (o: EditorObject | undefined): o is EditorObject => !!o && !o.locked && !busy(o.id)
    const editables = (ids: string[]) => ids.map(find).filter(editable)
    const commit = (changes: Change[], undoable = true) => {
      if (!changes.length) return
      actions.apply(latest.current.layoutId, changes, undoable)
      sync.persist(latest.current.layoutId, changes)
    }
    const setAll = (next: EditorObject[]) => commit(next.map((o) => ({ id: o.id, next: clampToHall(o) })))

    return {
      /** Numeric edits from the side panel (one object). */
      update(id: string, patch: Partial<EditorObject>) {
        const o = find(id)
        if (editable(o)) setAll([{ ...o, ...patch, rotY: normDeg(patch.rotY ?? o.rotY) }])
      },
      /** Remarks can be written on locked objects too (only not while someone else drags it). */
      annotate(id: string, note: string) {
        const o = find(id)
        if (o && !busy(id)) setAll([{ ...o, note: note.trim() ? note : undefined }])
      },
      /** Same change on several objects (e.g. color); locked ones are skipped. */
      updateMany(ids: string[], patch: Partial<EditorObject>) {
        setAll(editables(ids).map((o) => ({ ...o, ...patch })))
      },
      /** One object turns in place; a group turns around its common center. */
      rotate(ids: string[], delta: number) {
        const objs = editables(ids)
        if (!objs.length) return
        if (objs.length === 1) {
          setAll([{ ...objs[0], rotY: normDeg(objs[0].rotY + delta) }])
          return
        }
        const cx = objs.reduce((s, o) => s + o.x, 0) / objs.length
        const cz = objs.reduce((s, o) => s + o.z, 0) / objs.length
        const a = delta * DEG // same sense as three.js rotation.y
        const c = Math.cos(a)
        const s = Math.sin(a)
        setAll(
          objs.map((o) => {
            const dx = o.x - cx
            const dz = o.z - cz
            return { ...o, x: cx + dx * c + dz * s, z: cz - dx * s + dz * c, rotY: normDeg(o.rotY + delta) }
          }),
        )
      },
      /** Lock all if any is unlocked, otherwise unlock all. */
      toggleLock(ids: string[]) {
        const objs = ids.map(find).filter((o): o is EditorObject => !!o && !busy(o.id))
        const lock = objs.some((o) => !o.locked)
        setAll(objs.map((o) => ({ ...o, locked: lock })))
      },
      /** Add a brand-new object (e.g. from an uploaded model) and select it. */
      add(obj: EditorObject) {
        setAll([obj])
        setSelection([obj.id])
      },
      duplicate(ids: string[]) {
        const objs = ids.map(find).filter((o): o is EditorObject => !!o)
        const copies = objs.map((o) => ({
          ...o,
          id: copyId(o.id),
          name: `${o.name} (copy)`,
          x: o.x + 0.5,
          z: o.z + 0.5,
          locked: false,
        }))
        setAll(copies)
        setSelection(copies.map((o) => o.id))
      },
      remove(ids: string[]) {
        const objs = editables(ids)
        if (!objs.length) return
        const skipped = ids.length - objs.length
        const what = objs.length === 1 ? `"${objs[0].name}"` : `${objs.length} objects`
        const note = skipped ? ` (${skipped} locked or in use will be kept)` : ''
        if (!window.confirm(`Delete ${what}?${note}`)) return
        commit(objs.map((o) => ({ id: o.id, next: null })))
        setSelection([])
      },
      /** Undo this user's last action in the current layout, and save the restored values. */
      undo() {
        const { layoutId: l, undoStack: stack } = latest.current
        const entry = stack[stack.length - 1]
        if (!entry) return
        actions.undo(l)
        sync.persist(l, undoChanges(entry))
      },
      reset() {
        const { layoutId: l, objects: list } = latest.current
        if (!window.confirm(`Reset layout ${l} to the original design for everyone in this room? (You can undo this.)`))
          return
        commit(resetChanges(list))
      },
      /** Replace the current layout with a snapshot (one undo step; saved for everyone). */
      restore(objects: EditorObject[]) {
        commit(replaceChanges(latest.current.objects, objects))
        setSelection([])
      },

      // Dragging moves the whole selection if the grabbed object is part of it.
      // Live moves are broadcast, not saved; on drop one undo entry is pushed and the result saved.
      dragStart(id: string) {
        const sel = latest.current.selection
        const ids = sel.includes(id) ? sel : [id]
        dragGroup.current = { id, before: editables(ids) }
      },
      drag(id: string, x: number, z: number) {
        const g = dragGroup.current
        const lead = g?.before.find((o) => o.id === id)
        if (!g || !lead) return
        const s = latest.current.snap
        const target = clampToHall({ ...lead, x: s ? snapTo(x) : x, z: s ? snapTo(z) : z })
        const dx = target.x - lead.x
        const dz = target.z - lead.z
        const next = g.before.map((o) => clampToHall({ ...o, x: o.x + dx, z: o.z + dz }))
        actions.apply(latest.current.layoutId, next.map((o) => ({ id: o.id, next: o })), false)
        sync.dragMove(latest.current.layoutId, next)
      },
      dragEnd() {
        const { layoutId: l } = latest.current
        const g = dragGroup.current
        dragGroup.current = null
        if (!g) return
        const now = g.before.map((o) => find(o.id)).filter((o): o is EditorObject => !!o)
        sync.dragEnd(l, now)
        const moved = g.before.filter((b) => {
          const n = find(b.id)
          return n && (n.x !== b.x || n.z !== b.z)
        })
        if (!moved.length) return
        actions.pushUndo(l, { changes: moved.map((b) => ({ id: b.id, before: b })) })
        sync.persist(
          l,
          moved.map((b) => ({ id: b.id, next: find(b.id)! })),
        )
      },
    }
  }, [actions, sync, setSelection])
}

export type ObjectOps = ReturnType<typeof useObjectOps>
