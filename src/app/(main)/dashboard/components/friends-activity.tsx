'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, ArrowRight, UserPlus, Radio } from 'lucide-react'
import io, { Socket } from 'socket.io-client'
import { FriendActivityItem, FriendActivityData } from './friend-activity-item'
import { useSession } from 'next-auth/react'

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'https://services-videomax-websocket.khdya3.easypanel.host/'

interface FriendsActivityProps {
  initialFriends?: FriendActivityData[]
}

export function FriendsActivity({ initialFriends = [] }: FriendsActivityProps) {
  const { data: session } = useSession()
  const [friends, setFriends] = useState<FriendActivityData[]>(initialFriends)
  const [loading, setLoading] = useState(false)

  // 1. Fetch real friends list from database
  useEffect(() => {
    async function loadFriends() {
      try {
        setLoading(true)
        const res = await fetch('/api/friends')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data?.friends)) {
            setFriends(data.friends)
          }
        }
      } catch (err) {
        console.error('Failed to load friends:', err)
      } finally {
        setLoading(false)
      }
    }

    loadFriends()
  }, [])

  // 2. Real-time WebSocket presence and room binding
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
        if (session?.user) {
          socket?.emit('join-user-room', {
            userId: session.user.id,
            userName: session.user.name,
            userImage: session.user.image,
          })
        }
        socket?.emit('get-presence-list')
        socket?.emit('get-active-rooms')
      })

      // Presence list update handler
      const handlePresence = (onlineUsers: any[]) => {
        if (cancelled || !Array.isArray(onlineUsers)) return

        setFriends((prevFriends) =>
          prevFriends.map((f) => {
            const onlineRecord = onlineUsers.find(
              (u) => u.userId === f.id || (u.userName && u.userName.toLowerCase() === f.name.toLowerCase())
            )

            if (onlineRecord) {
              return {
                ...f,
                status: onlineRecord.currentRoom ? 'watching' : 'online',
                roomId: onlineRecord.currentRoom || f.roomId,
              }
            }
            return {
              ...f,
              status: f.status === 'watching' ? 'watching' : 'offline',
            }
          })
        )
      }

      // Active rooms update handler
      const handleRooms = (rooms: any[]) => {
        if (cancelled || !Array.isArray(rooms)) return

        setFriends((prevFriends) =>
          prevFriends.map((f) => {
            const activeRoom = rooms.find((r) =>
              r.viewers?.some(
                (v: any) => v.userId === f.id || (v.userName && v.userName.toLowerCase() === f.name.toLowerCase())
              )
            )
            if (activeRoom) {
              return {
                ...f,
                status: 'watching',
                roomId: activeRoom.roomId,
                videoTitle: activeRoom.videoTitle,
              }
            }
            return f
          })
        )
      }

      socket.on('presence-update', handlePresence)
      socket.on('presence-list', handlePresence)
      socket.on('active-rooms-update', handleRooms)
      socket.on('active-rooms-list', handleRooms)
    }

    init()

    return () => {
      cancelled = true
      if (socket) socket.disconnect()
    }
  }, [session])

  // Sort: online & watching friends first
  const sortedFriends = [...friends].sort((a, b) => {
    const scoreA = a.status === 'watching' ? 3 : a.status === 'online' ? 2 : 1
    const scoreB = b.status === 'watching' ? 3 : b.status === 'online' ? 2 : 1
    return scoreB - scoreA
  })

  const onlineCount = friends.filter((f) => f.status === 'online' || f.status === 'watching').length

  return (
    <div className="bg-[#09090D] border border-[#222] p-4 space-y-3">
      {/* Header with clean layout */}
      <div className="flex items-center justify-between gap-2 border-b border-[#222] pb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <Users className="w-3.5 h-3.5 text-[#FF5A00] shrink-0" />
          <span className="text-[10px] font-mono text-[#FF5A00] font-bold uppercase tracking-wider truncate">
            [ ATIVIDADE DOS AMIGOS ]
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-[9px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-[#22C55E] font-bold">{onlineCount}</span>
          <span className="text-[#555]">/</span>
          <span className="text-[#888]">{friends.length}</span>
        </div>
      </div>

      {/* Friends List */}
      <div className="space-y-1.5">
        {sortedFriends.length === 0 ? (
          <div className="py-6 text-center text-[10px] font-mono text-[#777] space-y-2">
            <p>NENHUM AMIGO REGISTRADO AINDA.</p>
            <Link
              href="/dashboard/friends"
              className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#FF5A00] hover:text-white uppercase transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>[ + ADICIONAR AMIGOS ]</span>
            </Link>
          </div>
        ) : (
          sortedFriends.slice(0, 6).map((friend) => (
            <FriendActivityItem key={friend.id} friend={friend} />
          ))
        )}
      </div>

      {/* Footer Link */}
      <Link
        href="/dashboard/friends"
        className="block pt-2 text-center text-[10px] font-mono font-bold text-[#888] hover:text-[#FF5A00] uppercase transition-colors border-t border-[#1A1A22]"
      >
        [ VER TODOS OS AMIGOS ({friends.length}) → ]
      </Link>
    </div>
  )
}
