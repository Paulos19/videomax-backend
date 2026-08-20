'use client'

import { useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { ForegroundParticles } from './foreground-particles'
import { LiveUsersBar } from './live-users-bar'
import { Users, MessageSquare, Play } from 'lucide-react'

interface AuthSceneProps {
  children: React.ReactNode
}

export function AuthScene({ children }: AuthSceneProps) {
  const sceneRef = useRef<HTMLDivElement>(null)
  const artworkRef = useRef<HTMLDivElement>(null)
  const characterRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!sceneRef.current) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const rect = sceneRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    if (artworkRef.current) {
      artworkRef.current.style.transform = `translate(${x * -6}px, ${y * -6}px)`
    }
    if (characterRef.current) {
      characterRef.current.style.transform = `translate(${x * 12}px, ${y * 10}px)`
    }
  }, [])

  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 768px)').matches
    if (!isDesktop) return

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  return (
    <div
      ref={sceneRef}
      className="relative isolate flex h-screen max-h-screen w-full items-center justify-center overflow-hidden bg-[#050505] select-none p-3 sm:p-4 lg:p-6"
    >
      {/* ═══ z-0: Ambient Fullscreen Background (fundo.jpg) ═══ */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/login/fundo.jpg"
          alt=""
          fill
          className="object-cover opacity-60"
          priority
          aria-hidden="true"
        />
        {/* Ambient Vignette and radial glow */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(239,32,32,0.08), #050505 85%)'
          }}
        />
      </div>

      {/* ═══ z-1: Central Modal Container (Strictly fits in 100vh) ═══ */}
      <div className="relative z-[1] flex w-full max-w-[1000px] h-[560px] max-h-[88vh] flex-col md:flex-row rounded-[20px] bg-[#09090D] border border-[#262635] shadow-[0_30px_90px_rgba(0,0,0,0.95),0_0_35px_rgba(255,90,0,0.12)] animate-auth-card-in">
        
        {/* ─── Modal Left Side (Artwork + 2.5D Character + Promo) ─── */}
        <div className="relative hidden md:flex md:w-[54%] h-full rounded-l-[20px] flex-col justify-between p-6 lg:p-8">
          
          {/* Layer 1: Background Ruins Artwork (clipped to card's left boundary) */}
          <div className="absolute inset-0 rounded-l-[20px] overflow-hidden pointer-events-none">
            <div
              ref={artworkRef}
              className="absolute inset-[-6%] z-0 animate-auth-artwork-in transition-transform duration-200 ease-out"
            >
              <Image
                src="/login/fundochar.png"
                alt="Ambiente de Fundo"
                fill
                className="object-cover object-top"
                priority
                aria-hidden="true"
              />
              {/* Soft fade on the right seam into the dark form panel */}
              <div className="absolute inset-y-0 right-0 w-[40%] bg-gradient-to-l from-[#09090D] via-[#09090D]/80 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-[#09090D] via-[#09090D]/80 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Layer 2: 2.5D Character Cutout (Pop-out overflowing card borders) */}
          <div
            ref={characterRef}
            className="pointer-events-none absolute -top-[18%] -bottom-[22%] -left-[10%] -right-[8%] z-20 animate-auth-character-in transition-transform duration-200 ease-out"
          >
            <Image
              src="/login/transparentchar.png"
              alt="Personagem 2.5D"
              fill
              className="object-cover object-top drop-shadow-[0_0_50px_rgba(255,90,0,0.45)] drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)]"
              priority
              aria-hidden="true"
            />
          </div>

          {/* Layer 3: Brand Logo & Telemetry (Top-Left) */}
          <div className="relative z-30 animate-auth-brand-in flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-[#FF5A00] flex items-center justify-center shadow-[0_0_20px_rgba(255,90,0,0.5)]">
                <Play className="w-3.5 h-3.5 text-[#050505] fill-[#050505] ml-0.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-mono font-black text-base tracking-tighter uppercase text-white leading-none">
                  VIDEOMAX
                </span>
                <span className="text-[8px] font-mono font-bold tracking-[0.25em] text-[#FF5A00] uppercase leading-none mt-1">
                  [ PROTOCOLO 0MS ]
                </span>
              </div>
            </div>
          </div>

          {/* Layer 4: Promo Copy & Live Stats (Bottom-Left) */}
          <div className="relative z-30 animate-auth-brand-in max-w-[310px]">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#0D0D14]/90 border border-white/20 text-[9px] font-mono font-bold text-white mb-2 uppercase tracking-widest backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-ping" />
              <span>SALA_CINEMA_ONLINE</span>
            </div>

            <h2 className="text-lg lg:text-xl font-black font-mono text-white leading-tight tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] uppercase">
              SUA SALA.<br />
              <span className="text-[#FF5A00] drop-shadow-[0_0_15px_rgba(255,90,0,0.6)]">SEU MOMENTO.</span>
            </h2>
            <p className="text-[11px] text-[#A3A3A3] mt-1.5 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              Assista a vídeos em sincronia perfeita com amigos, converse ao vivo e viva cada cena.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-x-2.5 gap-y-1.5 mt-2.5 font-mono text-[9px]">
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#08080C] border border-[#1F1F28] text-[#D4D4D4]">
                <Users className="w-3 h-3 text-[#FF5A00]" />
                <span>Sincronia 0ms</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#08080C] border border-[#1F1F28] text-[#D4D4D4]">
                <MessageSquare className="w-3 h-3 text-[#FF5A00]" />
                <span>Chat ao Vivo</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#08080C] border border-[#1F1F28] text-[#D4D4D4]">
                <Play className="w-3 h-3 text-[#22C55E]" />
                <span>Biblioteca</span>
              </div>
            </div>

            {/* Live Users Counter */}
            <div className="mt-3.5">
              <LiveUsersBar />
            </div>
          </div>
        </div>

        {/* ─── Modal Right Side (Form) ─── */}
        <div className="relative z-10 flex w-full md:w-[46%] h-full flex-col rounded-r-[20px] bg-[#08080C] border-t md:border-t-0 md:border-l border-[#1F1F28]">
          {/* Subtle Top-Right Cyberpunk Terminal Identifier */}
          <div className="hidden sm:flex items-center justify-between px-6 lg:px-8 pt-5 pb-0 text-[8.5px] font-mono text-[#555] tracking-widest uppercase">
            <span>[ SYS_AUTH // V2.5 ]</span>
            <span className="text-[#22C55E] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              ONLINE
            </span>
          </div>

          {children}
        </div>

      </div>

      {/* ═══ z-3: Foreground floating embers ═══ */}
      <ForegroundParticles />
    </div>
  )
}
