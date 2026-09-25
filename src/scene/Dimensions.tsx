import { useMemo, useState } from 'react'
import { Html, Line, Text } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { BufferGeometry, Float32BufferAttribute, Plane, Vector3 } from 'three'
import { useDesign } from '../lib/DesignContext'
import { clearances, snapPoints, snapToPoints } from '../lib/dimensions'
import type { EditorObject } from '../lib/editor'
import { DEG, inRects } from '../lib/layout'
import type { Pt } from '../lib/layoutEdit'

const noRaycast = () => null
const RULER = '#cbd5e1'
const DIM = '#7dd3fc'
const GAP = '#fbbf24'
const MEASURE = '#f472b6'
const FLOOR = new Plane(new Vector3(0, 1, 0), 0)
const hit = new Vector3()
const m = (v: number) => `${v.toFixed(2)} m`

function Label({ x, y, z, text, color }: { x: number; y: number; z: number; text: string; color?: string }) {
  return (
    <Html position={[x, y, z]} center zIndexRange={[15, 0]} style={{ pointerEvents: 'none' }}>
      <div className="dim-label" style={color ? { background: color } : undefined}>
        {text}
      </div>
    </Html>
  )
}

/** Meter ticks and numbers along the hall's north and west edges, plus the overall hall size. */
export function Rulers() {
  const { hall } = useDesign()
  const labelStep = Math.max(hall.w, hall.d) > 30 ? 2 : 1
  const ticks = useMemo(() => {
    const pts: number[] = []
    for (let x = 0; x <= hall.w + 1e-6; x++) {
      const len = x % 5 === 0 ? 0.45 : 0.22
      pts.push(x, 0.02, 0, x, 0.02, -len)
    }
    for (let z = 0; z <= hall.d + 1e-6; z++) {
      const len = z % 5 === 0 ? 0.45 : 0.22
      pts.push(0, 0.02, z, -len, 0.02, z)
    }
    pts.push(0, 0.02, 0, hall.w, 0.02, 0, 0, 0.02, 0, 0, 0.02, hall.d)
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(pts, 3))
    return g
  }, [hall.w, hall.d])

  const xs: number[] = []
  for (let x = 0; x <= hall.w + 1e-6; x += labelStep) xs.push(x)
  const zs: number[] = []
  for (let z = labelStep; z <= hall.d + 1e-6; z += labelStep) zs.push(z)

  return (
    <group>
      <lineSegments geometry={ticks} raycast={noRaycast}>
        <lineBasicMaterial color={RULER} />
      </lineSegments>
      {xs.map((x) => (
        <Text key={`x${x}`} position={[x, 0.02, -0.75]} rotation-x={-Math.PI / 2} fontSize={0.26} color={RULER} raycast={noRaycast}>
          {`${x}`}
        </Text>
      ))}
      {zs.map((z) => (
        <Text key={`z${z}`} position={[-0.75, 0.02, z]} rotation-x={-Math.PI / 2} fontSize={0.26} color={RULER} anchorX="center" raycast={noRaycast}>
          {`${z}`}
        </Text>
      ))}
      <Text position={[hall.w / 2, 0.02, -1.45]} rotation-x={-Math.PI / 2} fontSize={0.4} color="#f8fafc" raycast={noRaycast}>
        {`← ${m(hall.w)} →`}
      </Text>
      <Text
        position={[-1.45, 0.02, hall.d / 2]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        fontSize={0.4}
        color="#f8fafc"
        raycast={noRaycast}
      >
        {`← ${m(hall.d)} →`}
      </Text>
      <Text position={[-0.75, 0.02, -0.75]} rotation-x={-Math.PI / 2} fontSize={0.22} color={RULER} raycast={noRaycast}>
        m
      </Text>
    </group>
  )
}

