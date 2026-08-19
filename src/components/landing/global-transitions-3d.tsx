'use client'

import { useState, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { motion, useScroll, useVelocity, useSpring, useTransform } from 'framer-motion'
import * as THREE from 'three'

function SpeedParticles({ velocity }: { velocity: any }) {
  const pointsRef = useRef<THREE.Points>(null)
  
  // Create a massive field of particles
  const [positions] = useState(() => {
    const count = 3000
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30 // X spread
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50 // Y spread
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 // Z spread (depth)
    }
    return pos
  })

  useFrame((state, delta) => {
    if (!pointsRef.current) return
    
    // Read Framer Motion velocity value directly inside the rAF loop
    const speed = velocity.get() * 0.05
    
    const array = pointsRef.current.geometry.attributes.position.array as Float32Array
    
    for (let i = 0; i < array.length; i += 3) {
      // Y-axis parallax based on scroll speed
      array[i + 1] += speed * delta * 5
      
      // Wrap particles around the screen vertical boundaries to create an endless loop
      if (array[i + 1] > 25) array[i + 1] = -25
      if (array[i + 1] < -25) array[i + 1] = 25
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
      {/* We use an aggressive orange color for the particles */}
      <pointsMaterial 
        size={0.06} 
        color="#FF5A00" 
        transparent 
        opacity={0.8} 
        blending={THREE.AdditiveBlending} 
        depthWrite={false} 
      />
    </points>
  )
}

function WebGLOverlay() {
  const { scrollY } = useScroll()
  
  // Track scroll velocity
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 })
  
  // Map high absolute velocity to high opacity. 
  // When scrolling fast (transitions), the 3D particles fade in up to 40% opacity. 
  // When standing still, they fade out completely to 0.
  const velocityOpacity = useTransform(smoothVelocity, [-1500, 0, 1500], [0.6, 0, 0.6])

  return (
    <motion.div 
      className="fixed inset-0 pointer-events-none z-30 mix-blend-screen"
      style={{ opacity: velocityOpacity }}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <SpeedParticles velocity={smoothVelocity} />
      </Canvas>
    </motion.div>
  )
}

export function GlobalTransitions3D() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return <WebGLOverlay />
}
