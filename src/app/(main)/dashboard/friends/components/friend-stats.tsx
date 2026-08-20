'use client'

import { Users, Clock, Mail, Film, Radio, Activity } from 'lucide-react'

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
    <div className="bg-white dark:bg-[#09090D] border border-slate-200 dark:border-[#222] p-4 space-y-3.5 shadow-sm dark:shadow-xl transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#222] pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#FF5A00]" />
          <h3 className="text-slate-900 dark:text-white font-mono font-bold text-[10px] uppercase tracking-wider">
            [ TELEMETRIA DA REDE ]
          </h3>
        </div>
        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] dark:bg-[#22C55E] animate-ping" />
      </div>

      {/* Telemetry rows */}
      <div className="space-y-2 font-mono text-[10px]">
        <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-[#1C1C24] transition-colors">
          <div className="flex items-center gap-2 text-slate-600 dark:text-[#AAA]">
            <Users className="w-3.5 h-3.5 text-[#FF5A00]" />
            <span className="uppercase">AMIGOS NA REDE</span>
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-xs">{friendsCount}</span>
        </div>

        <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-[#1C1C24] transition-colors">
          <div className="flex items-center gap-2 text-slate-600 dark:text-[#AAA]">
            <Clock className="w-3.5 h-3.5 text-amber-500 dark:text-[#FFE600]" />
            <span className="uppercase">SOLICITAÇÕES PENDENTES</span>
          </div>
          <span className="font-bold text-amber-600 dark:text-[#FFE600] text-xs">{pendingCount}</span>
        </div>

        <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-[#1C1C24] transition-colors">
          <div className="flex items-center gap-2 text-slate-600 dark:text-[#AAA]">
            <Mail className="w-3.5 h-3.5 text-[#EF2020]" />
            <span className="uppercase">PEDIDOS RECEBIDOS</span>
          </div>
          <span className="font-bold text-[#EF2020] text-xs">{requestsCount}</span>
        </div>

        <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-[#1C1C24] transition-colors">
          <div className="flex items-center gap-2 text-slate-600 dark:text-[#AAA]">
            <Film className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span className="uppercase">SESSÕES COMPARTILHADAS</span>
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-xs">{roomsTogetherCount}</span>
        </div>
      </div>
    </div>
  )
}
