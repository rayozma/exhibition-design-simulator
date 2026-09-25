import { useEffect, useMemo, useRef, useState } from 'react'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { deleteObjects, fetchRoom, fromRow, upsertObjects, type ObjectRow } from './db'
import type { Change, EditorActions, EditorObject } from './editor'
import type { LayoutId } from './layout'
import { supabase } from './supabase'
import { TAB_ID, type User } from './user'

export type Peer = User & { tabId: string; layoutId: LayoutId; selectedIds: string[] }
export type Mover = User & { tabId: string; until: number }
export type SyncStatus = 'local' | 'connecting' | 'live' | 'offline'

/** What edit operations need from the sync layer. */
export type SyncApi = {
  persist(layoutId: LayoutId, changes: Change[]): void
  /** Live positions while dragging (one or several objects). */
  dragMove(layoutId: LayoutId, objs: EditorObject[]): void
  dragEnd(layoutId: LayoutId, objs: EditorObject[]): void
  /** True while someone else is dragging this object. */
  isBusy(layoutId: LayoutId, id: string): boolean
}

type DragMsg = User & { tabId: string; layoutId: LayoutId; objs: EditorObject[] }
type DragEndMsg = { tabId: string; layoutId: LayoutId; objs: EditorObject[] }
type DeletedMsg = { tabId: string; layoutId: LayoutId; ids: string[] }

const DRAG_HZ = 10
const MOVER_TIMEOUT_MS = 2000 // drop "being moved" if the mover goes quiet (e.g. closed the tab)
const RECONNECT_MS = 2000

export const moverKey = (layoutId: LayoutId, id: string) => `${layoutId}:${id}`

function readPeers(state: Record<string, unknown[]>): Peer[] {
  const seen = new Map<string, Peer>()
  for (const p of Object.values(state).flat() as Peer[]) {
    if (p.tabId && p.tabId !== TAB_ID) seen.set(p.tabId, { ...p, selectedIds: p.selectedIds ?? [] })
  }
  return [...seen.values()]
}

/**
 * Realtime sync for one room: loads rows, applies others' saved changes (postgres_changes),
 * exchanges ~10 Hz drag positions and deletions (broadcast) and who-is-where (presence).
 * Reconnects by itself after the connection closes, when the tab becomes visible again,
 * and when the network comes back. With no room / no Supabase it does nothing.
 */
