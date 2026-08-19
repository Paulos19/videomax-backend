'use client'

import { useEffect, useState } from 'react'
import io, { Socket } from 'socket.io-client'

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'https://services-videomax-websocket.khdya3.easypanel.host/'

export function useLandingSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const [viewerCount, setViewerCount] = useState(0)
  const [activeRooms, setActiveRooms] = useState(0)

  useEffect(() => {
    let newSocket: Socket | null = null

    const initSocket = async () => {
      newSocket = io(SOCKET_SERVER_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 15,
        reconnectionDelay: 1000,
        timeout: 15000,
      })

      newSocket.on('connect', () => {
        setIsConnected(true)
        newSocket?.emit('get-presence-list')
        newSocket?.emit('get-active-rooms')
      })

      newSocket.on('disconnect', () => {
        setIsConnected(false)
      })

      newSocket.on('presence-list', (list: any[]) => {
        setViewerCount(list.length)
      })

      newSocket.on('presence-update', (list: any[]) => {
        setViewerCount(list.length)
      })

      newSocket.on('active-rooms-list', (rooms: any[]) => {
        setActiveRooms(rooms.length)
      })

      newSocket.on('active-rooms-update', (rooms: any[]) => {
        setActiveRooms(rooms.length)
      })
    }

    initSocket()

    return () => {
      if (newSocket) {
        newSocket.disconnect()
      }
    }
  }, [])

  return { isConnected, viewerCount, activeRooms }
}
