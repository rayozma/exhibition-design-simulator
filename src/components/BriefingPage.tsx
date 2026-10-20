import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_BRIEFING } from '../data/briefing'
import {
  BRIEFING_IMAGES,
  deleteSection,
  fetchBriefing,
  insertSection,
  loadQuizAnswers,
  quizKey,
  saveQuizAnswers,
  seedBriefing,
  sortSections,
  subscribeBriefing,
  updateSection,
  type BriefingSection,
  type QuizItem,
  type SectionPatch,
} from '../lib/briefing'
import { fetchRoom, fetchRooms, type Room } from '../lib/db'
import { askConfirm, askText } from '../lib/dialogs'
import { parseDesign } from '../lib/design'
import type { EditorObject } from '../lib/editor'
import { isImageLink, uploadImage } from '../lib/images'
import { hasInfo } from '../lib/layout'
import { supabase } from '../lib/supabase'
import { loadUser } from '../lib/user'
import { Field, RemarksField } from './fields'
import { Markdown } from './Markdown'
import { Quiz, QuizEditor, usableQuiz } from './Quiz'

const home = () => location.pathname
const me = () => loadUser()?.name ?? 'anon'
const when = (iso?: string) =>
  iso ? new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''

/** The design the booth section lists: the chosen one, else the most recently edited ADIPEC design. */
function boothRoom(rooms: Room[], chosen: string | null): Room | null {
  if (chosen) return rooms.find((r) => r.id === chosen) ?? null
  // Rooms without a design are the original ADIPEC rooms (they get the ADIPEC design on first open).
  return rooms.find((r) => !r.design || /adipec/i.test(parseDesign(r.design)?.event ?? '')) ?? rooms[0] ?? null
}

