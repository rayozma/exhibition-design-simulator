import { useMemo, useReducer } from 'react'
import { LAYOUT_IDS, layouts, type LayoutId, type SeedObject } from './layout'

export type EditorObject = SeedObject & {
  locked: boolean
  /** Public URL of an attached .glb; null/undefined = render the placeholder box. */
  modelUrl?: string | null
  /** true = scale the model to fit inside w/d/h; false = keep the model's own size. */
  modelFit?: boolean
}

export type ObjectsByLayout = Record<LayoutId, EditorObject[]>

/** Set an object (insert or replace), or delete it with next = null. */
export type Change = { id: string; next: EditorObject | null }

/** What each touched object looked like before an action (null = it didn't exist). */
export type UndoEntry = { changes: { id: string; before: EditorObject | null }[] }

type State = {
  objects: ObjectsByLayout
  undo: Record<LayoutId, UndoEntry[]>
}

type Action =
  | { type: 'apply'; layoutId: LayoutId; changes: Change[]; undoable: boolean }
  | { type: 'pushUndo'; layoutId: LayoutId; entry: UndoEntry }
  | { type: 'undo'; layoutId: LayoutId }
  | { type: 'load'; objects: ObjectsByLayout }

const MAX_UNDO = 100

export const seedObjects = (): EditorObject[] => layouts.objects.map((o) => ({ ...o, locked: false }))

/** Changes that revert an undo entry (last change first). */
export const undoChanges = (entry: UndoEntry): Change[] =>
  [...entry.changes].reverse().map((c) => ({ id: c.id, next: c.before }))

/** Changes that turn `list` back into the seed design: drop extra objects, restore seed ones. */
export function resetChanges(list: EditorObject[]): Change[] {
  const seed = seedObjects()
  const seedIds = new Set(seed.map((o) => o.id))
  return [
    ...list.filter((o) => !seedIds.has(o.id)).map((o) => ({ id: o.id, next: null })),
    ...seed.map((o) => ({ id: o.id, next: o })),
  ]
}

function init(): State {
  const objects = {} as State['objects']
  const undo = {} as State['undo']
  for (const id of LAYOUT_IDS) {
    objects[id] = seedObjects()
    undo[id] = []
  }
  return { objects, undo }
}

function applyChanges(list: EditorObject[], changes: Change[]): EditorObject[] {
  let out = list
  for (const c of changes) {
    const exists = out.some((o) => o.id === c.id)
    if (c.next) {
      const next = c.next
      out = exists ? out.map((o) => (o.id === c.id ? next : o)) : [...out, next]
    } else if (exists) {
      out = out.filter((o) => o.id !== c.id)
    }
  }
  return out
}

function pushUndo(state: State, layoutId: LayoutId, entry: UndoEntry): State['undo'] {
  return { ...state.undo, [layoutId]: [...state.undo[layoutId], entry].slice(-MAX_UNDO) }
}

function apply(state: State, layoutId: LayoutId, changes: Change[], undoable: boolean): State {
  const list = state.objects[layoutId]
  const entry: UndoEntry = {
    changes: changes.map((c) => ({ id: c.id, before: list.find((o) => o.id === c.id) ?? null })),
  }
  return {
    objects: { ...state.objects, [layoutId]: applyChanges(list, changes) },
    undo: undoable ? pushUndo(state, layoutId, entry) : state.undo,
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'apply':
      return apply(state, action.layoutId, action.changes, action.undoable)
    case 'pushUndo':
      return { ...state, undo: pushUndo(state, action.layoutId, action.entry) }
    case 'undo': {
      const stack = state.undo[action.layoutId]
      const entry = stack[stack.length - 1]
      if (!entry) return state
      return {
        objects: {
          ...state.objects,
          [action.layoutId]: applyChanges(state.objects[action.layoutId], undoChanges(entry)),
        },
        undo: { ...state.undo, [action.layoutId]: stack.slice(0, -1) },
      }
    }
    case 'load':
      // Replace everything with the database contents; undo stacks are kept.
      return { ...state, objects: action.objects }
  }
}

/** Local editor state: objects per layout option, plus an undo stack per layout option. */
export function useEditor() {
  const [state, dispatch] = useReducer(reducer, undefined, init)
  const actions = useMemo(
    () => ({
      apply: (layoutId: LayoutId, changes: Change[], undoable = true) =>
        dispatch({ type: 'apply', layoutId, changes, undoable }),
      pushUndo: (layoutId: LayoutId, entry: UndoEntry) => dispatch({ type: 'pushUndo', layoutId, entry }),
      undo: (layoutId: LayoutId) => dispatch({ type: 'undo', layoutId }),
      load: (objects: ObjectsByLayout) => dispatch({ type: 'load', objects }),
    }),
    [],
  )
  return { state, actions }
}

export type EditorActions = ReturnType<typeof useEditor>['actions']
