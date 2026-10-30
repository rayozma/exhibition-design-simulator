import type React from 'react'
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
import { fetchRooms, type Room } from '../lib/db'
import { askConfirm, askText } from '../lib/dialogs'
import { parseDesign } from '../lib/design'
import { isImageLink, uploadImage } from '../lib/images'
import { supabase } from '../lib/supabase'
import { loadUser } from '../lib/user'
import { ExhibitorFinder } from './ExhibitorFinder'
import { PRODUCT_TOPICS } from '../data/productFaq'
import { ServiceFaq } from './ServiceFaq'
import { VisitorCheck } from './VisitorCheck'
import { Field, RemarksField } from './fields'
import { Markdown } from './Markdown'
import { ProductCatalog } from './ProductCatalog'
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

/** Team briefing at ?briefing: sections everyone can edit live, a link to the booth in 3D, and a private quiz. */
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

  // Content arrives after the first render: jump to #section once it's there.
  const jumped = useRef(false)
  useEffect(() => {
    if (jumped.current || !sections || !location.hash) return
    // #products/dji-dock-4 = a product in the catalog of section "products"
    const el = document.getElementById(decodeURIComponent(location.hash.slice(1)).split('/')[0])
    if (el) {
      jumped.current = true
      el.scrollIntoView()
    }
  })

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

  // Highlight the section in view in the side navigation.
  const [active, setActive] = useState<string | null>(null)
  useEffect(() => {
    if (!sections?.length) return
    const els = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el)
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((x, y) => x.boundingClientRect.top - y.boundingClientRect.top)[0]
        if (hit) setActive(hit.target.id)
      },
      { rootMargin: '-15% 0px -70% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [sections])

  // On phones the navigation is a horizontal strip: keep the active section in view in it.
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>('.brief-nav')
    const a = nav?.querySelector<HTMLElement>('a.active')
    if (!nav || !a || nav.scrollWidth <= nav.clientWidth) return
    nav.scrollTo({ left: a.offsetLeft - nav.clientWidth / 2 + a.offsetWidth / 2, behavior: 'smooth' })
  }, [active])

  const catalog = sections?.find((s) => CATALOG_LINE.test(s.body))

  const pct = quizTotals.total ? Math.round((quizTotals.right / quizTotals.total) * 100) : 0

  return (
    <div className="guide briefing">
      <div className="brief-top no-print">
        <a href={home()}>← Back to designs</a>
        <div className="brief-top-links">
          <a href="?guide">Simulator guide</a>
          <button onClick={() => window.print()}>Print</button>
        </div>
      </div>

      <header className="brief-hero">
        <div>
          <div className="brief-eyebrow">Terra Drone x NDTCCS x VALSEM · team briefing</div>
          <h1>ADIPEC 2026</h1>
          <p>Everything you need to know before and during the show. Read it, then test yourself at the end of each section.</p>
          <div className="brief-meta">
            <span className="brief-chip">2–5 November 2026</span>
            <span className="brief-chip">ADNEC, Abu Dhabi</span>
            <span className="brief-chip">Our stand: 4210, Hall 4</span>
            <span className="brief-chip">8 AM – 4 PM daily</span>
          </div>
          {catalog && (
            <a className="brief-find no-print" href={`#${catalog.id}`}>
              <span aria-hidden="true">⌕</span> Find a product <kbd>/</kbd>
            </a>
          )}
        </div>
        {quizTotals.total > 0 && (
          <div className="brief-progress no-print">
            <div className="brief-progress-head">
              <span>Your quiz</span>
              <b>
                {quizTotals.right}/{quizTotals.total}
              </b>
            </div>
            <div className="bar">
              <div style={{ width: `${pct}%` }} />
            </div>
            <div className="muted small">
              {pct === 100 ? 'All correct. Well prepared!' : `${pct}% right · answers stay on this device`}
              {Object.keys(answers).length > 0 && (
                <>
                  {' · '}
                  <button className="link" onClick={resetQuiz}>
                    clear
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

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

      <div className="brief-layout">
        {sections && sections.length > 0 && (
          <nav className="brief-nav no-print" aria-label="Sections">
            {sections.map((s, k) => (
              <a key={s.id} href={`#${s.id}`} className={active === s.id ? 'active' : ''}>
                <span className="num">{k + 1}</span>
                {s.title || 'Untitled'}
              </a>
            ))}
            {live && (
              <div className="brief-nav-foot">
                <button className="link small" onClick={() => add(sections.length - 1)}>
                  + Add a section
                </button>
              </div>
            )}
          </nav>
        )}

        <main className="brief-main">
          {sections?.map((s, k) => (
            <section key={s.id} id={s.id}>
              <div className="briefing-head">
                <h2>
                  <span className="sec-num">{k + 1}</span>
                  {s.title || 'Untitled'}
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
                  <Body text={s.body} sectionId={s.id} />
                  <Images images={s.images} title={s.title} />
                  {s.kind === 'booth' && <BoothLink rooms={rooms} chosen={s.room} />}
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
        </main>
      </div>
    </div>
  )
}

/** A line with only [[name]] or [[name:arg]] puts that interactive block there. */
const WIDGETS: Record<string, (arg?: string) => React.ReactNode> = {
  'exhibitor-finder': () => <ExhibitorFinder />,
  'visitor-check': () => <VisitorCheck />,
  'service-faq': (topic) => <ServiceFaq topic={topic} />,
  'product-faq': (id) => <ServiceFaq topic={id} topics={PRODUCT_TOPICS} />,
}
const WIDGET_LINE = /^[ \t]*\[\[((?:exhibitor-finder|visitor-check|service-faq|product-faq)(?::[a-z0-9-]+)?)\]\][ \t]*$/m

/** A line with only [[product-catalog]]: the rest of the section is a searchable product catalog. */
const CATALOG_LINE = /^[ \t]*\[\[product-catalog\]\][ \t]*$/m

/** Section text, with interactive blocks where their marker lines are. */
function Body({ text, sectionId }: { text: string; sectionId?: string }) {
  const catalog = sectionId ? CATALOG_LINE.exec(text) : null
  if (catalog && sectionId) {
    const before = text.slice(0, catalog.index)
    return (
      <>
        {before.trim() && <Body text={before} />}
        <ProductCatalog sectionId={sectionId} text={text.slice(catalog.index + catalog[0].length)} render={(t) => <Body text={t} />} />
      </>
    )
  }
  if (!WIDGET_LINE.test(text)) return <Markdown text={text} />
  // split with a capture group: [text, name, text, name, …, text]
  const parts = text.split(new RegExp(WIDGET_LINE.source, 'gm'))
  return (
    <>
      {parts.map((p, k) =>
        k % 2 ? <div key={k}>{WIDGETS[p.split(':')[0]](p.split(':')[1])}</div> : p.trim() ? <Markdown key={k} text={p} /> : null,
      )}
    </>
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

/** Button to open the booth design in 3D (the one chosen for the section, else the latest ADIPEC design). */
function BoothLink({ rooms, chosen }: { rooms: Room[] | null; chosen: string | null }) {
  const room = rooms ? boothRoom(rooms, chosen) : null
  if (!supabase) return null
  if (!rooms) return <p className="muted small">Loading the booth…</p>
  if (!room) return <p className="muted small">No booth design yet. Create one on the home page.</p>
  return (
    <p className="booth-link">
      <a className="button-link" href={`?room=${room.id}`} target="_blank" rel="noopener">
        Open “{room.name}” in 3D ↗
      </a>
    </p>
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
          <li>
            Picture beside the text below it: a line with only <code>![description](https://…/photo.jpg)</code>. For a picture at the
            end of the section, use <i>Upload images</i> below
          </li>
          <li>
            Video: a line with only a YouTube link, e.g. <code>https://youtu.be/…</code>, or an .mp4 file (a web address, or a file in the app such as <code>briefing/videos/demo.mp4</code>)
          </li>
          <li>
            Exhibitor search box: a line with only <code>[[exhibitor-finder]]</code>; visitor check: <code>[[visitor-check]]</code>; service FAQ: <code>[[service-faq:survey]]</code> (survey, inspection, surveillance, methane, training, selling); product FAQ: <code>[[product-faq:voliro]]</code>
          </li>
          <li>
            Product catalog: a line with only <code>[[product-catalog]]</code>; below it, <code>## Category</code> headings with{' '}
            <code>### Product</code> entries (add <code>(on the booth)</code> to the end of a product heading to mark it). A{' '}
            <code>## Heading</code> with no products under it folds out below the cards
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
