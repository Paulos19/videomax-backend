'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useSocket } from '@/lib/useSocket'
import { WatchRoom } from '@/components/watch-room/watch-room'
import { Video, PlayerStateData } from '@/types'

export default function RoomPage() {
  const params = useParams()
  const roomId = params.id as string
  const router = useRouter()
  const { data: session, status } = useSession()

  const [videos, setVideos] = useState<Video[]>([])
  const [remotePlayerEvent, setRemotePlayerEvent] = useState<{ data: PlayerStateData; version: number } | null>(null)
  const remoteStateVersion = useRef(0)

  const {
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
    currentUserId,
    selectedColor,
    changeChatColor
  } = useSocket(roomId)

  // Listen for remote player-state-change events from socket
  useEffect(() => {
    if (!socket) return

    const handlePlayerState = (data: PlayerStateData) => {
      // Ignore change-video events (handled by useSocket → currentVideoUrl)
      if (data.type === 'change-video') return

      remoteStateVersion.current++
      setRemotePlayerEvent({ data, version: remoteStateVersion.current })
    }

    socket.on('player-state-change', handlePlayerState)
    return () => {
      socket.off('player-state-change', handlePlayerState)
    }
  }, [socket])

  // Fetch videos from backend
  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch('/api/mobile/videos')
        if (res.ok) {
          const data = await res.json()
          if (data?.videos) {
            setVideos(data.videos)
          }
        }
      } catch {
        // Videos fetch failed
      }
    }
    fetchVideos()
  }, [])

  // Handle video changes (sync via socket)
  const handleVideoChange = useCallback((url: string) => {
    syncPlayerState({ type: 'change-video', url })
  }, [syncPlayerState])

  // Called by WatchRoom after consuming a remote player state
  const handleRemotePlayerStateConsumed = useCallback(() => {
    setRemotePlayerEvent(null)
  }, [])

  // Loading state
  if (status === 'loading') {
    return (
      <div className="h-screen bg-room-bg flex items-center justify-center">
        <div className="text-room-text-secondary">Carregando...</div>
      </div>
    )
  }

  // Not authenticated
  if (!session) {
    router.push('/login')
    return null
  }

  return (
    <WatchRoom
      roomId={roomId}
      videos={videos}
      messages={messages}
      viewers={viewers}
      currentUserId={currentUserId}
      isConnected={isConnected}
      currentVideoUrl={currentVideoUrl}
      videoTitle={roomInfo?.videoTitle}
      userRole={userRole}
      hostPlan={roomInfo?.hostPlan}
      maxViewers={roomInfo?.maxViewers}
      lastPlayerAction={lastPlayerAction}
      selectedColor={selectedColor}
      onSelectColor={changeChatColor}
      onSendMessage={sendMessage}
      onSyncPlayerState={syncPlayerState}
      onRemotePlayerState={remotePlayerEvent?.data ?? null}
      onRemotePlayerStateVersion={remotePlayerEvent?.version}
      onRemotePlayerStateConsumed={handleRemotePlayerStateConsumed}
      onVideoChange={handleVideoChange}
      onChangeUserRole={changeUserRole}
      onBack={() => router.push('/')}
      socket={socket}
      senderName={session?.user?.name || session?.user?.email || 'Um amigo'}
    />
  )
}
