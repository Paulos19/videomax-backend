'use client'

import { useRouter } from 'next/navigation'
import { Play, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export interface RecentRoomData {
  roomId: string
  title: string
  thumbnailUrl?: string
  creatorName: string
  creatorImage?: string
  timeAgo: string
  participants: Array<{ userId: string; userName: string; userImage?: string }>
}

function getThumbnailForVideo(url?: string, title?: string): string | null {
  if (url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`
    }
  }
  if (title) {
    const lower = title.toLowerCase()
    if (lower.includes('arcane')) return 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80'
    if (lower.includes('duna') || lower.includes('dune')) return 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80'
    if (lower.includes('aranha') || lower.includes('spider')) return 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&auto=format&fit=crop&q=80'
    if (lower.includes('interestelar')) return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80'
  }
  return null
}

export function RecentRoomItem({ room }: { room: RecentRoomData }) {
  const router = useRouter()
  const thumb = room.thumbnailUrl || getThumbnailForVideo(undefined, room.title)

  return (
    <div
      onClick={() => router.push(`/room/${room.roomId}`)}
      className="group cursor-pointer bg-[#0B0B0B] hover:bg-[#111111] border border-[#242424] hover:border-[#FF5A00]/40 rounded-xl p-3 flex items-center justify-between gap-4 transition-all"
    >
      {/* Left: Thumbnail & Info */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="relative w-16 h-11 rounded-lg bg-[#151515] overflow-hidden shrink-0 border border-[#242424]">
          {thumb ? (
            <img
              src={thumb}
              alt={room.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full brand-gradient-subtle flex items-center justify-center">
              <Play className="w-4 h-4 text-[#FF5A00]/40" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-[#F5F5F5] group-hover:text-[#FF5A00] transition-colors truncate">
            {room.title}
          </h4>
          <p className="text-[11px] text-[#8A8A8A] mt-0.5 truncate">
            {room.creatorName} • {room.timeAgo}
          </p>
        </div>
      </div>

      {/* Right: Participants & Entrar Button */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex -space-x-1.5 overflow-hidden hidden sm:flex">
          {room.participants.slice(0, 3).map((p, idx) => (
            <Avatar key={p.userId + idx} className="w-5 h-5 border border-[#0B0B0B]">
              <AvatarImage src={p.userImage} />
              <AvatarFallback className="bg-[#151515] text-[#FF5A00] text-[8px] font-bold">
                {p.userName?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>

        <button className="px-3.5 py-1.5 rounded-lg bg-[#151515] group-hover:brand-gradient text-[#F5F5F5] group-hover:text-white text-xs font-bold transition-all flex items-center gap-1">
          <Play className="w-3 h-3 fill-current" />
          Entrar
        </button>
      </div>
    </div>
  )
}
