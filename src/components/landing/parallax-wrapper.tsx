'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export function ParallaxWrapper({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  // Sink effect: When the section hits the top of the viewport and keeps scrolling up,
  // it scales down slightly, darkens (opacity drops), creating a depth effect 
  // as the next section rolls over it.
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92])
  const opacity = useTransform(scrollYProgress, [0.3, 1], [1, 0.2])
  
  return (
    <motion.div
      ref={ref}
      style={{ scale, opacity }}
      className="origin-top relative w-full bg-[#050505] border-b border-[#222]"
    >
      {children}
    </motion.div>
  )
}
