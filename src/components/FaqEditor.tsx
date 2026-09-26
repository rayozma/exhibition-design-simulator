import type { FaqItem } from '../lib/layout'
import { Field, RemarksField } from './fields'

type Props = {
  faq: FaqItem[]
  disabled: boolean
  /** Applies a change to the latest FAQ list (the card may be edited by others meanwhile). */
  onChange: (fn: (faq: FaqItem[]) => FaqItem[]) => void
}

/** Question / answer pairs of an info card: add, edit, reorder, remove. */
export function FaqEditor({ faq, disabled, onChange }: Props) {
  const setAt = (k: number, patch: Partial<FaqItem>) =>
    onChange((list) => list.map((f, j) => (j === k ? { ...f, ...patch } : f)))
  const move = (k: number, dir: -1 | 1) =>
    onChange((list) => {
      const next = [...list]
      const [it] = next.splice(k, 1)
      next.splice(k + dir, 0, it)
      return next
    })

  return (
    <div className="field">
      <span>FAQ{faq.length ? ` (${faq.length})` : ''}</span>
      {faq.map((f, k) => (
        <div key={k} className="faq-edit">
          <div className="faq-edit-head">
            <b>{k + 1}.</b>
            <button className="link" disabled={disabled || k === 0} onClick={() => move(k, -1)} title="Move up" aria-label="Move question up">
              ↑
            </button>
            <button className="link" disabled={disabled || k === faq.length - 1} onClick={() => move(k, 1)} title="Move down" aria-label="Move question down">
              ↓
            </button>
            <button
              className="link"
              disabled={disabled}
              onClick={() => onChange((list) => list.filter((_, j) => j !== k))}
              title="Remove question"
              aria-label="Remove question"
            >
              ✕
            </button>
          </div>
          <Field label="Question" value={f.q} placeholder="e.g. How deep can it go?" disabled={disabled} onCommit={(q) => setAt(k, { q })} />
          <RemarksField label="Answer" rows={3} value={f.a} placeholder="The answer" disabled={disabled} onCommit={(a) => setAt(k, { a })} />
        </div>
      ))}
      <div className="actions tight">
        <button disabled={disabled} onClick={() => onChange((list) => [...list, { q: 'New question', a: '' }])}>
          + Add question
        </button>
      </div>
    </div>
  )
}
