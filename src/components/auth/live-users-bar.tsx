'use client'

import { useEffect, useState } from 'react'
import io, { Socket } from 'socket.io-client'

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'https://services-videomax-websocket.khdya3.easypanel.host/'

interface ActiveRoom {
  roomId: string
  hostUserId: string
  hostName: string
  hostImage?: string
  viewerCount: number
  viewers: Array<{ userId: string; userName: string; userImage?: string }>
}

interface AvatarData {
  id: string
  image: string
  color: string
  initial: string
}

export function LiveUsersBar() {
  const [totalViewers, setTotalViewers] = useState(0)
  const [avatars, setAvatars] = useState<AvatarData[]>([])

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

      const handleRoomsUpdate = (rooms: ActiveRoom[]) => {
        if (cancelled || !Array.isArray(rooms)) return

        let total = 0
        const uniqueAvatars = new Map<string, AvatarData>()
        const colors = ['#EF2020', '#FF5A00', '#FFB800', '#A855F7', '#3B82F6']

        rooms.forEach((room, index) => {
          total += room.viewerCount

          // Add host avatar
          if (!uniqueAvatars.has(room.hostUserId)) {
            uniqueAvatars.set(room.hostUserId, {
              id: room.hostUserId,
              image: room.hostImage || '',
              color: colors[index % colors.length],
              initial: room.hostName.charAt(0).toUpperCase() || 'U',
            })
          }

          // Add viewer avatars
          room.viewers.forEach((viewer) => {
            if (!uniqueAvatars.has(viewer.userId)) {
              uniqueAvatars.set(viewer.userId, {
                id: viewer.userId,
                image: viewer.userImage || '',
                color: colors[(index + 1) % colors.length],
                initial: viewer.userName.charAt(0).toUpperCase() || 'U',
              })
            }
          })
        })

        setTotalViewers(total)
        setAvatars(Array.from(uniqueAvatars.values()).slice(0, 4))
      }

      socket.on('connect', () => {
        if (cancelled) return
        socket?.emit('get-active-rooms', handleRoomsUpdate)
      })

      socket.on('active-rooms-update', handleRoomsUpdate)
      socket.on('active-rooms-list', handleRoomsUpdate)
    }

    init()

    return () => {
      cancelled = true
      if (socket) socket.disconnect()
    }
  }, [])

  if (totalViewers === 0) {
    return (
      <div className="flex items-center gap-1.5 opacity-60">
        <span className="w-1.5 h-1.5 rounded-full bg-[#5F5F5F]" />
        <span className="text-[11px] text-[#8A8A8A] font-medium">Nenhuma sala ativa no momento</span>
      </div>
    )
  }

  const formatCount = (count: number) => {
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K'
    return count.toString()
  }

  return (
    <div className="flex items-center gap-3 animate-fade-in">
      {/* Stacked Avatars */}
      {avatars.length > 0 && (
        <div className="flex -space-x-2.5">
          {avatars.map((a, i) => (
            <div
              key={a.id}
              className="w-7 h-7 rounded-full border-2 border-[#050505] flex items-center justify-center text-[9px] font-bold text-white shrink-0 overflow-hidden bg-[#1A1A1A]"
              style={{ background: a.image ? '#1A1A1A' : a.color, zIndex: avatars.length - i }}
            >
              {a.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.image} alt="User" className="w-full h-full object-cover" />
              ) : (
                a.initial
              )}
            </div>
          ))}
          {totalViewers > avatars.length && (
            <div
              className="w-7 h-7 rounded-full border-2 border-[#050505] bg-[#1A1A1A] flex items-center justify-center text-[8px] font-bold text-[#8A8A8A] shrink-0"
              style={{ zIndex: 0 }}
            >
              +{totalViewers - avatars.length}
            </div>
          )}
        </div>
      )}

      {/* Counter */}
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse-online" />
        <span className="text-[11px] text-[#8A8A8A] font-medium">
          <span className="font-mono font-bold text-[#A3A3A3]">{formatCount(totalViewers)}</span> assistindo agora
        </span>
      </div>
    </div>
  )
}
