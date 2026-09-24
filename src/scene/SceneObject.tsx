import { memo, useRef } from 'react'
import { Plane, Vector3 } from 'three'
import { useThree, type ThreeEvent } from '@react-three/fiber'
import { Billboard, Edges, Text } from '@react-three/drei'
import type { EditorObject } from '../lib/editor'
import type { Status } from '../lib/geometry'
import { DEG, theme } from '../lib/layout'
import type { ObjectOps } from '../lib/useObjectOps'

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

const FLOOR = new Plane(new Vector3(0, 1, 0), 0)
const hit = new Vector3()

function colorOf(obj: EditorObject, status: Status) {
  return (
    STATUS_COLORS[status] ??
    ((obj.material && MATERIAL_COLORS[obj.material]) || CATEGORY_COLORS[obj.category] || '#d4d4d4')
  )
}

/** "Simulator table (laptop + monitor) – Display D" -> "2. Simulator table" */
function labelOf(obj: EditorObject) {
  const short = obj.name.split(/ – | \(/)[0]
  return `${obj.num ? `${obj.num}. ` : ''}${short}${obj.locked ? ' [locked]' : ''}`
}

type Props = {
  obj: EditorObject
  baseY: number
  status: Status
  selected: boolean
  ops: ObjectOps
  onSelect: (id: string) => void
}

/** Placeholder box/cylinder for an object, sized from w/d/h, with a name label. Click to select, drag to move. */
export const SceneObject = memo(function SceneObject({ obj, baseY, status, selected, ops, onSelect }: Props) {
  const controls = useThree((s) => s.controls) as { enabled: boolean } | null
  const drag = useRef<{ offX: number; offZ: number } | null>(null)

  const endDrag = () => {
    if (!drag.current) return
    drag.current = null
    if (controls) controls.enabled = true
    ops.dragEnd(obj.id)
  }

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (e.button !== 0) return
    e.stopPropagation()
    onSelect(obj.id)
    if (obj.locked || !e.ray.intersectPlane(FLOOR, hit)) return
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
          onPointerOver={() => (document.body.style.cursor = obj.locked ? 'not-allowed' : 'grab')}
          onPointerOut={() => (document.body.style.cursor = '')}
        >
          {obj.shape === 'cylinder' ? <cylinderGeometry args={[0.5, 0.5, 1, 24]} /> : <boxGeometry />}
          <meshStandardMaterial color={colorOf(obj, status)} />
          <Edges color={selected ? theme.ledEdge : '#475569'} threshold={20} />
        </mesh>
        {selected && (
          <mesh rotation-x={-Math.PI / 2} position-y={0.02} raycast={() => null}>
            <planeGeometry args={[obj.w + 0.12, obj.d + 0.12]} />
            <meshBasicMaterial color={theme.ledEdge} transparent opacity={0.6} depthWrite={false} />
          </mesh>
        )}
      </group>
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
          {labelOf(obj)}
        </Text>
      </Billboard>
    </group>
  )
})
