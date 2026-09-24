import { useEffect, useMemo, useRef, useState } from 'react'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { deleteObjects, fetchRoom, fromRow, upsertObjects, type ObjectRow } from './db'
import type { Change, EditorActions, EditorObject } from './editor'
import type { LayoutId } from './layout'
import { supabase } from './supabase'
import { TAB_ID, type User } from './user'

export type Peer = User & { tabId: string; layoutId: LayoutId; selectedId: string | null }
export type Mover = User & { tabId: string; until: number }
export type SyncStatus = 'local' | 'connecting' | 'live' | 'offline'

/** What edit operations need from the sync layer. */
export type SyncApi = {
  persist(layoutId: LayoutId, changes: Change[]): void
  dragMove(layoutId: LayoutId, obj: EditorObject): void
  dragEnd(layoutId: LayoutId, obj: EditorObject | undefined): void
  /** True while someone else is dragging this object. */
  isBusy(layoutId: LayoutId, id: string): boolean
}

type DragMsg = User & { tabId: string; layoutId: LayoutId; obj: EditorObject }
type DragEndMsg = { tabId: string; layoutId: LayoutId; obj: EditorObject }

const DRAG_HZ = 10
const MOVER_TIMEOUT_MS = 2000 // drop "being moved" if the mover goes quiet (e.g. closed the tab)

export const moverKey = (layoutId: LayoutId, id: string) => `${layoutId}:${id}`

function readPeers(state: Record<string, unknown[]>): Peer[] {
  const seen = new Map<string, Peer>()
  for (const p of Object.values(state).flat() as Peer[]) {
    if (p.tabId && p.tabId !== TAB_ID) seen.set(p.tabId, p)
  }
  return [...seen.values()]
}

/**
 * Realtime sync for one room: loads rows, applies others' changes (postgres_changes),
 * exchanges ~10 Hz drag positions (broadcast) and who-is-where (presence).
 * With no room / no Supabase it does nothing and edits stay local.
 */
export function useRoomSync(
  room: string | null,
  me: User | null,
  actions: EditorActions,
  layoutId: LayoutId,
  selectedId: string | null,
) {
  const enabled = !!(room && supabase && me)
  const [status, setStatus] = useState<SyncStatus>(room && supabase ? 'connecting' : 'local')
  const [loaded, setLoaded] = useState(!(room && supabase))
  const [peers, setPeers] = useState<Peer[]>([])
  const [movers, setMovers] = useState<Record<string, Mover>>({})
  const [error, setError] = useState<string | null>(null)

  const channel = useRef<RealtimeChannel | null>(null)
  const moversRef = useRef(movers)
  moversRef.current = movers
  const meRef = useRef(me)
  meRef.current = me
  const myDrag = useRef<string | null>(null)
  const lastDragSent = useRef(0)
  const writeQueue = useRef<Promise<void>>(Promise.resolve())
  const loadedOnce = useRef(false)

  // Connect to the room channel.
  useEffect(() => {
    if (!enabled || !room || !supabase) return
    const client = supabase

    const onRow = (p: RealtimePostgresChangesPayload<ObjectRow>) => {
      if (p.eventType === 'DELETE') {
        const old = p.old as Partial<ObjectRow>
        if (old.room === room && old.layout_id && old.id) actions.apply(old.layout_id, [{ id: old.id, next: null }], false)
        return
      }
      const row = p.new as ObjectRow
      if (row.updated_by?.endsWith(`#${TAB_ID}`)) return // echo of our own write
      if (myDrag.current === moverKey(row.layout_id, row.id)) return // we're dragging it right now
      actions.apply(row.layout_id, [{ id: row.id, next: fromRow(row) }], false)
    }

    const load = () =>
      fetchRoom(room)
        .then((objs) => {
          actions.load(objs)
          loadedOnce.current = true
          setLoaded(true)
        })
        .catch((e: Error) => setError(`Could not load room: ${e.message}`))

    const connect = () => {
      const ch = client.channel(`room:${room}`, {
        config: { presence: { key: TAB_ID }, broadcast: { self: false } },
      })
      ch.on('postgres_changes', { event: '*', schema: 'public', table: 'objects', filter: `room=eq.${room}` }, onRow)
        // DELETE events can't be filtered by column, so listen unfiltered and check the room ourselves.
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'objects' }, onRow)
        .on('broadcast', { event: 'drag' }, ({ payload }) => {
          const m = payload as DragMsg
          const key = moverKey(m.layoutId, m.obj.id)
          if (myDrag.current === key) return
          actions.apply(m.layoutId, [{ id: m.obj.id, next: m.obj }], false)
          setMovers((prev) => ({
            ...prev,
            [key]: { tabId: m.tabId, name: m.name, color: m.color, until: Date.now() + MOVER_TIMEOUT_MS },
          }))
        })
        .on('broadcast', { event: 'drag-end' }, ({ payload }) => {
          const m = payload as DragEndMsg
          const key = moverKey(m.layoutId, m.obj.id)
          if (myDrag.current !== key) actions.apply(m.layoutId, [{ id: m.obj.id, next: m.obj }], false)
          setMovers((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => k !== key)))
        })
        .on('presence', { event: 'sync' }, () => setPeers(readPeers(ch.presenceState())))
        .subscribe((s, err) => {
          if (s === 'SUBSCRIBED') {
            setStatus('live')
            load() // (re)load after subscribing so no change is missed in between
          } else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') {
            setStatus('offline')
            console.warn('Realtime:', s, err)
            if (!loadedOnce.current) {
              // Still show the room; live updates will start once the connection recovers.
              load()
              setError(`Live connection failed (${err?.message ?? s}). Retrying… Others' changes appear once connected.`)
            }
          } else if (s === 'CLOSED') {
            setStatus('offline')
          }
        })
      channel.current = ch
    }

    // supabase-js reuses a channel with the same topic until it has fully closed, so React's
    // dev-mode mount → unmount → mount would get the half-closed one. Deferring one tick means
    // that first mount is cancelled before it creates anything.
    const timer = setTimeout(connect, 0)
    return () => {
      clearTimeout(timer)
      if (channel.current) client.removeChannel(channel.current)
      channel.current = null
    }
  }, [enabled, room, actions])

  // Tell others who we are, which layout we're on and what we've selected.
  useEffect(() => {
    if (status !== 'live' || !me) return
    channel.current?.track({ tabId: TAB_ID, name: me.name, color: me.color, layoutId, selectedId } satisfies Peer)
  }, [status, me, layoutId, selectedId])

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
        // Writes run one after another so they reach the database in order.
        writeQueue.current = writeQueue.current
          .then(async () => {
            if (ups.length) await upsertObjects(room, l, ups, by())
            if (dels.length) await deleteObjects(room, l, dels)
          })
          .catch((e: Error) => setError(`Save failed: ${e.message}`))
      },
      dragMove(l, obj) {
        myDrag.current = moverKey(l, obj.id)
        const now = Date.now()
        const u = meRef.current
        if (!channel.current || !u || now - lastDragSent.current < 1000 / DRAG_HZ) return
        lastDragSent.current = now
        const msg: DragMsg = { tabId: TAB_ID, name: u.name, color: u.color, layoutId: l, obj }
        void channel.current.send({ type: 'broadcast', event: 'drag', payload: msg })
      },
      dragEnd(l, obj) {
        const moved = myDrag.current !== null // a plain click never called dragMove
        myDrag.current = null
        lastDragSent.current = 0
        if (!moved || !channel.current || !obj) return
        const msg: DragEndMsg = { tabId: TAB_ID, layoutId: l, obj }
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
