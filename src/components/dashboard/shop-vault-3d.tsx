'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── 3D QUANTUM DIAMOND / VAULT CORE IN THREE.JS ───────────────────
function QuantumDiamondMesh() {
  const gemRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)

  const [particlePositions] = useMemo(() => {
    const count = 35
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const radius = 0.8 + Math.random() * 0.4
      pos[i * 3] = Math.cos(angle) * radius
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.6
      pos[i * 3 + 2] = Math.sin(angle) * radius
    }
    return [pos]
  }, [])

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    if (gemRef.current) {
      gemRef.current.rotation.y += delta * 1.1
      gemRef.current.rotation.x = Math.sin(t * 0.8) * 0.2
    }
    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * 0.9
      ringRef.current.rotation.y = Math.PI / 4 + Math.sin(t * 0.6) * 0.2
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <group>
      {/* 3D Golden Octahedron Diamond */}
      <mesh ref={gemRef}>
        <octahedronGeometry args={[0.7, 0]} />
        <meshBasicMaterial color="#FFE600" wireframe transparent opacity={0.85} />
      </mesh>

      {/* Orbiting Halo Ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.05, 0.02, 8, 32]} />
        <meshBasicMaterial color="#FF5A00" transparent opacity={0.6} />
      </mesh>

      {/* Orbiting Sparkles */}
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
        <pointsMaterial size={0.055} color="#FFE600" transparent opacity={0.9} />
      </points>
    </group>
  )
}

export function ShopVault3DView({ className }: { className?: string }) {
  return (
    <div className={className || 'w-28 h-28 relative flex items-center justify-center'}>
      <Canvas camera={{ position: [0, 0, 3.2], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <QuantumDiamondMesh />
      </Canvas>
    </div>
  )
}
