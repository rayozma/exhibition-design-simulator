import { useMemo } from 'react'
import { Line, Text } from '@react-three/drei'
import { DoubleSide, ExtrudeGeometry, MeshBasicMaterial, MeshStandardMaterial, Shape, ShapeGeometry, Vector2 } from 'three'
import { DEG, type PavilionSpec } from '../lib/layout'

/**
 * Visual-only approximation of the Al Masaood Energy pavilion as designed by Elegant Qubes
 * (ADIPEC 2026 renders): dark glossy floor with an LED edge, a back canopy on leaning pylons with
 * a glass rail, the big tilted name panel, a triangular screen hanging over the walkway and
 * lightbox totems. No partition walls: the stands are open. Nothing here is selectable or
 * affects the crowd.
 */

const noRaycast = () => {}
const mat = (color: string, extra: ConstructorParameters<typeof MeshStandardMaterial>[0] = {}) =>
  new MeshStandardMaterial({ color, roughness: 0.4, ...extra })
const glow = (color: string) => new MeshBasicMaterial({ color, toneMapped: false })

/** Extrude a plan polygon ([x, z] points) upward from y to y + h. */
function slab(points: [number, number][], h: number, y: number) {
  const s = new Shape(points.map(([x, z]) => new Vector2(x, z)))
  const g = new ExtrudeGeometry(s, { depth: h, bevelEnabled: false })
  g.rotateX(Math.PI / 2) // extrusion now points down, shape y -> world z
  g.translate(0, y + h, 0)
  return g
}

/** The polygon shrunk toward its centroid. */
function inset(points: [number, number][], k: number): [number, number][] {
  const cx = points.reduce((s, p) => s + p[0], 0) / points.length
  const cz = points.reduce((s, p) => s + p[1], 0) / points.length
  return points.map(([x, z]) => [cx + (x - cx) * k, cz + (z - cz) * k])
}

/** Thin light curb and an LED line around the raised pavilion floor. */
function Platform({ P }: { P: PavilionSpec }) {
  const r = P.rect
  const curb = useMemo(() => mat('#d9d6d3', { roughness: 0.3 }), [])
  const led: [number, number, number][] = [
    [r.x, 0.09, r.z],
    [r.x + r.w, 0.09, r.z],
    [r.x + r.w, 0.09, r.z + r.d],
    [r.x, 0.09, r.z + r.d],
    [r.x, 0.09, r.z],
  ]
  const t = 0.08
  return (
    <group>
      {[
        [r.x + r.w / 2, r.z + t / 2, r.w, t],
        [r.x + r.w / 2, r.z + r.d - t / 2, r.w, t],
        [r.x + t / 2, r.z + r.d / 2, t, r.d],
        [r.x + r.w - t / 2, r.z + r.d / 2, t, r.d],
      ].map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, 0.04, z]} material={curb} raycast={noRaycast}>
          <boxGeometry args={[w, 0.08, d]} />
        </mesh>
      ))}
      <Line points={led} color={P.colors.led} lineWidth={2.5} raycast={noRaycast} />
    </group>
  )
}

