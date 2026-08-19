'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── 3D QUANTUM DATA VAULT / HYPERCUBE (CYBERPUNK LP STYLE) ────────
function QuantumDataVaultMesh({ isPro }: { isPro: boolean }) {
  const outerCubeRef = useRef<THREE.Mesh>(null)
  const innerPolyRef = useRef<THREE.Mesh>(null)
  const ring1Ref = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)

  const [particlePositions] = useMemo(() => {
    const count = 35
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const radius = 0.9 + Math.random() * 0.4
      pos[i * 3] = Math.cos(angle) * radius
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.7
      pos[i * 3 + 2] = Math.sin(angle) * radius
    }
    return [pos]
  }, [])

  const colorPrimary = isPro ? '#FFE600' : '#FF5A00'
  const colorSecondary = isPro ? '#FF5A00' : '#FFE600'

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    if (outerCubeRef.current) {
      outerCubeRef.current.rotation.y += delta * 0.8
      outerCubeRef.current.rotation.x = Math.sin(t * 0.6) * 0.25
    }
    if (innerPolyRef.current) {
      innerPolyRef.current.rotation.y -= delta * 1.3
      innerPolyRef.current.rotation.z += delta * 0.7
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 1.1
      ring1Ref.current.rotation.x = Math.PI / 4 + Math.sin(t * 0.5) * 0.15
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.9
      ring2Ref.current.rotation.y = Math.PI / 3 + Math.cos(t * 0.5) * 0.15
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.35
    }
  })

  return (
    <group>
      {/* Outer Rotating Quantum Data Cube */}
      <mesh ref={outerCubeRef}>
        <boxGeometry args={[1.0, 1.0, 1.0]} />
        <meshBasicMaterial color={colorPrimary} wireframe transparent opacity={0.75} />
      </mesh>

      {/* Inner Glowing Polyhedron Core */}
      <mesh ref={innerPolyRef}>
        <octahedronGeometry args={[0.45, 0]} />
        <meshBasicMaterial color={colorSecondary} wireframe transparent opacity={0.9} />
      </mesh>

      {/* Orbiting Orbital Laser Ring 1 */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[0.95, 0.018, 8, 32]} />
        <meshBasicMaterial color={colorPrimary} transparent opacity={0.6} />
      </mesh>

      {/* Orbiting Orbital Laser Ring 2 */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.1, 0.015, 8, 32]} />
        <meshBasicMaterial color={colorSecondary} transparent opacity={0.45} />
      </mesh>

      {/* Quantum Sparkle Particles */}
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

export function LibraryVault3DView({ isPro = false, className }: { isPro?: boolean; className?: string }) {
  return (
    <div className={className || 'w-24 h-24 relative flex items-center justify-center'}>
      <Canvas camera={{ position: [0, 0, 3.2], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <QuantumDataVaultMesh isPro={isPro} />
      </Canvas>
    </div>
  )
}
