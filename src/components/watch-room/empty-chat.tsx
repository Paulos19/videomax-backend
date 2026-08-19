'use client'

import { MessageSquare, Sparkles } from 'lucide-react'

export function EmptyChat() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center select-none font-mono">
      <div className="w-10 h-10 border-2 border-[#262633] bg-[#0E0E14] flex items-center justify-center mb-3 text-[#FF5A00]">
        <MessageSquare className="w-5 h-5" />
      </div>
      <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
        CANAL DE CHAT PRONTO
      </h4>
      <p className="text-[10px] text-[#777] max-w-[200px] leading-relaxed">
        Envie uma mensagem ou figurinha para interagir com a sala.
      </p>
    </div>
  )
}
