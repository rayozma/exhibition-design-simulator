import { useRef, useState } from 'react'
import type { EditorObject } from '../lib/editor'
import { layouts, type LayoutId } from '../lib/layout'
import { checkGlbFile, MAX_MODEL_MB, measureGlb, uploadGlb, type ModelSize } from '../lib/models'
import type { ObjectOps } from '../lib/useObjectOps'

export type UploadMode = 'attach' | 'new'

type Props = {
  room: string | null
  layoutId: LayoutId
  /** Object selected when the dialog opened (target for "attach"). */
  selected: EditorObject | null
  initialMode: UploadMode
  ops: ObjectOps
  onClose: () => void
}

const cm = (v: number) => Math.max(0.05, Math.round(v * 100) / 100)

/** New object sized to the model, placed in the middle of the booth's main strip. */
function newModelObject(fileName: string, url: string, size: ModelSize, layoutId: LayoutId): EditorObject {
  const r = layouts.options[layoutId].ndtFootprint[0]
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

export function UploadDialog({ room, layoutId, selected, initialMode, ops, onClose }: Props) {
  const target = useRef(selected).current // keep the target even if selection changes
  const canAttach = !!target && !target.locked
  const [mode, setMode] = useState<UploadMode>(canAttach ? initialMode : 'new')
  const [fit, setFit] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [phase, setPhase] = useState<'idle' | 'checking' | 'uploading'>('idle')
  const [progress, setProgress] = useState(0)
  const [fileError, setFileError] = useState<string | null>(null) // blocks Upload until another file is picked
  const [error, setError] = useState<string | null>(null) // upload errors; Upload can be retried
  const busy = phase !== 'idle'

  const pick = async (f: File | null) => {
    setFile(f)
    setError(null)
    setFileError(f ? await checkGlbFile(f) : null)
  }

  const start = async () => {
    if (!file || !room) return
    setError(null)
    setPhase('checking')
    try {
      const problem = await checkGlbFile(file)
      if (problem) throw new Error(problem)
      const size = await measureGlb(file)
      setPhase('uploading')
      setProgress(0)
      const url = await uploadGlb(room, file, setProgress)
      if (mode === 'attach' && target) ops.update(target.id, { modelUrl: url, modelFit: fit })
      else ops.add(newModelObject(file.name, url, size, layoutId))
      onClose()
    } catch (e) {
      setError((e as Error).message)
      setPhase('idle')
    }
  }

  return (
    <div className="overlay">
      <div className="card">
        <h2>Upload 3D model</h2>
        {!room ? (
          <p className="status overlap">Uploading needs Supabase (see .env). It isn't available in local-only mode.</p>
        ) : (
          <>
            <label className="field">
              <span>.glb file, max {MAX_MODEL_MB} MB</span>
              <input
                type="file"
                accept=".glb,model/gltf-binary"
                disabled={busy}
                onChange={(e) => pick(e.target.files?.[0] ?? null)}
              />
            </label>
            {file && (
              <p className="muted small">
                {file.name} — {(file.size / 1024 / 1024).toFixed(1)} MB
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

            {phase === 'checking' && <p className="muted small">Checking file…</p>}
            {phase === 'uploading' && (
              <div className="progress" aria-label="Upload progress">
                <div style={{ width: `${Math.round(progress * 100)}%` }} />
                <span>{Math.round(progress * 100)}%</span>
              </div>
            )}
          </>
        )}

        {(fileError ?? error) && <p className="status overlap">{fileError ?? error}</p>}

        <div className="actions">
          {room && (
            <button className="primary" onClick={start} disabled={!file || busy || !!fileError}>
              {busy ? 'Uploading…' : 'Upload'}
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
