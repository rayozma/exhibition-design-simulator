import { useRef, useState } from 'react'
import { Html, Line, Text } from '@react-three/drei'
import { useThree, type ThreeEvent } from '@react-three/fiber'
import { Plane, Vector3 } from 'three'
import type { Design } from '../lib/design'
import { useDesign } from '../lib/DesignContext'
import { theme } from '../lib/layout'
import {
  addDrawn,
  clampPt,
  corners,
  getRect,
  getSeg,
  MIN_RECT,
  moveSel,
  rectFrom,
  sameSel,
  segLength,
  setRect,
  setSeg,
  snapPt,
  type LayoutSel,
  type LayoutTool,
  type Pt,
  type Seg,
} from '../lib/layoutEdit'
import type { DesignEditor } from '../lib/useDesignEditor'

const FLOOR = new Plane(new Vector3(0, 1, 0), 0)
const hit = new Vector3()
const ACCENT = theme.accent
const ENTRANCE = '#22c55e'
const fmt = (v: number) => v.toFixed(2)

type Drag =
  | { mode: 'move'; sel: LayoutSel; start: Pt; before: Design; last: Design }
  | { mode: 'corner'; sel: LayoutSel; fixed: Pt; before: Design; last: Design }
  | { mode: 'end'; sel: LayoutSel; end: 1 | 2; before: Design; last: Design }
  | { mode: 'draw'; start: Pt; cur: Pt }

type Props = {
  tool: LayoutTool
  sel: LayoutSel
  onSelect: (sel: LayoutSel) => void
  /** Called after an element was drawn (the editor switches back to the Select tool). */
  onDrawn: () => void
  snapStep: number
  editor: DesignEditor
}

const rectLine = (x: number, z: number, w: number, d: number, y: number): [number, number, number][] => [
  [x, y, z],
  [x + w, y, z],
  [x + w, y, z + d],
  [x, y, z + d],
  [x, y, z],
]

