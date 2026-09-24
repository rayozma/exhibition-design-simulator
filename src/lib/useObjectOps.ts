import { useMemo, useRef } from 'react'
import type { EditorActions, EditorObject } from './editor'
import { clampToHall, normDeg, snapTo } from './geometry'
import type { LayoutId } from './layout'

export const ROTATE_STEP = 15

/** "item1-3f9a0c12" -> "item1-<new>", so copies of copies don't grow ids forever. */
const copyId = (id: string) => `${id.replace(/-[0-9a-f]{8}$/, '')}-${crypto.randomUUID().slice(0, 8)}`

/**
 * All edit operations for the current layout. Functions are stable (safe for
 * key handlers / memoized scene objects) and read the latest state via a ref.
 */
export function useObjectOps(
  actions: EditorActions,
  layoutId: LayoutId,
  objects: EditorObject[],
  snap: boolean,
  select: (id: string | null) => void,
) {
  const latest = useRef({ layoutId, objects, snap })
  latest.current = { layoutId, objects, snap }
  const dragBefore = useRef<EditorObject | null>(null)

  return useMemo(() => {
    const find = (id: string) => latest.current.objects.find((o) => o.id === id)
    const set = (next: EditorObject, undoable = true) =>
      actions.apply(latest.current.layoutId, [{ id: next.id, next: clampToHall(next) }], undoable)

    return {
      /** Numeric edits from the side panel. */
      update(id: string, patch: Partial<EditorObject>) {
        const o = find(id)
        if (o && !o.locked) set({ ...o, ...patch, rotY: normDeg(patch.rotY ?? o.rotY) })
      },
      rotate(id: string, delta: number) {
        const o = find(id)
        if (o && !o.locked) set({ ...o, rotY: normDeg(o.rotY + delta) })
      },
      toggleLock(id: string) {
        const o = find(id)
        if (o) set({ ...o, locked: !o.locked })
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
        if (!o || o.locked) return
        if (!window.confirm(`Delete "${o.name}"?`)) return
        actions.apply(latest.current.layoutId, [{ id, next: null }])
        select(null)
      },
      undo() {
        actions.undo(latest.current.layoutId)
      },
      reset() {
        const { layoutId } = latest.current
        if (!window.confirm(`Reset layout ${layoutId} to the original design? (You can undo this.)`)) return
        actions.reset(layoutId)
      },

      // Dragging: live moves are not undoable individually; one undo entry is pushed on drop.
      dragStart(id: string) {
        dragBefore.current = find(id) ?? null
      },
      drag(id: string, x: number, z: number) {
        const o = find(id)
        if (!o || o.locked) return
        const s = latest.current.snap
        set({ ...o, x: s ? snapTo(x) : x, z: s ? snapTo(z) : z }, false)
      },
      dragEnd(id: string) {
        const before = dragBefore.current
        dragBefore.current = null
        const now = find(id)
        if (before && now && (before.x !== now.x || before.z !== now.z)) {
          actions.pushUndo(latest.current.layoutId, { changes: [{ id, before }] })
        }
      },
    }
  }, [actions, select])
}

export type ObjectOps = ReturnType<typeof useObjectOps>
