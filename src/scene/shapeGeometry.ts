import { BoxGeometry, ConeGeometry, CylinderGeometry, SphereGeometry, type BufferGeometry } from 'three'
import type { ShapeKind } from '../lib/layout'

/** Unit-size geometries (1 × 1 × 1, centered) for the basic shapes; objects scale them to w × h × d. */
function wedgeGeometry() {
  // A box whose top front edge is pulled down to the floor: a ramp rising toward the back (-z).
  const g = new BoxGeometry(1, 1, 1)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) if (pos.getY(i) > 0 && pos.getZ(i) > 0) pos.setY(i, -0.5)
  g.computeVertexNormals()
  return g
}
export const SHAPE_GEOMETRY: Record<ShapeKind, BufferGeometry> = {
  box: new BoxGeometry(1, 1, 1),
  panel: new BoxGeometry(1, 1, 1),
  sign: new BoxGeometry(1, 1, 1),
  cylinder: new CylinderGeometry(0.5, 0.5, 1, 32),
  sphere: new SphereGeometry(0.5, 32, 20),
  cone: new ConeGeometry(0.5, 1, 32),
  wedge: wedgeGeometry(),
}
