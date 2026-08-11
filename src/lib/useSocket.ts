'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import io, { Socket } from 'socket.io-client'
import { ChatMessage, PlayerStateData } from '@/types'

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

export interface RoomInfo {
  roomId: string
  hostUserId: string
  coHostIds: string[]
  videoTitle?: string
  videoUrl?: string
}

export interface PlayerActionNotice {
  senderId: string
  senderName: string
  type: string
  videoTitle?: string
  currentTime?: number
  serverTimestamp: number
}

let systemMessageCounter = 0

export function useSocket(roomId: string) {
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
  const userProfileRef = useRef<SocketUserProfile>({ chatColor: '#4f46e5', image: '' })
  const seenMessageIds = useRef(new Set<string>())
  const viewersRef = useRef<Viewer[]>([])

  useEffect(() => {
    if (!session?.user) return

    let newSocket: Socket
    let cancelled = false

    const initSocket = async () => {
      const user = session.user!
      const userId = (user as Record<string, unknown>).id as string
      const userName = user.name || 'Usuário'
      const userImage = (user as Record<string, unknown>).image as string || ''

      if (!userId) return

      let profileData: SocketUserProfile = { chatColor: '#4f46e5', image: userImage }

      try {
        const res = await fetch('/api/mobile/profile')
        if (res.ok) {
          const data = await res.json()
          if (data?.user) {
            profileData.chatColor = data.user.chatColor || '#4f46e5'
            profileData.image = data.user.image || userImage
            userProfileRef.current = profileData
          }
        }
      } catch {
        // Profile fetch failed, use defaults
      }

      if (cancelled) return

      // Fetch JWT token for WebSocket authentication
      let wsToken: string | null = null
      try {
        const tokenRes = await fetch('/api/auth/token')
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json()
          wsToken = tokenData.token
        }
      } catch {
        // Token fetch failed — connect without auth (server will warn)
      }

      if (cancelled) return

      // Connect with JWT token for server-side verification
      newSocket = io(SOCKET_SERVER_URL, {
        auth: wsToken ? { token: wsToken } : undefined,
        transports: ['websocket', 'polling'],
      })

      newSocket.on('connect', () => {
        if (cancelled) return
        console.log('[WebSocket] Conectado com sucesso!')
        setIsConnected(true)
        setCurrentUserId(userId)

        // Add current user to viewers
        const currentUser: Viewer = {
          id: userId,
          name: userName,
          image: userProfileRef.current.image,
          isCurrentUser: true,
          role: 'viewer'
        }
        viewersRef.current = [currentUser]
        setViewers([currentUser])

        newSocket.emit('join-room', { roomId, userId, userName, userImage: userProfileRef.current.image || '' })
        newSocket.emit('join-user-room', { userId })
      })

      newSocket.on('connect_error', (err) => {
        if (cancelled) return
        console.error('[WebSocket] Erro de conexão:', err.message)
        setIsConnected(false)
      })

      newSocket.on('error', (err) => {
        if (cancelled) return
        console.error('[WebSocket] Erro retornado pelo servidor:', err)
      })

      newSocket.on('disconnect', (reason) => {
        if (cancelled) return
        console.warn('[WebSocket] Desconectado:', reason)
        setIsConnected(false)
      })

      newSocket.on('room-info', (info: RoomInfo) => {
        if (cancelled) return
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

      newSocket.on('receive-message', (data: ChatMessage) => {
        if (cancelled) return
        if (seenMessageIds.current.has(data.id)) return
        seenMessageIds.current.add(data.id)
        // Add timestamp if not present
        const msgWithTime = {
          ...data,
          timestamp: data.timestamp || new Date().toISOString()
        }
        setMessages((prev) => [...prev, msgWithTime])
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
      newSocket.on('player-state-change', (data: PlayerStateData & { senderName?: string; videoTitle?: string }) => {
        if (cancelled) return
        if (data.url) {
          setCurrentVideoUrl(data.url)
        }

        if (data.senderName) {
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

  const sendMessage = useCallback((messageText: string) => {
    if (socket && messageText.trim() !== '') {
      const payload = {
        text: messageText,
        color: userProfileRef.current.chatColor,
        image: userProfileRef.current.image
      }
      socket.emit('send-message', { message: JSON.stringify(payload) })
    }
  }, [socket])

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

  return {
    socket,
    isConnected,
    messages,
    viewers,
    currentVideoUrl,
    userRole,
    roomInfo,
    lastPlayerAction,
    sendMessage,
    syncPlayerState,
    changeUserRole,
    currentUserId
  }
}
