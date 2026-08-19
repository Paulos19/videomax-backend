'use client'

import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function BrutalistObject() {
  const groupRef = useRef<THREE.Group>(null)
  const targetMouse = useRef(new THREE.Vector2(0, 0))
  const currentMouse = useRef(new THREE.Vector2(0, 0))

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to -1 to +1 range
      targetMouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      targetMouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    
    // Smooth mouse follow
    currentMouse.current.lerp(targetMouse.current, 0.1)

    // Base continuous rotation
    groupRef.current.rotation.x += delta * 0.1
    groupRef.current.rotation.y += delta * 0.15

    // Reactive mouse rotation
    groupRef.current.rotation.x += currentMouse.current.y * 0.05
    groupRef.current.rotation.y += currentMouse.current.x * 0.05

    // Reactive scale (gets bigger when mouse is centered)
    const dist = currentMouse.current.length()
    const scale = 1 + Math.max(0, 1 - dist) * 0.3
    groupRef.current.scale.setScalar(scale)
  })

  return (
    <group ref={groupRef}>
      {/* Inner solid geometry - Brutalist black box feeling */}
      <mesh>
        <boxGeometry args={[2.5, 2.5, 2.5]} />
        <meshBasicMaterial color="#080808" />
      </mesh>
      
      {/* Outer wireframe - Technical grid feeling */}
      <mesh>
        <boxGeometry args={[2.5, 2.5, 2.5]} />
        <meshBasicMaterial color="#FF5A00" wireframe transparent opacity={0.8} />
      </mesh>
      
      {/* Vertices points */}
      <points>
        <boxGeometry args={[2.5, 2.5, 2.5]} />
        <pointsMaterial size={0.15} color="#F5F5F5" />
      </points>
      
      {/* Orbiting Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.5, 0.02, 16, 100]} />
        <meshBasicMaterial color="#333333" />
      </mesh>
    </group>
  )
}

export function ThreeFeatures() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-auto">
      <Canvas camera={{ position: [0, 0, 7], fov: 50 }}>
        <BrutalistObject />
      </Canvas>
    </div>
  )
}
