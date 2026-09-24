import { useMemo, useRef } from 'react'
import { resetChanges, undoChanges, type Change, type EditorActions, type EditorObject, type UndoEntry } from './editor'
import { clampToHall, normDeg, snapTo } from './geometry'
import type { LayoutId } from './layout'
import type { SyncApi } from './useRoomSync'

export const ROTATE_STEP = 15

/** "item1-3f9a0c12" -> "item1-<new>", so copies of copies don't grow ids forever. */
const copyId = (id: string) => `${id.replace(/-[0-9a-f]{8}$/, '')}-${crypto.randomUUID().slice(0, 8)}`

/**
 * All edit operations for the current layout. Each one updates local state and
 * saves via `sync`. Functions are stable (safe for key handlers / memoized scene
 * objects) and read the latest state via a ref.
 */
export function useObjectOps(
  actions: EditorActions,
  sync: SyncApi,
  layoutId: LayoutId,
  objects: EditorObject[],
  undoStack: UndoEntry[],
  snap: boolean,
  select: (id: string | null) => void,
) {
  const latest = useRef({ layoutId, objects, undoStack, snap })
  latest.current = { layoutId, objects, undoStack, snap }
  const dragBefore = useRef<EditorObject | null>(null)

  return useMemo(() => {
    const find = (id: string) => latest.current.objects.find((o) => o.id === id)
    const busy = (id: string) => sync.isBusy(latest.current.layoutId, id)
    /** Not locked and not being dragged by someone else. */
    const editable = (o: EditorObject | undefined): o is EditorObject => !!o && !o.locked && !busy(o.id)
    const commit = (changes: Change[], undoable = true) => {
      actions.apply(latest.current.layoutId, changes, undoable)
      sync.persist(latest.current.layoutId, changes)
    }
    const set = (next: EditorObject) => commit([{ id: next.id, next: clampToHall(next) }])

    return {
      /** Numeric edits from the side panel. */
      update(id: string, patch: Partial<EditorObject>) {
        const o = find(id)
        if (editable(o)) set({ ...o, ...patch, rotY: normDeg(patch.rotY ?? o.rotY) })
      },
      rotate(id: string, delta: number) {
        const o = find(id)
        if (editable(o)) set({ ...o, rotY: normDeg(o.rotY + delta) })
      },
      toggleLock(id: string) {
        const o = find(id)
        if (o && !busy(id)) set({ ...o, locked: !o.locked })
      },
      /** Add a brand-new object (e.g. from an uploaded model) and select it. */
      add(obj: EditorObject) {
        set(obj)
        select(obj.id)
      },
      duplicate(id: string) {
        const o = find(id)
        if (!o) return
        const copy = { ...o, id: copyId(o.id), name: `${o.name} (copy)`, x: o.x + 0.5, z: o.z + 0.5, locked: false }
        set(copy)
        select(copy.id)
      },
      remove(id: string) {
        const o = find(id)
        if (!editable(o)) return
        if (!window.confirm(`Delete "${o.name}"?`)) return
        commit([{ id, next: null }])
        select(null)
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

      // Dragging: live moves are broadcast, not saved; on drop one undo entry is pushed and the result saved.
      dragStart(id: string) {
        dragBefore.current = find(id) ?? null
      },
      drag(id: string, x: number, z: number) {
        const o = find(id)
        if (!editable(o)) return
        const s = latest.current.snap
        const next = clampToHall({ ...o, x: s ? snapTo(x) : x, z: s ? snapTo(z) : z })
        actions.apply(latest.current.layoutId, [{ id, next }], false)
        sync.dragMove(latest.current.layoutId, next)
      },
      dragEnd(id: string) {
        const { layoutId: l } = latest.current
        const before = dragBefore.current
        dragBefore.current = null
        const now = find(id)
        sync.dragEnd(l, now)
        if (before && now && (before.x !== now.x || before.z !== now.z)) {
          actions.pushUndo(l, { changes: [{ id, before }] })
          sync.persist(l, [{ id, next: now }])
        }
      },
    }
  }, [actions, sync, select])
}

export type ObjectOps = ReturnType<typeof useObjectOps>
