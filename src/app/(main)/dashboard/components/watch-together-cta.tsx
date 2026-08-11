'use client'

import { useState } from 'react'
import { Play, Sparkles, Users } from 'lucide-react'
import { CreateRoomDialog } from './create-room-dialog'

export function WatchTogetherCTA() {
  const [createRoomOpen, setCreateRoomOpen] = useState(false)

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-[#242424] p-6 bg-gradient-to-br from-[rgba(239,32,32,0.15)] via-[rgba(255,90,0,0.08)] to-[#0B0B0B] flex flex-col justify-between space-y-4">
        {/* Background glow & circles */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF5A00]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF5A00]/10 border border-[#FF5A00]/20 text-[#FF5A00] text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            Experiência Social
          </div>

          <h3 className="text-[#F5F5F5] font-extrabold text-xl leading-snug">
            Assista junto.<br />Onde e quando estiver.
          </h3>

          <p className="text-[#8A8A8A] text-xs leading-relaxed max-w-sm">
            Sincronize vídeos do YouTube ou arquivos locais, converse em tempo real e curta com seus amigos.
          </p>
        </div>

        <div className="relative z-10 pt-2">
          <button
            onClick={() => setCreateRoomOpen(true)}
            className="w-full sm:w-auto px-5 py-3 rounded-xl brand-gradient text-white text-xs font-bold brand-glow-strong hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            Criar sala agora
          </button>
        </div>
      </div>

      {createRoomOpen && (
        <CreateRoomDialog onClose={() => setCreateRoomOpen(false)} />
      )}
    </>
  )
}
