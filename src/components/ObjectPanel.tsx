import { useEffect, useState } from 'react'
import type { EditorObject } from '../lib/editor'
import type { Status } from '../lib/geometry'
import { ROTATE_STEP, type ObjectOps } from '../lib/useObjectOps'

const fmt = (v: number) => String(Math.round(v * 100) / 100)

/** Text input that commits on blur / Enter (so one edit = one undo step). */
function Field(props: {
  label: string
  value: string
  disabled?: boolean
  numeric?: boolean
  onCommit: (text: string) => void
}) {
  const [text, setText] = useState(props.value)
  useEffect(() => setText(props.value), [props.value]) // follow drags / undo

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

function NumberField(props: {
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

const STATUS_TEXT: Record<Status, string | null> = {
  ok: null,
  outside: 'Outside the NDT booth footprint',
  overlap: 'Overlaps another object or a wall',
}

type Props = { obj: EditorObject | null; status: Status; ops: ObjectOps }

export function ObjectPanel({ obj, status, ops }: Props) {
  if (!obj) {
    return (
      <aside className="panel">
        <p className="muted">Click an object to select it.</p>
        <ul className="help">
          <li>Drag: move on the floor</li>
          <li>R / Shift+R: rotate ±{ROTATE_STEP}°</li>
          <li>Delete: delete selected</li>
          <li>Ctrl+Z: undo</li>
          <li>Esc: deselect</li>
        </ul>
      </aside>
    )
  }

  const locked = obj.locked
  const update = (patch: Partial<EditorObject>) => ops.update(obj.id, patch)

  return (
    <aside className="panel" key={obj.id}>
      <Field label="Name" value={obj.name} disabled={locked} onCommit={(name) => update({ name })} />
      {STATUS_TEXT[status] && <p className={`status ${status}`}>{STATUS_TEXT[status]}</p>}

      <h4>Dimensions (m)</h4>
      <div className="row3">
        <NumberField label="W" value={obj.w} min={0.05} disabled={locked} onCommit={(w) => update({ w })} />
        <NumberField label="D" value={obj.d} min={0.05} disabled={locked} onCommit={(d) => update({ d })} />
        <NumberField label="H" value={obj.h} min={0.05} disabled={locked} onCommit={(h) => update({ h })} />
      </div>

      <h4>Position (m)</h4>
      <div className="row3">
        <NumberField label="X" value={obj.x} disabled={locked} onCommit={(x) => update({ x })} />
        <NumberField label="Z" value={obj.z} disabled={locked} onCommit={(z) => update({ z })} />
      </div>

      <h4>Rotation (°)</h4>
      <div className="row3">
        <NumberField label="Y" value={obj.rotY} disabled={locked} onCommit={(rotY) => update({ rotY })} />
        <button disabled={locked} onClick={() => ops.rotate(obj.id, -ROTATE_STEP)} title="Shift+R">
          ⟲ −{ROTATE_STEP}°
        </button>
        <button disabled={locked} onClick={() => ops.rotate(obj.id, ROTATE_STEP)} title="R">
          ⟳ +{ROTATE_STEP}°
        </button>
      </div>

      <div className="actions">
        <button onClick={() => ops.toggleLock(obj.id)}>{locked ? 'Unlock' : 'Lock'}</button>
        <button onClick={() => ops.duplicate(obj.id)}>Duplicate</button>
        <button className="danger" disabled={locked} onClick={() => ops.remove(obj.id)}>
          Delete
        </button>
      </div>
    </aside>
  )
}
