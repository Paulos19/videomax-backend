'use client'

import { Users, Clock, Mail, Film, ChevronRight } from 'lucide-react'

interface FriendStatsProps {
  friendsCount: number
  pendingCount: number
  requestsCount: number
  roomsTogetherCount?: number
}

export function FriendStats({
  friendsCount,
  pendingCount,
  requestsCount,
  roomsTogetherCount = 18,
}: FriendStatsProps) {
  return (
    <div className="bg-[#0B0B0B] border border-[#242424] rounded-2xl p-4 space-y-4">
      <h3 className="text-[#F5F5F5] font-bold text-sm">Estatísticas</h3>

      <div className="space-y-3 text-xs">
        <div className="flex items-center justify-between py-1 border-b border-[#242424]/50">
          <div className="flex items-center gap-2 text-[#8A8A8A]">
            <Users className="w-4 h-4 text-[#FF5A00]" />
            <span>Amigos</span>
          </div>
          <span className="font-bold text-[#F5F5F5]">{friendsCount}</span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-[#242424]/50">
          <div className="flex items-center gap-2 text-[#8A8A8A]">
            <Clock className="w-4 h-4 text-[#FFB800]" />
            <span>Pendentes</span>
          </div>
          <span className="font-bold text-[#F5F5F5]">{pendingCount}</span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-[#242424]/50">
          <div className="flex items-center gap-2 text-[#8A8A8A]">
            <Mail className="w-4 h-4 text-[#EF2020]" />
            <span>Solicitações recebidas</span>
          </div>
          <span className="font-bold text-[#F5F5F5]">{requestsCount}</span>
        </div>

        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2 text-[#8A8A8A]">
            <Film className="w-4 h-4 text-[#FF5A00]" />
            <span>Salas juntos</span>
          </div>
          <span className="font-bold text-[#F5F5F5]">{roomsTogetherCount}</span>
        </div>
      </div>

      <button className="text-xs font-semibold text-[#FF5A00] hover:underline flex items-center gap-1">
        Ver relatório completo
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
