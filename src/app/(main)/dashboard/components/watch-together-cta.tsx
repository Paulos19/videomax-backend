'use client'

import { useState } from 'react'
import { Play, Sparkles, Radio, Users } from 'lucide-react'
import { CreateRoomDialog } from './create-room-dialog'

export function WatchTogetherCTA() {
  const [createRoomOpen, setCreateRoomOpen] = useState(false)

  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1208] via-[#0E0C0A] to-[#07070A] border border-[#FF5A00]/40 p-6 flex flex-col justify-between space-y-4 shadow-[0_0_30px_rgba(255,90,0,0.12)]">
        {/* Background glow lines */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#FF5A00]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#FF5A00]/10 border border-[#FF5A00]/30 text-[#FF5A00] font-mono text-[9px] font-bold uppercase tracking-widest">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>PROTOCOLO MESH 0MS</span>
          </div>

          <h3 className="text-white font-mono font-black text-lg uppercase leading-snug">
            Assista Em Sincronia.<br />
            <span className="text-[#FF5A00]">Onde Estiver.</span>
          </h3>

          <p className="text-[#888] font-mono text-[11px] leading-relaxed">
            Compartilhe vídeos do YouTube ou arquivos locais em ultra-baixa latência com chat em tempo real.
          </p>
        </div>

        <div className="relative z-10 pt-2">
          <button
            onClick={() => setCreateRoomOpen(true)}
            className="w-full py-3 bg-[#FF5A00] hover:bg-white text-black font-mono font-black text-[11px] uppercase tracking-widest transition-all duration-150 shadow-[0_0_20px_rgba(255,90,0,0.35)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>[ + INICIAR SALA AGORA ]</span>
          </button>
        </div>
      </div>

      {createRoomOpen && (
        <CreateRoomDialog onClose={() => setCreateRoomOpen(false)} />
      )}
    </>
  )
}
