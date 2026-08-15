'use client'

import { useState } from 'react'
import { Link2, Check, UserPlus } from 'lucide-react'
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
    toast.success('Link copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-room-surface/40 backdrop-blur-xl border border-white/5 rounded-[28px] p-5 flex flex-col justify-between space-y-4 shrink-0 shadow-sm h-full">
      <div>
        <h4 className="text-[13px] font-extrabold text-white tracking-wide">Convidar amigos</h4>
        <p className="text-[11px] text-room-text-secondary mt-1">Compartilhe o link da sala</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleCopy}
          className="w-full py-2.5 rounded-full brand-gradient text-white text-[13px] font-extrabold brand-glow-strong hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
          {copied ? 'Link copiado!' : 'Copiar link'}
        </button>

        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">ou</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        <button
          onClick={onOpenInviteModal}
          className="w-full py-2.5 rounded-full bg-room-surface/50 hover:bg-room-surface/80 border border-white/10 hover:border-room-accent/30 text-white text-[13px] font-extrabold transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(255,90,0,0.15)] active:scale-95"
        >
          <UserPlus className="w-4 h-4 text-room-accent" />
          Enviar convite
        </button>
      </div>
    </div>
  )
}
