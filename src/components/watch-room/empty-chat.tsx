'use client'

import { Clapperboard } from 'lucide-react'

export function EmptyChat() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 h-full">
      <div className="relative w-20 h-20 rounded-3xl brand-gradient-subtle flex items-center justify-center animate-ember border border-room-accent/20 brand-glow shadow-xl">
        <Clapperboard className="w-10 h-10 text-room-accent opacity-90 drop-shadow-md" />
      </div>
      <div className="text-center space-y-1.5 z-10">
        <p className="text-white text-base font-bold tracking-tight">
          A conversa começa aqui
        </p>
        <p className="text-room-text-secondary text-xs">
          Diga oi para quebrar o gelo!
        </p>
      </div>
    </div>
  )
}
