'use client'

import { Clapperboard } from 'lucide-react'

export function EmptyChat() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4">
      <div className="w-16 h-16 rounded-2xl bg-room-accent/10 flex items-center justify-center">
        <Clapperboard className="w-8 h-8 text-room-accent/60" />
      </div>
      <div className="text-center">
        <p className="text-room-text-secondary/70 text-sm font-medium">
          A conversa começa aqui
        </p>
        <p className="text-room-text-secondary/40 text-xs mt-1">
          Diga oi para quebrar o gelo!
        </p>
      </div>
    </div>
  )
}
