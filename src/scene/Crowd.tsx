import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Color,
  CylinderGeometry,
  DataTexture,
  LinearFilter,
  Matrix4,
  NearestFilter,
  SphereGeometry,
  SRGBColorSpace,
  type InstancedMesh,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { EditorObject } from '../lib/editor'
import { inRects, layouts, type LayoutId } from '../lib/layout'
import { CrowdSim, MAX_AGENTS, type CrowdSettings, type CrowdStats } from '../sim/crowd'
import { buildNav, type NavGrid } from '../sim/navGrid'

const noRaycast = () => {}
const { w: HALL_W, d: HALL_D } = layouts.hall

/** `value`, but only after it has stopped changing for `ms` (immediately when `resetKey` changes). */
function useSettled<T>(value: T, ms: number, resetKey: unknown): T {
  const [settled, setSettled] = useState(value)
  const [key, setKey] = useState(resetKey)
  if (key !== resetKey) {
    setKey(resetKey)
    setSettled(value)
  }
  useEffect(() => {
    const t = setTimeout(() => setSettled(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return key !== resetKey ? value : settled
}

/** Low-poly person, 1.7 m tall, feet at the origin. */
function figureGeometry() {
  const body = new CylinderGeometry(0.15, 0.2, 1.42, 8).translate(0, 0.71, 0)
  const head = new SphereGeometry(0.13, 8, 6).translate(0, 1.57, 0)
  return mergeGeometries([body, head])!
}

/** people/m² -> RGBA: transparent when empty, blue → green → yellow → red as it gets crowded. */
const HEAT_STOPS: [number, number, number, number][] = [
  [0.25, 59, 130, 246],
  [0.75, 34, 197, 94],
  [1.5, 250, 204, 21],
  [2.5, 239, 68, 68],
]
function heatColor(v: number, out: Uint8Array, o: number) {
  let k = 0
  while (k < HEAT_STOPS.length - 1 && v > HEAT_STOPS[k + 1][0]) k++
  const [v0, r0, g0, b0] = HEAT_STOPS[k]
  const [v1, r1, g1, b1] = HEAT_STOPS[Math.min(k + 1, HEAT_STOPS.length - 1)]
  const t = v1 > v0 ? Math.min(1, Math.max(0, (v - v0) / (v1 - v0))) : 0
  out[o] = r0 + (r1 - r0) * t
  out[o + 1] = g0 + (g1 - g0) * t
  out[o + 2] = b0 + (b1 - b0) * t
  out[o + 3] = Math.min(1, v / 0.3) * 160
}

/** Flat plane over the whole hall showing a texture (row 0 of the data = north edge). */
function HallOverlay({ tex, y }: { tex: DataTexture; y: number }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[HALL_W / 2, y, HALL_D / 2]} raycast={noRaycast}>
      <planeGeometry args={[HALL_W, HALL_D]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  )
}

function HeatOverlay({ sim }: { sim: CrowdSim }) {
  const cols = sim.heatCols
  const rows = sim.heatRows
  const tex = useMemo(() => {
    const t = new DataTexture(new Uint8Array(cols * rows * 4), cols, rows)
    t.magFilter = LinearFilter
    t.colorSpace = SRGBColorSpace
    t.needsUpdate = true
    return t
  }, [cols, rows])
  useEffect(() => () => tex.dispose(), [tex])
  const version = useRef(-1)
  useFrame(() => {
    if (sim.heatVersion === version.current) return
    version.current = sim.heatVersion
    const data = tex.image.data as Uint8Array
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) heatColor(sim.heat[j * cols + i], data, ((rows - 1 - j) * cols + i) * 4)
    }
    tex.needsUpdate = true
  })
  return <HallOverlay tex={tex} y={0.13} />
}

function ClearanceOverlay({ nav }: { nav: NavGrid }) {
  const tex = useMemo(() => {
    const data = new Uint8Array(nav.cols * nav.rows * 4)
    for (let c = 0; c < nav.narrow.length; c++) {
      if (!nav.narrow[c]) continue
      const i = c % nav.cols
      const j = Math.floor(c / nav.cols)
      data.set([239, 68, 68, 170], ((nav.rows - 1 - j) * nav.cols + i) * 4)
    }
    const t = new DataTexture(data, nav.cols, nav.rows)
    t.magFilter = NearestFilter
    t.colorSpace = SRGBColorSpace
    t.needsUpdate = true
    return t
  }, [nav])
  useEffect(() => () => tex.dispose(), [tex])
  return <HallOverlay tex={tex} y={0.125} />
}

type Props = {
  layoutId: LayoutId
  objects: EditorObject[]
  settings: CrowdSettings
  onStats: (s: CrowdStats) => void
}

/** Local crowd simulation (not synced): instanced figures, optional heatmap and clearance overlays. */
export function Crowd({ layoutId, objects, settings, onStats }: Props) {
  const sim = useMemo(() => new CrowdSim(), [])
  // Rebuild routes only after objects stop moving (dragging changes them every frame).
  const settled = useSettled(objects, 300, layoutId)
  const active = settings.density > 0 || settings.showClearance
  const nav = useMemo(() => (active ? buildNav(layoutId, settled) : null), [active, layoutId, settled])

  useEffect(() => sim.setNav(nav), [sim, nav])
  useEffect(() => sim.setDensity(settings.density), [sim, settings.density])
  useEffect(() => {
    sim.visitorShare = settings.visitorShare
  }, [sim, settings.visitorShare])
  useEffect(() => sim.restart(), [sim, layoutId, settings.restartToken])
  useEffect(() => sim.resetPeak(), [sim, settings.density, settings.visitorShare])

  const mesh = useRef<InstancedMesh>(null)
  const geometry = useMemo(figureGeometry, [])
  useEffect(() => () => geometry.dispose(), [geometry])
  const tmp = useMemo(() => ({ m: new Matrix4(), c: new Color() }), [])
  useLayoutEffect(() => {
    // Create the per-instance color buffer up front.
    const m = mesh.current
    if (!m) return
    for (let i = 0; i < MAX_AGENTS; i++) m.setColorAt(i, tmp.c.set('#ffffff'))
    m.count = 0
  }, [tmp])

  const lastStats = useRef({ t: 0, key: '' })

  useFrame((_, dt) => {
    if (settings.playing) sim.step(Math.min(dt, 0.05))
    const m = mesh.current
    if (!m) return
    const agents = sim.agents
    const n = Math.min(agents.length, MAX_AGENTS)
    for (let i = 0; i < n; i++) {
      const a = agents[i]
      const y = nav && inRects(nav.footprint, a.x, a.z) ? nav.platformH : 0
      m.setMatrixAt(i, tmp.m.makeTranslation(a.x, y, a.z))
      m.setColorAt(i, tmp.c.setHex(a.color))
    }
    m.count = n
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true

    // Report stats ~4×/s, only when they change.
    const now = performance.now()
    if (now - lastStats.current.t > 250) {
      lastStats.current.t = now
      const s: CrowdStats = {
        inside: sim.inside,
        peak: sim.peak,
        total: n,
        area: nav?.walkableArea ?? 0,
        narrowArea: nav?.narrowArea ?? 0,
      }
      const key = `${s.inside}|${s.peak}|${s.total}|${s.area}|${s.narrowArea}`
      if (key !== lastStats.current.key) {
        lastStats.current.key = key
        onStats(s)
      }
    }
  })

  return (
    <group>
      <instancedMesh
        ref={mesh}
        args={[geometry, undefined, MAX_AGENTS]}
        frustumCulled={false}
        raycast={noRaycast}
      >
        <meshStandardMaterial roughness={0.8} />
      </instancedMesh>
      {settings.showHeat && settings.density > 0 && <HeatOverlay sim={sim} />}
      {settings.showClearance && nav && <ClearanceOverlay nav={nav} />}
    </group>
  )
}
