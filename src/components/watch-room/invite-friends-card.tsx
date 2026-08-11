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
    <div className="bg-[#0B0B0B] border border-[#242424] rounded-2xl p-4 flex flex-col justify-between space-y-4 shrink-0">
      <div>
        <h4 className="text-sm font-bold text-[#F5F5F5]">Convidar amigos</h4>
        <p className="text-xs text-[#8A8A8A] mt-0.5">Compartilhe o link da sala</p>
      </div>

      <div className="space-y-2">
        <button
          onClick={handleCopy}
          className="w-full py-2.5 rounded-full brand-gradient text-white text-xs font-bold brand-glow-strong hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
          {copied ? 'Link copiado!' : 'Copiar link'}
        </button>

        <div className="flex items-center gap-2 my-1">
          <div className="flex-1 h-[1px] bg-[#242424]" />
          <span className="text-[10px] text-[#5F5F5F] font-semibold uppercase">ou</span>
          <div className="flex-1 h-[1px] bg-[#242424]" />
        </div>

        <button
          onClick={onOpenInviteModal}
          className="w-full py-2.5 rounded-full bg-[#151515] hover:bg-[#1C1C24] border border-[#242424] text-[#F5F5F5] text-xs font-bold transition-all flex items-center justify-center gap-2"
        >
          <UserPlus className="w-3.5 h-3.5 text-[#FF5A00]" />
          Enviar convite
        </button>
      </div>
    </div>
  )
}
