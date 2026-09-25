import { useEffect, useState } from 'react'

export const fmt = (v: number) => String(Math.round(v * 100) / 100)

/** Text input that commits on blur / Enter (so one edit = one undo step). Esc cancels. */
export function Field(props: {
  label: string
  value: string
  disabled?: boolean
  numeric?: boolean
  placeholder?: string
  onCommit: (text: string) => void
}) {
  const [text, setText] = useState(props.value)
  useEffect(() => setText(props.value), [props.value]) // follow drags / undo / other users

  const commit = () => {
    if (text !== props.value) props.onCommit(text)
  }
  return (
    <label className="field">
      <span>{props.label}</span>
      <input
        type={props.numeric ? 'number' : 'text'}
        step="any"
        value={text}
        placeholder={props.placeholder}
        disabled={props.disabled}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
          if (e.key === 'Escape') {
            setText(props.value)
            e.currentTarget.blur()
          }
        }}
      />
    </label>
  )
}

export function NumberField(props: {
  label: string
  value: number
  min?: number
  disabled?: boolean
  onCommit: (v: number) => void
}) {
  const [bad, setBad] = useState(0) // bump to re-sync the input after invalid input
  return (
    <Field
      key={bad}
      numeric
      label={props.label}
      value={fmt(props.value)}
      disabled={props.disabled}
      onCommit={(t) => {
        const n = parseFloat(t)
        if (Number.isFinite(n) && (props.min === undefined || n >= props.min)) props.onCommit(n)
        else setBad((b) => b + 1)
      }}
    />
  )
}

/** Item number: a whole number, or empty for "no number". */
export function NumberTagField(props: { value: number | undefined; disabled?: boolean; onCommit: (v: number | undefined) => void }) {
  const [bad, setBad] = useState(0)
  return (
    <Field
      key={bad}
      label="No."
      placeholder="–"
      value={props.value === undefined ? '' : String(props.value)}
      disabled={props.disabled}
      onCommit={(t) => {
        const s = t.trim()
        if (!s) return props.onCommit(undefined)
        const n = Number(s)
        if (Number.isInteger(n) && n >= 0) props.onCommit(n)
        else setBad((b) => b + 1)
      }}
    />
  )
}

/** Multi-line remarks: commits on blur or Ctrl+Enter; Esc cancels. */
export function RemarksField(props: {
  value: string
  disabled?: boolean
  label?: string
  rows?: number
  onCommit: (text: string) => void
}) {
  const [text, setText] = useState(props.value)
  useEffect(() => setText(props.value), [props.value])
  const area = (
    <textarea
      className="remarks"
      rows={props.rows ?? 2}
      value={text}
      placeholder="Add a remark…"
      disabled={props.disabled}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => text !== props.value && props.onCommit(text)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) e.currentTarget.blur()
        if (e.key === 'Escape') {
          setText(props.value)
          e.currentTarget.blur()
        }
      }}
    />
  )
  return props.label ? (
    <label className="field">
      <span>{props.label}</span>
      {area}
    </label>
  ) : (
    area
  )
}
