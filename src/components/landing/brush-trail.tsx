'use client'

import { useRef, useEffect } from 'react'

export function BrushTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight
    
    // Set canvas to full screen
    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
      // Fill with black initially (difference of black = transparent)
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, width, height)
    }
    window.addEventListener('resize', resize)
    resize()

    // Mouse tracking
    let mouse = { x: width / 2, y: height / 2 }
    let lastMouse = { x: width / 2, y: height / 2 }
    let isMoving = false

    const handleMouseMove = (e: MouseEvent) => {
      lastMouse.x = mouse.x
      lastMouse.y = mouse.y
      mouse.x = e.clientX
      mouse.y = e.clientY
      isMoving = true
    }
    
    window.addEventListener('mousemove', handleMouseMove)

    // Animation Loop
    let animationFrameId: number
    
    const draw = () => {
      // 1. Fade the existing trail slowly to black
      // We use a semi-transparent black rectangle to progressively erase the white brush
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)' // Lower alpha = longer trail
      ctx.fillRect(0, 0, width, height)

      // 2. Draw the new brush stroke if mouse moved
      if (isMoving) {
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        ctx.lineWidth = 150 // Thick brush
        
        // Add a soft edge to the brush using a radial gradient
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 10, mouse.x, mouse.y, 75)
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        
        ctx.strokeStyle = gradient
        
        ctx.beginPath()
        ctx.moveTo(lastMouse.x, lastMouse.y)
        ctx.lineTo(mouse.x, mouse.y)
        ctx.stroke()
        
        // Add some noise/bubbles to the brush stroke to simulate the soapy texture
        for (let i = 0; i < 5; i++) {
          const offsetX = (Math.random() - 0.5) * 100
          const offsetY = (Math.random() - 0.5) * 100
          const radius = Math.random() * 20 + 5
          ctx.beginPath()
          ctx.arc(mouse.x + offsetX, mouse.y + offsetY, radius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5})`
          ctx.fill()
        }

        lastMouse.x = mouse.x
        lastMouse.y = mouse.y
        isMoving = false
      }

      animationFrameId = requestAnimationFrame(draw)
    }
    
    draw()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100] mix-blend-difference"
      style={{ width: '100vw', height: '100vh' }}
    />
  )
}
