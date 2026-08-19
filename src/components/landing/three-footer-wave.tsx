'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function FooterWave() {
  const meshRef = useRef<THREE.Mesh>(null)
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

  // Create a plane geometry and modify its vertices
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(40, 20, 80, 40)
    geo.rotateX(-Math.PI / 2) // Lay it flat
    return geo
  }, [])

  useFrame((state) => {
    if (!meshRef.current) return
    currentMouse.current.lerp(targetMouse.current, 0.05)

    const time = state.clock.getElapsedTime()
    const positions = meshRef.current.geometry.attributes.position
    const array = positions.array as Float32Array

    for (let i = 0; i < array.length; i += 3) {
      const x = array[i]
      const z = array[i + 2]

      // Distance from mouse projection on the plane
      // Amplifying mouse coordinates to map roughly to the 3D plane dimensions
      const mx = currentMouse.current.x * 15
      const mz = currentMouse.current.y * -10

      const distanceToMouse = Math.sqrt(Math.pow(x - mx, 2) + Math.pow(z - mz, 2))
      
      // Standard gentle wave across the grid
      const wave = Math.sin(x * 0.5 + time) * Math.cos(z * 0.5 + time) * 0.3
      
      // Severe brutal distortion spike when mouse is near
      const mouseDistortion = Math.max(0, 4 - distanceToMouse) * Math.sin(time * 5 + x) * 0.8

      array[i + 1] = wave + mouseDistortion
    }

    positions.needsUpdate = true
  })

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, -3, -5]}>
      <meshBasicMaterial color="#FF5A00" wireframe transparent opacity={0.2} />
    </mesh>
  )
}

export function ThreeFooterWave() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-auto overflow-hidden z-0">
      <Canvas camera={{ position: [0, 1, 5], fov: 60 }}>
        {/* Fog to fade out the horizon smoothly into the black background */}
        <fog attach="fog" args={['#050505', 2, 12]} />
        <FooterWave />
      </Canvas>
      {/* Dark gradient overlay to ensure text legibility at the top of the footer */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/80 to-transparent pointer-events-none" />
    </div>
  )
}
