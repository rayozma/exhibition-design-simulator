import { useRef, type ReactNode } from 'react'
import { askConfirm } from '../lib/dialogs'
import { useOnline } from '../lib/offline'

/**
 * A small markdown subset for briefing text:
 * ### / #### headings, - or 1. lists (indent 2 spaces to nest), | tables |, > callouts,
 * **bold**, *italic*, [label](https://…) and bare https links. [label]() = a link still to be added.
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
    <div className="md-table">
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

function inline(text: string): ReactNode[] {
  return text.split(TOKEN).map((part, k) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <b key={k}>{part.slice(2, -2)}</b>
    if (/^\*[^*\s]/.test(part) && part.endsWith('*') && part.length > 2) return <i key={k}>{part.slice(1, -1)}</i>
    const link = /^\[([^\]]+)\]\(([^)\s]*)\)$/.exec(part)
    if (link) return <MdLink key={k} label={link[1]} href={link[2]} />
    if (/^https?:\/\//.test(part)) return <MdLink key={k} label={part} href={part} />
    return part
  })
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
    // A file of this app, e.g. briefing/brochures/elios3.pdf
    const file = imageSrc(href)
    if (!file) return <span>{label}</span>
    href = file
  }
  // Videos play here, in the page: a new tab would leave the installed (offline) app on an iPad
  if (/.(mp4|webm)([?#].*)?$/i.test(href)) return <VideoLink label={label} src={href} />
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  )
}

function VideoLink({ label, src }: { label: string; src: string }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const close = () => {
    dialog.current?.querySelector('video')?.pause()
    dialog.current?.close()
  }
  return (
    <>
      <button className="link md-video-open" onClick={() => dialog.current?.showModal()}>
        ▶ {label}
      </button>
      <dialog ref={dialog} className="md-video-dialog" onClick={(e) => e.target === dialog.current && close()} onClose={close}>
        <div className="md-video-dialog-head">
          <b>{label}</b>
          <button className="link" onClick={close} aria-label="Close">
            ✕
          </button>
        </div>
        <video src={src} controls playsInline preload="none" />
      </dialog>
    </>
  )
}

const explainMissing = (label: string) =>
  askConfirm(`No link for “${label}” yet`, {
    message:
      'Nobody has added the address of this file yet. Click Edit on this section, find [' +
      label +
      '](), and paste the Google Drive (or other) link between the ( ). Then click Done.',
    okLabel: 'OK',
  })
