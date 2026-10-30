import type React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { PRODUCT_TOPICS } from '../data/productFaq'
import { imageSrc } from './Markdown'

/**
 * Product catalog for a briefing section: the text after its [[product-catalog]] line, as
 * "## Category" groups of "### Product" entries, shown as searchable cards; a product opens on its own
 * (link: #<section>/<product>). "(on the booth)" at the end of a product heading marks it as on the stand.
 * A "## Group" with no products under it is shown as a fold-out block below the cards.
 */
export type Product = {
  id: string
  title: string
  group: string
  booth: boolean
  body: string
  image: { src: string; alt: string } | null
  summary: string
  video: boolean
  /** Plain text of the product and its visitor FAQ, for search snippets. */
  text: string
  haystack: string
}

type Extra = { title: string; body: string }

const BOOTH = /\s*\(on the booth\)\s*$/i
const IMAGE = /^\s*!\[([^\]]*)\]\((\S+)\)\s*$/
const VIDEO = /^\s*(?:https?:\/\/(?:www\.|m\.)?(?:youtube\.com|youtu\.be)\/\S+|\S+\.(?:mp4|webm)(?:[?#]\S*)?)\s*$/i
const FAQ = /^\s*\[\[product-faq:([a-z0-9-]+)\]\]\s*$/gm
const GENERIC_FAQ = new Set(['price', 'other', 'permits'])

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'product'

/** Markdown to plain text, for card summaries and search. */
const plain = (s: string) =>
  s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[\[[^\]]*\]\]/g, '')
    .replace(/[*`>#|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

/** Card line from the first bullet; "**Name** (tagline): what it is" becomes just "What it is". */
function summarize(bullet: string, title: string) {
  const m = /^\*\*(.+?)\*\*[^:]*:\s*(.+)$/.exec(bullet)
  if (!m || !plain(m[1]).toLowerCase().includes(title.toLowerCase())) return plain(bullet)
  const rest = plain(m[2])
  return rest.charAt(0).toUpperCase() + rest.slice(1)
}

/** What the visitor FAQs in a product's text say, so a search finds answers too. */
function faqText(body: string) {
  const out: string[] = []
  for (const [, id] of body.matchAll(FAQ)) {
    for (const q of PRODUCT_TOPICS.find((t) => t.id === id)?.questions ?? []) {
      if (GENERIC_FAQ.has(q.id) || !q.answer) continue
      out.push(q.q, q.answer.say, ...(q.answer.facts ?? []))
    }
  }
  return out.join(' ')
}

export function parseCatalog(text: string): { products: Product[]; extras: Extra[] } {
  const products: Product[] = []
  const extras: Extra[] = []
  let group = ''
  let groupLines: string[] = []
  let groupHasProducts = false
  let cur: { title: string; lines: string[] } | null = null

  const endProduct = () => {
    if (!cur) return
    const body = cur.lines.join('\n').trim()
    const booth = BOOTH.test(cur.title)
    const title = cur.title.replace(BOOTH, '').trim()
    const img = cur.lines.map((l) => IMAGE.exec(l)).find(Boolean)
    const src = img && imageSrc(img[2])
    const first = cur.lines.find((l) => /^[-*]\s+/.test(l))
    const all = `${plain(body)} ${faqText(body)}`
    let id = slug(title)
    while (products.some((p) => p.id === id)) id += '-2'
    products.push({
      id,
      title,
      group,
      booth,
      body,
      image: src ? { src, alt: img[1] } : null,
      summary: first ? summarize(first.replace(/^[-*]\s+/, ''), title) : '',
      video: cur.lines.some((l) => VIDEO.test(l)),
      text: all,
      haystack: `${title} ${group} ${all}`.toLowerCase(),
    })
    cur = null
  }
  const endGroup = () => {
    endProduct()
    const body = groupLines.join('\n').trim()
    if (group && !groupHasProducts && body) extras.push({ title: group, body })
    groupLines = []
    groupHasProducts = false
  }

  for (const line of text.replace(/\r\n?/g, '\n').split('\n')) {
    const g = /^##\s+(.+)$/.exec(line)
    const p = /^###\s+(.+)$/.exec(line)
    if (g) {
      endGroup()
      group = g[1].trim()
    } else if (p) {
      endProduct()
      groupHasProducts = true
      cur = { title: p[1].trim(), lines: [] }
    } else if (cur) cur.lines.push(line)
    else groupLines.push(line)
  }
  endGroup()
  return { products, extras }
}

const BOOTH_FILTER = '\u0000booth'

type Props = {
  sectionId: string
  text: string
  /** Renders a product's text (markdown with widgets). */
  render: (text: string) => React.ReactNode
}

export function ProductCatalog({ sectionId, text, render }: Props) {
  const { products, extras } = useMemo(() => parseCatalog(text), [text])
  const groups = useMemo(() => [...new Set(products.map((p) => p.group).filter(Boolean))], [products])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const search = useRef<HTMLInputElement>(null)

  // The open product follows the address (#products/dji-dock-4), so links, Back and sharing work.
  useEffect(() => {
    const sync = () => {
      const [sec, id] = decodeURIComponent(location.hash.slice(1)).split('/')
      if (sec !== sectionId) return
      setOpenId(id || null)
      if (id) root.current?.scrollIntoView({ block: 'start' })
      else if (location.hash.slice(1) === sectionId) search.current?.focus({ preventScroll: true })
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [sectionId])

  // "/" jumps to the product search from anywhere on the page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (e.key !== '/' || e.ctrlKey || e.metaKey || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable) return
      e.preventDefault()
      if (openId) location.hash = sectionId
      root.current?.scrollIntoView({ block: 'start' })
      search.current?.focus({ preventScroll: true })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openId, sectionId])

  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  const shown = useMemo(() => {
    const inFilter = products.filter((p) => !filter || (filter === BOOTH_FILTER ? p.booth : p.group === filter))
    if (!words.length) return inFilter
    const hits = inFilter.filter((p) => words.every((w) => p.haystack.includes(w)))
    // Name matches first
    const inTitle = (p: Product) => words.some((w) => p.title.toLowerCase().includes(w))
    return [...hits.filter(inTitle), ...hits.filter((p) => !inTitle(p))]
  }, [products, filter, words.join(' ')]) // eslint-disable-line react-hooks/exhaustive-deps

  const open = products.find((p) => p.id === openId) ?? null
  const href = (p: Product) => `#${sectionId}/${p.id}`

  if (!products.length) return null

  if (open) {
    const list = shown.includes(open) ? shown : products
    const k = list.indexOf(open)
    const prev = list[k - 1]
    const next = list[k + 1]
    return (
      <div className="pc" ref={root}>
        <div className="pc-detail-bar no-print">
          <a className="pc-back" href={`#${sectionId}`}>
            ← All products
          </a>
          <span className="pc-crumb muted small">
            {open.group && <>{open.group} › </>}
            {open.title}
          </span>
          <span className="pc-step">
            {prev ? (
              <a href={href(prev)} title={prev.title}>
                ‹ Previous
              </a>
            ) : (
              <span className="muted">‹ Previous</span>
            )}
            <span className="muted small">
              {k + 1} / {list.length}
            </span>
            {next ? (
              <a href={href(next)} title={next.title}>
                Next ›
              </a>
            ) : (
              <span className="muted">Next ›</span>
            )}
          </span>
        </div>
        <article className="pc-detail">
          <h3 className="pc-detail-title">
            {open.title}
            {open.booth && <span className="pc-badge booth">On the booth</span>}
          </h3>
          {render(open.body)}
        </article>
        {next && (
          <a className="pc-next no-print" href={href(next)}>
            <span className="muted small">Next product</span>
            <b>{next.title} ›</b>
          </a>
        )}
      </div>
    )
  }

  const count = (g: string) => products.filter((p) => (g === BOOTH_FILTER ? p.booth : p.group === g)).length
  const chips = [
    { id: '', label: 'All', n: products.length },
    ...(products.some((p) => p.booth) ? [{ id: BOOTH_FILTER, label: 'On the booth', n: count(BOOTH_FILTER) }] : []),
    ...groups.map((g) => ({ id: g, label: g, n: count(g) })),
  ]
  const grouped = !words.length && !filter && groups.length > 1

  return (
    <div className="pc" ref={root}>
      <div className="pc-screen no-print">
        <div className="exf-bar pc-bar">
          <input
            ref={search}
            type="search"
            placeholder="Search products: name, use or spec (e.g. methane, tank, thermal, tower)…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && shown[0]) location.hash = `${sectionId}/${shown[0].id}`
              if (e.key === 'Escape') setQuery('')
            }}
            aria-label="Search products"
          />
        </div>
        <div className="pc-chips" role="group" aria-label="Category">
          {chips.map((c) => (
            <button key={c.id} className={filter === c.id ? 'active' : ''} aria-pressed={filter === c.id} onClick={() => setFilter(c.id)}>
              {c.label} <span>{c.n}</span>
            </button>
          ))}
        </div>
        <p className="muted small pc-count">
          {words.length
            ? shown.length
              ? `${shown.length} match${shown.length === 1 ? '' : 'es'} · Enter opens the first`
              : 'No product matches. Try fewer or different words.'
            : `${shown.length} products · click one to open it · press / to search`}
          {(words.length > 0 || filter) && (
            <>
              {' · '}
              <button
                className="link"
                onClick={() => {
                  setQuery('')
                  setFilter('')
                }}
              >
                show all
              </button>
            </>
          )}
        </p>

        {grouped ? (
          groups.map((g) => (
            <div key={g} className="pc-group">
              <h3 className="pc-group-title">{g}</h3>
              <Cards list={products.filter((p) => p.group === g)} href={href} words={words} showGroup={false} />
            </div>
          ))
        ) : (
          <Cards list={shown} href={href} words={words} />
        )}

        {!words.length &&
          extras.map((x) => (
            <details key={x.title} className="pc-extra">
              <summary>{x.title}</summary>
              {render(x.body)}
            </details>
          ))}
      </div>

      {/* Printed: every product in full */}
      <div className="pc-print">
        {products.map((p) => (
          <div key={p.id}>
            <h3>{p.title}</h3>
            {render(p.body)}
          </div>
        ))}
        {extras.map((x) => (
          <div key={x.title}>
            <h3>{x.title}</h3>
            {render(x.body)}
          </div>
        ))}
      </div>
    </div>
  )
}

