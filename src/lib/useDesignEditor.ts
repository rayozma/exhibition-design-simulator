import { useMemo, useRef, useState } from 'react'
import { saveDesign } from './db'
import { parseDesign, type Design } from './design'

const MAX_UNDO = 50

/**
 * Editing the open design (hall, zones, booth, entrances):
 * - preview(d): show a change immediately without saving (while dragging),
 * - commit(d, before): save it for everyone and remember `before` for undo,
 * - undo(): go back to the previous version (this user's own changes only),
 * - remote(row): apply a design saved by someone else (own saves are recognized by their `rev`).
 * Saves run one after another; the last save wins if two people edit the layout at the same moment.
 */
export function useDesignEditor(room: string | null, design: Design, setDesign: (d: Design) => void) {
  const latest = useRef(design)
  latest.current = design
  const stack = useRef<Design[]>([])
  const [undoCount, setUndoCount] = useState(0)
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
        setUndoCount(stack.current.length)
        const next = stamp(d)
        setDesign(next)
        save(next)
      },
      undo() {
        const prev = stack.current[stack.current.length - 1]
        if (!prev) return
        stack.current = stack.current.slice(0, -1)
        setUndoCount(stack.current.length)
        const next = stamp(prev)
        setDesign(next)
        save(next)
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

  return { ...api, canUndo: undoCount > 0, error, clearError: () => setError(null) }
}

export type DesignEditor = ReturnType<typeof useDesignEditor>
