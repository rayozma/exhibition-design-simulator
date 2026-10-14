import { memo, useMemo } from 'react'
import { BufferGeometry, Float32BufferAttribute, Shape, ShapeGeometry, Vector2 } from 'three'
import { DEG, type CompositeParts, type FloorMark, type SeedObject } from '../lib/layout'
import { CompositeModel } from './CompositeModel'

const noRaycast = () => {}

/** One fixed item: its parts, or a single built-in model / basic shape drawn as a one-part composite. */
function Item({ o }: { o: SeedObject }) {
  const parts = useMemo<CompositeParts>(
    () =>
      o.parts ?? {
        base: { w: o.w, d: o.d, h: o.h },
        items: [{ name: o.name, category: o.category, kind: o.kind, shape: o.shape, x: 0, y: 0, z: 0, w: o.w, d: o.d, h: o.h, rotY: 0, color: o.color, text: o.text }],
      },
    [o],
  )
  return (
    <group position={[o.x, o.elev ?? 0, o.z]} rotation-y={o.rotY * DEG}>
      <CompositeModel parts={parts} w={o.w} d={o.d} h={o.h} />
    </group>
  )
}

/** A floor polygon (filled and/or outlined), just above the zone floors and the grid. */
function Mark({ m, y }: { m: FloorMark; y: number }) {
  // Shape is drawn in x / y and laid flat by rotating -90° about x, so y = -z.
  const fill = useMemo(() => (m.color ? new ShapeGeometry(new Shape(m.points.map(([x, z]) => new Vector2(x, -z)))) : null), [m])
  const outline = useMemo(() => {
    if (!m.edge) return null
    const pts = m.points.flatMap(([x, z]) => [x, 0, z])
    return new BufferGeometry().setAttribute('position', new Float32BufferAttribute(pts, 3))
  }, [m])
  return (
    <>
      {fill && (
        <mesh geometry={fill} rotation-x={-Math.PI / 2} position-y={y} raycast={noRaycast}>
          <meshBasicMaterial color={m.color} toneMapped={false} />
        </mesh>
      )}
      {outline && (
        <lineLoop position-y={y + 0.002} raycast={noRaycast}>
          <primitive object={outline} attach="geometry" />
          <lineBasicMaterial color={m.edge} toneMapped={false} />
        </lineLoop>
      )}
    </>
  )
}

/** The design's fixed surroundings and floor graphics (not selectable). */
export const Surroundings = memo(function Surroundings({ items, marks }: { items?: SeedObject[]; marks?: FloorMark[] }) {
  return (
    <>
      {marks?.map((m, i) => <Mark key={m.id} m={m} y={0.015 + i * 0.0005} />)}
      {items?.map((o) => <Item key={o.id} o={o} />)}
    </>
  )
})
