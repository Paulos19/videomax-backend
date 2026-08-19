'use client'

import { useRef, useEffect } from 'react'

interface Stain {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  maxRadius: number
  alpha: number
  color: string
}

const STAIN_PALETTE = [
  'rgba(255, 90, 0, ',    // Electric Orange
  'rgba(255, 0, 120, ',   // Neon Magenta
  'rgba(0, 240, 255, ',   // Cyber Cyan
  'rgba(168, 85, 247, ',  // Deep Violet
  'rgba(255, 200, 0, ',   // Golden Glow
]

export function BrushTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }
    window.addEventListener('resize', resize)
    resize()

    const stains: Stain[] = []
    let lastX = -100
    let lastY = -100
    let colorIdx = 0

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX
      const y = e.clientY

      const dx = x - lastX
      const dy = y - lastY
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist > 12) {
        const count = Math.min(2, Math.floor(dist / 20) + 1)
        for (let i = 0; i < count; i++) {
          const colorBase = STAIN_PALETTE[colorIdx % STAIN_PALETTE.length]
          colorIdx++

          stains.push({
            x: x + (Math.random() - 0.5) * 15,
            y: y + (Math.random() - 0.5) * 15,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8 - 0.2,
            radius: Math.random() * 20 + 25,
            maxRadius: Math.random() * 45 + 55,
            alpha: 0.65,
            color: colorBase,
          })
        }
        lastX = x
        lastY = y
      }
    }

    window.addEventListener('mousemove', handleMouseMove)

    let animId: number
    const render = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'screen'

      for (let i = stains.length - 1; i >= 0; i--) {
        const s = stains[i]
        s.x += s.vx
        s.y += s.vy
        s.radius += (s.maxRadius - s.radius) * 0.08
        s.alpha -= 0.022 // Soft quick dissolve (~500ms)

        if (s.alpha <= 0.01) {
          stains.splice(i, 1)
          continue
        }

        // Draw soft expanding watercolor/smoke stain
        const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius)
        grad.addColorStop(0, `${s.color}${s.alpha * 0.85})`)
        grad.addColorStop(0.45, `${s.color}${s.alpha * 0.45})`)
        grad.addColorStop(1, `${s.color}0)`)

        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      animId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-20 mix-blend-screen"
      style={{ width: '100vw', height: '100vh' }}
    />
  )
}