/** Back wall, flat canopy with a glass rail, leaning pylons along its front edge. */
function Canopy({ P }: { P: PavilionSpec }) {
  const C = P.colors
  const d = P.deck
  const m = useMemo(
    () => ({
      top: mat('#b5b2af', { roughness: 0.35 }),
      side: mat(C.hull, { roughness: 0.3 }),
      under: mat(C.underside, { roughness: 0.6 }),
      wall: mat(C.shell, { roughness: 0.55 }),
      glass: mat(C.glass, { transparent: true, opacity: 0.25, depthWrite: false, roughness: 0.05 }),
      pylon: mat('#3a3a3d', { roughness: 0.35 }),
      strip: glow(C.led),
    }),
    [C],
  )
  const pylons = useMemo(() => {
    const xs: number[] = []
    for (let x = d.x + 1.2; x <= d.x + d.w - 1.2 + 1e-6; x += d.columnsEvery) xs.push(x)
    return xs
  }, [d])
  const lean = 9 * DEG
  const front = d.z + d.d
  return (
    <group>
      {/* back wall up to the canopy, with two horizontal LED lines */}
      <mesh position={[d.x + d.w / 2, d.y / 2, d.z + 0.075]} material={m.wall} raycast={noRaycast}>
        <boxGeometry args={[d.w, d.y, 0.15]} />
      </mesh>
      {[1.2, 2.5].map((y) => (
        <mesh key={y} position={[d.x + d.w / 2, y, d.z + 0.155]} material={m.strip} raycast={noRaycast}>
          <boxGeometry args={[d.w - 0.4, 0.03, 0.01]} />
        </mesh>
      ))}
      {/* canopy slab: light top and sides, dark underside */}
      <mesh
        position={[d.x + d.w / 2, d.y + d.thickness / 2, d.z + d.d / 2]}
        material={[m.side, m.side, m.top, m.under, m.side, m.side]}
        raycast={noRaycast}
      >
        <boxGeometry args={[d.w, d.thickness, d.d]} />
      </mesh>
      <mesh position={[d.x + d.w / 2, d.y + d.thickness - 0.1, front + 0.006]} material={m.strip} raycast={noRaycast}>
        <boxGeometry args={[d.w, 0.03, 0.01]} />
      </mesh>
      {/* glass rail on the front and both ends */}
      <mesh position={[d.x + d.w / 2, d.y + d.thickness + 0.5, front - 0.08]} material={m.glass} raycast={noRaycast}>
        <boxGeometry args={[d.w, 1.0, 0.03]} />
      </mesh>
      {[d.x + 0.08, d.x + d.w - 0.08].map((x) => (
        <mesh key={x} position={[x, d.y + d.thickness + 0.5, d.z + d.d / 2]} material={m.glass} raycast={noRaycast}>
          <boxGeometry args={[0.03, 1.0, d.d]} />
        </mesh>
      ))}
      {/* pylons leaning outward under the front edge */}
      {pylons.map((x) => (
        <group key={x} position={[x, d.y / 2, front - 0.25 - (Math.tan(lean) * d.y) / 2]} rotation-x={-lean}>
          <mesh material={m.pylon} raycast={noRaycast}>
            <boxGeometry args={[0.4, d.y / Math.cos(lean), 0.3]} />
          </mesh>
          <mesh position={[0.205, 0, 0]} material={m.strip} raycast={noRaycast}>
            <boxGeometry args={[0.01, d.y / Math.cos(lean) - 0.2, 0.03]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** The big name panel, rolled and leaning like a billboard over the canopy's front edge. */
function Header({ P }: { P: PavilionSpec }) {
  const H = P.header!
  const m = useMemo(() => ({ body: mat('#8d8a87', { roughness: 0.3 }), face: mat('#7d7a77', { roughness: 0.35 }), bar: mat('#f4f4f4') }), [])
  const t = 0.3
  const edge: [number, number, number][] = [
    [-H.w / 2, -H.h / 2, t / 2 + 0.01],
    [H.w / 2, -H.h / 2, t / 2 + 0.01],
    [H.w / 2, H.h / 2, t / 2 + 0.01],
    [-H.w / 2, H.h / 2, t / 2 + 0.01],
    [-H.w / 2, -H.h / 2, t / 2 + 0.01],
  ]
  const fs = Math.min(H.h * 0.3, H.w * 0.075)
  const barX = H.w * 0.33
  return (
    <group position={[H.x, H.y, H.z]} rotation={[H.lean * DEG, 0, H.tilt * DEG]}>
      <mesh material={m.body} raycast={noRaycast}>
        <boxGeometry args={[H.w, H.h, t]} />
      </mesh>
      <mesh position={[0, 0, t / 2 + 0.005]} material={m.face} raycast={noRaycast}>
        <boxGeometry args={[H.w - 0.3, H.h - 0.3, 0.01]} />
      </mesh>
      <Line points={edge} color={P.colors.led} lineWidth={2} raycast={noRaycast} />
      {['AL MASAOOD', 'ENERGY'].map((line, i) => (
        <Text
          key={line}
          position={[barX - 0.5, (0.5 - i) * fs * 1.15, t / 2 + 0.02]}
          fontSize={fs}
          letterSpacing={0.08}
          color="#ffffff"
          anchorX="right"
          anchorY="middle"
          raycast={noRaycast}
        >
          {line}
        </Text>
      ))}
      {[-0.17, 0, 0.17].map((dx, i) => (
        <mesh key={dx} position={[barX + dx, 0, t / 2 + 0.02]} material={m.bar} raycast={noRaycast}>
          <boxGeometry args={[0.05, H.h * (i === 1 ? 0.7 : 0.5), 0.02]} />
        </mesh>
      ))}
    </group>
  )
}

/** Triangular slab hung over the walkway, with a glowing screen on its underside. */
function HangingScreen({ P }: { P: PavilionSpec }) {
  const S = P.canopy!
  const g = useMemo(() => {
    const frame = slab(S.points, S.thickness, S.y)
    const screenPts = inset(S.points, 0.86)
    const screen = new ShapeGeometry(new Shape(screenPts.map(([x, z]) => new Vector2(x, z))))
    screen.rotateX(Math.PI / 2) // faces down, shape y -> world z
    screen.translate(0, S.y - 0.005, 0)
    const trim = inset(S.points, 0.93)
    const trimLine: [number, number, number][] = [...trim, trim[0]].map(([x, z]) => [x, S.y - 0.012, z])
    return { frame, screen, trimLine }
  }, [S])
  const m = useMemo(() => ({ frame: mat('#28282b', { roughness: 0.45 }), screen: new MeshBasicMaterial({ color: '#a9dcf3', side: DoubleSide, toneMapped: false }) }), [])
  return (
    <group>
      <mesh geometry={g.frame} material={m.frame} raycast={noRaycast} />
      <mesh geometry={g.screen} material={m.screen} raycast={noRaycast} />
      <Line points={g.trimLine} color="#ffffff" lineWidth={2} raycast={noRaycast} />
    </group>
  )
}

/** Glowing warm-white totem, or a tall poster lightbox with a blue image (front = +z). */
function Lightbox({ b }: { b: NonNullable<PavilionSpec['lightboxes']>[number] }) {
  const m = useMemo(() => ({ frame: mat('#2a2a2c', { roughness: 0.4 }), warm: glow('#fff1d6'), image: glow('#2d6f95'), sky: glow('#6fb3d6') }), [])
  if (b.kind === 'totem')
    return (
      <group position={[b.x, 0, b.z]} rotation-y={b.rotY * DEG}>
        <mesh position-y={0.03} material={m.frame} raycast={noRaycast}>
          <boxGeometry args={[b.w + 0.06, 0.06, b.d + 0.06]} />
        </mesh>
        <mesh position-y={0.06 + (b.h - 0.12) / 2} material={m.warm} raycast={noRaycast}>
          <boxGeometry args={[b.w, b.h - 0.12, b.d]} />
        </mesh>
        <mesh position-y={b.h - 0.03} material={m.frame} raycast={noRaycast}>
          <boxGeometry args={[b.w + 0.06, 0.06, b.d + 0.06]} />
        </mesh>
      </group>
    )
  return (
    <group position={[b.x, 0, b.z]} rotation-y={b.rotY * DEG}>
      <mesh position-y={b.h / 2} material={m.frame} raycast={noRaycast}>
        <boxGeometry args={[b.w, b.h, b.d]} />
      </mesh>
      <mesh position={[0, b.h * 0.55, b.d / 2 + 0.005]} material={m.image} raycast={noRaycast}>
        <boxGeometry args={[b.w - 0.1, b.h * 0.8, 0.01]} />
      </mesh>
      <mesh position={[0, b.h * 0.8, b.d / 2 + 0.012]} material={m.sky} raycast={noRaycast}>
        <boxGeometry args={[b.w - 0.1, b.h * 0.3, 0.01]} />
      </mesh>
      <Text position={[0, b.h * 0.2, b.d / 2 + 0.02]} fontSize={Math.min(0.1, b.w * 0.07)} letterSpacing={0.1} color="#ffffff" anchorX="center" anchorY="middle" raycast={noRaycast}>
        AL MASAOOD ENERGY
      </Text>
    </group>
  )
}

export function PavilionEq({ spec: P }: { spec: PavilionSpec }) {
  return (
    <group>
      <Platform P={P} />
      <Canopy P={P} />
      {P.header && <Header P={P} />}
      {P.canopy && <HangingScreen P={P} />}
      {P.lightboxes?.map((b, i) => (
        <Lightbox key={i} b={b} />
      ))}
    </group>
  )
}
