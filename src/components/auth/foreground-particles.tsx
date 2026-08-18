'use client'

import { useEffect, useState } from 'react'

interface Particle {
  id: number
  left: string
  top: string
  size: number
  delay: string
  duration: string
  travel: string
  peakOpacity: number
  blur: boolean
  blurAmount: number
}

export function ForegroundParticles() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    setParticles(
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: `${5 + Math.random() * 90}%`,
        top: `${20 + Math.random() * 70}%`,
        size: 1 + Math.random() * 3,
        delay: `${Math.random() * 6}s`,
        duration: `${3 + Math.random() * 5}s`,
        travel: `${-60 - Math.random() * 100}px`,
        peakOpacity: 0.2 + Math.random() * 0.4,
        blur: Math.random() > 0.6,
        blurAmount: 1 + Math.random()
      }))
    )
  }, [])

  if (particles.length === 0) return null

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[5] overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background:
              p.size > 2
                ? 'radial-gradient(circle, #FF5A00, #EF2020)'
                : '#FF5A00',
            boxShadow:
              p.size > 2
                ? `0 0 ${p.size * 3}px rgba(255,90,0,0.4)`
                : 'none',
            filter: p.blur ? `blur(${p.blurAmount}px)` : 'none',
            animation: `ember-particle-rise ${p.duration} ${p.delay} ease-out infinite`,
            ['--ember-travel' as string]: p.travel,
            ['--ember-peak-opacity' as string]: p.peakOpacity,
          }}
        />
      ))}
    </div>
  )
}
