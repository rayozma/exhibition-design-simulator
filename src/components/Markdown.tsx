import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { askConfirm } from '../lib/dialogs'
import { useOnline } from '../lib/offline'

/**
 * A small markdown subset for briefing text:
 * ### / #### headings, - or 1. lists (indent 2 spaces to nest), | tables |, > callouts,
 * **bold**, *italic*, [label](https://…) and bare https links. [label]() = a link still to be added.
 * Two or more photo links on one line, e.g. [Front](briefing/photos/a.jpg) · [Side](briefing/photos/b.jpg),
 * become a strip of thumbnails that opens a swipeable gallery.
 * A line with only ![alt](src) is a picture, shown to the right of the text that follows it;
 * src is a web address or a file in the app's public/ folder (e.g. briefing/voliro-t.jpg).
 * A line with only a YouTube link, or an .mp4 / .webm file (web address or public/ file, e.g.
 * briefing/videos/demo.mp4), is an embedded video.
 */
export function Markdown({ text }: { text: string }) {
  return <div className="md">{blocks(text.replace(/\r\n?/g, '\n').split('\n'))}</div>
}

const LIST = /^(\s*)([-*]|\d+\.)\s+(.*)$/
const TABLE = /^\s*\|/
const TABLE_RULE = /^\s*\|?\s*:?-{3,}/
const IMAGE = /^\s*!\[([^\]]*)\]\((\S+)\)\s*$/ // greedy: the address may itself contain ( )
const YOUTUBE = /^\s*https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:\S*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})\S*\s*$/
const VIDEO_FILE = /^\s*(\S+\.(?:mp4|webm)(?:[?#]\S*)?)\s*$/i

/** Web address as is; a bare path is a file of this app (public/ folder), under its base URL. */
export const imageSrc = (src: string) =>
  /^https?:\/\//i.test(src) ? src : /^[\w./-]+$/.test(src) && !src.includes('..') ? import.meta.env.BASE_URL + src.replace(/^\//, '') : null

function blocks(lines: string[]): ReactNode[] {
  const out: ReactNode[] = []
  let para: string[] = []
  const flush = () => {
    if (para.length) out.push(<p key={out.length}>{joinLines(para)}</p>)
    para = []
  }

  for (let i = 0; i < lines.length; ) {
    const line = lines[i]
    const heading = /^(#{2,4})\s+(.*)$/.exec(line)
    const image = IMAGE.exec(line)
    const src = image && imageSrc(image[2])
    const video = YOUTUBE.exec(line)
    const videoFile = VIDEO_FILE.exec(line)
    const videoSrc = videoFile && imageSrc(videoFile[1])
    if (!line.trim()) {
      flush()
      i++
    } else if (heading) {
      flush()
      const H = heading[1].length <= 3 ? 'h3' : 'h4'
      out.push(<H key={out.length}>{inline(heading[2])}</H>)
      i++
    } else if (image && src) {
      flush()
      out.push(
        <figure key={out.length} className="md-figure">
          <a href={src} target="_blank" rel="noopener noreferrer">
            <img src={src} alt={image[1]} loading="lazy" />
          </a>
        </figure>,
      )
      i++
    } else if (video) {
      flush()
      out.push(
        <YouTube key={out.length} id={video[1]} />,
      )
      i++
    } else if (videoSrc) {
      flush()
      out.push(
        <div key={out.length} className="md-video">
          <video src={videoSrc} controls playsInline preload="metadata" />
          <a className="md-video-link" href={videoSrc} target="_blank" rel="noopener noreferrer">
            ▶ Open video in a new tab
          </a>
        </div>,
      )
      i++
    } else if (LIST.test(line)) {
      flush()
      const items: string[] = []
      while (i < lines.length && LIST.test(lines[i])) items.push(lines[i++])
      out.push(<List key={out.length} lines={items} />)
    } else if (TABLE.test(line)) {
      flush()
      const rows: string[] = []
      while (i < lines.length && TABLE.test(lines[i])) rows.push(lines[i++])
      out.push(<Table key={out.length} rows={rows} />)
    } else if (/^>\s?/.test(line)) {
      flush()
      const quote: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i])) quote.push(lines[i++].replace(/^>\s?/, ''))
      out.push(
        <div key={out.length} className="md-callout">
          {blocks(quote)}
        </div>,
      )
    } else {
      para.push(line)
      i++
    }
  }
  flush()
  return out
}

/** Embedded YouTube video; without internet, its picture and a note instead of a dead player. */
function YouTube({ id }: { id: string }) {
  const online = useOnline()
  return (
    <div className="md-video">
      {online ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title="YouTube video"
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <div className="md-video-offline" style={{ backgroundImage: `url(https://img.youtube.com/vi/${id}/hqdefault.jpg)` }}>
          <span>YouTube video: needs internet</span>
        </div>
      )}
      <a className="md-video-link" href={`https://youtu.be/${id}`} target="_blank" rel="noopener noreferrer">
        ▶ Watch on YouTube: youtu.be/{id}
      </a>
    </div>
  )
}

