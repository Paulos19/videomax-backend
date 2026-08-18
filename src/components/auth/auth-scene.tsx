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
      <div className="relative z-[1] flex w-full max-w-[980px] h-[550px] max-h-[88vh] flex-col md:flex-row rounded-[24px] bg-[#0B0B0B] shadow-[0_40px_100px_rgba(0,0,0,0.85),0_0_1px_rgba(255,255,255,0.06)_inset] animate-auth-card-in">
        
        {/* ─── Modal Left Side (Artwork + 2.5D Character + Promo) ─── */}
        <div className="relative hidden md:flex md:w-[53%] h-full rounded-l-[24px] flex-col justify-between p-6 lg:p-8">
          
          {/* Layer 1: Background Ruins Artwork (clipped to card's left boundary) */}
          <div className="absolute inset-0 rounded-l-[24px] overflow-hidden pointer-events-none">
            <div
              ref={artworkRef}
              className="absolute inset-[-4%] z-0 animate-auth-artwork-in transition-transform duration-200 ease-out"
            >
              <Image
                src="/login/fundochar.png"
                alt=""
                fill
                className="object-cover object-top"
                priority
                aria-hidden="true"
              />
              {/* Soft fade on the right seam into the dark form panel */}
              <div className="absolute inset-y-0 right-0 w-[35%] bg-gradient-to-l from-[#0B0B0B] to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-[35%] bg-gradient-to-t from-[#0B0B0B] to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Layer 2: 2.5D Character Cutout (Elongated to show full legs down to 100vh limit) */}
          <div
            ref={characterRef}
            className="pointer-events-none absolute -top-[14%] -bottom-[22%] -left-[8%] -right-[8%] z-20 animate-auth-character-in transition-transform duration-200 ease-out"
          >
            <Image
              src="/login/transparentchar.png"
              alt=""
              fill
              className="object-cover object-top drop-shadow-[0_0_50px_rgba(239,32,32,0.35)]"
              priority
              aria-hidden="true"
            />
          </div>

          {/* Layer 3: Brand Logo (Top-Left) */}
          <div className="relative z-30 animate-auth-brand-in">
            <div className="flex items-center gap-2.5">
              <div className="relative w-6 h-6 flex items-center justify-center">
                <Image
                  src="/simplelogo.png"
                  alt="VideoMax"
                  width={24}
                  height={24}
                  className="object-contain"
                  priority
                />
              </div>
              <span className="font-black tracking-wider text-[16px] brand-gradient-text drop-shadow-md">
                VIDEOMAX
              </span>
            </div>
            <p className="text-[8px] font-mono font-bold tracking-[0.25em] text-[#737373] mt-0.5 ml-8 uppercase">
              Assista. Juntos.
            </p>
          </div>

          {/* Layer 4: Promo Copy & Live Stats (Bottom-Left) */}
          <div className="relative z-30 animate-auth-brand-in max-w-[300px]">
            <h2 className="text-lg lg:text-xl font-black text-white leading-tight tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              SUA SALA.
              <br />
              <span className="text-[#FF5A00]">SEU MOMENTO.</span>
            </h2>
            <p className="text-[10.5px] text-[#A3A3A3] mt-1.5 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              Assista a vídeos em sincronia com amigos,
              converse ao vivo e viva cada cena
              como se estivessem juntos.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 mt-2.5">
              <div className="flex items-center gap-1.5 drop-shadow">
                <Users className="w-3 h-3 text-[#EF2020]" />
                <span className="text-[9.5px] text-[#D4D4D4] font-medium">Assista em sincronia</span>
              </div>
              <div className="flex items-center gap-1.5 drop-shadow">
                <MessageSquare className="w-3 h-3 text-[#FF5A00]" />
                <span className="text-[9.5px] text-[#D4D4D4] font-medium">Chat ao vivo</span>
              </div>
              <div className="flex items-center gap-1.5 drop-shadow">
                <Play className="w-3 h-3 text-[#FFB800]" />
                <span className="text-[9.5px] text-[#D4D4D4] font-medium">Sua biblioteca</span>
              </div>
            </div>

            {/* Live Users Counter */}
            <div className="mt-4">
              <LiveUsersBar />
            </div>
          </div>
        </div>

        {/* ─── Modal Right Side (Form) ─── */}
        <div className="relative z-10 flex w-full md:w-[47%] h-full flex-col rounded-r-[24px]">
          {children}
        </div>

      </div>

      {/* ═══ z-3: Foreground floating embers ═══ */}
      <ForegroundParticles />
    </div>
  )
}
