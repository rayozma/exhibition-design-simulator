import { memo, useRef, useState } from 'react'
import { BoxGeometry, ConeGeometry, CylinderGeometry, Plane, SphereGeometry, Vector3, type BufferGeometry } from 'three'
import { useThree, type ThreeEvent } from '@react-three/fiber'
import { Billboard, Edges, Text } from '@react-three/drei'
import type { EditorObject } from '../lib/editor'
import type { Status } from '../lib/geometry'
import { DEG, textColorOn, theme, type ShapeKind } from '../lib/layout'
import type { ObjectOps } from '../lib/useObjectOps'
import { ModelView } from './ModelView'
import { kindOf, ProcModel } from './ProcModels'

const MATERIAL_COLORS: Record<string, string> = {
  'lacquer white': '#f7f7f5',
  black: '#1f1f1f',
}
const CATEGORY_COLORS: Record<string, string> = {
  furniture: '#9ca3af',
}
const STATUS_COLORS: Record<Status, string | null> = {
  ok: null,
  outside: '#facc15',
  overlap: '#ef4444',
}

/** Unit-size geometries (1 × 1 × 1, centered) for the basic shapes; objects scale them to w × h × d. */
function wedgeGeometry() {
  // A box whose top front edge is pulled down to the floor: a ramp rising toward the back (-z).
  const g = new BoxGeometry(1, 1, 1)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) if (pos.getY(i) > 0 && pos.getZ(i) > 0) pos.setY(i, -0.5)
  g.computeVertexNormals()
  return g
}
const SHAPE_GEOMETRY: Record<ShapeKind, BufferGeometry> = {
  box: new BoxGeometry(1, 1, 1),
  panel: new BoxGeometry(1, 1, 1),
  sign: new BoxGeometry(1, 1, 1),
  cylinder: new CylinderGeometry(0.5, 0.5, 1, 32),
  sphere: new SphereGeometry(0.5, 32, 20),
  cone: new ConeGeometry(0.5, 1, 32),
  wedge: wedgeGeometry(),
}

const FLOOR = new Plane(new Vector3(0, 1, 0), 0)
const hit = new Vector3()

/** Color when there is no warning: the object's own color, else by material, else by category. */
export function baseColorOf(obj: EditorObject) {
  return obj.color || (obj.material && MATERIAL_COLORS[obj.material]) || CATEGORY_COLORS[obj.category] || '#d4d4d4'
}

function colorOf(obj: EditorObject, status: Status) {
  return STATUS_COLORS[status] ?? baseColorOf(obj)
}

