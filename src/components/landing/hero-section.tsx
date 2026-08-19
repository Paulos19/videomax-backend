'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ThreeRings } from './three-rings'
import { BrushTrail } from './brush-trail'

export function HeroSection() {
  const containerRef = useRef(null)
  
  // We make the hero section 200vh so it takes 2 screens to scroll past,
  // allowing a long, smooth parallax effect on the text.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  })

  // Brutalist scale down and fade out
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.3])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const y = useTransform(scrollYProgress, [0, 1], [0, 300])

  return (
    <section ref={containerRef} className="relative h-[150vh] w-full bg-[#050505]">
      
      {/* 
        The Brush Trail Canvas overlays the entire Hero section.
        It uses mix-blend-difference, which means where the mouse draws white strokes,
        the underlying pixels are inverted (Black bg -> White bg, White text -> Black text).
      */}
      <BrushTrail />

      {/* Sticky container that stays in viewport while scrolling through the 150vh */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center items-center">
        
        {/* Background 3D Rings */}
        <div className="absolute inset-0 z-0 opacity-40">
          <ThreeRings />
        </div>

        <motion.div 
          style={{ scale, opacity, y }}
          className="relative z-10 flex flex-col items-center pointer-events-none w-full px-4"
        >
          {/* Brutalist Typography */}
          <h1 className="text-[14vw] font-black leading-[0.85] tracking-tighter text-[#F5F5F5] text-center m-0">
            VIDEOMAX
          </h1>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-12">
            <div className="text-[12px] sm:text-[14px] font-bold text-[#A3A3A3] tracking-[0.3em] uppercase">
              Assista Junto
            </div>
            <div className="hidden sm:block w-2 h-2 rounded-full bg-[#FF5A00]" />
            <div className="text-[12px] sm:text-[14px] font-bold text-[#A3A3A3] tracking-[0.3em] uppercase">
              Sincronia 0ms
            </div>
          </div>
        </motion.div>

        {/* Scroll Down Indicator */}
        <motion.div 
          style={{ opacity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="text-[9px] text-[#A3A3A3] uppercase tracking-widest font-mono">
            Scroll to explore
          </div>
          <div className="w-[1px] h-12 bg-gradient-to-b from-[#A3A3A3] to-transparent animate-pulse" />
        </motion.div>

      </div>
    </section>
  )
}
