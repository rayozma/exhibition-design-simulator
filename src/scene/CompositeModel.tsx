import { useMemo } from 'react'
import { Text } from '@react-three/drei'
import { MeshStandardMaterial } from 'three'
import type { EditorObject } from '../lib/editor'
import { DEG, textColorOn, type CompositePart, type CompositeParts } from '../lib/layout'
import { kindOf, ProcModel } from './ProcModels'
import { SHAPE_GEOMETRY } from './shapeGeometry'

const noRaycast = () => {}
const DEFAULT_COLOR = '#e5e7eb'

const materials = new Map<string, MeshStandardMaterial>()
const mat = (color: string) => {
  let m = materials.get(color)
  if (!m) materials.set(color, (m = new MeshStandardMaterial({ color, roughness: 0.35 })))
  return m
}

/** One part: a built-in model, or a basic shape (with sign text). */
function PartView({ p }: { p: CompositePart }) {
  // Built-in models take an object-like description; only size, kind and name matter for drawing.
  const asObject = useMemo<EditorObject>(
    () => ({ id: '', name: p.name ?? '', category: p.category ?? 'shape', x: 0, z: 0, w: p.w, d: p.d, h: p.h, rotY: 0, kind: p.kind, locked: false }),
    [p],
  )
  const kind = p.kind ? kindOf(asObject) : null
  const color = p.color ?? DEFAULT_COLOR
  return (
    <group position={[p.x, p.y, p.z]} rotation-y={p.rotY * DEG}>
      {kind ? (
        <ProcModel kind={kind} obj={asObject} c={color} />
      ) : (
        <mesh
          geometry={SHAPE_GEOMETRY[p.shape ?? 'box'] ?? SHAPE_GEOMETRY.box}
          material={mat(color)}
          position-y={p.h / 2}
          scale={[p.w, p.h, p.d]}
          raycast={noRaycast}
        />
      )}
      {p.shape === 'sign' && p.text && (
        <Text
          position={[0, p.h / 2, p.d / 2 + 0.005]}
          fontSize={Math.min(p.h * 0.45, (p.w * 1.7) / Math.max(4, p.text.length))}
          maxWidth={p.w * 0.92}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          color={textColorOn(color)}
          raycast={noRaycast}
        >
          {p.text}
        </Text>
      )}
    </group>
  )
}

/** A combined object: its parts, scaled from their saved size to the object's current w / d / h. */
export function CompositeModel({ parts, w, d, h }: { parts: CompositeParts; w: number; d: number; h: number }) {
  const { base, items } = parts
  const scale: [number, number, number] = [base.w ? w / base.w : 1, base.h ? h / base.h : 1, base.d ? d / base.d : 1]
  return (
    <group scale={scale}>
      {items.map((p, i) => (
        <PartView key={i} p={p} />
      ))}
    </group>
  )
}
