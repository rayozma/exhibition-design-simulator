import { useEffect, useRef } from 'react'
import type { Design } from '../lib/design'
import { useDesign } from '../lib/DesignContext'
import {
  getRect,
  getSeg,
  removeSel,
  sameSel,
  segLength,
  selLabel,
  setRect,
  setSeg,
  updateEntrance,
  updateZone,
  type LayoutSel,
  type LayoutTool,
} from '../lib/layoutEdit'
import type { DesignEditor } from '../lib/useDesignEditor'
import { Field, fmt, NumberField } from './fields'

const TOOLS: [LayoutTool, string, string][] = [
  ['select', 'Select', 'Click to select, drag to move, drag the handles to resize'],
  ['zone', '+ Zone', "Another exhibitor's booth or a blocked area"],
  ['walkway', '+ Walkway', 'Aisle or open floor where people can walk'],
  ['area', '+ Booth area', 'Part of your booth (the raised platform)'],
  ['wall', '+ Wall', 'A wall of your booth'],
  ['entrance', '+ Entrance', 'Where visitors enter and leave the hall'],
]

type Props = {
  tool: LayoutTool
  onTool: (t: LayoutTool) => void
  sel: LayoutSel
  onSelect: (s: LayoutSel) => void
  editor: DesignEditor
}

