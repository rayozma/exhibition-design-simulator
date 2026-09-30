import { useMemo, useRef, useState } from 'react'
import { saveDesign } from './db'
import { parseDesign, type Design } from './design'

const MAX_UNDO = 50

/**
 * Editing the open design (hall, zones, booth, entrances):
 * - preview(d): show a change immediately without saving (while dragging),
 * - commit(d, before): save it for everyone and remember `before` for undo,
 * - undo() / redo(): go back to the previous version, or forward again (this user's own changes only),
 * - remote(row): apply a design saved by someone else (own saves are recognized by their `rev`).
 * Saves run one after another; the last save wins if two people edit the layout at the same moment.
 */
export function useDesignEditor(room: string | null, design: Design, setDesign: (d: Design) => void) {
  const latest = useRef(design)
  latest.current = design
  const stack = useRef<Design[]>([])
  const redoStack = useRef<Design[]>([])
  const [counts, setCounts] = useState({ undo: 0, redo: 0 })
  const myRevs = useRef(new Set<string>())
  const queue = useRef<Promise<void>>(Promise.resolve())
  const [error, setError] = useState<string | null>(null)

  const api = useMemo(() => {
    const save = (d: Design) => {
      if (!room) return
      queue.current = queue.current
        .then(() => saveDesign(room, d))
        .catch((e: Error) => setError(`Saving the layout failed: ${e.message}`))
    }
    const stamp = (d: Design): Design => {
      const rev = crypto.randomUUID().slice(0, 12)
      myRevs.current.add(rev)
      return { ...d, rev }
    }
    const count = () => setCounts({ undo: stack.current.length, redo: redoStack.current.length })
    /** Take the last version off `from`, show and save it, and keep the current one on `to`. */
    const step = (from: typeof stack, to: typeof stack) => {
      const target = from.current[from.current.length - 1]
      if (!target) return
      from.current = from.current.slice(0, -1)
      to.current = [...to.current, latest.current].slice(-MAX_UNDO)
      count()
      const next = stamp(target)
      setDesign(next)
      save(next)
    }
    return {
      preview(d: Design) {
        setDesign(d)
      },
      commit(d: Design, before: Design = latest.current) {
        if (JSON.stringify(d) === JSON.stringify(before)) {
          setDesign(before) // a drag that ended where it started
          return
        }
        stack.current = [...stack.current, before].slice(-MAX_UNDO)
        redoStack.current = [] // a new change: nothing to redo any more
        count()
        const next = stamp(d)
        setDesign(next)
        save(next)
      },
      undo() {
        step(stack, redoStack)
      },
      redo() {
        step(redoStack, stack)
      },
      remote(raw: unknown) {
        const d = parseDesign(raw)
        if (!d || (d.rev && myRevs.current.has(d.rev))) return
        // The room row also changes on every object edit ("last edited" time): skip unchanged designs.
        if (d.rev ? d.rev === latest.current.rev : JSON.stringify(d) === JSON.stringify(latest.current)) return
        setDesign(d)
      },
    }
  }, [room, setDesign])

  return { ...api, canUndo: counts.undo > 0, canRedo: counts.redo > 0, error, clearError: () => setError(null) }
}

export type DesignEditor = ReturnType<typeof useDesignEditor>
