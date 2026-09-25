import { useRef, useState } from 'react'
import type { EditorObject } from '../lib/editor'
import type { Design } from '../lib/design'
import { useDesign } from '../lib/DesignContext'
import { MAX_MODEL_MB, measureGlb, prepareModel, uploadGlb, type ModelSize } from '../lib/models'
import type { ObjectOps } from '../lib/useObjectOps'

export type UploadMode = 'attach' | 'new'

type Props = {
  room: string | null
  /** Object selected when the dialog opened (target for "attach"). */
  selected: EditorObject | null
  initialMode: UploadMode
  ops: ObjectOps
  onClose: () => void
}

type Prepared = { glb: File; size: ModelSize; warning: string | null; converted: boolean }

const cm = (v: number) => Math.max(0.05, Math.round(v * 100) / 100)
const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`

/** New object sized to the model, placed in the middle of the booth (or the hall if there is no booth). */
function newModelObject(fileName: string, url: string, size: ModelSize, design: Design): EditorObject {
  const r = design.booth.footprint[0] ?? { x: 0, z: 0, w: design.hall.w, d: design.hall.d }
  return {
    id: `model-${crypto.randomUUID().slice(0, 8)}`,
    name: fileName.replace(/\.glb$/i, ''),
    category: 'model',
    x: r.x + r.w / 2,
    z: r.z + r.d / 2,
    w: cm(size.w),
    d: cm(size.d),
    h: cm(size.h),
    rotY: 0,
    locked: false,
    modelUrl: url,
    modelFit: true,
  }
}

export function UploadDialog({ room, selected, initialMode, ops, onClose }: Props) {
  const design = useDesign()
  const target = useRef(selected).current // keep the target even if selection changes
  const canAttach = !!target && !target.locked
  const [mode, setMode] = useState<UploadMode>(canAttach ? initialMode : 'new')
  const [fit, setFit] = useState(true)
  const [prepared, setPrepared] = useState<Prepared | null>(null)
  const [phase, setPhase] = useState<'idle' | 'preparing' | 'uploading'>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const busy = phase !== 'idle'

  /** Check, convert (OBJ) and measure right away, so problems show before uploading. */
  const pick = async (list: FileList | null) => {
    const files = list ? [...list] : []
    setPrepared(null)
    setError(null)
    if (!files.length) return
    setPhase('preparing')
    try {
      const { glb, warning } = await prepareModel(files)
      const size = await measureGlb(glb)
      setPrepared({ glb, size, warning, converted: !files.some((f) => f === glb) })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setPhase('idle')
    }
  }

  const start = async () => {
    if (!prepared || !room) return
    setError(null)
    setPhase('uploading')
    setProgress(0)
    try {
      const url = await uploadGlb(room, prepared.glb, setProgress)
      if (mode === 'attach' && target) ops.update(target.id, { modelUrl: url, modelFit: fit })
      else ops.add(newModelObject(prepared.glb.name, url, prepared.size, design))
      onClose()
    } catch (e) {
      setError((e as Error).message) // Upload stays enabled so it can be retried
      setPhase('idle')
    }
  }

  const s = prepared?.size
  return (
    <div className="overlay">
      <div className="card">
        <h2>Upload 3D model</h2>
        {!room ? (
          <p className="status overlap">Uploading needs Supabase (see .env). It isn't available in local-only mode.</p>
        ) : (
          <>
            <label className="field">
              <span>
                .glb file (max {MAX_MODEL_MB} MB), or .obj + its .mtl and texture images — Ctrl+click to pick several
              </span>
              <input
                type="file"
                multiple
                accept=".glb,.obj,.mtl,.png,.jpg,.jpeg,.bmp,.tga,.webp"
                disabled={busy}
                onChange={(e) => pick(e.target.files)}
              />
            </label>
            {phase === 'preparing' && <p className="muted small">Checking file…</p>}
            {prepared && s && (
              <p className="muted small">
                {prepared.converted ? `Converted to ${prepared.glb.name}` : prepared.glb.name} — {mb(prepared.glb.size)}
                , model size {cm(s.w)} × {cm(s.d)} × {cm(s.h)} m
              </p>
            )}
            {prepared?.warning && <p className="status outside">{prepared.warning}</p>}
            {s && Math.max(s.w, s.d, s.h) > 20 && (
              <p className="status outside">
                The model is over 20 m — it was probably exported in centimeters or millimeters. Use auto-scale, or
                correct W/D/H after adding it.
              </p>
            )}

            <div className="field">
              <label className="radio">
                <input
                  type="radio"
                  checked={mode === 'attach'}
                  disabled={!canAttach || busy}
                  onChange={() => setMode('attach')}
                />
                Attach to selected object
                {target ? `: ${target.name.split(/ – | \(/)[0]}` : ' (select one first)'}
                {target?.locked ? ' — locked' : ''}
              </label>
              <label className="radio">
                <input type="radio" checked={mode === 'new'} disabled={busy} onChange={() => setMode('new')} />
                Add as a new object (sized to the model)
              </label>
            </div>

            {mode === 'attach' && target && (
              <label className="radio">
                <input type="checkbox" checked={fit} disabled={busy} onChange={(e) => setFit(e.target.checked)} />
                Auto-scale model to fit {target.w} × {target.d} × {target.h} m
              </label>
            )}

            {phase === 'uploading' && (
              <div className="progress" aria-label="Upload progress">
                <div style={{ width: `${Math.round(progress * 100)}%` }} />
                <span>{Math.round(progress * 100)}%</span>
              </div>
            )}
          </>
        )}

        {error && <p className="status overlap">{error}</p>}

        <div className="actions">
          {room && (
            <button className="primary" onClick={start} disabled={!prepared || busy}>
              {phase === 'uploading' ? 'Uploading…' : 'Upload'}
            </button>
          )}
          <button onClick={onClose} disabled={busy}>
            {room ? 'Cancel' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  )
}
