import { Component, Suspense, useLayoutEffect, useMemo, type ReactNode } from 'react'
import { useGLTF } from '@react-three/drei'
import { Box3, Vector3, type Mesh } from 'three'

type Size = { w: number; d: number; h: number }
type Props = Size & { url: string; fit: boolean; onError: () => void }

const noRaycast = () => {}

/** Model centered on the object's footprint, standing on its base; optionally scaled to fit w/d/h. */
function FittedModel({ url, fit, w, d, h }: Omit<Props, 'onError'>) {
  const { scene } = useGLTF(url)

  // Own copy per object (the loaded scene is cached and shared between objects with the same URL).
  const { object, size, center, minY } = useMemo(() => {
    const object = scene.clone(true)
    // The invisible footprint box handles clicks; skipping model triangles keeps hover/drag fast.
    object.traverse((o) => {
      if ((o as Mesh).isMesh) o.raycast = noRaycast
    })
    const box = new Box3().setFromObject(object)
    return { object, size: box.getSize(new Vector3()), center: box.getCenter(new Vector3()), minY: box.min.y }
  }, [scene])

  const s = fit ? Math.min(w / size.x || Infinity, h / size.y || Infinity, d / size.z || Infinity) : 1
  const scale = Number.isFinite(s) && s > 0 ? s : 1

  useLayoutEffect(() => {
    object.scale.setScalar(scale)
    object.position.set(-center.x * scale, -minY * scale, -center.z * scale)
  }, [object, scale, center, minY])

  return <primitive object={object} />
}

class ModelBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(e: Error) {
    console.warn('3D model failed to load:', e.message)
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/** Loads a .glb by URL. Shows a wireframe box while loading; calls onError if it can't be loaded. */
export function ModelView({ url, fit, w, d, h, onError }: Props) {
  const loading = (
    <mesh position-y={h / 2} scale={[w, h, d]} raycast={noRaycast}>
      <boxGeometry />
      <meshBasicMaterial color="#94a3b8" wireframe />
    </mesh>
  )
  return (
    <ModelBoundary key={url} onError={onError}>
      <Suspense fallback={loading}>
        <FittedModel url={url} fit={fit} w={w} d={d} h={h} />
      </Suspense>
    </ModelBoundary>
  )
}
