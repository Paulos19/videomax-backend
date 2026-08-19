'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion'
import { ThreeRings } from './three-rings'
import { BrushTrail } from './brush-trail'
import { Play, ArrowDown, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface DispersingLetterProps {
  char: string
  progress: MotionValue<number>
  dx: number
  dy: number
  dz: number
  rotZ: number
  rotX: number
  scaleTarget: number
}

function DispersingLetter({
  char,
  progress,
  dx,
  dy,
  dz,
  rotZ,
  rotX,
  scaleTarget,
}: DispersingLetterProps) {
  // Disperse during the first 50% of the hero scroll
  const x = useTransform(progress, [0, 0.5], [0, dx])
  const y = useTransform(progress, [0, 0.5], [0, dy])
  const z = useTransform(progress, [0, 0.5], [0, dz])
  const rotateZ = useTransform(progress, [0, 0.5], [0, rotZ])
  const rotateX = useTransform(progress, [0, 0.5], [0, rotX])
  const scale = useTransform(progress, [0, 0.5], [1, scaleTarget])
  const opacity = useTransform(progress, [0, 0.4], [1, 0])
  const filter = useTransform(progress, [0, 0.5], ['blur(0px)', 'blur(14px)'])

  return (
    <motion.span
      style={{
        x,
        y,
        z,
        rotateZ,
        rotateX,
        scale,
        opacity,
        filter,
      }}
      className="inline-block relative will-change-transform select-none"
    >
      {char}
    </motion.span>
  )
}

const LETTERS_CONFIG = [
  { char: 'V', dx: -240, dy: -140, dz: 160, rotZ: -25, rotX: 25, scaleTarget: 1.35 },
  { char: 'I', dx: -160, dy: 110, dz: -100, rotZ: 18, rotX: -20, scaleTarget: 0.8 },
  { char: 'D', dx: -80, dy: -170, dz: 210, rotZ: -15, rotX: 30, scaleTarget: 1.3 },
  { char: 'E', dx: -20, dy: 160, dz: -140, rotZ: 22, rotX: -25, scaleTarget: 0.75 },
  { char: 'O', dx: 30, dy: -190, dz: 250, rotZ: -26, rotX: 35, scaleTarget: 1.45 },
  { char: 'M', dx: 90, dy: 170, dz: -80, rotZ: 16, rotX: -18, scaleTarget: 0.85 },
  { char: 'A', dx: 170, dy: -130, dz: 180, rotZ: -20, rotX: 22, scaleTarget: 1.2 },
  { char: 'X', dx: 240, dy: 150, dz: -110, rotZ: 28, rotX: -30, scaleTarget: 1.4 },
]

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'

  // Parallax scroll logic linked to window scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.9])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const ctaOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0])

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window
      setMousePos({
        x: (e.clientX / innerWidth - 0.5) * 35,
        y: (e.clientY / innerHeight - 0.5) * 35,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full bg-[#050505] overflow-hidden flex flex-col justify-center items-center select-none"
    >
      {/* 1. Lightweight Fluid Stains Trail (Manchas Orgânicas Coloridas) */}
      <BrushTrail />

      {/* 2. Background 3D Concentric Rings */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <ThreeRings />
      </div>

      {/* 3. Ambient Subtle Radial Glow */}
      <div
        className="absolute w-[600px] h-[300px] rounded-full bg-white/5 blur-[120px] pointer-events-none transition-transform duration-200 ease-out z-0"
        style={{
          transform: `translate(${mousePos.x * 1.5}px, ${mousePos.y * 1.5}px)`,
        }}
      />

      {/* 4. Main Content with immediate dispersion on scroll */}
      <motion.div
        style={{ scale: heroScale, opacity: heroOpacity }}
        className="relative z-10 flex flex-col items-center w-full px-4 text-center"
      >
        {/* Top Cyberpunk Telemetry Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 mb-8 px-4 py-1.5 bg-[#0D0D14]/90 border border-white/20 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.06)]"
        >
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping" />
          <span className="text-[10px] sm:text-[11px] font-mono text-white font-bold tracking-widest uppercase">
            SYS_TELEMETRY: PROTOCOLO 0MS ATIVO
          </span>
        </motion.div>

        {/* ── CLEAN WHITE TYPOGRAPHY WITH 3D LETTER DISPERSION ── */}
        <div className="relative my-2 perspective-[1200px]">
          <h1 className="text-[14vw] font-black leading-[0.85] tracking-tighter text-[#FFFFFF] drop-shadow-[0_0_35px_rgba(255,255,255,0.35)] flex items-center justify-center m-0">
            {LETTERS_CONFIG.map((cfg, idx) => (
              <DispersingLetter
                key={`letter-${cfg.char}-${idx}`}
                char={cfg.char}
                progress={scrollYProgress}
                dx={cfg.dx}
                dy={cfg.dy}
                dz={cfg.dz}
                rotZ={cfg.rotZ}
                rotX={cfg.rotX}
                scaleTarget={cfg.scaleTarget}
              />
            ))}
          </h1>
        </div>

        {/* Subtitle Badges */}
        <motion.div
          style={{ opacity: ctaOpacity }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6"
        >
          <span className="px-3.5 py-1.5 bg-[#0D0D14] border border-[#262635] text-[11px] sm:text-[13px] font-mono font-bold text-[#A3A3A3] tracking-[0.25em] uppercase">
            [ ASSISTA JUNTO ]
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#FF5A00]" />
          <span className="px-3.5 py-1.5 bg-white/5 border border-white/30 text-[11px] sm:text-[13px] font-mono font-bold text-white tracking-[0.25em] uppercase shadow-[0_0_20px_rgba(255,255,255,0.08)]">
            [ SINCRONIA 0MS ]
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#FF5A00]" />
          <span className="px-3.5 py-1.5 bg-[#0D0D14] border border-[#262635] text-[11px] sm:text-[13px] font-mono font-bold text-[#A3A3A3] tracking-[0.25em] uppercase">
            [ WEBRTC P2P ]
          </span>
        </motion.div>

        {/* Direct CTA Action Button */}
        <motion.div style={{ opacity: ctaOpacity }} className="mt-8 flex items-center gap-4">
          <Link
            href={isAuthenticated ? '/dashboard' : '/register'}
            className="inline-flex items-center gap-2.5 bg-white hover:bg-[#FF5A00] text-black hover:text-black font-mono font-black text-[12px] uppercase px-8 py-4 transition-all duration-200 shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:shadow-[0_0_35px_rgba(255,90,0,0.5)] hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>{isAuthenticated ? 'CRIAR NOVA SALA 🚀' : 'CRIAR CONTA GRÁTIS'}</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll Down Indicator */}
      <motion.div
        style={{ opacity: ctaOpacity }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
      >
        <div className="text-[9px] text-[#A3A3A3] uppercase tracking-widest font-mono flex items-center gap-1.5">
          <ArrowDown className="w-3 h-3 text-[#FF5A00] animate-bounce" />
          <span>Role para explorar</span>
        </div>
        <div className="w-[1px] h-8 bg-gradient-to-b from-white to-transparent" />
      </motion.div>
    </section>
  )
}
