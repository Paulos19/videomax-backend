'use client'

import { Check, X, Play, Mail } from 'lucide-react'

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
    <div className="p-3 bg-slate-50 dark:bg-[#09090D] border border-slate-200 dark:border-[#1C1C24] hover:border-[#FF5A00] space-y-2.5 transition-all shadow-xs dark:shadow-none">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {invite.senderImage ? (
            <img
              src={invite.senderImage}
              alt={invite.senderName}
              className="w-7 h-7 rounded border border-slate-300 dark:border-[#333] object-cover shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded bg-slate-100 dark:bg-[#222] border border-slate-300 dark:border-[#333] flex items-center justify-center font-mono font-bold text-[9px] text-[#FF5A00] shrink-0">
              {invite.senderName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[11px] font-mono font-bold text-slate-900 dark:text-white uppercase truncate">
              {invite.senderName}
            </p>
            <p className="text-[9px] font-mono text-slate-500 dark:text-[#777] truncate">
              CONVIDOU P/ #{invite.roomCode}
            </p>
          </div>
        </div>

        <span className="text-[8px] font-mono text-orange-600 dark:text-[#FF5A00] bg-orange-50 dark:bg-[#FF5A00]/10 px-1.5 py-0.5 uppercase border border-orange-200 dark:border-transparent">
          AO VIVO
        </span>
      </div>

      {invite.videoTitle && (
        <p className="text-[10px] font-mono text-slate-700 dark:text-[#AAA] truncate bg-white dark:bg-[#060608] px-2 py-1 border border-slate-200 dark:border-[#151520]">
          ► {invite.videoTitle}
        </p>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onAccept(invite)}
          className="flex-1 py-1.5 bg-[#FF5A00] hover:bg-slate-900 dark:hover:bg-white text-white dark:text-black font-mono font-black text-[9px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
          <Check className="w-3 h-3 stroke-[3]" />
          <span>ACEITAR</span>
        </button>

        <button
          onClick={() => onReject(invite.id)}
          className="p-1.5 border border-slate-300 dark:border-[#333] hover:border-[#EF4444] text-slate-500 dark:text-[#777] hover:text-[#EF4444] transition-colors cursor-pointer"
          title="Recusar"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
