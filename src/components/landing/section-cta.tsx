'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ThreeNeutron } from './three-neutron'

export function SectionCTA() {
  const sectionRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start center'],
  })

  const contentScale = useTransform(scrollYProgress, [0.2, 1], [0.94, 1])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100vh] w-full bg-[#050505] flex flex-col justify-center items-center overflow-hidden border-t border-[#222]"
    >
      {/* 3D Interactive Neutron Swarm */}
      <ThreeNeutron />

      {/* Climax Content */}
      <motion.div
        className="relative z-20 flex flex-col items-center text-center px-6 max-w-[1200px] pointer-events-none"
        style={{ scale: contentScale }}
      >
        <span className="text-[10px] font-mono text-[#FF5A00] tracking-widest uppercase mb-6 mix-blend-difference">
          [INIT_SYSTEM_NOW]
        </span>
        <h2 className="text-[12vw] font-black leading-[0.8] tracking-tighter text-[#F5F5F5] mb-12 mix-blend-difference uppercase">
          Uma sala.<br />
          Um filme.
        </h2>

        {/* Primary CTA */}
        <Link href="/register" className="pointer-events-auto">
          <button className="group relative inline-flex items-center gap-4 bg-[#F5F5F5] hover:bg-[#FF5A00] text-[#050505] hover:text-[#F5F5F5] font-mono font-bold text-[14px] uppercase px-12 py-6 transition-colors cursor-pointer">
            <span>Criar Sala Agora</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </button>
        </Link>
      </motion.div>

    </section>
  )
}