/** Team briefing at ?briefing: sections everyone can edit live, the booth items, and a private quiz. */
export function BriefingPage() {
  const [sections, setSections] = useState<BriefingSection[] | null>(supabase ? null : DEFAULT_BRIEFING)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [answers, setAnswers] = useState(loadQuizAnswers)
  const [rooms, setRooms] = useState<Room[] | null>(null)
  const live = !!supabase

  useEffect(() => {
    if (!live) return
    let cancelled = false
    ;(async () => {
      try {
        let list = await fetchBriefing()
        if (!list.length) {
          await seedBriefing(DEFAULT_BRIEFING, 'seed')
          list = await fetchBriefing()
        }
        if (!cancelled) setSections(list)
      } catch (e) {
        if (!cancelled) setError((e as Error).message)
      }
    })()
    fetchRooms()
      .then((r) => !cancelled && setRooms(r))
      .catch(() => !cancelled && setRooms([]))
    const off = subscribeBriefing(
      (s) => setSections((list) => list && sortSections([...list.filter((x) => x.id !== s.id), s])),
      (id) => setSections((list) => list && list.filter((x) => x.id !== id)),
    )
    return () => {
      cancelled = true
      off()
    }
  }, [live])

  // Content arrives after the first render: jump to #section / #obj-… once it's there.
  const jumped = useRef(false)
  useEffect(() => {
    if (jumped.current || !sections || !location.hash) return
    const el = document.getElementById(decodeURIComponent(location.hash.slice(1)))
    if (el) {
      jumped.current = true
      el.scrollIntoView()
    } else if (location.hash.startsWith('#obj-') && rooms) {
      jumped.current = true
      document.getElementById('booth')?.scrollIntoView()
    }
  })

  // Printing: open every collapsed FAQ so it's on paper.
  useEffect(() => {
    const open = () => document.querySelectorAll<HTMLDetailsElement>('.briefing .booth-item details').forEach((d) => (d.open = true))
    window.addEventListener('beforeprint', open)
    return () => window.removeEventListener('beforeprint', open)
  }, [])

  const patch = useCallback(async (id: string, p: SectionPatch) => {
    setSections((list) => list && sortSections(list.map((s) => (s.id === id ? { ...s, ...p } : s))))
    try {
      await updateSection(id, p, me())
    } catch (e) {
      setError(`Could not save: ${(e as Error).message}`)
    }
  }, [])

  // Quiz edits apply to the latest list (another person may have changed it meanwhile).
  const latest = useRef(sections)
  latest.current = sections
  const patchQuiz = (id: string, fn: (q: QuizItem[]) => QuizItem[]) => {
    const cur = latest.current?.find((s) => s.id === id)
    if (cur) patch(id, { quiz: fn(cur.quiz) })
  }

  const answer = (key: string, choice: number | null) =>
    setAnswers((a) => {
      const next = { ...a }
      if (choice === null) delete next[key]
      else next[key] = choice
      saveQuizAnswers(next)
      return next
    })

  const add = async (after: number) => {
    if (!sections) return
    const title = (await askText('New section', '', { message: 'Title of the new section', okLabel: 'Add' }))?.trim().slice(0, 120)
    if (!title) return
    const prev = sections[after]
    const next = sections[after + 1]
    const pos = prev ? (next ? (prev.pos + next.pos) / 2 : prev.pos + 10) : (next?.pos ?? 10) - 10
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'section'
    const s: BriefingSection = { id: `${slug}-${Date.now().toString(36)}`, pos, kind: 'text', title, body: '', images: [], quiz: [], room: null }
    setSections(sortSections([...sections, s]))
    setEditing(s.id)
    try {
      await insertSection(s, me())
    } catch (e) {
      setError(`Could not add the section: ${(e as Error).message}`)
    }
  }

  const move = (k: number, dir: -1 | 1) => {
    if (!sections) return
    const a = sections[k]
    const b = sections[k + dir]
    if (!a || !b) return
    patch(a.id, { pos: b.pos })
    patch(b.id, { pos: a.pos })
  }

  const remove = async (s: BriefingSection) => {
    const ok = await askConfirm(`Delete “${s.title || 'Untitled'}”?`, {
      message: 'The section and its quiz are removed for everyone.',
      okLabel: 'Delete',
      danger: true,
    })
    if (!ok) return
    setSections((list) => list && list.filter((x) => x.id !== s.id))
    try {
      await deleteSection(s.id)
    } catch (e) {
      setError(`Could not delete: ${(e as Error).message}`)
    }
  }

  const quizTotals = useMemo(() => {
    let total = 0
    let right = 0
    for (const s of sections ?? [])
      for (const q of usableQuiz(s.quiz)) {
        total++
        if (answers[quizKey(s.id, q)] === q.answer) right++
      }
    return { total, right }
  }, [sections, answers])

  const resetQuiz = async () => {
    if (!(await askConfirm('Clear your quiz answers?', { message: 'Only your own answers in this browser are cleared.', okLabel: 'Clear' }))) return
    setAnswers({})
    saveQuizAnswers({})
  }

  return (
    <div className="guide briefing">
      <header>
        <a className="no-print" href={home()}>
          ← Back to designs
        </a>
        <h1>ADIPEC 2026 team briefing</h1>
        <p className="muted">
          Terra Drone x NDTCCS · everything you need to know before and during the show. Read it, then test yourself at the end of each
          section.
        </p>
        <div className="briefing-tools no-print">
          {quizTotals.total > 0 && (
            <span className={`quiz-score ${quizTotals.right === quizTotals.total ? 'done' : ''}`}>
              Your quiz: {quizTotals.right}/{quizTotals.total} right
            </span>
          )}
          <button onClick={() => window.print()}>Print</button>
          {Object.keys(answers).length > 0 && <button onClick={resetQuiz}>Clear my quiz answers</button>}
          <a href="?guide">Simulator guide</a>
        </div>
      </header>

      {sections && sections.length > 0 && (
        <nav className="guide-toc">
          {sections.map((s, k) => (
            <a key={s.id} href={`#${s.id}`}>
              {k + 1}. {s.title || 'Untitled'}
            </a>
          ))}
        </nav>
      )}

      {error && (
        <p className="status overlap">
          {error}{' '}
          <button className="link" onClick={() => setError(null)}>
            Dismiss
          </button>
        </p>
      )}
      {!live && <p className="status outside">Offline copy: the database is not configured, so the briefing can't be edited here.</p>}
      {!sections && !error && <p className="muted">Loading…</p>}

      {sections?.map((s, k) => (
        <section key={s.id} id={s.id}>
          <div className="briefing-head">
            <h2>
              {k + 1}. {s.title || 'Untitled'}
            </h2>
            {live && (
              <div className="briefing-actions no-print">
                <button className={editing === s.id ? 'active' : ''} onClick={() => setEditing(editing === s.id ? null : s.id)}>
                  {editing === s.id ? 'Done' : 'Edit'}
                </button>
                <button className="link" disabled={k === 0} onClick={() => move(k, -1)} title="Move section up" aria-label="Move section up">
                  ↑
                </button>
                <button
                  className="link"
                  disabled={k === sections.length - 1}
                  onClick={() => move(k, 1)}
                  title="Move section down"
                  aria-label="Move section down"
                >
                  ↓
                </button>
              </div>
            )}
          </div>

          {editing === s.id ? (
            <SectionEditor
              s={s}
              rooms={rooms}
              onPatch={(p) => patch(s.id, p)}
              onQuiz={(fn) => patchQuiz(s.id, fn)}
              onDelete={() => remove(s)}
              onDone={() => setEditing(null)}
            />
          ) : (
            <>
              <Markdown text={s.body} />
              <Images images={s.images} title={s.title} />
              {s.kind === 'booth' && <BoothItems rooms={rooms} chosen={s.room} />}
              <Quiz sectionId={s.id} quiz={s.quiz} answers={answers} onAnswer={answer} />
              {s.updated_by && s.updated_by !== 'seed' && s.updated_at && (
                <p className="muted small no-print">
                  Last edited by {s.updated_by}, {when(s.updated_at)}
                </p>
              )}
            </>
          )}

          {live && (
            <button className="link add-section no-print" onClick={() => add(k)}>
              + Add a section here
            </button>
          )}
        </section>
      ))}

      {live && sections?.length === 0 && (
        <button className="no-print" onClick={() => add(-1)}>
          + Add a section
        </button>
      )}

      <footer className="muted small no-print">
        Everyone with the team PIN can edit this page; changes save automatically and show up live for others. Quiz answers stay
        private, in your browser only.
      </footer>
    </div>
  )
}

function Images({ images, title }: { images: string[]; title: string }) {
  if (!images.length) return null
  return (
    <div className="briefing-images">
      {images.map((src, k) => (
        <a key={`${k}-${src}`} href={src} target="_blank" rel="noopener noreferrer">
          <img src={src} alt={`${title} – image ${k + 1}`} loading="lazy" />
        </a>
      ))}
    </div>
  )
}

/** The numbered items of the booth design, with their info cards, each linking to it in 3D. */
function BoothItems({ rooms, chosen }: { rooms: Room[] | null; chosen: string | null }) {
  const room = rooms ? boothRoom(rooms, chosen) : null
  const [items, setItems] = useState<EditorObject[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!room) return
    let cancelled = false
    setItems(null)
    setError(null)
    const layoutId = parseDesign(room.design)?.layoutId ?? 'B'
    fetchRoom(room.id)
      .then((byLayout) => {
        if (cancelled) return
        const list = (byLayout[layoutId] ?? []).filter((o) => o.num !== undefined || hasInfo(o.info))
        list.sort((a, b) => (a.num ?? 999) - (b.num ?? 999) || a.name.localeCompare(b.name))
        setItems(list)
      })
      .catch((e: Error) => !cancelled && setError(e.message))
    return () => {
      cancelled = true
    }
  }, [room])

  if (!supabase) return <p className="muted small">The booth items show here when the database is configured.</p>
  if (!rooms) return <p className="muted small">Loading the booth…</p>
  if (!room) return <p className="muted small">No booth design yet. Create one on the home page.</p>

  const open3d = `?room=${room.id}`
  return (
    <div className="booth">
      <p className="booth-link">
        <a className="button-link" href={open3d} target="_blank" rel="noopener">
          Open “{room.name}” in 3D ↗
        </a>
      </p>
      {error && <p className="status overlap">Could not load the booth items: {error}</p>}
      {!items && !error && <p className="muted small">Loading the booth items…</p>}
      {items?.length === 0 && <p className="muted small">This design has no numbered items or info cards yet.</p>}
      {items?.map((o) => {
        const info = o.info ?? {}
        const faq = (info.faq ?? []).filter((f) => f.q.trim())
        return (
          <article key={o.id} id={`obj-${o.id}`} className="booth-item">
            <h3>
              {o.num !== undefined && <span className="booth-num">{o.num}</span>}
              {info.title?.trim() || o.name}
            </h3>
            {info.title?.trim() && info.title.trim() !== o.name && <p className="muted small">On the booth: {o.name}</p>}
            {!!info.images?.length && <Images images={info.images} title={info.title?.trim() || o.name} />}
            {info.description?.trim() && <p className="pre">{info.description.trim()}</p>}
            {info.why?.trim() && (
              <div className="info-why">
                <h4>Why it&apos;s useful for visitors</h4>
                <p className="pre">{info.why.trim()}</p>
              </div>
            )}
            {faq.length > 0 && (
              <div className="info-faq">
                <h4>FAQ</h4>
                {faq.map((f, k) => (
                  <details key={k}>
                    <summary>{f.q}</summary>
                    <p className="pre">{f.a}</p>
                  </details>
                ))}
              </div>
            )}
            <p className="booth-item-links no-print">
              <a href={`${open3d}&focus=${encodeURIComponent(o.id)}`} target="_blank" rel="noopener">
                Show in 3D ↗
              </a>
              {info.link?.trim() && (
                <a href={info.link.trim()} target="_blank" rel="noopener noreferrer">
                  Learn more ↗
                </a>
              )}
            </p>
          </article>
        )
      })}
    </div>
  )
}

