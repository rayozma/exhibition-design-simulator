import { useState } from 'react'
import type { ObjectsByLayout } from '../lib/editor'
import type { Peer, SyncStatus } from '../lib/useRoomSync'
import type { User } from '../lib/user'

const STATUS_LABEL: Record<SyncStatus, string> = {
  local: 'Local only (Supabase not configured)',
  connecting: 'Connecting…',
  live: 'Live',
  offline: 'Offline — reconnecting…',
}

type Props = {
  status: SyncStatus
  me: User | null
  peers: Peer[]
  objects: ObjectsByLayout
  onEditUser: () => void
}

/** Connection status, you, and everyone else online with what they have selected. */
export function PeerList({ status, me, peers, objects, onEditUser }: Props) {
  const [copied, setCopied] = useState(false)
  /** "Chair" or "Chair +2" for several selected objects. */
  const nameOf = (p: Peer) => {
    const first = objects[p.layoutId]?.find((o) => o.id === p.selectedIds[0])?.name.split(/ – | \(/)[0]
    if (!first) return undefined
    return p.selectedIds.length > 1 ? `${first} +${p.selectedIds.length - 1}` : first
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      window.prompt('Copy this room link:', location.href)
    }
  }

  return (
    <div className="peers">
      <span className={`conn ${status}`} title={STATUS_LABEL[status]}>
        {STATUS_LABEL[status]}
      </span>
      {status !== 'local' && (
        <>
          <button onClick={copyLink} title="Copy the room link to share it">
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          {me && (
            <button className="chip" onClick={onEditUser} title="Change your name / color">
              <i style={{ background: me.color }} />
              {me.name} (you)
            </button>
          )}
          {peers.map((p) => {
            const sel = nameOf(p)
            return (
              <span key={p.tabId} className="chip" title={`${p.name} — layout ${p.layoutId}${sel ? `, selected: ${sel}` : ''}`}>
                <i style={{ background: p.color }} />
                {p.name}
                <small>
                  {p.layoutId}
                  {sel ? ` · ${sel}` : ''}
                </small>
              </span>
            )
          })}
        </>
      )}
    </div>
  )
}
