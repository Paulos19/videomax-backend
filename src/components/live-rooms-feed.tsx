'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Users, Sparkles, Flame, Radio } from 'lucide-react'
import io, { Socket } from 'socket.io-client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'https://services-videomax-websocket.khdya3.easypanel.host/'

export interface ActiveRoom {
  roomId: string
  hostUserId: string
  hostName: string
  hostImage?: string
  videoTitle: string
  videoUrl?: string
  viewerCount: number
  viewers: Array<{ userId: string; userName: string; userImage?: string }>
}

function getYouTubeThumbnail(url?: string): string | null {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  if (match && match[2].length === 11) {
    return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`
  }
  return null
}

export function LiveRoomsFeed() {
  const router = useRouter()
  const [activeRooms, setActiveRooms] = useState<ActiveRoom[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let socket: Socket | null = null
    let cancelled = false

    const init = async () => {
      let wsToken: string | undefined
      try {
        const tokenRes = await fetch('/api/auth/token')
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json()
          wsToken = tokenData.token
        }
      } catch {}

      if (cancelled) return

      socket = io(SOCKET_SERVER_URL, {
        auth: wsToken ? { token: wsToken } : undefined,
        transports: ['websocket', 'polling'],
      })

      socket.on('connect', () => {
        if (cancelled) return
        socket?.emit('get-active-rooms', (rooms: ActiveRoom[]) => {
          if (!cancelled && Array.isArray(rooms)) {
            setActiveRooms(rooms)
            setLoading(false)
          }
        })
      })

      socket.on('active-rooms-update', (rooms: ActiveRoom[]) => {
        if (!cancelled && Array.isArray(rooms)) {
          setActiveRooms(rooms)
          setLoading(false)
        }
      })

      socket.on('active-rooms-list', (rooms: ActiveRoom[]) => {
        if (!cancelled && Array.isArray(rooms)) {
          setActiveRooms(rooms)
          setLoading(false)
        }
      })
    }

    init()

    return () => {
      cancelled = true
      if (socket) socket.disconnect()
    }
  }, [])

  if (!loading && activeRooms.length === 0) {
    return null
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-room-red/10 border border-room-red/20 flex items-center justify-center">
            <Flame className="w-4 h-4 text-room-red animate-pulse" />
          </div>
          <div>
            <h2 className="text-room-text font-bold text-lg flex items-center gap-2">
              Ao Vivo Agora
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-room-red/10 border border-room-red/20 text-room-red font-semibold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-room-red animate-ping" />
                {activeRooms.length} {activeRooms.length === 1 ? 'Sala Ativa' : 'Salas Ativas'}
              </span>
            </h2>
            <p className="text-room-text-secondary text-xs">Veja o que as pessoas estão assistindo juntas neste momento</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeRooms.map((room) => {
          const thumbnailUrl = getYouTubeThumbnail(room.videoUrl)

          return (
            <div
              key={room.roomId}
              className="group relative bg-room-surface border border-room-border hover:border-room-accent/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-room-accent/5 flex flex-col justify-between"
            >
              {/* Thumbnail / Cover Header */}
              <div className="relative aspect-video w-full bg-room-surface-3 overflow-hidden">
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt={room.videoTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full brand-gradient-subtle flex items-center justify-center">
                    <Play className="w-12 h-12 text-room-accent/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-room-surface via-transparent to-black/50" />

                {/* Live Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-room-red px-2.5 py-1 rounded-full text-white text-[11px] font-bold tracking-wider uppercase shadow-lg shadow-room-red/30">
                  <Radio className="w-3 h-3 animate-pulse" />
                  AO VIVO
                </div>

                {/* Viewer Counter */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs font-semibold border border-white/10">
                  <Users className="w-3.5 h-3.5 text-room-accent" />
                  {room.viewerCount}
                </div>

                {/* Host Info Badge */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                  <Avatar className="w-7 h-7 ring-2 ring-room-accent">
                    <AvatarImage src={room.hostImage} />
                    <AvatarFallback className="bg-room-surface-3 text-room-accent font-bold text-xs">
                      {room.hostName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-white text-xs font-medium drop-shadow truncate">
                    Criado por <strong className="font-bold">{room.hostName}</strong>
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-room-text font-bold text-sm line-clamp-1 group-hover:text-room-accent transition-colors">
                    {room.videoTitle || `Sala ${room.roomId}`}
                  </h3>
                  <p className="text-room-text-secondary text-xs font-mono mt-0.5">
                    Sala: #{room.roomId}
                  </p>
                </div>

                {/* Viewers Avatars & CTA */}
                <div className="pt-2 border-t border-room-border/60 flex items-center justify-between gap-3">
                  <div className="flex -space-x-2 overflow-hidden">
                    {room.viewers.slice(0, 4).map((viewer, idx) => (
                      <Avatar key={viewer.userId + idx} className="w-7 h-7 border-2 border-room-surface ring-1 ring-room-border">
                        <AvatarImage src={viewer.userImage} />
                        <AvatarFallback className="bg-room-surface-3 text-room-accent text-[10px] font-bold">
                          {viewer.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {room.viewers.length > 4 && (
                      <div className="w-7 h-7 rounded-full bg-room-surface-3 border-2 border-room-surface flex items-center justify-center text-[10px] font-bold text-room-text-secondary">
                        +{room.viewers.length - 4}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => router.push(`/room/${room.roomId}`)}
                    className="px-4 py-2 rounded-xl brand-gradient text-white text-xs font-semibold flex items-center gap-1.5 brand-glow-strong hover:opacity-90 active:scale-95 transition-all shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Entrar na sala
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
