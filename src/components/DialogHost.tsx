import { useEffect, useState } from 'react'
import { closeDialog, subscribeDialogs, type DialogRequest } from '../lib/dialogs'

/** Shows the in-app text / confirm dialogs requested with askText() / askConfirm(). */
export function DialogHost() {
  const [queue, setQueue] = useState<DialogRequest[]>([])
  useEffect(() => subscribeDialogs(setQueue), [])
  const current = queue[0]
  const [text, setText] = useState('')
  useEffect(() => {
    if (current?.kind === 'text') setText(current.initial)
  }, [current])

  if (!current) return null
  const ok = () => closeDialog(current.kind === 'text' ? text : true)
  const cancel = () => closeDialog(current.kind === 'text' ? null : false)

  return (
    <div
      className="overlay"
      onKeyDown={(e) => {
        if (e.key === 'Escape') cancel()
      }}
    >
      <form
        className="card"
        onSubmit={(e) => {
          e.preventDefault()
          ok()
        }}
      >
        <h2>{current.title}</h2>
        {current.message && <p className="muted small">{current.message}</p>}
        {current.kind === 'text' && (
          <input
            className="dialog-input"
            autoFocus
            value={text}
            maxLength={120}
            onChange={(e) => setText(e.target.value)}
            onFocus={(e) => e.currentTarget.select()}
          />
        )}
        <div className="actions">
          <button
            type="submit"
            className={current.kind === 'confirm' && current.danger ? 'danger' : 'primary'}
            autoFocus={current.kind === 'confirm'}
            disabled={current.kind === 'text' && !text.trim()}
          >
            {current.okLabel}
          </button>
          <button type="button" onClick={cancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
