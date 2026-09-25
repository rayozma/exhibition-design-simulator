import { useState } from 'react'
import { combinable } from '../lib/composite'
import { LIBRARY_CHANGED, saveLibraryItem, toTemplate } from '../lib/db'
import { askText } from '../lib/dialogs'
import type { EditorObject } from '../lib/editor'
import type { Status } from '../lib/geometry'
import type { ShapeKind } from '../lib/layout'
import { ROTATE_STEP, type ObjectOps } from '../lib/useObjectOps'
import { baseColorOf } from '../scene/SceneObject'
import { Field, NumberField, NumberTagField, RemarksField } from './fields'

const SHAPES: [ShapeKind, string][] = [
  ['box', 'Box'],
  ['cylinder', 'Cylinder'],
  ['sphere', 'Sphere'],
  ['cone', 'Cone'],
  ['wedge', 'Ramp'],
  ['panel', 'Panel'],
  ['sign', 'Sign'],
]

const STATUS_TEXT: Record<Status, string | null> = {
  ok: null,
  outside: 'Outside the NDT booth footprint',
  overlap: 'Overlaps another object or a wall',
}

type Props = {
  /** Selected objects (0, 1 or more). */
  objs: EditorObject[]
  statuses: Map<string, Status>
  /** Other user dragging an object, by object id. */
  busyBy: (id: string) => string | null
  ops: ObjectOps
  /** Open the upload dialog (attaches to the selected object, or adds a new one); undefined = uploads unavailable. */
  onUpload?: () => void
  /** Who saves to the shared library; undefined = library unavailable (local-only mode). */
  libraryBy?: string
}

