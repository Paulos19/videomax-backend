'use client'

import { useRouter } from 'next/navigation'
import { Check, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export interface PendingInviteData {
  id: string
  senderId: string
  senderName: string
  senderImage?: string
  roomCode: string
  videoTitle?: string
}

interface PendingInviteItemProps {
  invite: PendingInviteData
  onAccept: (invite: PendingInviteData) => void
  onReject: (inviteId: string) => void
}

export function PendingInviteItem({ invite, onAccept, onReject }: PendingInviteItemProps) {
  return (
    <div className="bg-[#0B0B0B] border border-[#242424] hover:border-[#FF5A00]/30 rounded-xl p-3 flex items-center justify-between gap-3 transition-all">
      {/* Left: Avatar & Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Avatar className="w-9 h-9 border border-[#242424] shrink-0">
          <AvatarImage src={invite.senderImage} />
          <AvatarFallback className="bg-[#151515] text-[#FF5A00] font-bold text-xs">
            {invite.senderName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[#F5F5F5] truncate">
            {invite.senderName}
          </p>
          <p className="text-[11px] text-[#8A8A8A] truncate">
            te convidou para <strong className="text-[#FF5A00] font-medium">{invite.videoTitle || `#${invite.roomCode}`}</strong>
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onAccept(invite)}
          className="w-7 h-7 rounded-lg brand-gradient text-white flex items-center justify-center hover:brightness-110 active:scale-95 transition-all shadow-sm"
          title="Aceitar convite"
          aria-label="Aceitar convite"
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </button>

        <button
          onClick={() => onReject(invite.id)}
          className="w-7 h-7 rounded-lg bg-[#151515] hover:bg-[#EF2020]/20 text-[#8A8A8A] hover:text-[#EF2020] flex items-center justify-center transition-all"
          title="Recusar convite"
          aria-label="Recusar convite"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
