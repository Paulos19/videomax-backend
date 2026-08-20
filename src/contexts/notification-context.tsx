'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '@/app/(main)/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Radio, Play, X, UserPlus, CheckCircle2, Crown, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  emailVerified: boolean
  setEmailVerified: (verified: boolean) => void
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  removeNotification: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

const defaultNotificationContext: NotificationContextValue = {
  notifications: [],
  unreadCount: 0,
  emailVerified: true,
  setEmailVerified: () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  removeNotification: async () => {},
  refresh: async () => {},
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  return ctx || defaultNotificationContext
}

export function NotificationProvider({
  children,
  userId,
}: {
  children: React.ReactNode
  userId?: string
}) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isPro, setIsPro] = useState(false)
  const [emailVerified, setEmailVerified] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/user/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          const plan = (data.user.plan || '').toUpperCase()
          setIsPro(plan === 'PRO' || plan === 'MAXPRO')
          setEmailVerified(data.user.emailVerified ? true : false)
        }
      })
      .catch(() => {})
  }, [userId])

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

      const SOCKET_SERVER_URL =
        process.env.NEXT_PUBLIC_WS_URL ??
        'https://services-videomax-websocket.khdya3.easypanel.host/'

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

  const lastInviteTimeRef = useRef<{ [key: string]: number }>({})

  useEffect(() => {
    if (!socket || !userId) return

    const onRoomInvite = (data: { senderName: string; roomCode: string }) => {
      if (!data.roomCode) return
      if (!data.senderName || data.senderName === 'Anonymous' || data.senderName === 'anonymous') {
        return
      }

      const key = `${data.senderName}-${data.roomCode}`
      const now = Date.now()
      if (lastInviteTimeRef.current[key] && now - lastInviteTimeRef.current[key] < 5000) {
        return
      }
      lastInviteTimeRef.current[key] = now

      toast.custom(
        (t) => (
          <div
            className={cn(
              'w-full max-w-[340px] p-4 bg-[#0A0A0E] border-2 font-mono text-white select-none backdrop-blur-md relative overflow-hidden',
              isPro
                ? 'border-[#FFE600] shadow-[0_0_30px_rgba(255,230,0,0.4)]'
                : 'border-[#FF5A00] shadow-[0_0_25px_rgba(255,90,0,0.35)]'
            )}
          >
            {/* Ambient Corner Flare */}
            <div
              className={cn(
                'absolute -top-12 -right-12 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-40',
                isPro ? 'bg-[#FFE600]' : 'bg-[#FF5A00]'
              )}
            />

            {/* Header info */}
            <div className="flex items-start gap-3 relative z-10">
              <div
                className={cn(
                  'w-9 h-9 flex items-center justify-center shrink-0 font-bold',
                  isPro ? 'bg-[#FFE600] text-black' : 'bg-[#FF5A00] text-black'
                )}
              >
                {isPro ? <Crown className="w-4 h-4 fill-black" /> : <Radio className="w-4 h-4 animate-pulse" />}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'text-[8px] font-bold uppercase tracking-widest px-1 py-0.2',
                      isPro
                        ? 'bg-[#1E1408] text-[#FFE600] border border-[#FFE600]/40'
                        : 'bg-[#150F08] text-[#FF5A00] border border-[#FF5A00]/40'
                    )}
                  >
                    {isPro ? '★ TRANSMISSÃO VIP' : '● SALA AO VIVO'}
                  </span>
                  <span className="text-[9px] font-bold text-[#888]">#{data.roomCode}</span>
                </div>

                <h4 className="text-[12px] font-black text-white uppercase leading-snug truncate">
                  <span className={isPro ? 'text-[#FFE600]' : 'text-[#FF5A00]'}>
                    {data.senderName}
                  </span>{' '}
                  convidou você!
                </h4>

                <p className="text-[10px] text-[#AAA] leading-tight font-mono">
                  Sincronia pronta para assistir juntos.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-3 mt-2 border-t border-[#1F1F28] relative z-10">
              <button
                onClick={() => {
                  toast.dismiss(t)
                  router.push(`/room/${data.roomCode}`)
                }}
                className={cn(
                  'flex-1 py-2 font-black text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer',
                  isPro
                    ? 'bg-[#FFE600] hover:bg-white text-black shadow-[0_0_15px_rgba(255,230,0,0.3)]'
                    : 'bg-[#FF5A00] hover:bg-white text-black shadow-[0_0_15px_rgba(255,90,0,0.3)]'
                )}
              >
                <Play className="w-3 h-3 fill-black" />
                <span>ENTRAR NA SALA</span>
              </button>

              <button
                onClick={() => toast.dismiss(t)}
                className="px-3 py-2 border border-[#333] hover:border-white text-[#888] hover:text-white font-bold text-[9px] uppercase transition-colors cursor-pointer"
              >
                IGNORAR
              </button>
            </div>
          </div>
        ),
        { duration: 9000 }
      )

      fetchNotifications()
    }

    const onFriendRequestReceived = (data: { senderName: string }) => {
      toast.custom(
        (t) => (
          <div className="w-full max-w-[320px] p-3.5 bg-[#0A0A0E] border-2 border-[#22C55E] shadow-[0_0_20px_rgba(34,197,94,0.3)] font-mono text-white flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 bg-[#22C55E] text-black flex items-center justify-center shrink-0">
                <UserPlus className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[8px] font-bold text-[#22C55E] uppercase block">
                  [ PEDIDO DE AMIZADE ]
                </span>
                <strong className="text-[11px] font-bold text-white uppercase truncate block">
                  {data.senderName}
                </strong>
              </div>
            </div>
            <button
              onClick={() => {
                toast.dismiss(t)
                router.push('/dashboard/friends')
              }}
              className="px-2.5 py-1.5 bg-[#22C55E] hover:bg-white text-black font-black text-[9px] uppercase cursor-pointer"
            >
              VER
            </button>
          </div>
        ),
        { duration: 7000 }
      )
      fetchNotifications()
    }

    const onFriendRequestAccepted = (data: { receiverName: string }) => {
      toast.custom(
        (t) => (
          <div className="w-full max-w-[320px] p-3.5 bg-[#0A0A0E] border-2 border-[#FFE600] shadow-[0_0_20px_rgba(255,230,0,0.3)] font-mono text-white flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 bg-[#FFE600] text-black flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[8px] font-bold text-[#FFE600] uppercase block">
                  [ CONEXÃO ESTABELECIDA ]
                </span>
                <strong className="text-[11px] font-bold text-white uppercase truncate block">
                  {data.receiverName} aceitou!
                </strong>
              </div>
            </div>
            <button
              onClick={() => {
                toast.dismiss(t)
                router.push('/dashboard/friends')
              }}
              className="px-2.5 py-1.5 bg-[#FFE600] hover:bg-white text-black font-black text-[9px] uppercase cursor-pointer"
            >
              AMIGOS
            </button>
          </div>
        ),
        { duration: 7000 }
      )
      fetchNotifications()
    }

    const onEmailVerified = (data: { userId?: string; email?: string }) => {
      if (!data || !data.userId || data.userId === userId) {
        setEmailVerified(true)
        toast.custom(
          (t) => (
            <div className="w-full max-w-[340px] p-3.5 bg-[#0A0A0E] border-2 border-[#22C55E] shadow-[0_0_25px_rgba(34,197,94,0.35)] font-mono text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-[#22C55E] text-black flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[8px] font-bold text-[#22C55E] uppercase block">
                  [ CONTA ATIVADA ]
                </span>
                <strong className="text-[11px] font-bold text-white uppercase truncate block">
                  E-mail verificado!
                </strong>
                <p className="text-[9.5px] text-[#A3A3A3] mt-0.5">
                  Criação de salas e amigos liberados.
                </p>
              </div>
            </div>
          ),
          { duration: 6000 }
        )
      }
    }

    socket.on('room-invite-received', onRoomInvite)
    socket.on('friend-request-received', onFriendRequestReceived)
    socket.on('friend-request-accepted', onFriendRequestAccepted)
    socket.on('email-verified', onEmailVerified)

    return () => {
      socket.off('room-invite-received', onRoomInvite)
      socket.off('friend-request-received', onFriendRequestReceived)
      socket.off('friend-request-accepted', onFriendRequestAccepted)
      socket.off('email-verified', onEmailVerified)
    }
  }, [socket, userId, isPro, fetchNotifications, router])

  const markAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
    } catch (err) {
      console.error('Failed to mark notification as read', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (err) {
      console.error('Failed to mark all as read', err)
    }
  }

  const removeNotification = async (id: string) => {
    try {
      await deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch (err) {
      console.error('Failed to delete notification', err)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        emailVerified,
        setEmailVerified,
        markAsRead,
        markAllAsRead,
        removeNotification,
        refresh: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
