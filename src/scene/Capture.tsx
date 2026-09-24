import { useEffect, type MutableRefObject } from 'react'
import { useThree } from '@react-three/fiber'

export type CaptureFn = () => Promise<Blob | null>

/**
 * Registers a function that renders the current view and returns it as a PNG.
 * Rendering right before toBlob means we don't need preserveDrawingBuffer (which costs performance).
 */
export function Capture({ register }: { register: MutableRefObject<CaptureFn | null> }) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)

  useEffect(() => {
    register.current = () =>
      new Promise((resolve) => {
        gl.render(scene, camera)
        gl.domElement.toBlob(resolve, 'image/png') // copies the bitmap synchronously
      })
    return () => {
      register.current = null
    }
  }, [gl, scene, camera, register])

  return null
}