const joinLines = (lines: string[]) =>
  lines.flatMap((l, k) => (k ? [<br key={`br${k}`} />, ...inline(l.trim())] : inline(l.trim())))

type Item = { text: string; ordered: boolean; children: Item[] }

/** Lines of a list -> nested items (deeper indent = child of the previous item). */
function List({ lines }: { lines: string[] }) {
  const root: Item[] = []
  const stack: { indent: number; items: Item[] }[] = [{ indent: -1, items: root }]
  for (const l of lines) {
    const [, sp, marker, text] = LIST.exec(l)!
    const indent = sp.replace(/\t/g, '  ').length
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop()
    const parent = stack[stack.length - 1]
    const item: Item = { text, ordered: /\d/.test(marker), children: [] }
    parent.items.push(item)
    stack.push({ indent, items: item.children })
  }
  return <ListOf items={root} />
}

function ListOf({ items }: { items: Item[] }) {
  const Tag = items[0]?.ordered ? 'ol' : 'ul'
  return (
    <Tag>
      {items.map((it, k) => (
        <li key={k}>
          {inline(it.text)}
          {it.children.length > 0 && <ListOf items={it.children} />}
        </li>
      ))}
    </Tag>
  )
}

function Table({ rows }: { rows: string[] }) {
  const cells = rows
    .filter((r) => !TABLE_RULE.test(r))
    .map((r) => r.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim()))
  const [head, ...body] = cells
  if (!head) return null
  return (
    <div className={head.length === 2 ? 'md-table md-table-pairs' : 'md-table'}>
      <table>
        <thead>
          <tr>
            {head.map((c, k) => (
              <th key={k}>{inline(c)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((r, j) => (
            <tr key={j}>
              {head.map((_, k) => (
                <td key={k} data-label={head[k]}>
                  {inline(r[k] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const TOKEN = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[[^\]]+\]\([^)\s]*\)|https?:\/\/[^\s)]+)/g

const LINK = /^\[([^\]]+)\]\(([^)\s]*)\)$/

type Photo = { label: string; src: string }

/** A [label](file.jpg) link to a photo of this app, or null. */
function photoOf(part: string): Photo | null {
  const link = LINK.exec(part)
  if (!link || /^(https?:|mailto:|#)/i.test(link[2])) return null
  const src = imageSrc(link[2].split('#')[0])
  return src && /\.(jpe?g|png|webp)$/i.test(src) ? { label: link[1], src } : null
}

function inline(text: string): ReactNode[] {
  const parts = text.split(TOKEN)
  const photos = parts.map(photoOf)
  const gallery = photos.filter((x): x is Photo => !!x)
  if (gallery.length < 2) return parts.map(inlinePart)
  // The photos (and the " · " between them) become one gallery, where the first one was.
  const out: ReactNode[] = []
  let placed = false
  parts.forEach((part, k) => {
    if (photos[k]) {
      if (!placed) out.push(<PhotoGallery key={k} photos={gallery} />)
      placed = true
    } else if (!(placed && /^[\s·•,|/-]*$/.test(part))) out.push(inlinePart(part, k))
  })
  return out
}

function inlinePart(part: string, k: number): ReactNode {
  if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <b key={k}>{part.slice(2, -2)}</b>
  if (/^\*[^*\s]/.test(part) && part.endsWith('*') && part.length > 2) return <i key={k}>{part.slice(1, -1)}</i>
  const link = LINK.exec(part)
  if (link) return <MdLink key={k} label={link[1]} href={link[2]} />
  if (/^https?:\/\//.test(part)) return <MdLink key={k} label={part} href={part} />
  return part
}

function MdLink({ label, href }: { label: string; href: string }) {
  if (!href)
    return (
      <span
        className="md-missing"
        role="button"
        tabIndex={0}
        title="No link yet"
        onClick={() => explainMissing(label)}
        onKeyDown={(e) => e.key === 'Enter' && explainMissing(label)}
      >
        {label}
      </span>
    )
  if (href.startsWith('#')) return <a href={href}>{label}</a>
  if (!/^(https?:|mailto:)/i.test(href)) {
    // A file of this app, e.g. briefing/brochures/elios3.pdf (#pages=5 for a multi-page brochure)
    const [path, fragment = ''] = href.split('#')
    const file = imageSrc(path)
    if (!file) return <span>{label}</span>
    // Brochures and photos open here, in the page: a new tab would leave the installed (offline) app on an iPad
    if (/\.pdf$/i.test(file)) return <BrochureLink label={label} pdf={file} pages={Number(/pages=(\d+)/.exec(fragment)?.[1] ?? 1)} />
    if (/\.(jpe?g|png|webp)$/i.test(file)) return <PhotoLink label={label} src={file} />
    href = file
  }
  // Videos play here, in the page, for the same reason
  if (/\.(mp4|webm)([?#].*)?$/i.test(href)) return <VideoLink label={label} src={href} />
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  )
}

/**
 * A pop-up's open state (a value, e.g. which photo), as a step in the browser history:
 * the phone's or iPad's Back button closes the pop-up instead of leaving the page. Escape closes it too.
 */
function useOverlay<T>() {
  const [value, setValue] = useState<T | null>(null)
  const open = value !== null
  const close = () => (history.state?.mdOverlay ? history.back() : setValue(null))
  useEffect(() => {
    if (!open) return
    const onPop = () => setValue(null)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('popstate', onPop)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('keydown', onKey)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps
  const show = (v: T) => {
    if (!open) history.pushState({ mdOverlay: true }, '')
    setValue(v)
  }
  return [value, show, close] as const
}

/** A link that opens its content in a plain overlay (not <dialog>, which older iPads lack). */
function MediaLink({ label, icon, wide, children }: { label: string; icon: string; wide?: boolean; children: (close: () => void) => ReactNode }) {
  const [open, show, close] = useOverlay<true>()
  return (
    <>
      <button className="link md-video-open" onClick={() => show(true)}>
        {icon} {label}
      </button>
      {open && (
        <div className="md-video-overlay" role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.target === e.currentTarget && close()}>
          <div className={`md-video-dialog${wide ? ' wide' : ''}`}>
            <div className="md-video-dialog-head">
              <b>{label}</b>
              <button className="link" onClick={close} aria-label="Close">
                ✕
              </button>
            </div>
            {children(close)}
          </div>
        </div>
      )}
    </>
  )
}

const VideoLink = ({ label, src }: { label: string; src: string }) => (
  <MediaLink label={label} icon="▶">
    {() => <video src={src} controls playsInline autoPlay />}
  </MediaLink>
)

function PhotoLink({ label, src }: Photo) {
  const [at, show, close] = useOverlay<number>()
  return (
    <>
      <button className="link md-video-open" onClick={() => show(0)}>
        🖼 {label}
      </button>
      {at !== null && <Lightbox photos={[{ label, src }]} start={at} onClose={close} />}
    </>
  )
}

/** A row of photo thumbnails (scrolls sideways); a tap opens the gallery at that photo. */
function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [at, show, close] = useOverlay<number>()
  return (
    <>
      <span className="md-gallery" aria-label={`${photos.length} photos`}>
        {photos.map((p, k) => (
          <button key={p.src + k} className="md-gallery-thumb" onClick={() => show(k)} title={p.label}>
            <img src={p.src} alt={p.label} loading="lazy" />
            <span>{p.label}</span>
          </button>
        ))}
      </span>
      {at !== null && <Lightbox photos={photos} start={at} onClose={close} />}
    </>
  )
}

/** Full-screen photos side by side: swipe (or ‹ ›, arrow keys) to go through them. */
function Lightbox({ photos, start, onClose }: { photos: Photo[]; start: number; onClose: () => void }) {
  const track = useRef<HTMLDivElement>(null)
  const [at, setAt] = useState(start)
  const atRef = useRef(at)
  atRef.current = at
  const go = (k: number) => {
    const t = track.current
    if (t) t.scrollTo({ left: Math.max(0, Math.min(photos.length - 1, k)) * t.clientWidth, behavior: 'smooth' })
  }
  useEffect(() => {
    const t = track.current
    if (t) t.scrollLeft = start * t.clientWidth
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(atRef.current + 1)
      if (e.key === 'ArrowLeft') go(atRef.current - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const many = photos.length > 1
  const closeOnBackdrop = (e: MouseEvent) => e.target === e.currentTarget && onClose()
  return createPortal(
    <div className="md-video-overlay md-lightbox" role="dialog" aria-modal="true" aria-label="Photos" onClick={closeOnBackdrop}>
      <div className="md-lightbox-head">
        <b>{photos[at]?.label}</b>
        {many && (
          <span className="md-lightbox-count">
            {at + 1} / {photos.length}
          </span>
        )}
        <button className="link" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
      <div
        className="md-lightbox-track"
        ref={track}
        onClick={closeOnBackdrop}
        onScroll={(e) => {
          const t = e.currentTarget
          setAt(Math.min(photos.length - 1, Math.max(0, Math.round(t.scrollLeft / t.clientWidth))))
        }}
      >
        {photos.map((p, k) => (
          <div key={p.src + k} className="md-lightbox-slide" onClick={closeOnBackdrop}>
            <img src={p.src} alt={p.label} loading={Math.abs(k - start) > 1 ? 'lazy' : undefined} />
          </div>
        ))}
      </div>
      {many && (
        <>
          <button className="md-lightbox-nav prev" onClick={() => go(at - 1)} disabled={at === 0} aria-label="Previous photo">
            ‹
          </button>
          <button className="md-lightbox-nav next" onClick={() => go(at + 1)} disabled={at === photos.length - 1} aria-label="Next photo">
            ›
          </button>
        </>
      )}
    </div>,
    document.body,
  )
}

/** A brochure: its pages as pictures (they work offline and on any iPad), plus the PDF to download. */
const BrochureLink = ({ label, pdf, pages }: { label: string; pdf: string; pages: number }) => (
  <MediaLink label={label} icon="📄" wide>
    {() => (
      <>
        <div className="md-pages">
          {Array.from({ length: pages }, (_, k) => (
            <img key={k} src={brochurePage(pdf, k + 1)} alt={`${label}, page ${k + 1}`} loading={k ? 'lazy' : undefined} />
          ))}
        </div>
        <a className="md-pages-download" href={pdf} download>
          Download PDF
        </a>
      </>
    )}
  </MediaLink>
)

/** Page n of a brochure, as published next to it: briefing/brochures/x.pdf -> x-n.jpg */
export const brochurePage = (pdf: string, n: number) => pdf.replace(/\.pdf$/i, `-${n}.jpg`)

const explainMissing = (label: string) =>
  askConfirm(`No link for “${label}” yet`, {
    message:
      'Nobody has added the address of this file yet. Click Edit on this section, find [' +
      label +
      '](), and paste the Google Drive (or other) link between the ( ). Then click Done.',
    okLabel: 'OK',
  })
