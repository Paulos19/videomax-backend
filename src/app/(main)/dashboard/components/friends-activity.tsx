'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, ArrowRight } from 'lucide-react'
import io, { Socket } from 'socket.io-client'
import { FriendActivityItem, FriendActivityData } from './friend-activity-item'

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'https://services-videomax-websocket.khdya3.easypanel.host/'

interface FriendsActivityProps {
  initialFriends?: FriendActivityData[]
}

export function FriendsActivity({ initialFriends = [] }: FriendsActivityProps) {
  const [friends, setFriends] = useState<FriendActivityData[]>(initialFriends)

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
        socket?.emit('get-active-rooms')
      })

      socket.on('active-rooms-update', (rooms: Array<{ roomId: string; videoTitle: string; viewers: Array<{ userId: string; userName: string; userImage?: string }> }>) => {
        if (cancelled || !Array.isArray(rooms)) return

        setFriends((prevFriends) =>
          prevFriends.map((f) => {
            const activeRoom = rooms.find((r) => r.viewers.some((v) => v.userId === f.id))
            if (activeRoom) {
              return {
                ...f,
                status: 'watching',
                roomId: activeRoom.roomId,
                videoTitle: activeRoom.videoTitle
              }
            }
            return f
          })
        )
      })
    }

    init()

    return () => {
      cancelled = true
      if (socket) socket.disconnect()
    }
  }, [])

  return (
    <div className="bg-[#0B0B0B] border border-[#242424] rounded-2xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#FF5A00]" />
          <h3 className="text-[#F5F5F5] font-bold text-sm">Atividade dos amigos</h3>
        </div>
      </div>

      {/* Friends List */}
      <div className="space-y-1">
        {friends.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#8A8A8A]">
            Seus amigos ainda não estão assistindo nada.
          </div>
        ) : (
          friends.map((friend) => (
            <FriendActivityItem key={friend.id} friend={friend} />
          ))
        )}
      </div>

      {/* Footer Link */}
      <Link
        href="/dashboard/friends"
        className="block pt-2 text-center text-xs font-semibold text-[#8A8A8A] hover:text-[#FF5A00] transition-colors"
      >
        Ver todos os amigos →
      </Link>
    </div>
  )
}
