'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '@/app/(main)/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export type NotificationType = 'ROOM_INVITE' | 'FRIEND_REQUEST' | 'SYSTEM'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data: string | null
  read: boolean
  createdAt: string | Date
}

interface NotificationContextValue {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  removeNotification: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within a NotificationProvider')
  return ctx
}

export function NotificationProvider({ 
  children,
  userId
}: { 
  children: React.ReactNode
  userId?: string
}) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)
  const router = useRouter()

  const fetchNotifications = useCallback(async () => {
    if (!userId) return
    try {
      const data = await getNotifications()
      setNotifications(data as Notification[])
    } catch (err) {
      console.error('Failed to fetch notifications', err)
    }
  }, [userId])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Initialize socket
  useEffect(() => {
    if (!userId) return

    let s: Socket | null = null
    let cancelled = false

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

      const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'https://services-videomax-websocket.khdya3.easypanel.host/'
      
      s = io(SOCKET_SERVER_URL, {
        auth: wsToken ? { token: wsToken } : undefined,
        transports: ['websocket', 'polling'],
      })

      s.on('connect', () => {
        if (cancelled) return
        s?.emit('join-user-room', { userId })
      })

      setSocket(s)
    }

    initSocket()

    return () => {
      cancelled = true
      if (s) s.disconnect()
    }
  }, [userId])

  useEffect(() => {
    if (!socket || !userId) return

    const onRoomInvite = (data: { senderName: string, roomCode: string }) => {
      toast.custom((t) => (
        <div className="flex flex-col gap-2 p-4 bg-room-surface border border-[#FF5A00]/20 rounded-xl shadow-xl w-[320px]">
          <p className="text-white text-sm font-medium">
            <span className="text-[#FF5A00]">{data.senderName}</span> convidou você para uma sala!
          </p>
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => {
                toast.dismiss(t)
                router.push(`/room/${data.roomCode}`)
              }}
              className="flex-1 bg-[#FF5A00] hover:bg-[#FF5A00]/90 text-white text-xs font-bold py-2 rounded-lg transition-colors"
            >
              Entrar
            </button>
            <button
              onClick={() => toast.dismiss(t)}
              className="flex-1 bg-room-surface-2 hover:bg-room-surface-3 text-white text-xs font-medium py-2 rounded-lg transition-colors"
            >
              Ignorar
            </button>
          </div>
        </div>
      ), { duration: 8000 })
      
      // Refresh notifications to get the newly created one from the DB
      fetchNotifications()
    }

    const onFriendRequestReceived = (data: { senderName: string }) => {
      toast.success(`${data.senderName} enviou um pedido de amizade!`)
      fetchNotifications()
    }

    const onFriendRequestAccepted = (data: { receiverName: string }) => {
      toast.success(`${data.receiverName} aceitou seu pedido de amizade!`)
      fetchNotifications()
    }

    socket.on('room-invite-received', onRoomInvite)
    socket.on('friend-request-received', onFriendRequestReceived)
    socket.on('friend-request-accepted', onFriendRequestAccepted)

    return () => {
      socket.off('room-invite-received', onRoomInvite)
      socket.off('friend-request-received', onFriendRequestReceived)
      socket.off('friend-request-accepted', onFriendRequestAccepted)
    }
  }, [socket, userId, fetchNotifications, router])

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    await markNotificationAsRead(id).catch(console.error)
  }

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    await markAllNotificationsAsRead().catch(console.error)
  }

  const removeNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    await deleteNotification(id).catch(console.error)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      removeNotification,
      refresh: fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  )
}
