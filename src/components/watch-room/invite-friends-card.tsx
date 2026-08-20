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
    <div className="bg-white dark:bg-[#08080C] border border-slate-200 dark:border-[#1F1F28] p-4 flex flex-col justify-between space-y-3 shrink-0 shadow-xs dark:shadow-sm h-full font-mono select-none transition-colors">
      <div>
        <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider">
          [ CONVOCAR AMIGOS ]
        </h4>
        <p className="text-[9px] text-slate-500 dark:text-[#777] mt-0.5 uppercase">
          Compartilhe o link direto ou envie notificação
        </p>
      </div>

      <div className="space-y-2">
        <button
          onClick={handleCopy}
          className="w-full py-2 bg-[#FF5A00] hover:bg-slate-900 dark:hover:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(255,90,0,0.25)]"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
          <span>{copied ? 'LINK COPIADO!' : 'COPIAR LINK DA SALA'}</span>
        </button>

        <button
          onClick={onOpenInviteModal}
          className="w-full py-2 bg-slate-100 dark:bg-[#121218] hover:bg-slate-200 dark:hover:bg-[#1A1A24] border border-slate-300 dark:border-[#333] hover:border-amber-400 dark:hover:border-[#FFE600] text-slate-800 dark:text-white text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5 text-amber-500 dark:text-[#FFE600]" />
          <span>ENVIAR NOTIFICAÇÃO</span>
        </button>
      </div>
    </div>
  )
}
