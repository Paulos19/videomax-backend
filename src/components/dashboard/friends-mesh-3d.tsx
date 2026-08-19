'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── 3D NEURAL P2P MESH / CONNECTED NODES IN THREE.JS ──────────────
function NeuralMesh3D({ isPro }: { isPro: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const linesRef = useRef<THREE.LineSegments>(null)
  const pointsRef = useRef<THREE.Points>(null)

  const [positions, linePositions] = useMemo(() => {
    const nodeCount = 14
    const pos = new Float32Array(nodeCount * 3)

    for (let i = 0; i < nodeCount; i++) {
      const theta = (i / nodeCount) * Math.PI * 2
      const phi = (i % 2 === 0 ? 0.4 : -0.4) + (Math.random() - 0.5) * 0.4
      const radius = 0.85 + Math.random() * 0.25

      pos[i * 3] = radius * Math.cos(theta) * Math.cos(phi)
      pos[i * 3 + 1] = radius * Math.sin(phi)
      pos[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi)
    }

    // Build connections between nearby nodes
    const lines: number[] = []
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dx = pos[i * 3] - pos[j * 3]
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1]
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2]
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (dist < 1.1) {
          lines.push(
            pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2],
            pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]
          )
        }
      }
    }

    return [pos, new Float32Array(lines)]
  }, [])

  const colorPrimary = isPro ? '#FFE600' : '#FF5A00'
  const colorSecondary = isPro ? '#FF8A00' : '#00F0FF'

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.6
      groupRef.current.rotation.x = Math.sin(t * 0.5) * 0.15
    }
  })

  return (
    <group ref={groupRef}>
      {/* Laser Connections Line Segments */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={linePositions.length / 3}
            array={linePositions}
            itemSize={3}
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color={colorSecondary} transparent opacity={0.65} />
      </lineSegments>

      {/* Neural Avatar Nodes */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.08} color={colorPrimary} transparent opacity={0.9} />
      </points>
    </group>
  )
}

export function FriendsMesh3DView({ isPro = false, className }: { isPro?: boolean; className?: string }) {
  return (
    <div className={className || 'w-24 h-24 relative flex items-center justify-center'}>
      <Canvas camera={{ position: [0, 0, 3.2], fov: 45 }}>
        <ambientLight intensity={0.9} />
        <NeuralMesh3D isPro={isPro} />
      </Canvas>
    </div>
  )
}
