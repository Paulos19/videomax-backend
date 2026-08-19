'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface ProChatAuraProps {
  className?: string
}

export function ProChatAura({ className }: ProChatAuraProps) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    let animationFrameId: number
    const width = container.clientWidth || 240
    const height = container.clientHeight || 80

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.z = 4

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Particle field with golden and amber sparkles
    const particleCount = 28
    const positions = new Float32Array(particleCount * 3)
    const speeds = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 6
      positions[i * 3 + 1] = (Math.random() - 0.5) * 3
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2
      speeds[i] = 0.005 + Math.random() * 0.01
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      color: 0xffe600,
      size: 0.07,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    // Floating golden quantum diamond
    const diamondGeom = new THREE.OctahedronGeometry(0.35, 0)
    const diamondMat = new THREE.MeshBasicMaterial({
      color: 0xffe600,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    })
    const diamond = new THREE.Mesh(diamondGeom, diamondMat)
    diamond.position.set(1.6, 0, 0)
    scene.add(diamond)

    let clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      // Rotate diamond
      diamond.rotation.x = elapsedTime * 0.4
      diamond.rotation.y = elapsedTime * 0.6
      diamond.position.y = Math.sin(elapsedTime * 2) * 0.1

      // Drift particles
      const pos = geometry.attributes.position.array as Float32Array
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3 + 1] += speeds[i]
        if (pos[i * 3 + 1] > 1.8) {
          pos[i * 3 + 1] = -1.8
        }
      }
      geometry.attributes.position.needsUpdate = true

      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {
      if (!container) return
      const newW = container.clientWidth
      const newH = container.clientHeight
      camera.aspect = newW / newH
      camera.updateProjectionMatrix()
      renderer.setSize(newW, newH)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      geometry.dispose()
      material.dispose()
      diamondGeom.dispose()
      diamondMat.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className={className || 'absolute inset-0 pointer-events-none overflow-hidden z-0'}
    />
  )
}
