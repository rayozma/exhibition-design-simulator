import type { ReactNode } from 'react'

/**
 * A small markdown subset for briefing text:
 * ### / #### headings, - or 1. lists (indent 2 spaces to nest), | tables |, > callouts,
 * **bold**, *italic*, [label](https://…) and bare https links. [label]() = a link still to be added.
 */
export function Markdown({ text }: { text: string }) {
  return <div className="md">{blocks(text.replace(/\r\n?/g, '\n').split('\n'))}</div>
}

const LIST = /^(\s*)([-*]|\d+\.)\s+(.*)$/
const TABLE = /^\s*\|/
const TABLE_RULE = /^\s*\|?\s*:?-{3,}/

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
    if (!line.trim()) {
      flush()
      i++
    } else if (heading) {
      flush()
      const H = heading[1].length <= 3 ? 'h3' : 'h4'
      out.push(<H key={out.length}>{inline(heading[2])}</H>)
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
                <td key={k}>{inline(r[k] ?? '')}</td>
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
      <span className="md-missing" title="No link yet: edit this section and put the address between the ( )">
        {label}
      </span>
    )
  if (href.startsWith('#')) return <a href={href}>{label}</a>
  if (!/^(https?:|mailto:)/i.test(href)) return <span>{label}</span>
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  )
}
