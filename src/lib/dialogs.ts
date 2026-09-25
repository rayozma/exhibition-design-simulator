/**
 * In-app replacements for window.prompt / window.confirm. The browser's own dialogs can be blocked
 * ("prevent this page from creating additional dialogs"), which silently returns null / false and
 * made actions like Combine or Delete do nothing. These render in the page (see DialogHost).
 */

export type DialogRequest =
  | { kind: 'text'; title: string; message?: string; initial: string; okLabel: string; resolve: (v: string | null) => void }
  | { kind: 'confirm'; title: string; message?: string; okLabel: string; danger: boolean; resolve: (v: boolean) => void }

type Listener = (queue: DialogRequest[]) => void

let queue: DialogRequest[] = []
const listeners = new Set<Listener>()
const emit = () => listeners.forEach((l) => l(queue))

export function subscribeDialogs(l: Listener) {
  listeners.add(l)
  l(queue)
  return () => {
    listeners.delete(l)
  }
}

/** Close the first dialog in the queue with a result. */
export function closeDialog(result: string | boolean | null) {
  const [first, ...rest] = queue
  if (!first) return
  queue = rest
  emit()
  if (first.kind === 'text') first.resolve(typeof result === 'string' ? result : null)
  else first.resolve(result === true)
}

/** Ask for a line of text. Resolves to the trimmed text, or null if cancelled / empty. */
export function askText(title: string, initial = '', opts: { message?: string; okLabel?: string } = {}): Promise<string | null> {
  return new Promise((resolve) => {
    queue = [
      ...queue,
      {
        kind: 'text',
        title,
        message: opts.message,
        initial,
        okLabel: opts.okLabel ?? 'OK',
        resolve: (v) => resolve(v?.trim() ? v.trim() : null),
      },
    ]
    emit()
  })
}

/** Ask to confirm an action. Resolves to true if confirmed. */
export function askConfirm(title: string, opts: { message?: string; okLabel?: string; danger?: boolean } = {}): Promise<boolean> {
  return new Promise((resolve) => {
    queue = [...queue, { kind: 'confirm', title, message: opts.message, okLabel: opts.okLabel ?? 'OK', danger: !!opts.danger, resolve }]
    emit()
  })
}
