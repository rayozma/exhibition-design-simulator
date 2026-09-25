import { Text } from '@react-three/drei'
import { useDesign } from '../lib/DesignContext'
import { textColorOn, type Zone } from '../lib/layout'

const noRaycast = () => null // zones are never selectable

/**
 * Floor rectangle + name for one pavilion zone. In `realistic` (Pavilion view) mode, exhibitor
 * zones get neutral carpet instead of their planning color, walkways stay white, and the
 * translucent volume is replaced by the booth shells drawn by <Pavilion>.
 */
function ZoneRect({ zone, showVolume, realistic }: { zone: Zone; showVolume: boolean; realistic: boolean }) {
  const volume = showVolume && !realistic && zone.h > 0
  const labelY = volume ? zone.h + 0.02 : 0.02
  const carpet = useDesign().pavilion?.colors.carpet ?? '#cfd5dd'
  const floor = realistic && !zone.walkable ? carpet : zone.color

  return (
    <group position={[zone.x + zone.w / 2, 0, zone.z + zone.d / 2]}>
      <mesh rotation-x={-Math.PI / 2} position-y={0.006} raycast={noRaycast}>
        <planeGeometry args={[zone.w, zone.d]} />
        <meshBasicMaterial color={floor} />
      </mesh>
      {volume && (
        <mesh position-y={zone.h / 2} raycast={noRaycast}>
          <boxGeometry args={[zone.w, zone.h, zone.d]} />
          <meshStandardMaterial color={zone.color} transparent opacity={0.3} depthWrite={false} />
        </mesh>
      )}
      <Text
        rotation-x={-Math.PI / 2}
        position-y={labelY}
        fontSize={Math.min(0.45, zone.d * 0.22)}
        maxWidth={zone.w * 0.9}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        color={textColorOn(floor)}
        raycast={noRaycast}
      >
        {zone.name}
      </Text>
    </group>
  )
}

export function Zones({ zones, showVolumes, realistic }: { zones: Zone[]; showVolumes: boolean; realistic: boolean }) {
  return (
    <group>
      {zones.map((z) => (
        <ZoneRect key={z.id} zone={z} showVolume={showVolumes} realistic={realistic} />
      ))}
    </group>
  )
}
