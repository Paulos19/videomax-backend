'use client'

import { useState, useEffect } from 'react'

export function MouseMask({ children }: { children: React.ReactNode }) {
  const [mouse, setMouse] = useState({ x: -1000, y: -1000 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate position relative to the viewport
      setMouse({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div 
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{
        maskImage: `radial-gradient(circle at ${mouse.x}px ${mouse.y}px, black 0%, transparent 600px)`,
        WebkitMaskImage: `radial-gradient(circle at ${mouse.x}px ${mouse.y}px, black 0%, transparent 600px)`
      }}
    >
      {children}
    </div>
  )
}
