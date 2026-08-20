'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Crown, Sparkles, Zap, Shield, Play, ArrowUpRight, Radio } from 'lucide-react'
import { ProReactor3DView } from './pro-dashboard-3d'
import { CreateRoomDialog } from '@/app/(main)/dashboard/components/create-room-dialog'

interface ProVipHeroBannerProps {
  userName?: string | null
}

export function ProVipHeroBanner({ userName }: ProVipHeroBannerProps) {
  const [createRoomOpen, setCreateRoomOpen] = useState(false)

  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 dark:from-[#1E1408] dark:via-[#100D09] dark:to-[#080705] border border-amber-300 dark:border-[#FFE600]/40 p-5 sm:p-6 shadow-md dark:shadow-[0_0_30px_rgba(255,230,0,0.12)] select-none transition-colors">
        
        {/* Ambient Top Golden Glow */}
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-amber-400/15 dark:from-[#FFE600]/10 to-transparent blur-2xl pointer-events-none" />
        <div className="absolute top-0 left-0 w-32 h-32 bg-orange-500/15 dark:bg-[#FF5A00]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left Info & VIP Telemetry */}
          <div className="space-y-3 flex-1 min-w-0 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 dark:from-[#FFE600] dark:to-[#FF5A00] text-white dark:text-black font-mono font-black text-[10px] uppercase tracking-widest shadow-sm">
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span>MAXPRO VIP ASSINANTE ATIVO</span>
              </div>

              <div className="inline-flex items-center gap-1 px-2 py-0.5 border border-amber-300 dark:border-[#FFE600]/40 bg-white/70 dark:bg-black/60 text-amber-800 dark:text-[#FFE600] font-mono text-[9px] font-bold">
                <Radio className="w-3 h-3 animate-pulse text-amber-500 dark:text-[#FFE600]" />
                <span>NÓ MESH 6X ONLINE</span>
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white uppercase tracking-tight">
                Olá, {userName || 'Comandante'} <span className="text-amber-500 dark:text-[#FFE600]">⭐</span>
              </h2>
              <p className="text-[11px] font-mono text-slate-600 dark:text-[#AAA] max-w-xl mt-1 leading-relaxed">
                Você possui acesso ilimitado com infraestrutura de rede <strong className="text-slate-900 dark:text-white">WebRTC Mesh 6X</strong>, transmissão HD 1080p sem anúncios e selo exclusivo de Host VIP.
              </p>
            </div>

            {/* Micro VIP Perks Badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
              <span className="text-[9px] font-mono text-amber-800 dark:text-[#FFE600] bg-amber-100/70 dark:bg-[#221808] border border-amber-300 dark:border-[#443010] px-2 py-0.5 font-bold">
                ✓ ATÉ 6 PESSOAS POR SALA
              </span>
              <span className="text-[9px] font-mono text-amber-800 dark:text-[#FFE600] bg-amber-100/70 dark:bg-[#221808] border border-amber-300 dark:border-[#443010] px-2 py-0.5 font-bold">
                ✓ TRANSMISSÃO 1080P HD 60FPS
              </span>
              <span className="text-[9px] font-mono text-amber-800 dark:text-[#FFE600] bg-amber-100/70 dark:bg-[#221808] border border-amber-300 dark:border-[#443010] px-2 py-0.5 font-bold">
                ✓ SALAS ILIMITADAS 0MS
              </span>
            </div>
          </div>

          {/* Center / Right: 3D Holographic Quantum Core + Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            {/* 3D Three.js Golden Crystal Reactor */}
            <div className="relative group cursor-pointer" title="Reator Quântico MAXPRO">
              <ProReactor3DView className="w-28 h-28 sm:w-32 sm:h-32 relative" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 bg-amber-400/20 dark:bg-[#FFE600]/10 rounded-full blur-xl animate-pulse" />
              </div>
            </div>

            {/* VIP CTA Actions */}
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <button
                onClick={() => setCreateRoomOpen(true)}
                className="px-5 py-3 bg-amber-500 hover:bg-slate-900 dark:bg-[#FFE600] dark:hover:bg-white text-white dark:text-black font-mono font-black text-[11px] uppercase tracking-widest transition-all duration-200 shadow-md dark:shadow-[0_0_20px_rgba(255,230,0,0.35)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>[ + CRIAR SALA MESH 6X ]</span>
              </button>

              <Link
                href="/dashboard/loja"
                className="px-5 py-2 border border-amber-300 hover:border-amber-500 dark:border-[#FFE600]/40 dark:hover:border-[#FFE600] bg-white/80 hover:bg-amber-50 dark:bg-black/60 dark:hover:bg-[#1A1408] text-amber-800 dark:text-[#FFE600] font-mono font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
              >
                <span>GERENCIAR ASSINATURA VIP</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </div>

      {createRoomOpen && (
        <CreateRoomDialog onClose={() => setCreateRoomOpen(false)} />
      )}
    </>
  )
}
