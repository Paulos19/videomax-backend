'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Tv, ArrowRight } from 'lucide-react'
import { RecentRoomItem, RecentRoomData } from './recent-room-item'
import { cn } from '@/lib/utils'

interface RecentRoomsSectionProps {
  rooms: RecentRoomData[]
}

const tabs = [
  { id: 'all', label: 'Todas' },
  { id: 'joined', label: 'Participei' },
  { id: 'friends', label: 'Meus amigos' },
  { id: 'favorites', label: 'Favoritas' },
]

export function RecentRoomsSection({ rooms }: RecentRoomsSectionProps) {
  const [activeTab, setActiveTab] = useState('all')

  return (
    <section className="space-y-4">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Tv className="w-5 h-5 text-[#FF5A00]" />
          <h2 className="text-[#F5F5F5] font-bold text-xl">Salas recentes</h2>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#0B0B0B] p-1 rounded-xl border border-[#242424] self-start sm:self-auto overflow-x-auto scrollbar-none">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
                activeTab === t.id
                  ? "bg-[#151515] text-[#FF5A00] border border-[#242424] shadow-sm"
                  : "text-[#8A8A8A] hover:text-[#F5F5F5]"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {rooms.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#0B0B0B] border border-[#242424] text-center text-xs text-[#8A8A8A]">
          Nenhuma sala recente encontrada nesta categoria.
        </div>
      ) : (
        <div className="space-y-2">
          {rooms.slice(0, 4).map((room) => (
            <RecentRoomItem key={room.roomId} room={room} />
          ))}
        </div>
      )}
    </section>
  )
}
