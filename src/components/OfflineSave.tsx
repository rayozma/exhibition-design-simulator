import { useEffect, useState } from 'react'
import type { BriefingSection } from '../lib/briefing'
import {
  formatBytes,
  isIosBrowserTab,
  loadOfflineStatus,
  missingFiles,
  offlineSupported,
  saveForOffline,
  useOnline,
  type OfflineStatus,
  type SaveProgress,
} from '../lib/offline'

const when = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

/** "Save for offline" for the briefing: saves every picture, video and brochure on this device. */
export function OfflineSave({ sections }: { sections: BriefingSection[] | null }) {
  const online = useOnline()
  const [status, setStatus] = useState<OfflineStatus | null>(loadOfflineStatus)
  const [missing, setMissing] = useState<number | null>(null)
  const [progress, setProgress] = useState<SaveProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sections || !status || progress) return
    let cancelled = false
    missingFiles(sections).then((m) => !cancelled && setMissing(m.length))
    return () => {
      cancelled = true
    }
  }, [sections, status, progress])

  if (!offlineSupported() || !sections) return null

  const save = async (refresh = false) => {
    setError(null)
    try {
      setStatus(await saveForOffline(sections, setProgress, refresh))
    } catch (e) {
      setError((e as Error).message || 'Saving failed. Is there enough free storage on this device?')
    }
    setProgress(null)
  }

  if (progress) {
    const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0
    return (
      <div className="offline-box no-print" aria-live="polite">
        <div className="offline-head">
          <b>Saving for offline…</b>
          <span className="muted small">
            {progress.done} of {progress.total} files · {formatBytes(progress.bytes)}
          </span>
        </div>
        <div className="bar">
          <div style={{ width: `${pct}%` }} />
        </div>
        <div className="muted small offline-note">Keep this page open until it finishes.</div>
      </div>
    )
  }

  const ios = isIosBrowserTab()
  const outdated = !!status && !!missing

  return (
    <div className="offline-box no-print">
      {status && !outdated ? (
        <div className="offline-head">
          <b className="offline-ok">✓ Ready offline</b>
          <span className="muted small">
            {status.files} files · {formatBytes(status.bytes)} · saved {when(status.at)}
          </span>
        </div>
      ) : (
        <div className="offline-head">
          <b>{outdated ? `${missing} new file${missing === 1 ? '' : 's'} not saved yet` : 'Use it without internet'}</b>
          <span className="muted small">Save every picture, video and brochure on this device, for the booth.</span>
        </div>
      )}
      {status && status.failed.length > 0 && !outdated && (
        <details className="small offline-note">
          <summary>{status.failed.length} file(s) couldn't be saved</summary>
          <ul>
            {status.failed.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </details>
      )}
      {ios && (
        <p className="small offline-note">
          On an iPad: first tap <b>Share → Add to Home Screen</b>, open the briefing from the home screen and save it there.
          Files saved in Safari are not available to the home-screen app.
        </p>
      )}
      {error && <p className="status overlap small">{error}</p>}
      <div className="offline-actions">
        {online ? (
          <>
            <button className={!status || outdated ? 'primary' : ''} onClick={() => save()}>
              {!status ? 'Save for offline' : outdated ? 'Save new files' : 'Check for updates'}
            </button>
            {status && (
              <button className="link small" onClick={() => save(true)}>
                Download everything again
              </button>
            )}
          </>
        ) : (
          !status && <span className="muted small">No internet: connect to save.</span>
        )}
      </div>
    </div>
  )
}