export function useRoomSync(
  room: string | null,
  me: User | null,
  actions: EditorActions,
  layoutId: LayoutId,
  selectedIds: string[],
) {
  const enabled = !!(room && supabase && me)
  const [status, setStatus] = useState<SyncStatus>(room && supabase ? 'connecting' : 'local')
  const [loaded, setLoaded] = useState(!(room && supabase))
  const [peers, setPeers] = useState<Peer[]>([])
  const [movers, setMovers] = useState<Record<string, Mover>>({})
  const [error, setError] = useState<string | null>(null)
  /** Bump to tear down the channel and connect again. */
  const [attempt, setAttempt] = useState(0)

  const channel = useRef<RealtimeChannel | null>(null)
  const moversRef = useRef(movers)
  moversRef.current = movers
  const meRef = useRef(me)
  meRef.current = me
  const statusRef = useRef(status)
  statusRef.current = status
  const myDrag = useRef<Set<string>>(new Set())
  const lastDragSent = useRef(0)
  const writeQueue = useRef<Promise<void>>(Promise.resolve())
  const loadedOnce = useRef(false)

  // Connect to the room channel (again whenever `attempt` changes).
  useEffect(() => {
    if (!enabled || !room || !supabase) return
    const client = supabase
    let disposed = false
    let retry: ReturnType<typeof setTimeout> | undefined
    const reconnectSoon = () => {
      if (disposed || retry) return
      retry = setTimeout(() => setAttempt((a) => a + 1), RECONNECT_MS)
    }

    const onRow = (p: RealtimePostgresChangesPayload<ObjectRow>) => {
      if (p.eventType === 'DELETE') {
        const old = p.old as Partial<ObjectRow>
        if (old.room === room && old.layout_id && old.id) actions.apply(old.layout_id, [{ id: old.id, next: null }], false)
        return
      }
      const row = p.new as ObjectRow
      if (row.updated_by?.endsWith(`#${TAB_ID}`)) return // echo of our own write
      if (myDrag.current.has(moverKey(row.layout_id, row.id))) return // we're dragging it right now
      actions.apply(row.layout_id, [{ id: row.id, next: fromRow(row) }], false)
    }

    const load = () =>
      fetchRoom(room)
        .then((objs) => {
          if (disposed) return
          actions.load(objs)
          loadedOnce.current = true
          setLoaded(true)
        })
        .catch((e: Error) => setError(`Could not load room: ${e.message}`))

    const connect = () => {
      setStatus((s) => (s === 'live' ? 'offline' : s))
      const ch = client.channel(`room:${room}`, {
        config: { presence: { key: TAB_ID }, broadcast: { self: false } },
      })
      ch.on('postgres_changes', { event: '*', schema: 'public', table: 'objects', filter: `room=eq.${room}` }, onRow)
        .on('broadcast', { event: 'drag' }, ({ payload }) => {
          const m = payload as DragMsg
          const mine = (id: string) => myDrag.current.has(moverKey(m.layoutId, id))
          const objs = (m.objs ?? []).filter((o) => !mine(o.id))
          if (!objs.length) return
          actions.apply(m.layoutId, objs.map((o) => ({ id: o.id, next: o })), false)
          const until = Date.now() + MOVER_TIMEOUT_MS
          setMovers((prev) => {
            const next = { ...prev }
            for (const o of objs) next[moverKey(m.layoutId, o.id)] = { tabId: m.tabId, name: m.name, color: m.color, until }
            return next
          })
        })
        .on('broadcast', { event: 'drag-end' }, ({ payload }) => {
          const m = payload as DragEndMsg
          const objs = m.objs ?? []
          const keys = new Set(objs.map((o) => moverKey(m.layoutId, o.id)))
          const others = objs.filter((o) => !myDrag.current.has(moverKey(m.layoutId, o.id)))
          if (others.length) actions.apply(m.layoutId, others.map((o) => ({ id: o.id, next: o })), false)
          setMovers((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => !keys.has(k))))
        })
        .on('broadcast', { event: 'deleted' }, ({ payload }) => {
          const m = payload as DeletedMsg
          actions.apply(m.layoutId, m.ids.map((id) => ({ id, next: null })), false)
        })
        .on('presence', { event: 'sync' }, () => setPeers(readPeers(ch.presenceState())))
        .subscribe((s, err) => {
          if (disposed) return
          if (s === 'SUBSCRIBED') {
            setStatus('live')
            setError((e) => (e?.startsWith('Live connection') ? null : e))
            load() // (re)load after subscribing so no change is missed in between
          } else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') {
            // supabase-js retries these by itself; we only report and make sure data is shown.
            setStatus('offline')
            console.warn('Realtime:', s, err)
            if (!loadedOnce.current) {
              load()
              setError(`Live connection failed (${err?.message ?? s}). Retrying… Others' changes appear once connected.`)
            }
          } else if (s === 'CLOSED') {
            // A closed channel is not retried automatically: start over with a new one.
            setStatus('offline')
            reconnectSoon()
          }
        })
      channel.current = ch
    }

    // supabase-js reuses a channel with the same topic until it has fully closed, so React's
    // dev-mode mount → unmount → mount would get the half-closed one. Deferring one tick means
    // that first mount is cancelled before it creates anything.
    const timer = setTimeout(connect, 0)
    return () => {
      disposed = true
      clearTimeout(timer)
      clearTimeout(retry)
      if (channel.current) client.removeChannel(channel.current)
      channel.current = null
    }
  }, [enabled, room, actions, attempt])

  // Coming back to the tab, or the network returning: reconnect if we aren't live.
  useEffect(() => {
    if (!enabled) return
    const check = () => {
      if (document.visibilityState === 'visible' && statusRef.current !== 'live') setAttempt((a) => a + 1)
    }
    document.addEventListener('visibilitychange', check)
    window.addEventListener('online', check)
    return () => {
      document.removeEventListener('visibilitychange', check)
      window.removeEventListener('online', check)
    }
  }, [enabled])

  // Tell others who we are, which layout we're on and what we've selected.
  const selKey = selectedIds.join(',')
  useEffect(() => {
    if (status !== 'live' || !me) return
    const payload: Peer = { tabId: TAB_ID, name: me.name, color: me.color, layoutId, selectedIds: selKey ? selKey.split(',') : [] }
    channel.current?.track(payload)
  }, [status, me, layoutId, selKey])

  // Expire movers that stopped sending.
  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now()
      if (Object.values(moversRef.current).some((m) => m.until < now)) {
        setMovers((prev) => Object.fromEntries(Object.entries(prev).filter(([, m]) => m.until >= now)))
      }
    }, 500)
    return () => clearInterval(t)
  }, [])

  const sync = useMemo<SyncApi>(() => {
    const by = () => `${meRef.current?.name ?? 'anon'}#${TAB_ID}`
    return {
      persist(l, changes) {
        if (!enabled || !room) return
        const ups = changes.flatMap((c) => (c.next ? [c.next] : []))
        const dels = changes.filter((c) => !c.next).map((c) => c.id)
        if (dels.length && channel.current) {
          // Deletions reach others right away over the channel (database delete events can't be filtered by room).
          const msg: DeletedMsg = { tabId: TAB_ID, layoutId: l, ids: dels }
          void channel.current.send({ type: 'broadcast', event: 'deleted', payload: msg })
        }
        // Writes run one after another so they reach the database in order.
        writeQueue.current = writeQueue.current
          .then(async () => {
            if (ups.length) await upsertObjects(room, l, ups, by())
            if (dels.length) await deleteObjects(room, l, dels)
          })
          .catch((e: Error) => setError(`Save failed: ${e.message}`))
      },
      dragMove(l, objs) {
        for (const o of objs) myDrag.current.add(moverKey(l, o.id))
        const now = Date.now()
        const u = meRef.current
        if (!channel.current || !u || now - lastDragSent.current < 1000 / DRAG_HZ) return
        lastDragSent.current = now
        const msg: DragMsg = { tabId: TAB_ID, name: u.name, color: u.color, layoutId: l, objs }
        void channel.current.send({ type: 'broadcast', event: 'drag', payload: msg })
      },
      dragEnd(l, objs) {
        const moved = myDrag.current.size > 0 // a plain click never called dragMove
        myDrag.current = new Set()
        lastDragSent.current = 0
        if (!moved || !channel.current || !objs.length) return
        const msg: DragEndMsg = { tabId: TAB_ID, layoutId: l, objs }
        void channel.current.send({ type: 'broadcast', event: 'drag-end', payload: msg })
      },
      isBusy(l, id) {
        const m = moversRef.current[moverKey(l, id)]
        return !!m && m.tabId !== TAB_ID && m.until > Date.now()
      },
    }
  }, [enabled, room])

  return { sync, status, loaded, peers, movers, error, clearError: () => setError(null) }
}