/** Sidebar in layout mode: tools, hall and booth settings, the selected element, and all elements. */
export function LayoutPanel({ tool, onTool, sel, onSelect, editor }: Props) {
  const design = useDesign()
  const set = (next: Design) => editor.commit(next, design)
  const { hall, booth } = design

  // Delete removes the selected element, Esc cancels a tool / deselects, Ctrl+Z undoes layout changes.
  const latest = useRef({ sel, tool, design })
  latest.current = { sel, tool, design }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea, select')) return
      if (document.querySelector('.overlay')) return
      const { sel: s, tool: t, design: d } = latest.current
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        editor.undo()
      } else if (e.key === 'Escape') {
        if (t !== 'select') onTool('select')
        else onSelect(null)
      } else if (s && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault()
        editor.commit(removeSel(d, s), d)
        onSelect(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editor, onSelect, onTool])

  const r = getRect(design, sel)
  const s = getSeg(design, sel)
  const zone = sel?.kind === 'zone' ? design.zones.find((z) => z.id === sel.id) : undefined
  const entrance = sel?.kind === 'entrance' ? design.entrances.find((en) => en.id === sel.id) : undefined

  const item = (key: string, label: string, detail: string, it: LayoutSel) => (
    <button key={key} className={`layout-item ${sameSel(it, sel) ? 'selected' : ''}`} onClick={() => onSelect(it)}>
      <span>{label}</span>
      <span className="muted small">{detail}</span>
    </button>
  )

  return (
    <div className="layout-panel">
      <div className="tool-grid">
        {TOOLS.map(([t, label, hint]) => (
          <button key={t} className={tool === t ? 'active' : ''} title={hint} onClick={() => onTool(t)}>
            {label}
          </button>
        ))}
      </div>
      <p className="muted small">
        {tool === 'select'
          ? 'Click an element on the plan to select it. Drag to move; drag the yellow handles to resize.'
          : 'Press and drag on the plan to draw. Esc cancels.'}
      </p>
      <div className="actions tight">
        <button onClick={editor.undo} disabled={!editor.canUndo} title="Ctrl+Z">
          Undo layout change
        </button>
      </div>

      {sel && (r || s) && (
        <>
          <h4>{selLabel(design, sel)}</h4>
          {zone && (
            <>
              <Field label="Name" value={zone.name} onCommit={(name) => set(updateZone(design, zone.id, { name: name || zone.name }))} />
              <label className="radio">
                <input
                  type="checkbox"
                  checked={!!zone.walkable}
                  onChange={(e) =>
                    set(updateZone(design, zone.id, { walkable: e.target.checked || undefined, h: e.target.checked ? 0 : zone.h || 2.5 }))
                  }
                />
                People can walk here (walkway, aisle, open floor)
              </label>
              <div className="color-row">
                <input type="color" value={zone.color} onChange={(e) => set(updateZone(design, zone.id, { color: e.target.value }))} />
                <span className="muted small">Floor color</span>
              </div>
            </>
          )}
          {r && (
            <div className="row4">
              <NumberField label="X" value={r.x} onCommit={(x) => set(setRect(design, sel, { ...r, x }))} />
              <NumberField label="Z" value={r.z} onCommit={(z) => set(setRect(design, sel, { ...r, z }))} />
              <NumberField label="W" value={r.w} min={0.25} onCommit={(w) => set(setRect(design, sel, { ...r, w }))} />
              <NumberField label="D" value={r.d} min={0.25} onCommit={(d) => set(setRect(design, sel, { ...r, d }))} />
            </div>
          )}
          {zone && !zone.walkable && (
            <NumberField label="Height (m, 0 = flat)" value={zone.h} min={0} onCommit={(h) => set(updateZone(design, zone.id, { h }))} />
          )}
          {s && (
            <>
              <div className="row4">
                <NumberField label="X1" value={s.x1} onCommit={(x1) => set(setSeg(design, sel, { ...s, x1 }))} />
                <NumberField label="Z1" value={s.z1} onCommit={(z1) => set(setSeg(design, sel, { ...s, z1 }))} />
                <NumberField label="X2" value={s.x2} onCommit={(x2) => set(setSeg(design, sel, { ...s, x2 }))} />
                <NumberField label="Z2" value={s.z2} onCommit={(z2) => set(setSeg(design, sel, { ...s, z2 }))} />
              </div>
              <p className="muted small">Length {fmt(segLength(s))} m</p>
            </>
          )}
          {entrance && (
            <Field
              label="Corridor (passers-by walk between entrances with the same name)"
              value={entrance.aisle ?? ''}
              placeholder="e.g. main aisle"
              onCommit={(aisle) => set(updateEntrance(design, entrance.id, { aisle: aisle.trim() || undefined }))}
            />
          )}
          <div className="actions">
            <button
              className="danger"
              onClick={() => {
                set(removeSel(design, sel))
                onSelect(null)
              }}
            >
              Delete {selLabel(design, sel).toLowerCase()}
            </button>
          </div>
        </>
      )}

      <h4>Hall (m)</h4>
      <div className="row3">
        <NumberField label="Width (x)" value={hall.w} min={4} onCommit={(w) => set({ ...design, hall: { ...hall, w: Math.min(w, 300) } })} />
        <NumberField label="Depth (z)" value={hall.d} min={4} onCommit={(d) => set({ ...design, hall: { ...hall, d: Math.min(d, 300) } })} />
      </div>

      <h4>Your booth</h4>
      <Field label="Name" value={booth.label} onCommit={(label) => set({ ...design, booth: { ...booth, label: label || booth.label } })} />
      <div className="row3">
        <NumberField label="Platform (m)" value={booth.platformH} min={0} onCommit={(platformH) => set({ ...design, booth: { ...booth, platformH: Math.min(platformH, 1) } })} />
        <NumberField label="Wall height" value={booth.wallH} min={0.3} onCommit={(wallH) => set({ ...design, booth: { ...booth, wallH: Math.min(wallH, 8) } })} />
        <NumberField label="Wall thick." value={booth.wallT} min={0.02} onCommit={(wallT) => set({ ...design, booth: { ...booth, wallT: Math.min(wallT, 0.6) } })} />
      </div>

      <h4>Elements</h4>
      <div className="layout-list">
        {booth.footprint.map((a, i) => item(`a${i}`, `Booth area ${i + 1}`, `${fmt(a.w)} × ${fmt(a.d)} m`, { kind: 'area', index: i }))}
        {booth.walls.map((w) => item(w.id, 'Wall', `${fmt(segLength(w))} m`, { kind: 'wall', id: w.id }))}
        {design.entrances.map((en) => item(en.id, 'Entrance', en.aisle ? `corridor: ${en.aisle}` : `${fmt(segLength(en))} m`, { kind: 'entrance', id: en.id }))}
        {design.zones.map((z) => item(z.id, z.name, `${z.walkable ? 'walkway' : 'zone'} · ${fmt(z.w)} × ${fmt(z.d)} m`, { kind: 'zone', id: z.id }))}
      </div>
    </div>
  )
}
