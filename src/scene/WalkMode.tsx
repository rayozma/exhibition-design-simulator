import { useEffect, useMemo, useRef } from 'react'
import { PerspectiveCamera, PointerLockControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Vector3, type PerspectiveCamera as PerspectiveCameraImpl } from 'three'
import type { EditorObject } from '../lib/editor'
import { distToFootprint, wallFootprint, type Footprint } from '../lib/geometry'
import { inRects, layouts, type LayoutId } from '../lib/layout'
import { walkableRects } from '../sim/navGrid'

export const WALK_START_ID = 'walk-start'

const EYE = 1.6 // m above the floor
const RADIUS = 0.25 // you can't get closer than this to objects and walls
const WALK = 1.4 // m/s
const RUN = 3.0

const KEYS: Record<string, 'f' | 'b' | 'l' | 'r'> = {
  KeyW: 'f',
  ArrowUp: 'f',
  KeyS: 'b',
  ArrowDown: 'b',
  KeyA: 'l',
  ArrowLeft: 'l',
  KeyD: 'r',
  ArrowRight: 'r',
}

type Props = {
  layoutId: LayoutId
  objects: EditorObject[]
  onLockChange: (locked: boolean) => void
  /** Called every frame with where I am (the sync layer throttles), and once when walk mode ends. */
  onMove: (x: number, z: number, heading: number) => void
  onLeave: () => void
}

/**
 * First-person walking: click the "Start walking" button to capture the mouse (look around),
 * WASD / arrows to move, Shift to run, Esc to release the mouse. Starts on the walkway facing the booth.
 */
export function WalkMode({ layoutId, objects, onLockChange, onMove, onLeave }: Props) {
  const opt = layouts.options[layoutId]
  const walkRects = useMemo(() => walkableRects(layoutId), [layoutId])
  const obstacles: Footprint[] = useMemo(
    () => [...objects, ...opt.walls.map((w) => wallFootprint(w, opt.wallT))],
    [objects, opt],
  )

  const pressed = useRef({ f: false, b: false, l: false, r: false, run: false })
  useEffect(() => {
    const set = (e: KeyboardEvent, down: boolean) => {
      if ((e.target as HTMLElement).closest('input, textarea, select')) return
      const k = KEYS[e.code]
      if (k) {
        pressed.current[k] = down
        e.preventDefault()
      }
      if (e.key === 'Shift') pressed.current.run = down
    }
    const down = (e: KeyboardEvent) => set(e, true)
    const up = (e: KeyboardEvent) => set(e, false)
    const clear = () => Object.assign(pressed.current, { f: false, b: false, l: false, r: false, run: false })
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', clear)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', clear)
    }
  }, [])

  // Start on the walkway in front of the booth, looking into it (+z = south).
  const start = useMemo(() => {
    const r = opt.ndtFootprint[0]
    return new Vector3(r.x + r.w / 2, EYE, 7.5)
  }, [opt])
  const cam = useRef<PerspectiveCameraImpl>(null)
  useEffect(() => {
    cam.current?.position.copy(start)
    cam.current?.lookAt(start.x, EYE, start.z + 5)
  }, [start])

  // Tell others when I stop walking (switching view, or leaving the room).
  const leave = useRef(onLeave)
  leave.current = onLeave
  useEffect(() => () => leave.current(), [])

  const canStand = (x: number, z: number) =>
    inRects(walkRects, x, z) && obstacles.every((o) => distToFootprint(o, x, z) > RADIUS)

  const tmp = useMemo(() => ({ fwd: new Vector3(), side: new Vector3() }), [])
  useFrame((_, dt) => {
    const camera = cam.current
    if (!camera) return
    const k = pressed.current
    const f = (k.f ? 1 : 0) - (k.b ? 1 : 0)
    const s = (k.r ? 1 : 0) - (k.l ? 1 : 0)
    const p = camera.position
    if (f || s) {
      camera.getWorldDirection(tmp.fwd)
      tmp.fwd.y = 0
      tmp.fwd.normalize()
      tmp.side.set(-tmp.fwd.z, 0, tmp.fwd.x) // right-hand side
      const speed = (k.run ? RUN : WALK) * Math.min(dt, 0.05)
      const len = Math.hypot(f, s)
      const dx = ((tmp.fwd.x * f + tmp.side.x * s) / len) * speed
      const dz = ((tmp.fwd.z * f + tmp.side.z * s) / len) * speed
      // Move, sliding along whatever blocks the way.
      if (canStand(p.x + dx, p.z + dz)) {
        p.x += dx
        p.z += dz
      } else if (canStand(p.x + dx, p.z)) p.x += dx
      else if (canStand(p.x, p.z + dz)) p.z += dz
    }
    // Step up onto the booth platform.
    p.y = EYE + (inRects(opt.ndtFootprint, p.x, p.z) ? opt.platformH : 0)
    // Share position and facing (heading in three.js rotation.y terms: 0 = facing +z).
    camera.getWorldDirection(tmp.fwd)
    onMove(p.x, p.z, Math.atan2(tmp.fwd.x, tmp.fwd.z))
  })

  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault fov={70} near={0.05} far={200} />
      <PointerLockControls
        selector={`#${WALK_START_ID}`}
        onLock={() => onLockChange(true)}
        onUnlock={() => onLockChange(false)}
      />
    </>
  )
}
