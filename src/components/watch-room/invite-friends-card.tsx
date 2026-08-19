'use client'

import { useState } from 'react'
import { Link2, Check, UserPlus, Share2 } from 'lucide-react'
import { toast } from 'sonner'

interface InviteFriendsCardProps {
  roomId: string
  onOpenInviteModal?: () => void
}

export function InviteFriendsCard({ roomId, onOpenInviteModal }: InviteFriendsCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const link = `${window.location.origin}/room/${roomId}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success('Link da sala copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-[#08080C] border border-[#1F1F28] p-4 flex flex-col justify-between space-y-3 shrink-0 shadow-sm h-full font-mono select-none">
      <div>
        <h4 className="text-[11px] font-black text-white uppercase tracking-wider">
          [ CONVOCAR AMIGOS ]
        </h4>
        <p className="text-[9px] text-[#777] mt-0.5 uppercase">
          Compartilhe o link direto ou envie notificação
        </p>
      </div>

      <div className="space-y-2">
        <button
          onClick={handleCopy}
          className="w-full py-2 bg-[#FF5A00] hover:bg-white text-black text-[10px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(255,90,0,0.25)]"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
          <span>{copied ? 'LINK COPIADO!' : 'COPIAR LINK DA SALA'}</span>
        </button>

        <button
          onClick={onOpenInviteModal}
          className="w-full py-2 bg-[#121218] hover:bg-[#1A1A24] border border-[#333] hover:border-[#FFE600] text-white text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5 text-[#FFE600]" />
          <span>ENVIAR NOTIFICAÇÃO</span>
        </button>
      </div>
    </div>
  )
}
