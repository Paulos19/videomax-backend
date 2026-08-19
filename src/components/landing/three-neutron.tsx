'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function NeutronSwarm() {
  const pointsRef = useRef<THREE.Points>(null)
  const targetMouse = useRef(new THREE.Vector2(0, 0))
  const currentMouse = useRef(new THREE.Vector2(0, 0))
  
  // Track mouse globally across window
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to -1 to +1 range
      targetMouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      targetMouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Create particles
  const particleCount = 4000
  const [positions, initialPositions] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    const initPos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      // Golden ratio spiral for even distribution on a sphere
      const phi = Math.acos(-1 + (2 * i) / particleCount)
      const theta = Math.sqrt(particleCount * Math.PI) * phi
      
      const r = 2.5 + Math.random() * 0.5 // Base radius

      const x = r * Math.cos(theta) * Math.sin(phi)
      const y = r * Math.sin(theta) * Math.sin(phi)
      const z = r * Math.cos(phi)

      pos[i * 3] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z

      initPos[i * 3] = x
      initPos[i * 3 + 1] = y
      initPos[i * 3 + 2] = z
    }
    return [pos, initPos]
  }, [particleCount])

  useFrame((state) => {
    if (!pointsRef.current) return

    // Smooth mouse position
    currentMouse.current.lerp(targetMouse.current, 0.05)

    const positionsArray = pointsRef.current.geometry.attributes.position.array as Float32Array
    const time = state.clock.getElapsedTime()

    // Rotate the entire swarm slowly
    pointsRef.current.rotation.y = time * 0.1
    pointsRef.current.rotation.x = time * 0.05

    // Animate particles based on mouse and noise
    for (let i = 0; i < particleCount; i++) {
      const ix = i * 3
      const iy = i * 3 + 1
      const iz = i * 3 + 2

      const origX = initialPositions[ix]
      const origY = initialPositions[iy]
      const origZ = initialPositions[iz]

      // Mouse repulsion vector in local space
      // Note: mapping mouse screen space to 3D world space roughly
      const mx = currentMouse.current.x * 5
      const my = currentMouse.current.y * 5
      
      // We do a simple distance check from mouse projection
      const dx = origX - mx
      const dy = origY - my
      const dist = Math.sqrt(dx * dx + dy * dy)
      
      // If mouse is near, push particle out
      const push = Math.max(0, 2 - dist) * 0.5

      // Breathing animation
      const breath = Math.sin(time * 2 + origX) * 0.1

      positionsArray[ix] = origX + (origX / 2.5) * push + (origX / 2.5) * breath
      positionsArray[iy] = origY + (origY / 2.5) * push + (origY / 2.5) * breath
      positionsArray[iz] = origZ + (origZ / 2.5) * push + (origZ / 2.5) * breath
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true
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
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#FF5A00"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

export function ThreeNeutron() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <NeutronSwarm />
      </Canvas>
    </div>
  )
}
