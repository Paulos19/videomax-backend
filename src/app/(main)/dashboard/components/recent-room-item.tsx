'use client'

import { useRouter } from 'next/navigation'
import { Play, Users, Clock } from 'lucide-react'

export interface RecentRoomData {
  roomId: string
  title: string
  thumbnailUrl?: string
  creatorId?: string
  creatorName: string
  creatorImage?: string
  timeAgo: string
  isMyRoom?: boolean
  isFriendRoom?: boolean
  isJoined?: boolean
  participants: Array<{ userId: string; userName: string; userImage?: string }>
}

function getThumbnailForVideo(url?: string, title?: string): string | null {
  if (url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/
    const match = url.match(regExp)
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`
    }
  }
  return null
}

export function RecentRoomItem({ room }: { room: RecentRoomData }) {
  const router = useRouter()
  const thumb = room.thumbnailUrl || getThumbnailForVideo(undefined, room.title)

  return (
    <div
      onClick={() => router.push(`/room/${room.roomId}`)}
      className="group cursor-pointer bg-[#09090D] hover:bg-[#0E0E14] border border-[#222] hover:border-[#FF5A00] p-3 flex items-center justify-between gap-4 transition-all duration-200"
    >
      {/* Left: Thumbnail & Info */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="relative w-18 h-12 bg-[#050508] overflow-hidden shrink-0 border border-[#222]">
          {thumb ? (
            <img
              src={thumb}
              alt={room.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#151520]">
              <Play className="w-4 h-4 text-[#FF5A00]" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[9px] font-mono text-[#FF5A00] uppercase font-bold">
              [ SALA #{room.roomId} ]
            </span>
            {room.isMyRoom ? (
              <span className="text-[8px] font-mono text-black bg-[#FF5A00] px-1 font-bold uppercase">
                MINHA SALA
              </span>
            ) : room.isFriendRoom ? (
              <span className="text-[8px] font-mono text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/30 px-1 font-bold uppercase">
                AMIGO
              </span>
            ) : null}
          </div>
          <h4 className="text-[12px] font-mono font-bold text-white uppercase group-hover:text-[#FF5A00] transition-colors truncate">
            {room.title}
          </h4>
          <p className="text-[10px] font-mono text-[#777] mt-0.5 truncate flex items-center gap-1.5">
            <span>{room.creatorName}</span>
            <span>•</span>
            <span className="text-[#555]">{room.timeAgo}</span>
          </p>
        </div>
      </div>

      {/* Right: Participants & Action */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden sm:flex items-center -space-x-1.5 overflow-hidden">
          {room.participants.slice(0, 3).map((p, idx) => (
            <div
              key={p.userId + idx}
              className="w-6 h-6 rounded-full border border-[#09090D] bg-[#222] flex items-center justify-center font-mono font-bold text-[8px] text-[#FF5A00] overflow-hidden"
            >
              {p.userImage ? (
                <img src={p.userImage} alt={p.userName} className="w-full h-full object-cover" />
              ) : (
                p.userName?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
          ))}
        </div>

        <div className="px-3 py-1.5 bg-[#151520] group-hover:bg-[#FF5A00] text-white group-hover:text-black font-mono font-bold text-[10px] uppercase transition-colors flex items-center gap-1.5 border border-[#333] group-hover:border-[#FF5A00]">
          <Play className="w-2.5 h-2.5 fill-current" />
          <span>ENTRAR</span>
        </div>
      </div>
    </div>
  )
}
