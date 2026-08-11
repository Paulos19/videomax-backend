'use client'

import { useRouter } from 'next/navigation'
import { Play, Users, Radio } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export interface LiveRoomData {
  roomId: string
  hostUserId: string
  hostName: string
  hostImage?: string
  videoTitle: string
  videoUrl?: string
  viewerCount: number
  viewers: Array<{ userId: string; userName: string; userImage?: string }>
}

function getThumbnailForVideo(url?: string, title?: string): string | null {
  if (url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`
    }
    if (url.includes('BigBuckBunny')) {
      return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg'
    }
    if (url.includes('ElephantsDream')) {
      return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg'
    }
    if (url.includes('Sintel')) {
      return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg'
    }
    if (url.includes('TearsOfSteel')) {
      return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg'
    }
    if (url.includes('ForBiggerBlazes')) {
      return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg'
    }
  }

  if (title) {
    const lower = title.toLowerCase()
    if (lower.includes('arcane')) {
      return 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80'
    }
    if (lower.includes('duna') || lower.includes('dune')) {
      return 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80'
    }
    if (lower.includes('jujutsu') || lower.includes('anime')) {
      return 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80'
    }
    if (lower.includes('aranha') || lower.includes('spider')) {
      return 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&auto=format&fit=crop&q=80'
    }
    if (lower.includes('interestelar') || lower.includes('interstellar')) {
      return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80'
    }
    if (lower.includes('breaking bad')) {
      return 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'
    }
  }

  return null
}

export function LiveRoomCard({ room }: { room: LiveRoomData }) {
  const router = useRouter()
  const thumbnailUrl = getThumbnailForVideo(room.videoUrl, room.videoTitle)

  return (
    <div
      onClick={() => router.push(`/room/${room.roomId}`)}
      className="group cursor-pointer relative bg-[#0B0B0B] border border-[#242424] hover:border-[#FF5A00] rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-[#FF5A00]/5 flex flex-col justify-between"
    >
      {/* Video Thumbnail Header */}
      <div className="relative aspect-video w-full bg-[#151515] overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={room.videoTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#151515] via-[#111111] to-[#0B0B0B] flex items-center justify-center">
            {/* Ambient glow decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-[#FF5A00]/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10 w-12 h-12 rounded-full brand-gradient flex items-center justify-center text-white brand-glow-strong group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-transparent to-black/60" />

        {/* Live Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#EF2020] px-2.5 py-1 rounded-full text-white text-[10px] font-bold tracking-wider uppercase shadow-lg shadow-[#EF2020]/30">
          <Radio className="w-3 h-3 animate-pulse" />
          AO VIVO
        </div>

        {/* Viewer Count */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs font-semibold border border-white/10">
          <Users className="w-3.5 h-3.5 text-[#FF5A00]" />
          {room.viewerCount}
        </div>
      </div>

      {/* Card Info */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-[#F5F5F5] font-bold text-sm line-clamp-1 group-hover:text-[#FF5A00] transition-colors">
            {room.videoTitle || `Sala ${room.roomId}`}
          </h3>
          <p className="text-[#8A8A8A] text-xs mt-1 truncate">
            {room.hostName} • {room.viewerCount} assistindo
          </p>
        </div>

        {/* Viewers Avatars & CTA */}
        <div className="pt-2 border-t border-[#242424] flex items-center justify-between gap-2">
          {/* Overlapping Avatars */}
          <div className="flex -space-x-2 overflow-hidden">
            {room.viewers.slice(0, 4).map((v, idx) => (
              <Avatar key={v.userId + idx} className="w-6 h-6 border-2 border-[#0B0B0B] ring-1 ring-[#242424]">
                <AvatarImage src={v.userImage} />
                <AvatarFallback className="bg-[#151515] text-[#FF5A00] text-[9px] font-bold">
                  {v.userName?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            ))}
            {room.viewers.length > 4 && (
              <div className="w-6 h-6 rounded-full bg-[#151515] border-2 border-[#0B0B0B] flex items-center justify-center text-[9px] font-bold text-[#8A8A8A]">
                +{room.viewers.length - 4}
              </div>
            )}
          </div>

          <button className="px-3.5 py-1.5 rounded-xl brand-gradient text-white text-xs font-bold flex items-center gap-1.5 brand-glow-strong hover:brightness-110 transition-all shrink-0">
            <Play className="w-3 h-3 fill-white" />
            Entrar na sala
          </button>
        </div>
      </div>
    </div>
  )
}