/** Width / depth dimension lines (turning with the object), height, and clearances to its surroundings. */
export function SelectionDims({ obj, objects }: { obj: EditorObject; objects: EditorObject[] }) {
  const design = useDesign()
  const floor = inRects(design.booth.footprint, obj.x, obj.z) ? design.booth.platformH : 0
  const y = floor + 0.04
  const off = 0.3 // dimension lines sit this far outside the footprint
  const a = obj.rotY * DEG
  const c = Math.cos(a)
  const s = Math.sin(a)
  // local (u, v) -> world, same sense as three.js rotation.y
  const w2 = (u: number, v: number): [number, number, number] => [obj.x + u * c + v * s, y, obj.z - u * s + v * c]
  const hw = obj.w / 2
  const hd = obj.d / 2
  const gaps = useMemo(() => clearances(obj, objects, design), [obj, objects, design])
  const top = floor + (obj.elev ?? 0) + obj.h

  return (
    <group>
      {/* width, behind the object (local -z) */}
      <Line points={[w2(-hw, -hd - off), w2(hw, -hd - off)]} color={DIM} lineWidth={2} raycast={noRaycast} />
      <Line points={[w2(-hw, -hd), w2(-hw, -hd - off - 0.08)]} color={DIM} lineWidth={1} raycast={noRaycast} />
      <Line points={[w2(hw, -hd), w2(hw, -hd - off - 0.08)]} color={DIM} lineWidth={1} raycast={noRaycast} />
      <Label {...{ x: w2(0, -hd - off)[0], y, z: w2(0, -hd - off)[2] }} text={`W ${m(obj.w)}`} color={DIM} />
      {/* depth, at the object's right side (local +x) */}
      <Line points={[w2(hw + off, -hd), w2(hw + off, hd)]} color={DIM} lineWidth={2} raycast={noRaycast} />
      <Line points={[w2(hw, -hd), w2(hw + off + 0.08, -hd)]} color={DIM} lineWidth={1} raycast={noRaycast} />
      <Line points={[w2(hw, hd), w2(hw + off + 0.08, hd)]} color={DIM} lineWidth={1} raycast={noRaycast} />
      <Label {...{ x: w2(hw + off, 0)[0], y, z: w2(hw + off, 0)[2] }} text={`D ${m(obj.d)}`} color={DIM} />
      {/* height (and lift) above the object */}
      <Label x={obj.x} y={top + 0.35} z={obj.z} text={`H ${m(obj.h)}${obj.elev ? ` · lift ${m(obj.elev)}` : ''}`} color={DIM} />
      {/* clearances */}
      {gaps.map((g, i) => (
        <group key={i}>
          <Line
            points={[
              [g.from.x, y, g.from.z],
              [g.to.x, y, g.to.z],
            ]}
            color={GAP}
            lineWidth={1.5}
            dashed
            dashSize={0.12}
            gapSize={0.08}
            raycast={noRaycast}
          />
          <Label x={(g.from.x + g.to.x) / 2} y={y} z={(g.from.z + g.to.z) / 2} text={m(g.gap)} color={GAP} />
        </group>
      ))}
    </group>
  )
}

export type Measurement = { a: Pt; b: Pt }

/**
 * Measure tool: click two points on the floor; they snap to nearby corners (objects, walls, zones,
 * booth, hall). Finished measurements stay until cleared.
 */
export function MeasureLayer({
  active,
  measures,
  onAdd,
  objects,
}: {
  active: boolean
  measures: Measurement[]
  onAdd: (m: Measurement) => void
  objects: EditorObject[]
}) {
  const design = useDesign()
  const [start, setStart] = useState<Pt | null>(null)
  const [cursor, setCursor] = useState<Pt | null>(null)
  const points = useMemo(() => (active ? snapPoints(objects, design) : []), [active, objects, design])
  const y = 0.2

  const point = (e: ThreeEvent<PointerEvent>): Pt | null =>
    e.ray.intersectPlane(FLOOR, hit) ? snapToPoints({ x: hit.x, z: hit.z }, points) : null

  const line = (a: Pt, b: Pt, key: string, color = MEASURE) => (
    <group key={key}>
      <Line
        points={[
          [a.x, y, a.z],
          [b.x, y, b.z],
        ]}
        color={color}
        lineWidth={2.5}
        raycast={noRaycast}
      />
      {[a, b].map((p, i) => (
        <mesh key={i} position={[p.x, y, p.z]} raycast={noRaycast}>
          <sphereGeometry args={[0.06, 12, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
      <Label x={(a.x + b.x) / 2} y={y + 0.1} z={(a.z + b.z) / 2} text={m(Math.hypot(b.x - a.x, b.z - a.z))} color={color} />
    </group>
  )

  return (
    <group>
      {measures.map((mm, i) => line(mm.a, mm.b, `m${i}`))}
      {active && start && cursor && line(start, cursor, 'preview')}
      {active && cursor && !start && (
        <mesh position={[cursor.x, y, cursor.z]} raycast={noRaycast}>
          <sphereGeometry args={[0.07, 12, 8]} />
          <meshBasicMaterial color={MEASURE} />
        </mesh>
      )}
      {active && (
        <mesh
          rotation-x={-Math.PI / 2}
          position={[design.hall.w / 2, 0.005, design.hall.d / 2]}
          onPointerMove={(e) => setCursor(point(e))}
          onPointerOut={() => setCursor(null)}
          onPointerDown={(e) => {
            if (e.button !== 0) return
            const p = point(e)
            if (!p) return
            e.stopPropagation()
            if (!start) setStart(p)
            else {
              onAdd({ a: start, b: p })
              setStart(null)
            }
          }}
        >
          <planeGeometry args={[design.hall.w + 10, design.hall.d + 10]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}