/** "Save to library…": asks for a name, saves the object as a reusable template for all designs. */
function SaveToLibrary({ obj, by }: { obj: EditorObject; by: string }) {
  const [state, setState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [error, setError] = useState<string | null>(null)
  const save = async () => {
    const name = (await askText('Save to library', obj.name, { message: 'Name in the library (shared by all designs)', okLabel: 'Save' }))?.slice(0, 80)
    if (!name) return
    setState('saving')
    setError(null)
    try {
      await saveLibraryItem(name, { ...toTemplate(obj), name }, by)
      window.dispatchEvent(new Event(LIBRARY_CHANGED))
      setState('saved')
      setTimeout(() => setState('idle'), 2000)
    } catch (e) {
      setError((e as Error).message)
      setState('idle')
    }
  }
  return (
    <>
      <button onClick={save} disabled={state === 'saving'} title="Reuse this object in any design: + Add → Your library">
        {state === 'saved' ? 'Saved to library ✓' : state === 'saving' ? 'Saving…' : 'Save to library…'}
      </button>
      {error && <p className="status overlap">{error}</p>}
    </>
  )
}

function Help({ onUpload }: { onUpload?: () => void }) {
  return (
    <>
      <p className="muted">Click an object to select it. Ctrl/Shift+click to select several. Add new things in the + Add tab.</p>
      <ul className="help">
        <li>Drag: move (drags the whole selection)</li>
        <li>R / Shift+R: rotate ±{ROTATE_STEP}°</li>
        <li>Delete: delete selected</li>
        <li>Ctrl+Z: undo</li>
        <li>Esc: deselect</li>
      </ul>
      {onUpload && (
        <button className="block" onClick={onUpload}>
          Upload .glb / .obj as new object…
        </button>
      )}
    </>
  )
}

/** Several objects selected: shared actions. */
function MultiPanel({ objs, ops }: { objs: EditorObject[]; ops: ObjectOps }) {
  const ids = objs.map((o) => o.id)
  const parts = objs.filter((o) => combinable(o) && !o.locked)
  const combineNow = async () => {
    const name = await askText('Combine into one object', 'Custom object', { message: 'Name for the combined object', okLabel: 'Combine' })
    if (name) ops.combine(ids, name.slice(0, 80))
  }
  const allLocked = objs.every((o) => o.locked)
  return (
    <>
      <h4>{objs.length} objects selected</h4>
      <ul className="help">
        {objs.map((o) => (
          <li key={o.id}>
            {o.num !== undefined ? `${o.num}. ` : ''}
            {o.name}
            {o.locked ? ' (locked)' : ''}
          </li>
        ))}
      </ul>
      <p className="muted small">Drag any of them to move them together. Locked objects stay put.</p>

      <button
        className="primary block"
        disabled={parts.length < 2}
        onClick={combineNow}
        title="Merge them into one object that moves, rotates and resizes as a unit"
      >
        Combine into one object
      </button>
      {parts.length < objs.length && (
        <p className="muted small">Locked objects and uploaded 3D files are left out of combining.</p>
      )}

      <h4>Rotate around their center</h4>
      <div className="actions tight">
        <button onClick={() => ops.rotate(ids, -ROTATE_STEP)} title="Shift+R">
          ⟲ −{ROTATE_STEP}°
        </button>
        <button onClick={() => ops.rotate(ids, ROTATE_STEP)} title="R">
          ⟳ +{ROTATE_STEP}°
        </button>
      </div>

      <h4>Color for all</h4>
      <div className="color-row">
        <input type="color" value={baseColorOf(objs[0])} onChange={(e) => ops.updateMany(ids, { color: e.target.value })} />
        <button onClick={() => ops.updateMany(ids, { color: undefined })}>Reset colors</button>
      </div>

      <div className="actions">
        <button onClick={() => ops.toggleLock(ids)}>{allLocked ? 'Unlock all' : 'Lock all'}</button>
        <button onClick={() => ops.duplicate(ids)}>Duplicate</button>
        <button className="danger" onClick={() => ops.remove(ids)}>
          Delete
        </button>
      </div>
    </>
  )
}

/** One object selected: every property, editable. */
function SinglePanel({
  obj,
  status,
  busyBy,
  ops,
  onUpload,
  libraryBy,
}: {
  obj: EditorObject
  status: Status
  busyBy: string | null
  ops: ObjectOps
  onUpload?: () => void
  libraryBy?: string
}) {
  const locked = obj.locked || !!busyBy
  const update = (patch: Partial<EditorObject>) => ops.update(obj.id, patch)
  const ids = [obj.id]

  return (
    <div key={obj.id}>
      <div className="row-name">
        <NumberTagField value={obj.num} disabled={locked} onCommit={(num) => update({ num })} />
        <Field label="Name" value={obj.name} disabled={locked} onCommit={(name) => update({ name })} />
      </div>
      {busyBy && <p className="status busy">Being moved by {busyBy}</p>}
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
        <NumberField label="Lift" value={obj.elev ?? 0} min={0} disabled={locked} onCommit={(elev) => update({ elev: elev || undefined })} />
      </div>

      <h4>Rotation (°)</h4>
      <div className="row3">
        <NumberField label="Y" value={obj.rotY} disabled={locked} onCommit={(rotY) => update({ rotY })} />
        <button disabled={locked} onClick={() => ops.rotate(ids, -ROTATE_STEP)} title="Shift+R">
          ⟲ −{ROTATE_STEP}°
        </button>
        <button disabled={locked} onClick={() => ops.rotate(ids, ROTATE_STEP)} title="R">
          ⟳ +{ROTATE_STEP}°
        </button>
      </div>

      {obj.category === 'shape' && (
        <>
          <h4>Shape</h4>
          <div className="shape-switch">
            {SHAPES.map(([shape, label]) => (
              <button key={shape} className={(obj.shape ?? 'box') === shape ? 'active' : ''} disabled={locked} onClick={() => update({ shape })}>
                {label}
              </button>
            ))}
          </div>
          {obj.shape === 'sign' && (
            <Field label="Sign text" value={obj.text ?? ''} disabled={locked} onCommit={(text) => update({ text })} />
          )}
        </>
      )}

      <label className="radio" title="In the crowd simulation, booth visitors walk to and stop at objects marked like this">
        <input
          type="checkbox"
          checked={!!obj.attraction}
          disabled={locked}
          onChange={(e) => update({ attraction: e.target.checked || undefined })}
        />
        Visitors stop here (crowd)
      </label>

      <h4>Remarks</h4>
      <RemarksField value={obj.note ?? ''} rows={3} disabled={!!busyBy} onCommit={(t) => ops.annotate(obj.id, t)} />

      {!obj.parts && (
        <>
      <h4>Color</h4>
      <div className="color-row">
        <input
          type="color"
          value={baseColorOf(obj)}
          disabled={locked}
          onChange={(e) => update({ color: e.target.value })}
          title="Main color of the built-in model (uploaded models keep their own materials)"
        />
        <span className="muted small">{obj.color ?? `default${obj.material ? ` (${obj.material})` : ''}`}</span>
        {obj.color && (
          <button disabled={locked} onClick={() => update({ color: undefined })}>
            Reset
          </button>
        )}
      </div>

        </>
      )}

      {obj.parts && (
        <>
          <h4>Combined object · {obj.parts.items.length} parts</h4>
          <button disabled={locked} onClick={() => ops.breakApart(obj.id)} title="Turn it back into separate objects">
            Break apart
          </button>
        </>
      )}

      {!obj.parts && <h4>3D model</h4>}
      {obj.parts ? null : obj.modelUrl ? (
        <>
          <label className="radio">
            <input
              type="checkbox"
              checked={obj.modelFit ?? true}
              disabled={locked}
              onChange={(e) => update({ modelFit: e.target.checked })}
            />
            Auto-scale to W × D × H
          </label>
          <div className="actions tight">
            {onUpload && (
              <button disabled={locked} onClick={onUpload}>
                Replace…
              </button>
            )}
            <button disabled={locked} onClick={() => update({ modelUrl: null })}>
              Remove model
            </button>
          </div>
        </>
      ) : onUpload ? (
        <button disabled={locked} onClick={onUpload}>
          Attach .glb / .obj model…
        </button>
      ) : (
        <p className="muted small">Model upload needs Supabase.</p>
      )}

      <div className="actions">
        <button disabled={!!busyBy} onClick={() => ops.toggleLock(ids)}>
          {obj.locked ? 'Unlock' : 'Lock'}
        </button>
        <button onClick={() => ops.duplicate(ids)}>Duplicate</button>
        <button className="danger" disabled={locked} onClick={() => ops.remove(ids)}>
          Delete
        </button>
      </div>
      {libraryBy && (
        <div className="actions tight">
          <SaveToLibrary obj={obj} by={libraryBy} />
        </div>
      )}
    </div>
  )
}

/** "Selected" tab: help (nothing selected), one object's properties, or actions for several. */
export function ObjectPanel({ objs, statuses, busyBy, ops, onUpload, libraryBy }: Props) {
  if (!objs.length) return <Help onUpload={onUpload} />
  if (objs.length > 1) return <MultiPanel objs={objs} ops={ops} />
  const obj = objs[0]
  return (
    <SinglePanel
      obj={obj}
      status={statuses.get(obj.id) ?? 'ok'}
      busyBy={busyBy(obj.id)}
      ops={ops}
      onUpload={onUpload}
      libraryBy={libraryBy}
    />
  )
}
