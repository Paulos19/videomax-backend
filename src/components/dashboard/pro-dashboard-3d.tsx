'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── 1. 3D GOLDEN QUANTUM CRYSTAL CORE WITH PLASMA RINGS ──────────
function ProCrystalMesh() {
  const crystalRef = useRef<THREE.Mesh>(null)
  const innerRef = useRef<THREE.Mesh>(null)
  const ring1Ref = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)

  const [particlePositions] = useMemo(() => {
    const count = 45
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      const radius = 1.3 + Math.random() * 0.4
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = radius * Math.cos(phi)
    }
    return [pos]
  }, [])

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * 0.9
      crystalRef.current.rotation.x = Math.sin(t * 0.7) * 0.25
    }
    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 1.4
      innerRef.current.rotation.z += delta * 0.6
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 1.1
      ring1Ref.current.rotation.x = Math.PI / 3 + Math.sin(t * 0.8) * 0.2
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.8
      ring2Ref.current.rotation.y = Math.PI / 4 + Math.cos(t * 0.6) * 0.2
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.4
    }
  })

  return (
    <group>
      {/* Outer Golden Crystal Facets */}
      <mesh ref={crystalRef}>
        <octahedronGeometry args={[0.9, 0]} />
        <meshBasicMaterial color="#FFE600" wireframe transparent opacity={0.85} />
      </mesh>

      {/* Inner Glowing Amber Energy Core */}
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.45, 0]} />
        <meshBasicMaterial color="#FF5A00" wireframe transparent opacity={0.9} />
      </mesh>

      {/* Orbiting Gyro Ring 1 */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.35, 0.025, 8, 36]} />
        <meshBasicMaterial color="#FFE600" transparent opacity={0.65} />
      </mesh>

      {/* Orbiting Gyro Ring 2 */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.6, 0.02, 8, 36]} />
        <meshBasicMaterial color="#FF5A00" transparent opacity={0.5} />
      </mesh>

      {/* Quantum Sparkle Field */}
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
        <pointsMaterial size={0.065} color="#FFE600" transparent opacity={0.9} />
      </points>
    </group>
  )
}

// ── 2. VIP 3D CRYSTAL REACTOR VIEWPORT ───────────────────────────
export function ProReactor3DView({ className }: { className?: string }) {
  return (
    <div className={className || 'w-28 h-28 relative'}>
      <Canvas camera={{ position: [0, 0, 3.8], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <ProCrystalMesh />
      </Canvas>
    </div>
  )
}

// ── 3. 3D AMBIENT BACKGROUND NEBULA FOR MAXPRO DASHBOARD ─────────
function AmbientNebulaParticles() {
  const pointsRef = useRef<THREE.Points>(null)

  const [positions, colors] = useMemo(() => {
    const count = 75
    const pos = new Float32Array(count * 3)
    const cols = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6

      // Gold (#FFE600) to Electric Orange (#FF5A00) gradient colors
      if (Math.random() > 0.4) {
        cols[i * 3] = 1.0 // R
        cols[i * 3 + 1] = 0.9 // G
        cols[i * 3 + 2] = 0.0 // B
      } else {
        cols[i * 3] = 1.0
        cols[i * 3 + 1] = 0.35
        cols[i * 3 + 2] = 0.0
      }
    }
    return [pos, cols]
  }, [])

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.04
      pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.03) * 0.05
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.08} vertexColors transparent opacity={0.6} />
    </points>
  )
}

export function ProAmbientNebulaCanvas() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-40">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <AmbientNebulaParticles />
      </Canvas>
    </div>
  )
}
