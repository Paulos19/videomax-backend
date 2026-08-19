'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── 3D CYBERNETIC BIOMETRIC CORE / IDENTITY GYRO ──────────────────
function BiometricCoreMesh({ isPro }: { isPro: boolean }) {
  const outerRingRef = useRef<THREE.Mesh>(null)
  const innerRingRef = useRef<THREE.Mesh>(null)
  const coreIcoRef = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)

  const [particlePositions] = useMemo(() => {
    const count = 32
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const radius = 0.85 + Math.random() * 0.35
      pos[i * 3] = Math.cos(angle) * radius
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.5
      pos[i * 3 + 2] = Math.sin(angle) * radius
    }
    return [pos]
  }, [])

  const colorPrimary = isPro ? '#FFE600' : '#FF5A00'
  const colorSecondary = isPro ? '#FF5A00' : '#00F0FF'

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    if (outerRingRef.current) {
      outerRingRef.current.rotation.x = Math.PI / 4 + Math.sin(t * 0.6) * 0.2
      outerRingRef.current.rotation.y += delta * 1.0
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.y -= delta * 1.4
      innerRingRef.current.rotation.z += delta * 0.8
    }
    if (coreIcoRef.current) {
      coreIcoRef.current.rotation.y += delta * 1.8
      coreIcoRef.current.rotation.x = Math.cos(t * 0.8) * 0.3
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.4
    }
  })

  return (
    <group>
      {/* Outer Gyro Ring */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[0.9, 0.02, 8, 32]} />
        <meshBasicMaterial color={colorPrimary} transparent opacity={0.7} />
      </mesh>

      {/* Middle Gyro Ring */}
      <mesh ref={innerRingRef}>
        <torusGeometry args={[0.65, 0.018, 8, 32]} />
        <meshBasicMaterial color={colorSecondary} transparent opacity={0.8} />
      </mesh>

      {/* Central Biometric Icosahedron Core */}
      <mesh ref={coreIcoRef}>
        <icosahedronGeometry args={[0.32, 0]} />
        <meshBasicMaterial color={colorPrimary} wireframe />
      </mesh>

      {/* Orbiting Quantum Sparkles */}
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
        <pointsMaterial size={0.045} color={colorPrimary} transparent opacity={0.85} />
      </points>
    </group>
  )
}

export function ProfileCore3DView({ isPro = false, className }: { isPro?: boolean; className?: string }) {
  return (
    <div className={className || 'w-24 h-24 relative flex items-center justify-center'}>
      <Canvas camera={{ position: [0, 0, 2.8], fov: 45 }}>
        <ambientLight intensity={0.9} />
        <BiometricCoreMesh isPro={isPro} />
      </Canvas>
    </div>
  )
}
