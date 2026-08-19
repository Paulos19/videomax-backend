'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import io, { Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

const SOCKET_SERVER_URL =
  process.env.NEXT_PUBLIC_WS_URL ??
  'https://services-videomax-websocket.khdya3.easypanel.host/'

export interface LivePresenceUser {
  userId: string
  status: 'online' | 'in_room' | 'offline'
  roomId: string | null
  videoTitle: string | null
  videoUrl: string | null
  userName: string
  userImage: string
  chatColor?: string
  lastSeen?: number
}

export function useLandingSocket() {
  const { data: session } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const [viewerCount, setViewerCount] = useState(0)
  const [activeRooms, setActiveRooms] = useState(0)
  const [presenceUsers, setPresenceUsers] = useState<LivePresenceUser[]>([])
  const [activeRoomsList, setActiveRoomsList] = useState<any[]>([])
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    let socket: Socket | null = null

    const initSocket = async () => {
      socket = io(SOCKET_SERVER_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 15,
        reconnectionDelay: 1000,
        timeout: 15000,
      })

      socketRef.current = socket

      socket.on('connect', () => {
        setIsConnected(true)

        // Register user presence if logged in or as guest
        if (session?.user?.id) {
          socket?.emit('join-user-room', {
            userId: session.user.id,
            userName: session.user.name || session.user.email || 'Usuário',
            userImage: session.user.image || '',
            chatColor: (session.user as any).chatColor || '#FF5A00',
          })
        }

        socket?.emit('get-presence-list')
        socket?.emit('get-active-rooms')
      })

      socket.on('disconnect', () => {
        setIsConnected(false)
      })

      socket.on('presence-list', (list: LivePresenceUser[]) => {
        if (Array.isArray(list)) {
          setPresenceUsers(list)
          setViewerCount(list.length)
        }
      })

      socket.on('presence-update', (list: LivePresenceUser[]) => {
        if (Array.isArray(list)) {
          setPresenceUsers(list)
          setViewerCount(list.length)
        }
      })

      socket.on('active-rooms-list', (rooms: any[]) => {
        if (Array.isArray(rooms)) {
          setActiveRoomsList(rooms)
          setActiveRooms(rooms.length)
        }
      })

      socket.on('active-rooms-update', (rooms: any[]) => {
        if (Array.isArray(rooms)) {
          setActiveRoomsList(rooms)
          setActiveRooms(rooms.length)
        }
      })
    }

    initSocket()

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [session?.user?.id, session?.user?.name, session?.user?.email, session?.user?.image])

  const inviteToRoom = useCallback(
    (targetUserId: string, roomCode: string, senderName: string) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('invite-to-room', {
          targetUserId,
          roomCode,
          senderName,
        })
        return true
      }
      return false
    },
    []
  )

  return {
    isConnected,
    viewerCount,
    activeRooms,
    presenceUsers,
    activeRoomsList,
    inviteToRoom,
  }
}