type EditorProps = {
  s: BriefingSection
  rooms: Room[] | null
  onPatch: (p: SectionPatch) => void
  onQuiz: (fn: (q: QuizItem[]) => QuizItem[]) => void
  onDelete: () => void
  onDone: () => void
}

function SectionEditor({ s, rooms, onPatch, onQuiz, onDelete, onDone }: EditorProps) {
  const [upload, setUpload] = useState<{ done: number; total: number; progress: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const images = useRef(s.images)
  images.current = s.images

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setError(null)
    const list = [...files]
    const added: string[] = []
    for (let k = 0; k < list.length; k++) {
      setUpload({ done: k, total: list.length, progress: 0 })
      try {
        added.push(await uploadImage(BRIEFING_IMAGES, list[k], (p) => setUpload({ done: k, total: list.length, progress: p })))
      } catch (e) {
        setError(`${list[k].name}: ${(e as Error).message}`)
      }
    }
    setUpload(null)
    if (added.length) onPatch({ images: [...images.current, ...added] })
    if (fileInput.current) fileInput.current.value = ''
  }

  const addLink = async () => {
    const url = await askText('Add image link', 'https://', { message: 'Web address of an image (ending in .jpg, .png, …)', okLabel: 'Add' })
    if (!url) return
    if (!isImageLink(url)) return setError('That is not a web address (it should start with https://).')
    setError(null)
    onPatch({ images: [...s.images, url.trim()] })
  }

  const moveImage = (k: number, dir: -1 | 1) => {
    const next = [...s.images]
    const [it] = next.splice(k, 1)
    next.splice(k + dir, 0, it)
    onPatch({ images: next })
  }

  return (
    <div className="briefing-editor">
      <Field label="Title" value={s.title} onCommit={(title) => onPatch({ title: title.trim().slice(0, 120) })} />
      <RemarksField label="Text" rows={18} value={s.body} placeholder="Write the section…" onCommit={(body) => onPatch({ body })} />
      <details className="muted small">
        <summary>Formatting help</summary>
        <ul>
          <li>
            <code>### Heading</code> · <code>**bold**</code> · <code>*italic*</code> · <code>&gt; highlighted note</code>
          </li>
          <li>
            <code>- item</code> or <code>1. item</code>; indent with 2 spaces for a sub-item
          </li>
          <li>
            Link: <code>[label](https://…)</code>. A link still to be added: <code>[label]()</code> (shown grey). Another section:{' '}
            <code>[label](#who)</code>
          </li>
          <li>
            Table: <code>| A | B |</code> lines, the first one is the header
          </li>
        </ul>
      </details>

      {s.kind === 'booth' && (
        <label className="field">
          <span>Booth design to list</span>
          <select className="dialog-input" value={s.room ?? ''} onChange={(e) => onPatch({ room: e.target.value || null })}>
            <option value="">Automatic: the latest edited ADIPEC design</option>
            {rooms?.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="field">
        <span>Images{s.images.length ? ` (${s.images.length})` : ''}</span>
        {s.images.length > 0 && (
          <div className="info-edit-images">
            {s.images.map((src, k) => (
              <div key={`${k}-${src}`} className="info-edit-thumb">
                <img src={src} alt="" />
                <div>
                  <button className="link" disabled={k === 0} onClick={() => moveImage(k, -1)} aria-label="Move earlier" title="Move earlier">
                    ‹
                  </button>
                  <button className="link" disabled={k === s.images.length - 1} onClick={() => moveImage(k, 1)} aria-label="Move later" title="Move later">
                    ›
                  </button>
                  <button className="link" onClick={() => onPatch({ images: s.images.filter((_, j) => j !== k) })} aria-label="Remove image" title="Remove">
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="actions tight">
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden onChange={(e) => onFiles(e.target.files)} />
          <button disabled={!!upload} onClick={() => fileInput.current?.click()}>
            Upload images…
          </button>
          <button onClick={addLink}>Add image link…</button>
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

      <QuizEditor quiz={s.quiz} onChange={onQuiz} />

      <div className="actions">
        <button className="primary" onClick={onDone}>
          Done
        </button>
        {s.kind !== 'booth' && (
          <button className="danger" onClick={onDelete}>
            Delete section
          </button>
        )}
      </div>
    </div>
  )
}
