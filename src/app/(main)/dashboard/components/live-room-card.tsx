'use client'

import { useRouter } from 'next/navigation'
import { Play, Users, Radio, Sparkles, Tv, Shield } from 'lucide-react'
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
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/
    const match = url.match(regExp)
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`
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
      className="group cursor-pointer relative bg-[#09090D] border border-[#222] hover:border-[#FF5A00] transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl"
    >
      {/* Video Thumbnail Header */}
      <div className="relative aspect-video w-full bg-[#050508] overflow-hidden border-b border-[#222]">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={room.videoTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#121218] to-[#060608] flex items-center justify-center">
            <div className="w-10 h-10 bg-[#FF5A00] flex items-center justify-center text-black shadow-[0_0_15px_rgba(255,90,0,0.4)] group-hover:scale-110 transition-transform">
              <Play className="w-4 h-4 fill-black ml-0.5" />
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />

        {/* Live Radar Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-[#EF2020] px-2 py-0.5 text-white font-mono text-[9px] font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(239,32,32,0.5)]">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <span>TRANSMISSÃO AO VIVO</span>
        </div>

        {/* Real Viewer Count Badge */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-black/80 border border-[#333] px-2 py-0.5 text-white font-mono text-[9px] font-bold">
          <Users className="w-3 h-3 text-[#FF5A00]" />
          <span>{room.viewerCount} ONLINE</span>
        </div>
      </div>

      {/* Info Body */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[9px] font-mono text-[#FF5A00] tracking-widest uppercase block mb-1">
            [ SALA #{room.roomId} ]
          </span>
          <h3 className="text-[13px] font-mono font-bold text-white uppercase line-clamp-1 group-hover:text-[#FF5A00] transition-colors">
            {room.videoTitle}
          </h3>
        </div>

        {/* Host and Action */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1C1C24]">
          <div className="flex items-center gap-2 min-w-0">
            {room.hostImage ? (
              <img src={room.hostImage} alt="Host" className="w-6 h-6 rounded border border-[#333] object-cover" />
            ) : (
              <div className="w-6 h-6 rounded bg-[#222] border border-[#333] flex items-center justify-center font-mono font-bold text-[9px] text-[#FF5A00]">
                {room.hostName.substring(0, 2).toUpperCase()}
              </div>
            )}
            <span className="text-[10px] font-mono text-[#888] truncate max-w-[90px]">
              {room.hostName}
            </span>
          </div>

          <div className="px-3 py-1 bg-[#FF5A00] group-hover:bg-white text-black font-mono font-black text-[9px] uppercase tracking-wider transition-colors flex items-center gap-1">
            <Play className="w-2.5 h-2.5 fill-black" />
            <span>CONECTAR</span>
          </div>
        </div>
      </div>
    </div>
  )
}
