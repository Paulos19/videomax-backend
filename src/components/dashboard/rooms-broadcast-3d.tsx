'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── 3D CYBERPUNK RADAR SCANNER & BROADCAST DISH ───────────────────
function RadarScanMesh({ isPro }: { isPro: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const radarRingRef = useRef<THREE.Mesh>(null)
  const sweepBeamRef = useRef<THREE.Mesh>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)

  const [particlePositions] = useMemo(() => {
    const count = 30
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const radius = 0.55 + Math.random() * 0.35
      pos[i * 3] = Math.cos(angle) * radius
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.2
      pos[i * 3 + 2] = Math.sin(angle) * radius
    }
    return [pos]
  }, [])

  const colorPrimary = isPro ? '#FFE600' : '#FF5A00'
  const colorSecondary = isPro ? '#FF5A00' : '#00F0FF'

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    if (radarRingRef.current) {
      radarRingRef.current.rotation.z += delta * 0.7
      radarRingRef.current.rotation.x = Math.PI / 3.2 + Math.sin(t * 0.5) * 0.08
    }
    if (sweepBeamRef.current) {
      sweepBeamRef.current.rotation.z -= delta * 1.5
      sweepBeamRef.current.rotation.x = Math.PI / 3.2 + Math.sin(t * 0.5) * 0.08
    }
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 1.2
      coreRef.current.rotation.x += delta * 0.6
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.z += delta * 0.4
      particlesRef.current.rotation.x = Math.PI / 3.2
    }
  })

  return (
    <group ref={groupRef}>
      {/* Outer Rotating Radar Disc */}
      <mesh ref={radarRingRef}>
        <ringGeometry args={[0.45, 0.9, 32]} />
        <meshBasicMaterial color={colorPrimary} wireframe transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>

      {/* Sweep Beam Line */}
      <mesh ref={sweepBeamRef}>
        <ringGeometry args={[0.15, 0.92, 8, 1, 0, Math.PI / 3.5]} />
        <meshBasicMaterial color={colorSecondary} transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>

      {/* Central Pulsing Beacon Core */}
      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.22, 0]} />
        <meshBasicMaterial color={colorPrimary} wireframe />
      </mesh>

      {/* Broadcast Signal Particles */}
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

export function RoomsBroadcast3DView({ isPro = false, className }: { isPro?: boolean; className?: string }) {
  return (
    <div className={className || 'w-24 h-24 relative flex items-center justify-center'}>
      <Canvas camera={{ position: [0, 0, 3.2], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <RadarScanMesh isPro={isPro} />
      </Canvas>
    </div>
  )
}
