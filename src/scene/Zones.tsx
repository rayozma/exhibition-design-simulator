import { Text } from '@react-three/drei'
import { textColorOn, type Zone } from '../lib/layout'

const noRaycast = () => null // zones are never selectable

function ZoneRect({ zone, showVolume }: { zone: Zone; showVolume: boolean }) {
  const volume = showVolume && zone.h > 0
  const labelY = volume ? zone.h + 0.02 : 0.02

  return (
    <group position={[zone.x + zone.w / 2, 0, zone.z + zone.d / 2]}>
      <mesh rotation-x={-Math.PI / 2} position-y={0.006} raycast={noRaycast}>
        <planeGeometry args={[zone.w, zone.d]} />
        <meshBasicMaterial color={zone.color} />
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
        color={textColorOn(zone.color)}
        raycast={noRaycast}
      >
        {zone.name}
      </Text>
    </group>
  )
}

export function Zones({ zones, showVolumes }: { zones: Zone[]; showVolumes: boolean }) {
  return (
    <group>
      {zones.map((z) => (
        <ZoneRect key={z.id} zone={z} showVolume={showVolumes} />
      ))}
    </group>
  )
}
