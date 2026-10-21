import { useEffect, useMemo, useState } from 'react'

/** One exhibitor from public/briefing/exhibitors.json (short keys to keep the file small). */
type Exhibitor = {
  i: number
  n: string
  /** Stand number(s), e.g. "4210" or "3430, 3530". */
  s: string
  h: string
  c: string
  /** Main Exhibitor / Co-exhibitor / Agent. */
  t: string
  d: string
  w: string
  /** Product categories. */
  k: string[]
  /** Search-only text: the full description, when it says more than `d`. */
  x?: string
}

const DATA_URL = import.meta.env.BASE_URL + 'briefing/exhibitors.json'
const profileUrl = (id: number) => `https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=${id}`
const MAX_SHOWN = 60

/** "Hall 4" before "Hall 10", halls before Atrium / Concourse / Hall AI. */
function hallOrder(a: string, b: string) {
  const na = /^Hall (\d+)$/.exec(a)
  const nb = /^Hall (\d+)$/.exec(b)
  if (na && nb) return Number(na[1]) - Number(nb[1])
  if (na) return -1
  if (nb) return 1
  return a.localeCompare(b)
}

/** Search box over the full ADIPEC exhibitor list: name, stand, country, description or category. */
export function ExhibitorFinder() {
  const [data, setData] = useState<{ fetched: string; list: Exhibitor[] } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [hall, setHall] = useState('')

  useEffect(() => {
    fetch(DATA_URL)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setData)
      .catch((e: Error) => setError(e.message))
  }, [])

  const halls = useMemo(() => (data ? [...new Set(data.list.map((e) => e.h).filter(Boolean))].sort(hallOrder) : []), [data])
  const haystacks = useMemo(
    () => new Map(data?.list.map((e) => [e.i, `${e.n} ${e.s} ${e.h} ${e.c} ${e.d} ${e.k.join(' ')} ${e.x ?? ''}`.toLowerCase()]) ?? []),
    [data],
  )
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  /** The list shows only once someone searches or picks a hall. */
  const searching = words.length > 0 || !!hall
  const results = useMemo(
    () => (data ? data.list.filter((e) => (!hall || e.h === hall) && words.every((w) => haystacks.get(e.i)!.includes(w))) : []),
    [data, hall, words.join(' '), haystacks], // eslint-disable-line react-hooks/exhaustive-deps
  )

  return (
    <div className="exf no-print">
      <div className="exf-bar">
        <input
          type="search"
          placeholder="Find any exhibitor: company, stand number, country, product…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search exhibitors"
        />
        <select value={hall} onChange={(e) => setHall(e.target.value)} aria-label="Hall">
          <option value="">All halls</option>
          {halls.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="status overlap">Could not load the exhibitor list: {error}</p>}
      {!data && !error && <p className="muted small">Loading the exhibitor list…</p>}
      {data && (
        <p className="muted small exf-count">
          {!searching
            ? `Type a company, stand number, country or product, or pick a hall: ${data.list.length} exhibitors`
            : results.length === 0
              ? 'No exhibitor matches. Try fewer or different words.'
              : `${results.length} of ${data.list.length} exhibitors${results.length > MAX_SHOWN ? `, first ${MAX_SHOWN} shown` : ''}`}
          {' · '}ADIPEC list as of {data.fetched}
        </p>
      )}
      <div className="exf-list">
        {(searching ? results : []).slice(0, MAX_SHOWN).map((e) => (
          <article key={e.i} className="exf-card">
            <div className="exf-head">
              <a href={profileUrl(e.i)} target="_blank" rel="noopener noreferrer">
                {e.n}
              </a>
              {e.s && <span className="exf-stand">{e.s}</span>}
            </div>
            <div className="muted small">
              {[e.h, e.c, e.t !== 'Main Exhibitor' ? e.t : ''].filter(Boolean).join(' · ')}
            </div>
            {e.d && <p>{e.d}</p>}
            {e.k.length > 0 && <div className="exf-tags">{e.k.map((k) => <span key={k}>{k}</span>)}</div>}
            {e.w && (
              <a className="small" href={e.w} target="_blank" rel="noopener noreferrer">
                {e.w.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')} ↗
              </a>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
