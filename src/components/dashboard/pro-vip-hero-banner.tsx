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
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1E1408] via-[#100D09] to-[#080705] border border-[#FFE600]/40 p-5 sm:p-6 shadow-[0_0_30px_rgba(255,230,0,0.12)] select-none">
        
        {/* Ambient Top Golden Glow */}
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#FFE600]/10 to-transparent blur-2xl pointer-events-none" />
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#FF5A00]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left Info & VIP Telemetry */}
          <div className="space-y-3 flex-1 min-w-0 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#FFE600] to-[#FF5A00] text-black font-mono font-black text-[10px] uppercase tracking-widest shadow-[0_0_12px_rgba(255,230,0,0.4)]">
                <Crown className="w-3.5 h-3.5 fill-black" />
                <span>MAXPRO VIP ASSINANTE ATIVO</span>
              </div>

              <div className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#FFE600]/40 bg-black/60 text-[#FFE600] font-mono text-[9px] font-bold">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>NÓ MESH 6X ONLINE</span>
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black font-mono text-white uppercase tracking-tight">
                Olá, {userName || 'Comandante'} <span className="text-[#FFE600]">⭐</span>
              </h2>
              <p className="text-[11px] font-mono text-[#AAA] max-w-xl mt-1 leading-relaxed">
                Você possui acesso ilimitado com infraestrutura de rede <strong className="text-white">WebRTC Mesh 6X</strong>, transmissão HD 1080p sem anúncios e selo exclusivo de Host VIP.
              </p>
            </div>

            {/* Micro VIP Perks Badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
              <span className="text-[9px] font-mono text-[#FFE600] bg-[#221808] border border-[#443010] px-2 py-0.5">
                ✓ ATÉ 6 PESSOAS POR SALA
              </span>
              <span className="text-[9px] font-mono text-[#FFE600] bg-[#221808] border border-[#443010] px-2 py-0.5">
                ✓ TRANSMISSÃO 1080P HD 60FPS
              </span>
              <span className="text-[9px] font-mono text-[#FFE600] bg-[#221808] border border-[#443010] px-2 py-0.5">
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
                <div className="w-16 h-16 bg-[#FFE600]/10 rounded-full blur-xl animate-pulse" />
              </div>
            </div>

            {/* VIP CTA Actions */}
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <button
                onClick={() => setCreateRoomOpen(true)}
                className="px-5 py-3 bg-[#FFE600] hover:bg-white text-black font-mono font-black text-[11px] uppercase tracking-widest transition-all duration-200 shadow-[0_0_20px_rgba(255,230,0,0.35)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>[ + CRIAR SALA MESH 6X ]</span>
              </button>

              <Link
                href="/dashboard/loja"
                className="px-5 py-2 border border-[#FFE600]/40 hover:border-[#FFE600] bg-black/60 hover:bg-[#1A1408] text-[#FFE600] font-mono font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
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
