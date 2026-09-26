import { useEffect, useState } from 'react'
import type { EditorObject } from '../lib/editor'

/** Text with line breaks kept; blank lines start a new paragraph. */
function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/\n\s*\n/)
        .filter((p) => p.trim())
        .map((p, i) => (
          <p key={i} style={{ whiteSpace: 'pre-line' }}>
            {p.trim()}
          </p>
        ))}
    </>
  )
}

/** The info window of an object (ⓘ): images, description, why it's useful for visitors, and a link. */
export function InfoDialog({
  obj,
  onClose,
  continueLabel,
}: {
  obj: EditorObject
  onClose: () => void
  /** Extra button that also closes, e.g. "Continue walking" in Walk view. */
  continueLabel?: string
}) {
  const info = obj.info ?? {}
  const images = info.images ?? []
  const [index, setIndex] = useState(0)
  const [broken, setBroken] = useState<Set<number>>(new Set())
  const title = info.title?.trim() || obj.name

  // Esc closes, arrow keys switch images.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' && images.length > 1) setIndex((i) => (i + 1) % images.length)
      if (e.key === 'ArrowLeft' && images.length > 1) setIndex((i) => (i - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [images.length, onClose])

  const i = Math.min(index, Math.max(0, images.length - 1))
  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card info-card" role="dialog" aria-label={title}>
        <button className="link info-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h2>{title}</h2>

        {images.length > 0 && (
          <div className="info-images">
            <div className="info-main">
              {broken.has(i) ? (
                <div className="info-broken muted small">This image could not be loaded.</div>
              ) : (
                <img src={images[i]} alt={`${title} – image ${i + 1}`} onError={() => setBroken((b) => new Set(b).add(i))} />
              )}
              {images.length > 1 && (
                <>
                  <button className="info-nav prev" onClick={() => setIndex((i - 1 + images.length) % images.length)} aria-label="Previous image">
                    ‹
                  </button>
                  <button className="info-nav next" onClick={() => setIndex((i + 1) % images.length)} aria-label="Next image">
                    ›
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="info-thumbs">
                {images.map((src, k) => (
                  <button key={k} className={k === i ? 'active' : ''} onClick={() => setIndex(k)} aria-label={`Image ${k + 1}`}>
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {info.description?.trim() && <Paragraphs text={info.description} />}

        {info.why?.trim() && (
          <div className="info-why">
            <h4>Why it&apos;s useful for you</h4>
            <Paragraphs text={info.why} />
          </div>
        )}

        {!!info.faq?.filter((f) => f.q.trim()).length && (
          <div className="info-faq">
            <h4>FAQ</h4>
            {info.faq
              .filter((f) => f.q.trim())
              .map((f, k) => (
                <details key={k}>
                  <summary>{f.q}</summary>
                  <Paragraphs text={f.a} />
                </details>
              ))}
          </div>
        )}

        {info.link?.trim() && (
          <a className="button-link info-link" href={info.link.trim()} target="_blank" rel="noopener noreferrer">
            Learn more ↗
          </a>
        )}

        {continueLabel && (
          <button className="primary block" onClick={onClose}>
            {continueLabel}
          </button>
        )}
      </div>
    </div>
  )
}
