import { useRef, useState } from 'react'
import { askText } from '../lib/dialogs'
import type { EditorObject } from '../lib/editor'
import { isImageLink, uploadImage } from '../lib/images'
import { hasInfo, type ObjectInfo } from '../lib/layout'
import type { ObjectOps } from '../lib/useObjectOps'
import { FaqEditor } from './FaqEditor'
import { Field, RemarksField } from './fields'

type Props = {
  obj: EditorObject
  ops: ObjectOps
  /** Uploads need a room (Supabase); null = paste links only. */
  room: string | null
  disabled: boolean
  onPreview: () => void
}

/** "Info card" section of the Selected tab: what visitors see when they open the object\x27s ⓘ. */
export function InfoEditor({ obj, ops, room, disabled, onPreview }: Props) {
  const info: ObjectInfo = obj.info ?? {}
  const [open, setOpen] = useState(hasInfo(obj.info))
  const [upload, setUpload] = useState<{ done: number; total: number; progress: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const set = (patch: Partial<ObjectInfo>) => ops.patchInfo(obj.id, (cur) => ({ ...cur, ...patch }))
  const images = info.images ?? []

  const onFiles = async (files: FileList | null) => {
    if (!files?.length || !room) return
    setError(null)
    const list = [...files]
    const added: string[] = []
    for (let k = 0; k < list.length; k++) {
      setUpload({ done: k, total: list.length, progress: 0 })
      try {
        added.push(await uploadImage(room, list[k], (p) => setUpload({ done: k, total: list.length, progress: p })))
      } catch (e) {
        setError(`${list[k].name}: ${(e as Error).message}`)
      }
    }
    setUpload(null)
    // Append to the latest card: it may have been edited while uploading.
    if (added.length) ops.patchInfo(obj.id, (cur) => ({ ...cur, images: [...(cur.images ?? []), ...added] }))
    if (fileInput.current) fileInput.current.value = ''
  }

  const addLink = async () => {
    const url = await askText('Add image link', 'https://', { message: 'Web address of an image (ending in .jpg, .png, …)', okLabel: 'Add' })
    if (!url) return
    if (!isImageLink(url)) {
      setError('That is not a web address (it should start with https://).')
      return
    }
    setError(null)
    set({ images: [...images, url] })
  }

  const move = (k: number, dir: -1 | 1) => {
    const next = [...images]
    const [it] = next.splice(k, 1)
    next.splice(k + dir, 0, it)
    set({ images: next })
  }

  if (!open) {
    return (
      <>
        <h4>Info card</h4>
        <p className="muted small">What visitors see when they click this object&apos;s ⓘ.</p>
        <button disabled={disabled} onClick={() => setOpen(true)}>
          Add info card…
        </button>
      </>
    )
  }

  return (
    <>
      <h4>Info card (ⓘ)</h4>
      <Field label="Title" value={info.title ?? ''} placeholder={obj.name} disabled={disabled} onCommit={(title) => set({ title })} />
      <RemarksField
        label="Description"
        rows={4}
        value={info.description ?? ''}
        placeholder="What is it? What does it do?"
        disabled={disabled}
        onCommit={(description) => set({ description })}
      />
      <RemarksField
        label="Why it's useful for visitors"
        rows={3}
        value={info.why ?? ''}
        placeholder="The benefit for them, in a sentence or two"
        disabled={disabled}
        onCommit={(why) => set({ why })}
      />
      <Field label="Learn more link" value={info.link ?? ''} placeholder="https://…" disabled={disabled} onCommit={(link) => set({ link: link.trim() })} />

      <div className="field">
        <span>Images{images.length ? ` (${images.length})` : ''}</span>
        {images.length > 0 && (
          <div className="info-edit-images">
            {images.map((src, k) => (
              <div key={`${k}-${src}`} className="info-edit-thumb">
                <img src={src} alt="" />
                <div>
                  <button className="link" disabled={disabled || k === 0} onClick={() => move(k, -1)} aria-label="Move earlier" title="Move earlier">
                    ‹
                  </button>
                  <button className="link" disabled={disabled || k === images.length - 1} onClick={() => move(k, 1)} aria-label="Move later" title="Move later">
                    ›
                  </button>
                  <button className="link" disabled={disabled} onClick={() => set({ images: images.filter((_, j) => j !== k) })} aria-label="Remove image" title="Remove">
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="actions tight">
          {room && (
            <>
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                hidden
                onChange={(e) => onFiles(e.target.files)}
              />
              <button disabled={disabled || !!upload} onClick={() => fileInput.current?.click()}>
                Upload images…
              </button>
            </>
          )}
          <button disabled={disabled} onClick={addLink}>
            Add image link…
          </button>
        </div>
        {upload && (
          <div className="progress" aria-label="Upload progress">
            <div style={{ width: `${Math.round(((upload.done + upload.progress) / upload.total) * 100)}%` }} />
            <span>
              Uploading {upload.done + 1} of {upload.total}…
            </span>
          </div>
        )}
      </div>
      {error && <p className="status overlap">{error}</p>}

      <FaqEditor
        faq={info.faq ?? []}
        disabled={disabled}
        onChange={(fn) => ops.patchInfo(obj.id, (cur) => ({ ...cur, faq: fn(cur.faq ?? []) }))}
      />

      <div className="actions tight">
        <button className="primary" onClick={onPreview} disabled={!hasInfo(obj.info)}>
          Preview ⓘ
        </button>
        <button
          className="danger"
          disabled={disabled}
          onClick={() => {
            ops.setInfo(obj.id, {})
            setOpen(false)
          }}
        >
          Remove card
        </button>
      </div>
    </>
  )
}
