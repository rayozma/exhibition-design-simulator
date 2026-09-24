import { Billboard, Edges, Text } from '@react-three/drei'
import { DEG, type SeedObject } from '../lib/layout'

const MATERIAL_COLORS: Record<string, string> = {
  'lacquer white': '#f7f7f5',
  black: '#1f1f1f',
}
const CATEGORY_COLORS: Record<string, string> = {
  furniture: '#9ca3af',
}

function colorOf(obj: SeedObject) {
  return (obj.material && MATERIAL_COLORS[obj.material]) || CATEGORY_COLORS[obj.category] || '#d4d4d4'
}

/** "Simulator table (laptop + monitor) – Display D" -> "2. Simulator table" */
function labelOf(obj: SeedObject) {
  const short = obj.name.split(/ – | \(/)[0]
  return obj.num ? `${obj.num}. ${short}` : short
}

/** Placeholder box/cylinder for an object, sized from w/d/h, with a name label. */
export function SceneObject({ obj, baseY }: { obj: SeedObject; baseY: number }) {
  const fontSize = Math.min(0.16, Math.max(0.1, Math.max(obj.w, obj.d) * 0.2))
  return (
    <group position={[obj.x, baseY, obj.z]}>
      <mesh rotation-y={obj.rotY * DEG} position-y={obj.h / 2} scale={[obj.w, obj.h, obj.d]}>
        {obj.shape === 'cylinder' ? <cylinderGeometry args={[0.5, 0.5, 1, 24]} /> : <boxGeometry />}
        <meshStandardMaterial color={colorOf(obj)} />
        <Edges color="#475569" threshold={20} />
      </mesh>
      <Billboard position-y={obj.h + 0.15}>
        <Text
          fontSize={fontSize}
          maxWidth={2}
          textAlign="center"
          anchorY="bottom"
          color="#ffffff"
          outlineWidth={fontSize * 0.1}
          outlineColor="#000000"
        >
          {labelOf(obj)}
        </Text>
      </Billboard>
    </group>
  )
}
