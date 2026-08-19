'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Play, Pause, Crown, Shield, Users, MessageSquare, Heart, Sparkles, Radio, Share2 } from 'lucide-react'
import Image from 'next/image'

const ROOM_PARTICIPANTS = [
  { name: 'Lucas (Você)', role: 'host', color: '#EF2020', avatar: 'L' },
  { name: 'Marina', role: 'cohost', color: '#3B82F6', avatar: 'M' },
  { name: 'Gabriel', role: 'viewer', color: '#10B981', avatar: 'G' },
  { name: 'Beatriz', role: 'viewer', color: '#A855F7', avatar: 'B' },
]

export function SectionWatchTogether() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<'video' | 'chat' | 'viewers'>('video')
  const [isPlaying, setIsPlaying] = useState(true)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // 3D Perspective parallax
  const glowOpacity = useTransform(scrollYProgress, [0.1, 0.5, 0.9], [0.05, 0.25, 0.1])
  const uiY = useTransform(scrollYProgress, [0, 0.5], [80, -20])
  const uiRotateX = useTransform(scrollYProgress, [0, 0.5], [6, 0])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full bg-[#050505] overflow-hidden py-24 lg:py-36 flex items-center border-t border-white/[0.04]"
      style={{ perspective: '1200px' }}
    >
      {/* Volumetric Radial Glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(239,32,32,0.15) 0%, rgba(255,90,0,0.1) 40%, transparent 70%)',
          opacity: glowOpacity,
          filter: 'blur(120px)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-[1400px] px-5 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ─── LEFT: Headline & Description (5 Columns) ─── */}
          <div className="lg:col-span-5 flex flex-col justify-center text-center lg:text-left">
            {/* Headline — NO Eyebrows */}
            <h2 className="text-[38px] sm:text-[48px] lg:text-[56px] font-black leading-[0.96] tracking-tight text-white mb-6">
              Não assista sozinho.{' '}
              <span className="brand-gradient-text block mt-2">
                O cinema agora é social.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-[#A3A3A3] leading-relaxed max-w-[460px] mx-auto lg:mx-0 mb-8 font-normal">
              Transforme a maratona de séries, vídeos do YouTube e transmissões em um ponto de encontro. Distribua papéis de Host e Co-Host, controle quem pode pausar e reaja ao vivo com sua comunidade.
            </p>

            {/* Interactive Tab Selector to test UI preview modes */}
            <div className="flex items-center gap-2 justify-center lg:justify-start bg-[#0B0B0B] border border-white/[0.08] p-1.5 rounded-xl w-fit mx-auto lg:mx-0">
              <button
                onClick={() => setActiveTab('video')}
                className={`text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'video'
                    ? 'bg-[#151515] text-white border border-white/[0.1] shadow-md'
                    : 'text-[#8A8A8A] hover:text-white'
                }`}
              >
                Player em Grupo
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'chat'
                    ? 'bg-[#151515] text-white border border-white/[0.1] shadow-md'
                    : 'text-[#8A8A8A] hover:text-white'
                }`}
              >
                Chat Interativo
              </button>
              <button
                onClick={() => setActiveTab('viewers')}
                className={`text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'viewers'
                    ? 'bg-[#151515] text-white border border-white/[0.1] shadow-md'
                    : 'text-[#8A8A8A] hover:text-white'
                }`}
              >
                Cargos & Controle
              </button>
            </div>
          </div>

          {/* ─── RIGHT: Interactive 2.5D Mockup (7 Columns) ─── */}
          <motion.div
            className="lg:col-span-7 w-full relative"
            style={{
              y: uiY,
              rotateX: uiRotateX,
              transformStyle: 'preserve-3d',
            }}
          >
            <div className="bg-[#0B0B0B]/95 backdrop-blur-3xl border border-white/[0.1] rounded-2xl lg:rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.85)] p-4 lg:p-6 space-y-4">
              
              {/* Top Bar */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#EF2020] inline-block" />
                  <div className="w-3 h-3 rounded-full bg-[#FF5A00] inline-block" />
                  <div className="w-3 h-3 rounded-full bg-[#FFB800] inline-block" />
                  <span className="text-xs font-mono font-bold text-[#8A8A8A] ml-2">
                    SALA_ID: MAX-8829
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-extrabold text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <Radio className="w-3 h-3 animate-pulse" />
                    SINCRONIZADO
                  </span>
                </div>
              </div>

              {/* Dynamic View based on Active Tab */}
              {activeTab === 'video' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="relative aspect-video rounded-xl bg-black overflow-hidden group">
                    <Image
                      src="/landing/hero-bg.jpg"
                      alt="Watch Party"
                      fill
                      className="object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    >
                      <div className="w-14 h-14 rounded-full brand-gradient flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        {isPlaying ? <Pause className="w-6 h-6 text-white fill-white" /> : <Play className="w-6 h-6 text-white fill-white ml-0.5" />}
                      </div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-[#151515] p-3 rounded-xl border border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-9 h-9 rounded-lg brand-gradient flex items-center justify-center text-white cursor-pointer"
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                      </button>
                      <div>
                        <p className="text-xs font-bold text-white">Episódio Especial — Sincronia HD</p>
                        <p className="text-[10px] font-mono text-[#8A8A8A]">4 Espectadores Ativos</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {ROOM_PARTICIPANTS.map((p, i) => (
                          <div
                            key={i}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-[#0B0B0B]"
                            style={{ backgroundColor: p.color }}
                          >
                            {p.avatar}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="h-[280px] bg-[#111111] border border-white/[0.06] rounded-xl p-4 flex flex-col justify-between animate-fade-in">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#EF2020] text-white flex items-center justify-center font-bold text-xs shrink-0">L</div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#EF2020]">Lucas</span>
                          <span className="text-[9px] font-mono bg-[#FFB800]/20 text-[#FFB800] px-1.5 py-0.2 rounded font-bold">HOST</span>
                        </div>
                        <p className="text-xs text-[#F5F5F5] mt-0.5">Solta o play galera, tá sincronizado!</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#3B82F6] text-white flex items-center justify-center font-bold text-xs shrink-0">M</div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#3B82F6]">Marina</span>
                          <span className="text-[9px] font-mono bg-[#06B6D4]/20 text-[#06B6D4] px-1.5 py-0.2 rounded font-bold">CO-HOST</span>
                        </div>
                        <p className="text-xs text-[#F5F5F5] mt-0.5">Essa cena ficou espetacular 🔥🍿</p>
                      </div>
                    </div>
                  </div>

                  <div className="h-10 rounded-xl bg-[#1A1A1A] border border-white/[0.08] flex items-center px-3 justify-between">
                    <span className="text-xs text-[#8A8A8A]">Digite uma reação rápida...</span>
                    <div className="flex items-center gap-1 text-sm">
                      <span>🔥</span>
                      <span>❤️</span>
                      <span>🎉</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'viewers' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="text-xs font-mono font-bold text-[#8A8A8A] uppercase tracking-wider mb-2">
                    Hierarquia de Permissões da Sala
                  </div>
                  {ROOM_PARTICIPANTS.map((p) => (
                    <div
                      key={p.name}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#111111] border border-white/[0.06]"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg text-white font-bold flex items-center justify-center text-xs"
                          style={{ backgroundColor: p.color }}
                        >
                          {p.avatar}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{p.name}</p>
                          <p className="text-[10px] text-[#8A8A8A]">
                            {p.role === 'host'
                              ? 'Controle Total do Player'
                              : p.role === 'cohost'
                              ? 'Pode Pausar / Trocar Vídeo'
                              : 'Espectador'}
                          </p>
                        </div>
                      </div>

                      {p.role === 'host' && (
                        <div className="flex items-center gap-1 bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/30 px-2.5 py-1 rounded-md text-[10px] font-bold">
                          <Crown className="w-3 h-3" />
                          <span>HOST</span>
                        </div>
                      )}
                      {p.role === 'cohost' && (
                        <div className="flex items-center gap-1 bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30 px-2.5 py-1 rounded-md text-[10px] font-bold">
                          <Shield className="w-3 h-3" />
                          <span>CO-HOST</span>
                        </div>
                      )}
                      {p.role === 'viewer' && (
                        <span className="text-[10px] text-[#8A8A8A] font-mono">Membro</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