function Cards({ list, href, words, showGroup = true }: { list: Product[]; href: (p: Product) => string; words: string[]; showGroup?: boolean }) {
  return (
    <div className="pc-grid">
      {list.map((p) => {
        const hint = words.length && !words.every((w) => `${p.title} ${p.summary}`.toLowerCase().includes(w)) ? snippet(p, words) : null
        return (
          <a key={p.id} className="pc-card" href={href(p)}>
            <div className="pc-thumb">
              {p.image ? <img src={p.image.src} alt={p.image.alt} loading="lazy" /> : <span>{p.title.slice(0, 1)}</span>}
              <div className="pc-badges">
                {p.booth && <span className="pc-badge booth">On the booth</span>}
                {p.video && (
                  <span className="pc-badge" title="Has a video">
                    ▶<span className="pc-badge-label"> Video</span>
                  </span>
                )}
              </div>
            </div>
            <div className="pc-card-body">
              {showGroup && p.group && <span className="pc-card-group">{p.group}</span>}
              <b>{p.title}</b>
              {hint ? <span className="pc-hint">{hint}</span> : p.summary && <span className="pc-summary">{p.summary}</span>}
            </div>
          </a>
        )
      })}
    </div>
  )
}

/** The words around the first search word found in the product text (not its name). */
function snippet(p: Product, words: string[]) {
  const text = p.text
  const lower = text.toLowerCase()
  const w = words.find((x) => lower.includes(x))
  if (!w) return null
  const at = lower.indexOf(w)
  const start = Math.max(0, text.lastIndexOf(' ', Math.max(0, at - 50)))
  const end = text.indexOf(' ', Math.min(text.length, at + w.length + 70))
  return (
    <>
      {start > 0 && '…'}
      {text.slice(start, at)}
      <mark>{text.slice(at, at + w.length)}</mark>
      {text.slice(at + w.length, end < 0 ? undefined : end)}
      {end > 0 && '…'}
    </>
  )
}