/** "Simulator table (laptop + monitor) – Display D" -> "2. Simulator table" */
function labelOf(obj: EditorObject, modelFailed: boolean) {
  const short = obj.name.split(/ – | \(/)[0]
  return `${obj.num ? `${obj.num}. ` : ''}${short}${obj.locked ? ' [locked]' : ''}${modelFailed ? ' [model failed to load]' : ''}`
}

type Tag = { name: string; color: string }

type Props = {
  obj: EditorObject
  baseY: number
  status: Status
  selected: boolean
  /** Another user who has this object selected. */
  peer?: Tag
  /** Another user who is dragging this object right now (it can't be grabbed). */
  mover?: Tag
  ops: ObjectOps
  /** additive = Ctrl/Shift/Cmd held: add to or remove from the selection. */
  onSelect: (id: string, additive: boolean) => void
  /** false in walk mode: no selecting or dragging. */
  interactive: boolean
}

/**
 * An object with a name label: its uploaded .glb model, or a built-in shaped model sized from w/d/h.
 * Click to select (Ctrl/Shift+click for several), drag to move.
 */
export const SceneObject = memo(function SceneObject({
  obj,
  baseY,
  status,
  selected,
  peer,
  mover,
  ops,
  onSelect,
  interactive,
}: Props) {
  const controls = useThree((s) => s.controls) as { enabled: boolean } | null
  const drag = useRef<{ offX: number; offZ: number } | null>(null)
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const modelFailed = !!obj.modelUrl && failedUrl === obj.modelUrl
  const hasModel = !!obj.modelUrl && !modelFailed
  // Built-in shaped model (chair, stool, display…) unless an uploaded model replaces it.
  const proc = hasModel ? null : kindOf(obj)
  const hidden = hasModel || !!proc // footprint box only serves as click target / warning tint

  const endDrag = () => {
    if (!drag.current) return
    drag.current = null
    if (controls) controls.enabled = true
    ops.dragEnd()
  }

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (e.button !== 0 || !interactive) return
    e.stopPropagation()
    const additive = e.shiftKey || e.ctrlKey || e.metaKey
    onSelect(obj.id, additive)
    if (additive) return // toggling selection, not dragging
    if (obj.locked || mover || !e.ray.intersectPlane(FLOOR, hit)) return
    drag.current = { offX: hit.x - obj.x, offZ: hit.z - obj.z }
    ;(e.target as unknown as Element).setPointerCapture(e.pointerId)
    if (controls) controls.enabled = false // don't orbit while dragging
    ops.dragStart(obj.id)
  }

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!drag.current || !e.ray.intersectPlane(FLOOR, hit)) return
    e.stopPropagation()
    ops.drag(obj.id, hit.x - drag.current.offX, hit.z - drag.current.offZ)
  }

  const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (!drag.current) return
    ;(e.target as unknown as Element).releasePointerCapture(e.pointerId)
    endDrag()
  }

  const fontSize = Math.min(0.16, Math.max(0.1, Math.max(obj.w, obj.d) * 0.2))

  return (
    <group position={[obj.x, baseY, obj.z]}>
      <group rotation-y={obj.rotY * DEG}>
        <mesh
          position-y={obj.h / 2}
          scale={[obj.w, obj.h, obj.d]}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onLostPointerCapture={endDrag}
          onPointerOver={() => {
            if (interactive) document.body.style.cursor = obj.locked || mover ? 'not-allowed' : 'grab'
          }}
          onPointerOut={() => (document.body.style.cursor = '')}
        >
          <primitive object={hidden ? (obj.shape === 'cylinder' ? SHAPE_GEOMETRY.cylinder : SHAPE_GEOMETRY.box) : SHAPE_GEOMETRY[obj.shape ?? 'box'] ?? SHAPE_GEOMETRY.box} attach="geometry" />
          {hidden ? (
            // Invisible click target around the model; tinted only to show a warning status.
            <meshBasicMaterial
              color={STATUS_COLORS[status] ?? '#ffffff'}
              transparent
              opacity={status === 'ok' ? 0 : 0.28}
              depthWrite={false}
            />
          ) : (
            <meshStandardMaterial color={colorOf(obj, status)} />
          )}
          <Edges
            visible={!hidden || selected || status !== 'ok'}
            color={selected ? theme.ledEdge : hidden ? STATUS_COLORS[status] ?? '#475569' : '#475569'}
            threshold={20}
          />
        </mesh>
        {proc && <ProcModel kind={proc} obj={obj} c={baseColorOf(obj)} />}
        {!hidden && obj.shape === 'sign' && obj.text && (
          // Sign text on the front face (+z), sized to fit.
          <Text
            position={[0, obj.h / 2, obj.d / 2 + 0.005]}
            fontSize={Math.min(obj.h * 0.45, (obj.w * 1.7) / Math.max(4, obj.text.length))}
            maxWidth={obj.w * 0.92}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            color={textColorOn(baseColorOf(obj))}
            raycast={() => null}
          >
            {obj.text}
          </Text>
        )}
        {obj.modelUrl && !modelFailed && (
          <ModelView
            url={obj.modelUrl}
            fit={obj.modelFit ?? true}
            w={obj.w}
            d={obj.d}
            h={obj.h}
            onError={() => setFailedUrl(obj.modelUrl ?? null)}
          />
        )}
        {selected && (
          <mesh rotation-x={-Math.PI / 2} position-y={0.02} raycast={() => null}>
            <planeGeometry args={[obj.w + 0.12, obj.d + 0.12]} />
            <meshBasicMaterial color={theme.ledEdge} transparent opacity={0.6} depthWrite={false} />
          </mesh>
        )}
        {(mover ?? peer) && (
          <mesh rotation-x={-Math.PI / 2} position-y={0.018} raycast={() => null}>
            <planeGeometry args={[obj.w + 0.26, obj.d + 0.26]} />
            <meshBasicMaterial color={(mover ?? peer)!.color} transparent opacity={0.55} depthWrite={false} />
          </mesh>
        )}
      </group>
      {(mover ?? peer) && (
        <Billboard position-y={obj.h + 0.12}>
          <Text
            fontSize={0.11}
            anchorY="top"
            color={(mover ?? peer)!.color}
            outlineWidth={0.012}
            outlineColor="#000000"
            raycast={() => null}
          >
            {mover ? `moving: ${mover.name}` : peer!.name}
          </Text>
        </Billboard>
      )}
      <Billboard position-y={obj.h + 0.15}>
        <Text
          fontSize={fontSize}
          maxWidth={2}
          textAlign="center"
          anchorY="bottom"
          color={selected ? theme.ledEdge : '#ffffff'}
          outlineWidth={fontSize * 0.1}
          outlineColor="#000000"
          raycast={() => null}
        >
          {labelOf(obj, modelFailed)}
        </Text>
      </Billboard>
    </group>
  )
})
