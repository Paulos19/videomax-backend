'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Flame, ArrowRight, Plus } from 'lucide-react'
import { LiveRoomCard, LiveRoomData } from './live-room-card'
import { CreateRoomDialog } from './create-room-dialog'

interface LiveRoomsSectionProps {
  rooms: LiveRoomData[]
}

export function LiveRoomsSection({ rooms }: LiveRoomsSectionProps) {
  const [createRoomOpen, setCreateRoomOpen] = useState(false)

  return (
    <>
      <section className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#EF2020] animate-pulse" />
            <h2 className="text-[#F5F5F5] font-bold text-xl">O que está rolando</h2>
          </div>

          <Link
            href="/dashboard/rooms"
            className="text-xs font-semibold text-[#FF5A00] hover:underline flex items-center gap-1 group"
          >
            Ver todas
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Content Grid / Scroll */}
        {rooms.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#0B0B0B] border border-[#242424] text-center space-y-3">
            <p className="text-[#8A8A8A] text-sm">Seus amigos ainda não estão assistindo nada.</p>
            <button
              onClick={() => setCreateRoomOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl brand-gradient text-white text-xs font-bold brand-glow-strong hover:brightness-110 transition-all"
            >
              <Plus className="w-4 h-4" />
              Criar uma sala
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.slice(0, 3).map((room) => (
              <LiveRoomCard key={room.roomId} room={room} />
            ))}
          </div>
        )}
      </section>

      {createRoomOpen && (
        <CreateRoomDialog onClose={() => setCreateRoomOpen(false)} />
      )}
    </>
  )
}
