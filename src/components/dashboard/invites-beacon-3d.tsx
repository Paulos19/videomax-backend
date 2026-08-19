'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── 3D HOLOGRAPHIC SIGNAL BEACON / TRANSPONDER ────────────────────
function QuantumBeaconMesh({ isPro }: { isPro: boolean }) {
  const pyramidRef = useRef<THREE.Mesh>(null)
  const ring1Ref = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)

  const [particlePositions] = useMemo(() => {
    const count = 30
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const radius = 0.6 + (i / count) * 0.5
      pos[i * 3] = Math.cos(angle) * radius
      pos[i * 3 + 1] = (i / count) * 1.0 - 0.5
      pos[i * 3 + 2] = Math.sin(angle) * radius
    }
    return [pos]
  }, [])

  const colorPrimary = isPro ? '#FFE600' : '#FF5A00'
  const colorSecondary = isPro ? '#FF5A00' : '#00F0FF'

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    if (pyramidRef.current) {
      pyramidRef.current.rotation.y += delta * 1.2
      pyramidRef.current.rotation.x = Math.sin(t * 0.6) * 0.15
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 1.0
      ring1Ref.current.position.y = Math.sin(t * 1.5) * 0.3
      ring1Ref.current.scale.setScalar(0.7 + Math.sin(t * 1.5) * 0.2)
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.8
      ring2Ref.current.position.y = Math.cos(t * 1.5) * 0.3
      ring2Ref.current.scale.setScalar(0.8 + Math.cos(t * 1.5) * 0.2)
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <group>
      {/* Central Holographic Beacon Pyramid/Octahedron */}
      <mesh ref={pyramidRef}>
        <octahedronGeometry args={[0.5, 0]} />
        <meshBasicMaterial color={colorPrimary} wireframe transparent opacity={0.8} />
      </mesh>

      {/* Pulsing Radio Wave Ring 1 */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[0.75, 0.015, 8, 32]} />
        <meshBasicMaterial color={colorSecondary} transparent opacity={0.65} />
      </mesh>

      {/* Pulsing Radio Wave Ring 2 */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[0.95, 0.015, 8, 32]} />
        <meshBasicMaterial color={colorPrimary} transparent opacity={0.5} />
      </mesh>

      {/* Orbiting Quantum Signal Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlePositions.length / 3}
            array={particlePositions}
            itemSize={3}
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.05} color={colorPrimary} transparent opacity={0.9} />
      </points>
    </group>
  )
}

export function InvitesBeacon3DView({ isPro = false, className }: { isPro?: boolean; className?: string }) {
  return (
    <div className={className || 'w-24 h-24 relative flex items-center justify-center'}>
      <Canvas camera={{ position: [0, 0, 2.8], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <QuantumBeaconMesh isPro={isPro} />
      </Canvas>
    </div>
  )
}
