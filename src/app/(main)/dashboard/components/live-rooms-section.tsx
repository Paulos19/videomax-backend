'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Flame, ArrowRight, Plus, Radio, Shield, Sparkles } from 'lucide-react'
import { LiveRoomCard, LiveRoomData } from './live-room-card'
import { CreateRoomDialog } from './create-room-dialog'

interface LiveRoomsSectionProps {
  rooms: LiveRoomData[]
}

export function LiveRoomsSection({ rooms }: LiveRoomsSectionProps) {
  const [createRoomOpen, setCreateRoomOpen] = useState(false)

  return (
    <>
      <section className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#EF2020] animate-ping" />
            <span className="text-[10px] font-mono text-[#FF5A00] tracking-widest uppercase bg-[#111] px-2 py-0.5 border border-[#222]">
              [01 — SALAS EM TRANSMISSÃO AO VIVO]
            </span>
          </div>

          <Link
            href="/dashboard/rooms"
            className="text-[10px] font-mono font-bold text-[#A3A3A3] hover:text-[#FF5A00] flex items-center gap-1.5 uppercase transition-colors"
          >
            <span>VER TODAS AS SALAS</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Content Grid / Empty State */}
        {rooms.length === 0 ? (
          <div className="p-8 bg-[#09090D] border border-[#222] text-center space-y-4 relative overflow-hidden">
            {/* Background grid matrix lines */}
            <div
              className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                backgroundImage: 'linear-gradient(#FF5A00 1px, transparent 1px), linear-gradient(90deg, #FF5A00 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />

            <div className="relative z-10 max-w-[480px] mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#121218] border border-[#333] text-[9px] font-mono text-[#888] uppercase">
                <Radio className="w-3 h-3 text-[#FF5A00] animate-pulse" />
                <span>SYS_RADAR: NENHUM NÓ EM TRANSMISSÃO PÚBLICA NO MOMENTO</span>
              </div>

              <h3 className="text-lg font-black text-white font-mono uppercase">
                Inicie uma Watch Party Agora
              </h3>

              <p className="text-[11px] font-mono text-[#888] leading-relaxed">
                Crie sua própria sala sincronizada com link direto do YouTube ou arquivo de vídeo em nuvem com chat em tempo real.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => setCreateRoomOpen(true)}
                  className="px-6 py-3 bg-[#FF5A00] hover:bg-white text-black font-mono font-black text-[11px] uppercase tracking-widest transition-all duration-150 shadow-[0_0_20px_rgba(255,90,0,0.35)] cursor-pointer"
                >
                  [ + CRIAR NOVA SALA DE VÍDEO ]
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.slice(0, 3).map((room) => (
              <LiveRoomCard key={room.roomId} room={room} />
            ))}
          </div>
        )}
      </section>

      {createRoomOpen && (
        <CreateRoomDialog onClose={() => setCreateRoomOpen(false)} />
      )}
    </>
  )
}
