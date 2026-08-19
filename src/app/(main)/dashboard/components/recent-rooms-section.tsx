'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Tv, ArrowRight, History } from 'lucide-react'
import { RecentRoomItem, RecentRoomData } from './recent-room-item'
import { cn } from '@/lib/utils'

interface RecentRoomsSectionProps {
  rooms: RecentRoomData[]
}

const tabs = [
  { id: 'all', label: 'TODAS' },
  { id: 'joined', label: 'PARTICIPEI' },
  { id: 'friends', label: 'AMIGOS' },
]

export function RecentRoomsSection({ rooms }: RecentRoomsSectionProps) {
  const [activeTab, setActiveTab] = useState('all')

  const filteredRooms = useMemo(() => {
    if (activeTab === 'joined') {
      return rooms.filter((r) => r.isJoined || r.isMyRoom)
    }
    if (activeTab === 'friends') {
      return rooms.filter((r) => r.isFriendRoom || (!r.isMyRoom && r.creatorName !== 'Você'))
    }
    return rooms
  }, [rooms, activeTab])

  const countByTab = useMemo(() => {
    return {
      all: rooms.length,
      joined: rooms.filter((r) => r.isJoined || r.isMyRoom).length,
      friends: rooms.filter((r) => r.isFriendRoom || (!r.isMyRoom && r.creatorName !== 'Você')).length,
    }
  }, [rooms])

  return (
    <section className="space-y-4">
      {/* Header & Brutalist Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222] pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#FF5A00]" />
          <span className="text-[10px] font-mono text-[#FF5A00] tracking-widest uppercase bg-[#111] px-2 py-0.5 border border-[#222]">
            [02 — HISTÓRICO RECENTE // NÓS DE TRANSMISSÃO]
          </span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto scrollbar-none">
          {tabs.map((t) => {
            const count = countByTab[t.id as keyof typeof countByTab] || 0
            const active = activeTab === t.id

            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  'px-3 py-1.5 text-[10px] font-mono uppercase font-bold border transition-all cursor-pointer flex items-center gap-1.5',
                  active
                    ? 'bg-[#FF5A00] text-black border-[#FF5A00] shadow-[0_0_12px_rgba(255,90,0,0.3)]'
                    : 'bg-[#09090D] text-[#777] border-[#222] hover:text-white hover:border-[#333]'
                )}
              >
                <span>[ {t.label} ]</span>
                <span
                  className={cn(
                    'text-[9px] px-1 py-0.2 rounded-xs font-mono font-bold',
                    active ? 'bg-black text-[#FF5A00]' : 'bg-[#151520] text-[#888]'
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Filtered List */}
      {filteredRooms.length === 0 ? (
        <div className="p-8 bg-[#09090D] border border-[#222] text-center font-mono text-[11px] text-[#777] space-y-1">
          <p>NENHUMA SALA ENCONTRADA NESTE FILTRO ({tabs.find((t) => t.id === activeTab)?.label}).</p>
          <p className="text-[9px] text-[#555]">
            {activeTab === 'friends'
              ? 'Conecte-se com mais amigos para ver transmissões compartilhadas.'
              : 'Inicie uma nova sala de vídeo para registrar seu histórico.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredRooms.slice(0, 5).map((room) => (
            <RecentRoomItem key={room.roomId} room={room} />
          ))}
        </div>
      )}
    </section>
  )
}
