'use client'

import { useEffect, useState } from 'react'
import io, { Socket } from 'socket.io-client'

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'https://services-videomax-websocket.khdya3.easypanel.host/'

interface RawRoom {
  roomId: string
  hostUserId?: string
  hostName?: string
  hostImage?: string
  videoTitle?: string
  videoUrl?: string
  viewerCount?: number
  viewers?: Array<{ userId: string; userName: string; userImage?: string }>
  isStreamingScreen?: boolean
  isStreaming?: boolean
}

interface HostAvatar {
  id: string
  name: string
  image?: string
  color: string
  initial: string
  roomId: string
}

const AVATAR_COLORS = [
  '#EF2020', // Red
  '#FF5A00', // Orange
  '#FFB800', // Gold
  '#A855F7', // Purple
  '#3B82F6', // Blue
  '#10B981', // Emerald
]

export function LiveUsersBar() {
  const [activeRoomsCount, setActiveRoomsCount] = useState(0)
  const [totalViewers, setTotalViewers] = useState(0)
  const [activeHosts, setActiveHosts] = useState<HostAvatar[]>([])

  useEffect(() => {
    let socket: Socket | null = null
    let cancelled = false
    let pollTimer: NodeJS.Timeout | null = null

    const initSocket = async () => {
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
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 2000,
      })

      const handleRoomsUpdate = (rooms: RawRoom[]) => {
        if (cancelled || !Array.isArray(rooms)) return

        let totalPeople = 0
        const hostsList: HostAvatar[] = []
        const seenHostIds = new Set<string>()

        rooms.forEach((r, idx) => {
          // Calculate viewers
          const viewersInRoom = Array.isArray(r.viewers) ? r.viewers.length : (r.viewerCount || 1)
          totalPeople += Math.max(1, viewersInRoom)

          // Extract host information (supports multiple backend payload shapes)
          const hostId = r.hostUserId || r.viewers?.[0]?.userId || r.roomId || `room-${idx}`
          const hostName = r.hostName || r.viewers?.[0]?.userName || `Host ${idx + 1}`
          const hostImage = r.hostImage || r.viewers?.[0]?.userImage || ''

          if (!seenHostIds.has(hostId) && hostsList.length < 5) {
            seenHostIds.add(hostId)
            hostsList.push({
              id: hostId,
              name: hostName,
              image: hostImage,
              color: AVATAR_COLORS[hostsList.length % AVATAR_COLORS.length],
              initial: hostName.charAt(0).toUpperCase() || 'H',
              roomId: r.roomId,
            })
          }
        })

        setActiveRoomsCount(rooms.length)
        setTotalViewers(totalPeople)
        setActiveHosts(hostsList)
      }

      socket.on('connect', () => {
        if (cancelled) return
        socket?.emit('get-active-rooms')
      })

      socket.on('active-rooms-update', handleRoomsUpdate)
      socket.on('active-rooms-list', handleRoomsUpdate)

      // Poll periodically to ensure sync even if reconnecting
      pollTimer = setInterval(() => {
        if (socket?.connected) {
          socket.emit('get-active-rooms')
        }
      }, 10000)
    }

    initSocket()

    return () => {
      cancelled = true
      if (pollTimer) clearInterval(pollTimer)
      if (socket) socket.disconnect()
    }
  }, [])

  // If no rooms are active yet
  if (activeRoomsCount === 0) {
    return (
      <div className="flex items-center gap-2 opacity-70">
        <span className="w-2 h-2 rounded-full bg-[#5F5F5F]" />
        <span className="text-[10.5px] text-[#8A8A8A] font-medium">
          Nenhuma sala ativa no momento
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 animate-fade-in">
      {/* 5 Most Recent Active Hosts Queue */}
      {activeHosts.length > 0 && (
        <div className="flex -space-x-2 shrink-0">
          {activeHosts.map((host, i) => (
            <div
              key={host.id}
              title={`Host: ${host.name}`}
              className="relative group w-7 h-7 rounded-full border-2 border-[#0B0B0B] flex items-center justify-center text-[9.5px] font-extrabold text-white shrink-0 overflow-hidden bg-[#161616] shadow-[0_2px_8px_rgba(0,0,0,0.6)] transition-transform hover:scale-110 hover:z-30 cursor-pointer"
              style={{
                background: host.image ? '#161616' : host.color,
                zIndex: activeHosts.length - i,
              }}
            >
              {host.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={host.image}
                  alt={host.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{host.initial}</span>
              )}

              {/* Tooltip on hover */}
              <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 bg-[#1A1A1A] border border-white/10 text-white text-[9px] font-semibold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-50">
                {host.name}
              </div>
            </div>
          ))}

          {/* If there are more rooms than the 5 hosts shown */}
          {activeRoomsCount > activeHosts.length && (
            <div
              className="w-7 h-7 rounded-full border-2 border-[#0B0B0B] bg-[#1F1F1F] flex items-center justify-center text-[8.5px] font-bold text-[#A3A3A3] shrink-0 shadow-md"
              style={{ zIndex: 0 }}
              title={`+${activeRoomsCount - activeHosts.length} outras salas`}
            >
              +{activeRoomsCount - activeHosts.length}
            </div>
          )}
        </div>
      )}

      {/* Real-time Screens & Viewers Counter */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse-online" />
          <span className="text-[11px] text-white font-bold tracking-tight">
            {activeRoomsCount} {activeRoomsCount === 1 ? 'tela ligada' : 'telas ligadas'}
          </span>
          <span className="text-[10px] text-[#737373] font-medium">
            • {totalViewers} {totalViewers === 1 ? 'online' : 'online'}
          </span>
        </div>
      </div>
    </div>
  )
}
