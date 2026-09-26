import { useEffect, useMemo, useRef, useState } from 'react'
import { PerspectiveCamera, PointerLockControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { Raycaster, Vector2, Vector3, type PerspectiveCamera as PerspectiveCameraImpl } from 'three'
import type { EditorObject } from '../lib/editor'
import { distToFootprint, wallFootprint, type Footprint } from '../lib/geometry'
import { walkableRects } from '../lib/design'
import { HEADROOM } from '../sim/navGrid'
import { useDesign } from '../lib/DesignContext'
import { hasInfo, inRects } from '../lib/layout'

export const WALK_START_ID = 'walk-start'

const EYE = 1.6 // m above the floor
const RADIUS = 0.25 // you can't get closer than this to objects and walls
const WALK = 1.4 // m/s
const REACH = 6 // m: how far away you can "look at" an object to open its info
const CENTER = new Vector2(0, 0)
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
  objects: EditorObject[]
  onLockChange: (locked: boolean) => void
  /** Called every frame with where I am (the sync layer throttles), and once when walk mode ends. */
  onMove: (x: number, z: number, heading: number) => void
  onLeave: () => void
  /** The object with an info card in the crosshair (null = none), and opening its info (E or click). */
  onAim: (id: string | null) => void
  onInteract: (id: string) => void
}

/**
 * First-person walking: click the "Start walking" button to capture the mouse (look around),
 * WASD / arrows to move, Shift to run, Esc to release the mouse. Starts just outside the booth, facing it.
 */
export function WalkMode({ objects, onLockChange, onMove, onLeave, onAim, onInteract }: Props) {
  const design = useDesign()
  const opt = design.booth
  const walkRects = useMemo(() => walkableRects(design), [design])
  const obstacles: Footprint[] = useMemo(
    () => [...objects.filter((o) => (o.elev ?? 0) < HEADROOM), ...opt.walls.map((w) => wallFootprint(w, opt.wallT))],
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

  const canStand = (x: number, z: number) =>
    inRects(walkRects, x, z) && obstacles.every((o) => distToFootprint(o, x, z) > RADIUS)

  // Start (once, when walk mode opens) at the free walkable spot outside the booth closest to it,
  // looking at the booth's center. Falls back to the booth center.
  const [start] = useState(() => {
    const r = opt.footprint[0] ?? { x: design.hall.w / 2 - 1, z: design.hall.d / 2 - 1, w: 2, d: 2 }
    const target = new Vector3(r.x + r.w / 2, EYE, r.z + r.d / 2)
    let best: Vector3 | null = null
    let bestD = Infinity
    for (let x = 0.25; x < design.hall.w; x += 0.5) {
      for (let z = 0.25; z < design.hall.d; z += 0.5) {
        if (inRects(opt.footprint, x, z) || !canStand(x, z)) continue
        const dd = Math.hypot(x - target.x, z - target.z)
        if (dd > 1.5 && dd < bestD) {
          bestD = dd
          best = new Vector3(x, EYE, z)
        }
      }
    }
    return { pos: best ?? target.clone(), look: target }
  })
  const cam = useRef<PerspectiveCameraImpl>(null)
  useEffect(() => {
    cam.current?.position.copy(start.pos)
    cam.current?.lookAt(start.look)
  }, [start])

  // What the crosshair points at: the nearest object with an info card, within reach.
  const scene = useThree((s) => s.scene)
  const raycaster = useMemo(() => {
    const r = new Raycaster()
    r.far = REACH
    return r
  }, [])
  const locked = useRef(false)
  const aimed = useRef<string | null>(null)
  const lastAim = useRef(0)
  const latest = useRef({ objects, onAim, onInteract })
  latest.current = { objects, onAim, onInteract }
  const setAim = (id: string | null) => {
    if (id === aimed.current) return
    aimed.current = id
    latest.current.onAim(id)
  }
  const interact = () => {
    const id = aimed.current
    if (!id || !locked.current) return
    document.exitPointerLock() // free the mouse to read the info
    latest.current.onInteract(id)
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyE') interact()
    }
    const onDown = (e: MouseEvent) => {
      if (e.button === 0 && document.pointerLockElement) interact()
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
      latest.current.onAim(null)
    }
  }, [])

  // Tell others when I stop walking (switching view, or leaving the room).
  const leave = useRef(onLeave)
  leave.current = onLeave
  useEffect(() => () => leave.current(), [])

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
    p.y = EYE + (inRects(opt.footprint, p.x, p.z) ? opt.platformH : 0)
    // Share position and facing (heading in three.js rotation.y terms: 0 = facing +z).
    camera.getWorldDirection(tmp.fwd)
    onMove(p.x, p.z, Math.atan2(tmp.fwd.x, tmp.fwd.z))

    // ~10×/s: which object is in the crosshair?
    const now = performance.now()
    if (now - lastAim.current > 100) {
      lastAim.current = now
      let id: string | null = null
      if (locked.current) {
        raycaster.setFromCamera(CENTER, camera)
        const hit = raycaster.intersectObjects(scene.children, true).find((h) => h.object.userData.objectId)
        const o = hit && latest.current.objects.find((ob) => ob.id === hit.object.userData.objectId)
        if (o && hasInfo(o.info)) id = o.id
      }
      setAim(id)
    }
  })

  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault fov={70} near={0.05} far={200} />
      <PointerLockControls
        selector={`#${WALK_START_ID}`}
        onLock={() => {
          locked.current = true
          onLockChange(true)
        }}
        onUnlock={() => {
          locked.current = false
          onLockChange(false)
        }}
      />
    </>
  )
}
