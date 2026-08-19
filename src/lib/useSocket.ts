'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import io, { Socket } from 'socket.io-client'
import { ChatMessage, PlayerStateData, RoomInfo, ChatReplyInfo, ChatPayload } from '@/types'
import { toast } from 'sonner'

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'https://services-videomax-websocket.khdya3.easypanel.host/'

interface SocketUserProfile {
  chatColor: string
  image: string
}

export interface Viewer {
  id: string
  name: string
  image?: string
  isCurrentUser?: boolean
  role?: 'host' | 'cohost' | 'viewer'
}

export interface PlayerActionNotice {
  senderId: string
  senderName: string
  type: string
  videoTitle?: string
  currentTime?: number
  serverTimestamp: number
}

export interface HostAccessRequest {
  socketId: string
  requestingUserId: string
  requestingUserName: string
  requestingUserImage?: string
  roomId: string
}

let systemMessageCounter = 0

export function useSocket(roomId: string, initialHostUserId?: string) {
  const { data: session } = useSession()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [viewers, setViewers] = useState<Viewer[]>([])
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<'host' | 'cohost' | 'viewer'>('viewer')
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null)
  const [lastPlayerAction, setLastPlayerAction] = useState<PlayerActionNotice | null>(null)
  const [roomFullError, setRoomFullError] = useState<string | null>(null)
  const [pendingAccessRequests, setPendingAccessRequests] = useState<HostAccessRequest[]>([])
  const [accessApproved, setAccessApproved] = useState(false)
  const [accessRejectedReason, setAccessRejectedReason] = useState<string | null>(null)
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockedReason, setBlockedReason] = useState<string | null>(null)
  const [blockedHostUserId, setBlockedHostUserId] = useState<string | null>(null)
  const userProfileRef = useRef<SocketUserProfile>({ chatColor: '#4f46e5', image: '' })
  const seenMessageIds = useRef(new Set<string>())
  const viewersRef = useRef<Viewer[]>([])
  const roomInfoRef = useRef<RoomInfo | null>(null)

  useEffect(() => {
    if (!session?.user) return

    let newSocket: Socket
    let cancelled = false

    const initSocket = async () => {
      const user = session.user!
      const userId = (user as Record<string, unknown>).id as string
      const userName = user.name || user.email || 'Usuário'
      const sessionImage = (user as Record<string, unknown>).image as string || user.image || ''
      setCurrentUserId(userId)

      userProfileRef.current = {
        chatColor: '#4f46e5',
        image: sessionImage
      }

      try {
        const profileRes = await fetch('/api/mobile/profile')
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          if (profileData?.user) {
            userProfileRef.current = {
              chatColor: profileData.user.chatColor || '#4f46e5',
              image: profileData.user.image || sessionImage
            }
          }
        }
      } catch {}

      let wsToken: string | null = null
      try {
        const tokenRes = await fetch('/api/auth/token')
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json()
          wsToken = tokenData.token
        }
      } catch {}

      if (cancelled) return

      newSocket = io(SOCKET_SERVER_URL, {
        auth: wsToken ? { token: wsToken } : undefined,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 15,
        reconnectionDelay: 1000,
        timeout: 15000,
      })

      newSocket.on('connect', () => {
        if (cancelled) return
        setIsConnected(true)

        const currentUser: Viewer = {
          id: userId,
          name: userName,
          image: userProfileRef.current.image || sessionImage,
          isCurrentUser: true,
          role: 'viewer'
        }
        viewersRef.current = [currentUser]
        setViewers([currentUser])

        newSocket.emit('join-room', {
          roomId,
          userId,
          userName,
          userImage: userProfileRef.current.image || sessionImage,
          hostUserId: initialHostUserId || roomInfoRef.current?.hostUserId
        })
        newSocket.emit('join-user-room', { userId })
      })

      newSocket.on('connect_error', (err) => {
        if (cancelled) return
        console.warn('[WebSocket] Reconectando em segundo plano:', err.message)
        setIsConnected(false)
      })

      newSocket.on('error', (err) => {
        if (cancelled) return
        console.error('[WebSocket] Erro retornado pelo servidor:', err)
      })

      newSocket.on('room-full-error', (data: { message: string; maxViewers?: number; hostPlan?: string }) => {
        if (cancelled) return
        console.warn('[WebSocket] Sala cheia:', data.message)
        setRoomFullError(data.message)
        toast.error(data.message)
      })

      newSocket.on('host-access-request', (req: HostAccessRequest) => {
        if (cancelled) return
        setPendingAccessRequests((prev) => [...prev.filter((p) => p.socketId !== req.socketId), req])
        toast.info(`🙋‍♂️ ${req.requestingUserName} solicitou entrada na sala.`)
      })

      newSocket.on('room-access-approved', () => {
        if (cancelled) return
        setAccessApproved(true)
        toast.success('Sua entrada na sala foi aprovada pelo Host!')
        newSocket.emit('join-room', {
          roomId,
          userId: session?.user?.id,
          userName: session?.user?.name || session?.user?.email || 'Usuário',
          userImage: userProfileRef.current.image || session?.user?.image || '',
          hostUserId: initialHostUserId || roomInfoRef.current?.hostUserId
        })
      })

      newSocket.on('room-access-rejected', (data: { message?: string }) => {
        if (cancelled) return
        setAccessRejectedReason(data.message || 'Solicitação de entrada recusada.')
        toast.error(data.message || 'Solicitação de entrada recusada pelo Host.')
      })

      newSocket.on('disconnect', (reason) => {
        if (cancelled) return
        console.warn('[WebSocket] Desconectado:', reason)
        setIsConnected(false)
      })

      newSocket.on('room-info', (info: RoomInfo) => {
        if (cancelled) return
        roomInfoRef.current = info
        setRoomInfo(info)
        if (info.videoUrl) {
          setCurrentVideoUrl(info.videoUrl)
        }
        if (info.hostUserId === userId) {
          setUserRole('host')
        } else if (info.coHostIds?.includes(userId)) {
          setUserRole('cohost')
        } else {
          setUserRole('viewer')
        }
      })

      newSocket.on('stream-state-change', (data: { isStreaming: boolean; streamerId?: string; streamerName?: string }) => {
        if (cancelled) return
        if (roomInfoRef.current) {
          roomInfoRef.current.isStreamingScreen = data.isStreaming
          roomInfoRef.current.streamerId = data.streamerId || null
          roomInfoRef.current.streamerName = data.streamerName || null
        }
        setRoomInfo((prev) => prev ? { ...prev, isStreamingScreen: data.isStreaming, streamerId: data.streamerId || null, streamerName: data.streamerName || null } : null)
      })

      newSocket.on('receive-message', (data: ChatMessage) => {
        if (cancelled) return
        if (seenMessageIds.current.has(data.id)) return
        seenMessageIds.current.add(data.id)

        let parsedReplyTo = data.replyTo || null
        let parsedIsPro = data.isPro || false

        if (typeof data.message === 'string' && data.message.startsWith('{')) {
          try {
            const p = JSON.parse(data.message)
            if (p.replyTo) parsedReplyTo = p.replyTo
            if (p.isPro) parsedIsPro = true
          } catch {}
        }

        const msgWithTime: ChatMessage = {
          ...data,
          replyTo: parsedReplyTo,
          isPro: parsedIsPro,
          timestamp: data.timestamp || new Date().toISOString(),
        }
        setMessages((prev) => [...prev, msgWithTime])
      })

      newSocket.on('message-reaction', (data: { messageId: string; userId: string; emoji: string }) => {
        if (cancelled) return
        setMessages((prevMessages) =>
          prevMessages.map((msg) => {
            if (msg.id !== data.messageId) return msg
            const currentReactions = { ...(msg.userReactions || {}) }
            if (currentReactions[data.userId] === data.emoji) {
              delete currentReactions[data.userId]
            } else {
              currentReactions[data.userId] = data.emoji
            }
            return {
              ...msg,
              userReactions: currentReactions,
            }
          })
        )
      })

      // Server sends full room user list when we join — replaces our local-only list
      newSocket.on('room-users', (users: Array<{ userId: string; userName: string; userImage?: string; role?: 'host' | 'cohost' | 'viewer' }>) => {
        if (cancelled) return
        const me = users.find(u => u.userId === userId)
        if (me?.role) {
          setUserRole(me.role)
        }
        
        const updatedViewers: Viewer[] = users.map(u => ({
          id: u.userId,
          name: u.userName,
          image: u.userImage || '',
          isCurrentUser: u.userId === userId,
          role: u.role || (u.userId === roomInfo?.hostUserId ? 'host' : 'viewer')
        }))
        viewersRef.current = updatedViewers
        setViewers(updatedViewers)
      })

      newSocket.on('user-joined', (data: { userId: string; userName: string; userImage?: string; role?: 'host' | 'cohost' | 'viewer' }) => {
        if (cancelled) return

        // Add viewer if not already present
        if (!viewersRef.current.find(v => v.id === data.userId)) {
          const newViewer: Viewer = {
            id: data.userId,
            name: data.userName,
            image: data.userImage || '',
            isCurrentUser: data.userId === userId,
            role: data.role || 'viewer'
          }
          viewersRef.current = [...viewersRef.current, newViewer]
          setViewers([...viewersRef.current])
        }

        // System message
        const msgId = `sys-joined-${++systemMessageCounter}-${Date.now()}`
        seenMessageIds.current.add(msgId)
        setMessages((prev) => [
          ...prev,
          { id: msgId, userId: 'system', userName: 'Sistema', message: `${data.userName} entrou na sala.`, type: 'system', timestamp: new Date().toISOString() }
        ])
      })

      newSocket.on('user-left', (data: { userId: string; userName: string }) => {
        if (cancelled) return

        // Remove viewer
        viewersRef.current = viewersRef.current.filter(v => v.id !== data.userId)
        setViewers([...viewersRef.current])

        // System message
        const msgId = `sys-left-${++systemMessageCounter}-${Date.now()}`
        seenMessageIds.current.add(msgId)
        setMessages((prev) => [
          ...prev,
          { id: msgId, userId: 'system', userName: 'Sistema', message: `${data.userName} saiu da sala.`, type: 'system', timestamp: new Date().toISOString() }
        ])
      })

      // Listen for video sync from other users
      newSocket.on('player-state-change', (data: PlayerStateData & { senderName?: string; videoTitle?: string; isSync?: boolean }) => {
        if (cancelled) return
        if (data.url) {
          setCurrentVideoUrl(data.url)
        }

        // Only show action notice / system message if NOT an initial position sync packet and NOT streaming screen
        if (data.senderName && !data.isSync && !roomInfoRef.current?.isStreamingScreen) {
          setLastPlayerAction({
            senderId: data.senderId || '',
            senderName: data.senderName,
            type: data.type,
            videoTitle: data.videoTitle,
            currentTime: data.currentTime,
            serverTimestamp: data.serverTimestamp || Date.now()
          })

          // Add system notification message to chat
          let actionLabel = 'alterou o vídeo'
          if (data.type === 'play') actionLabel = 'iniciou a reprodução'
          else if (data.type === 'pause') actionLabel = 'pausou o vídeo'
          else if (data.type === 'seek') actionLabel = 'avançou no vídeo'

          const msgId = `sys-action-${++systemMessageCounter}-${Date.now()}`
          setMessages((prev) => [
            ...prev,
            { id: msgId, userId: 'system', userName: 'Sistema', message: `${data.senderName} ${actionLabel}.`, type: 'system', timestamp: new Date().toISOString() }
          ])
        }
      })

      newSocket.on('user-kicked', (data: { roomId: string; hostUserId?: string; message: string }) => {
        if (cancelled) return
        setIsBlocked(true)
        setBlockedReason(data.message)
        if (data.hostUserId) setBlockedHostUserId(data.hostUserId)
        toast.error(data.message || 'Você foi removido da sala pelo Host.')
      })

      newSocket.on('room-access-blocked', (data: { roomId: string; hostUserId?: string; message: string }) => {
        if (cancelled) return
        setIsBlocked(true)
        setBlockedReason(data.message)
        if (data.hostUserId) setBlockedHostUserId(data.hostUserId)
      })

      newSocket.on('room-access-approved', () => {
        if (cancelled) return
        setIsBlocked(false)
        setBlockedReason(null)
        setAccessApproved(true)
        toast.success('Sua entrada na sala foi autorizada pelo Host!')
      })

      setSocket(newSocket)
    }

    initSocket()

    return () => {
      cancelled = true
      seenMessageIds.current.clear()
      viewersRef.current = []
      if (newSocket) {
        newSocket.disconnect()
      }
    }
  }, [roomId, session?.user?.id, session?.user?.name, roomInfo?.hostUserId])

  const [selectedColor, setSelectedColor] = useState<string>('#F5F5F5')

  const changeChatColor = useCallback((color: string) => {
    setSelectedColor(color)
    userProfileRef.current.chatColor = color
  }, [])

  const sendMessage = useCallback(
    (
      messageText: string,
      type: 'text' | 'sticker' = 'text',
      stickerUrl?: string,
      replyTo?: ChatReplyInfo | null,
      isPro?: boolean
    ) => {
      if (socket && (messageText.trim() !== '' || type === 'sticker')) {
        const payload: ChatPayload = {
          text: messageText,
          color: userProfileRef.current.chatColor || selectedColor,
          image: userProfileRef.current.image || '',
          type,
          stickerUrl,
          replyTo: replyTo || null,
          isPro: isPro || (session?.user as any)?.plan === 'MAXPRO' || (session?.user as any)?.plan === 'PRO',
        }
        socket.emit('send-message', { message: JSON.stringify(payload) })
      }
    },
    [socket, selectedColor, session?.user]
  )

  const reactToMessage = useCallback(
    (messageId: string, emoji: string) => {
      const myId = currentUserId || session?.user?.id || 'me'
      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          if (msg.id !== messageId) return msg
          const currentReactions = { ...(msg.userReactions || {}) }
          if (currentReactions[myId] === emoji) {
            delete currentReactions[myId]
          } else {
            currentReactions[myId] = emoji
          }
          return {
            ...msg,
            userReactions: currentReactions,
          }
        })
      )
      if (socket) {
        socket.emit('message-reaction', { messageId, emoji })
      }
    },
    [socket, currentUserId, session?.user?.id]
  )

  const syncPlayerState = useCallback((stateData: PlayerStateData) => {
    if (socket) {
      socket.emit('player-state-change', stateData)
    }
  }, [socket])

  const changeUserRole = useCallback((targetUserId: string, newRole: 'host' | 'cohost' | 'viewer') => {
    if (socket) {
      socket.emit('set-user-role', { targetUserId, newRole })
    }
  }, [socket])

  const requestRoomAccess = useCallback((data: { roomId: string; hostUserId: string; userName: string; userImage?: string }) => {
    if (socket) {
      socket.emit('request-room-access', data)
    }
  }, [socket])

  const approveAccessRequest = useCallback((requestingSocketId: string) => {
    if (socket) {
      socket.emit('approve-room-access', { requestingSocketId, roomId })
      setPendingAccessRequests((prev) => prev.filter((p) => p.socketId !== requestingSocketId))
    }
  }, [socket, roomId])

  const rejectAccessRequest = useCallback((requestingSocketId: string) => {
    if (socket) {
      socket.emit('reject-room-access', { requestingSocketId, roomId })
      setPendingAccessRequests((prev) => prev.filter((p) => p.socketId !== requestingSocketId))
    }
  }, [socket, roomId])

  const kickUser = useCallback((targetUserId: string) => {
    if (socket) {
      socket.emit('kick-user', { roomId, targetUserId })
      toast.success('Participante removido e bloqueado da sala.')
    }
  }, [socket, roomId])

  return {
    socket,
    isConnected,
    messages,
    viewers,
    currentVideoUrl,
    userRole,
    roomInfo,
    lastPlayerAction,
    selectedColor,
    roomFullError,
    pendingAccessRequests,
    accessApproved,
    accessRejectedReason,
    isBlocked,
    blockedReason,
    blockedHostUserId,
    changeChatColor,
    sendMessage,
    syncPlayerState,
    changeUserRole,
    requestRoomAccess,
    approveAccessRequest,
    rejectAccessRequest,
    reactToMessage,
    kickUser,
    currentUserId
  }
}