function DimLabel({ x, z, y, text }: { x: number; z: number; y: number; text: string }) {
  return (
    <Html position={[x, y, z]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <div className="dim-label">{text}</div>
    </Html>
  )
}

/**
 * Interactive layer for editing the layout on the plan: zones, booth areas, walls and entrances
 * can be selected, moved, resized (corner / end handles) and drawn with the active tool.
 */
export function LayoutEditor({ tool, sel, onSelect, onDrawn, snapStep, editor }: Props) {
  const design = useDesign()
  const controls = useThree((s) => s.controls) as { enabled: boolean } | null
  const drag = useRef<Drag | null>(null)
  const [draft, setDraft] = useState<{ a: Pt; b: Pt } | null>(null)
  const { hall, booth } = design
  const areaY = booth.platformH + 0.02

  const point = (e: ThreeEvent<PointerEvent>): Pt | null =>
    e.ray.intersectPlane(FLOOR, hit) ? clampPt(snapPt({ x: hit.x, z: hit.z }, snapStep), hall) : null

  const begin = (e: ThreeEvent<PointerEvent>, d: Drag) => {
    if (e.button !== 0) return
    e.stopPropagation()
    ;(e.target as unknown as Element).setPointerCapture(e.pointerId)
    if (controls) controls.enabled = false
    drag.current = d
  }

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    const d = drag.current
    const p = d && point(e)
    if (!d || !p) return
    e.stopPropagation()
    if (d.mode === 'draw') {
      d.cur = p
      setDraft({ a: d.start, b: p })
      return
    }
    let next = d.last
    if (d.mode === 'move') next = moveSel(d.before, d.sel, p.x - d.start.x, p.z - d.start.z)
    else if (d.mode === 'corner') {
      const r = rectFrom(d.fixed, p)
      if (r.w >= MIN_RECT && r.d >= MIN_RECT) next = setRect(d.before, d.sel, r)
    } else {
      const s = getSeg(d.before, d.sel)
      if (s) next = setSeg(d.before, d.sel, d.end === 1 ? { ...s, x1: p.x, z1: p.z } : { ...s, x2: p.x, z2: p.z })
    }
    d.last = next
    editor.preview(next)
  }

  const finish = (e?: ThreeEvent<PointerEvent>) => {
    const d = drag.current
    if (!d) return
    drag.current = null
    if (e) (e.target as unknown as Element).releasePointerCapture(e.pointerId)
    if (controls) controls.enabled = true
    if (d.mode === 'draw') {
      setDraft(null)
      const added = addDrawn(design, tool, d.start, d.cur)
      if (added) {
        editor.commit(added.design, design)
        onSelect(added.sel)
        onDrawn()
      }
      return
    }
    editor.commit(d.last, d.before)
  }

  const dragProps = {
    onPointerMove: onMove,
    onPointerUp: (e: ThreeEvent<PointerEvent>) => finish(e),
    onLostPointerCapture: () => finish(),
  }

  const selectAndMove = (e: ThreeEvent<PointerEvent>, s: LayoutSel) => {
    if (tool !== 'select') return
    onSelect(s)
    const p = point(e)
    if (p) begin(e, { mode: 'move', sel: s, start: p, before: design, last: design })
  }

  const cursor = (c: string) => () => (document.body.style.cursor = c)

  // Rect-like elements: zones (on the floor) and booth areas (on the platform).
  const rects: { sel: LayoutSel; r: { x: number; z: number; w: number; d: number }; y: number; color: string }[] = [
    ...design.zones.map((z) => ({ sel: { kind: 'zone', id: z.id } as LayoutSel, r: z, y: 0.03, color: '#e2e8f0' })),
    ...booth.footprint.map((r, index) => ({ sel: { kind: 'area', index } as LayoutSel, r, y: areaY, color: theme.ledEdge })),
  ]
  const segs: { sel: LayoutSel; s: Seg; wall: boolean }[] = [
    ...booth.walls.map((w) => ({ sel: { kind: 'wall', id: w.id } as LayoutSel, s: w, wall: true })),
    ...design.entrances.map((en) => ({ sel: { kind: 'entrance', id: en.id } as LayoutSel, s: en, wall: false })),
  ]

  const selRect = getRect(design, sel)
  const selSeg = getSeg(design, sel)
  const handleY = areaY + 0.25

  return (
    <group>
      {/* Click on empty floor: deselect. */}
      {tool === 'select' && (
        <mesh rotation-x={-Math.PI / 2} position={[hall.w / 2, 0.001, hall.d / 2]} onPointerDown={() => onSelect(null)}>
          <planeGeometry args={[hall.w + 40, hall.d + 40]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}

      {rects.map(({ sel: s, r, y, color }) => {
        const selected = sameSel(s, sel)
        return (
          <group key={JSON.stringify(s)}>
            <mesh
              rotation-x={-Math.PI / 2}
              position={[r.x + r.w / 2, y, r.z + r.d / 2]}
              onPointerDown={(e) => selectAndMove(e, s)}
              onPointerOver={tool === 'select' ? cursor('move') : undefined}
              onPointerOut={cursor('')}
              {...dragProps}
            >
              <planeGeometry args={[r.w, r.d]} />
              <meshBasicMaterial color={ACCENT} transparent opacity={selected ? 0.22 : 0} depthWrite={false} />
            </mesh>
            <Line
              points={rectLine(r.x, r.z, r.w, r.d, y + 0.005)}
              color={selected ? ACCENT : color}
              lineWidth={selected ? 3 : 1.2}
              transparent
              opacity={selected ? 1 : 0.7}
              raycast={() => null}
            />
          </group>
        )
      })}

      {segs.map(({ sel: s, s: seg, wall }) => {
        const selected = sameSel(s, sel)
        const len = segLength(seg)
        const angle = -Math.atan2(seg.z2 - seg.z1, seg.x2 - seg.x1)
        const midX = (seg.x1 + seg.x2) / 2
        const midZ = (seg.z1 + seg.z2) / 2
        const h = wall ? booth.wallH : 0.4
        return (
          <group key={JSON.stringify(s)}>
            <mesh
              position={[midX, h / 2, midZ]}
              rotation-y={angle}
              onPointerDown={(e) => selectAndMove(e, s)}
              onPointerOver={tool === 'select' ? cursor('move') : undefined}
              onPointerOut={cursor('')}
              {...dragProps}
            >
              <boxGeometry args={[len + 0.1, h, Math.max(0.35, wall ? booth.wallT : 0)]} />
              <meshBasicMaterial color={ACCENT} transparent opacity={selected ? 0.35 : 0} depthWrite={false} />
            </mesh>
            {!wall && (
              <>
                <Line
                  points={[
                    [seg.x1, 0.06, seg.z1],
                    [seg.x2, 0.06, seg.z2],
                  ]}
                  color={selected ? ACCENT : ENTRANCE}
                  lineWidth={5}
                  raycast={() => null}
                />
                <Text
                  position={[midX, 0.07, midZ]}
                  rotation-x={-Math.PI / 2}
                  fontSize={0.28}
                  color={ENTRANCE}
                  outlineWidth={0.02}
                  outlineColor="#000000"
                  raycast={() => null}
                >
                  Entrance{design.entrances.find((en) => en.id === (s as { id: string }).id)?.aisle ? ' ↔' : ''}
                </Text>
              </>
            )}
          </group>
        )
      })}

      {/* Handles of the selected element. */}
      {tool === 'select' &&
        selRect &&
        corners(selRect).map((c, i) => {
          const fixed = corners(selRect)[(i + 2) % 4]
          return (
            <mesh
              key={i}
              position={[c.x, handleY, c.z]}
              onPointerDown={(e) => begin(e, { mode: 'corner', sel, fixed, before: design, last: design })}
              onPointerOver={cursor('nwse-resize')}
              onPointerOut={cursor('')}
              {...dragProps}
            >
              <boxGeometry args={[0.3, 0.1, 0.3]} />
              <meshBasicMaterial color={ACCENT} />
            </mesh>
          )
        })}
      {tool === 'select' &&
        selSeg &&
        ([1, 2] as const).map((end) => (
          <mesh
            key={end}
            position={[end === 1 ? selSeg.x1 : selSeg.x2, handleY, end === 1 ? selSeg.z1 : selSeg.z2]}
            onPointerDown={(e) => begin(e, { mode: 'end', sel, end, before: design, last: design })}
            onPointerOver={cursor('crosshair')}
            onPointerOut={cursor('')}
            {...dragProps}
          >
            <cylinderGeometry args={[0.17, 0.17, 0.1, 16]} />
            <meshBasicMaterial color={ACCENT} />
          </mesh>
        ))}

      {/* Size of the selected element. */}
      {selRect && <DimLabel x={selRect.x + selRect.w / 2} z={selRect.z + selRect.d / 2} y={handleY} text={`${fmt(selRect.w)} × ${fmt(selRect.d)} m`} />}
      {selSeg && <DimLabel x={(selSeg.x1 + selSeg.x2) / 2} z={(selSeg.z1 + selSeg.z2) / 2} y={handleY + 0.3} text={`${fmt(segLength(selSeg))} m`} />}

      {/* Drawing with a tool: press and drag anywhere in the hall. */}
      {tool !== 'select' && (
        <mesh
          rotation-x={-Math.PI / 2}
          position={[hall.w / 2, 0.6, hall.d / 2]}
          onPointerDown={(e) => {
            const p = point(e)
            if (p) begin(e, { mode: 'draw', start: p, cur: p })
          }}
          onPointerOver={cursor('crosshair')}
          onPointerOut={cursor('')}
          {...dragProps}
        >
          <planeGeometry args={[hall.w + 2, hall.d + 2]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
      {draft &&
        (tool === 'wall' || tool === 'entrance' ? (
          <>
            <Line
              points={[
                [draft.a.x, 0.65, draft.a.z],
                [draft.b.x, 0.65, draft.b.z],
              ]}
              color={tool === 'wall' ? ACCENT : ENTRANCE}
              lineWidth={5}
              raycast={() => null}
            />
            <DimLabel
              x={(draft.a.x + draft.b.x) / 2}
              z={(draft.a.z + draft.b.z) / 2}
              y={0.9}
              text={`${fmt(segLength({ x1: draft.a.x, z1: draft.a.z, x2: draft.b.x, z2: draft.b.z }))} m`}
            />
          </>
        ) : (
          (() => {
            const r = rectFrom(draft.a, draft.b)
            return (
              <>
                <mesh rotation-x={-Math.PI / 2} position={[r.x + r.w / 2, 0.65, r.z + r.d / 2]} raycast={() => null}>
                  <planeGeometry args={[Math.max(r.w, 0.01), Math.max(r.d, 0.01)]} />
                  <meshBasicMaterial color={ACCENT} transparent opacity={0.3} depthWrite={false} />
                </mesh>
                <DimLabel x={r.x + r.w / 2} z={r.z + r.d / 2} y={0.9} text={`${fmt(r.w)} × ${fmt(r.d)} m`} />
              </>
            )
          })()
        ))}
    </group>
  )
}
