'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { MessageCircle } from 'lucide-react'
import { RoomHeader } from './room-header'
import { VideoPlayer, VideoPlayerHandle } from './video-player'
import { ViewersPanel } from './viewers-panel'
import { ChatPanel } from './chat-panel'
import { VideoSelectorModal } from './video-selector-modal'
import { ShareModal } from './share-modal'
import { Video, ChatMessage, PlayerStateData } from '@/types'
import { Viewer } from '@/lib/useSocket'
import { cn } from '@/lib/utils'

const DEFAULT_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

interface WatchRoomProps {
  roomId: string
  videos: Video[]
  messages: ChatMessage[]
  viewers: Viewer[]
  currentUserId: string | null
  isConnected: boolean
  currentVideoUrl: string | null
  onSendMessage: (message: string) => void
  onSyncPlayerState?: (state: PlayerStateData) => void
  onRemotePlayerState?: PlayerStateData | null
  onRemotePlayerStateVersion?: number
  onRemotePlayerStateConsumed?: () => void
  onVideoChange?: (url: string) => void
  onBack?: () => void
}

export function WatchRoom({
  roomId,
  videos,
  messages,
  viewers,
  currentUserId,
  isConnected,
  currentVideoUrl: socketVideoUrl,
  onSendMessage,
  onSyncPlayerState,
  onRemotePlayerState,
  onRemotePlayerStateVersion,
  onRemotePlayerStateConsumed,
  onVideoChange,
  onBack
}: WatchRoomProps) {
  const [localVideoUrl, setLocalVideoUrl] = useState(DEFAULT_VIDEO)
  const [showChat, setShowChat] = useState(true)
  const [showVideoSelector, setShowVideoSelector] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  const videoPlayerRef = useRef<VideoPlayerHandle>(null)
  const isRemoteUpdateRef = useRef(false)

  // Sync video URL from socket
  useEffect(() => {
    if (socketVideoUrl) {
      setLocalVideoUrl(socketVideoUrl)
    }
  }, [socketVideoUrl])

  // Handle remote player state changes (play/pause/seek from other users)
  useEffect(() => {
    if (!onRemotePlayerState || !videoPlayerRef.current) return

    isRemoteUpdateRef.current = true

    switch (onRemotePlayerState.type) {
      case 'play':
        if (onRemotePlayerState.currentTime !== undefined) {
          videoPlayerRef.current.seek(onRemotePlayerState.currentTime)
        }
        videoPlayerRef.current.play()
        break
      case 'pause':
        if (onRemotePlayerState.currentTime !== undefined) {
          videoPlayerRef.current.seek(onRemotePlayerState.currentTime)
        }
        videoPlayerRef.current.pause()
        break
      case 'seek':
        if (onRemotePlayerState.currentTime !== undefined) {
          videoPlayerRef.current.seek(onRemotePlayerState.currentTime)
        }
        break
    }

    // Reset remote flag after a short delay (allows the video events to fire)
    const timeout = setTimeout(() => {
      isRemoteUpdateRef.current = false
      onRemotePlayerStateConsumed?.()
    }, 100)

    return () => clearTimeout(timeout)
  }, [onRemotePlayerState, onRemotePlayerStateVersion, onRemotePlayerStateConsumed])

  const handleVideoChange = useCallback((url: string) => {
    setLocalVideoUrl(url)
    onVideoChange?.(url)
  }, [onVideoChange])

  // Local user play/pause/seek → sync to other users
  const handlePlay = useCallback(() => {
    if (isRemoteUpdateRef.current) return
    onSyncPlayerState?.({ type: 'play', currentTime: videoPlayerRef.current?.getCurrentTime() })
  }, [onSyncPlayerState])

  const handlePause = useCallback(() => {
    if (isRemoteUpdateRef.current) return
    onSyncPlayerState?.({ type: 'pause', currentTime: videoPlayerRef.current?.getCurrentTime() })
  }, [onSyncPlayerState])

  const handleSeek = useCallback((time: number) => {
    if (isRemoteUpdateRef.current) return
    onSyncPlayerState?.({ type: 'seek', currentTime: time })
  }, [onSyncPlayerState])

  return (
    <div className="h-screen flex flex-col bg-room-bg overflow-hidden">
      {/* Header */}
      <RoomHeader
        roomName={roomId}
        viewerCount={viewers.length}
        isConnected={isConnected}
        onBack={onBack}
        onChangeVideo={() => setShowVideoSelector(true)}
        onShare={() => setShowShareModal(true)}
        onMore={() => {/* More options menu */}}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 p-3 lg:p-4 gap-3 lg:gap-4">
        {/* Left: Video + Viewers */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Video Player */}
          <VideoPlayer
            ref={videoPlayerRef}
            src={localVideoUrl}
            onPlay={handlePlay}
            onPause={handlePause}
            onSeek={handleSeek}
          />

          {/* Viewers Panel */}
          <ViewersPanel
            viewers={viewers}
            onInvite={() => setShowShareModal(true)}
          />
        </div>

        {/* Right: Chat */}
        <div className={cn(
          "flex flex-col min-h-0",
          showChat ? "h-[50vh] lg:h-full" : "h-0 lg:h-0"
        )}>
          <ChatPanel
            messages={messages}
            currentUserId={currentUserId}
            viewerCount={viewers.length}
            viewers={viewers}
            onSend={onSendMessage}
            onClose={() => setShowChat(false)}
          />
        </div>
      </div>

      {/* Mobile chat toggle */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="lg:hidden fixed bottom-4 right-4 w-14 h-14 bg-room-accent rounded-full flex items-center justify-center shadow-lg shadow-room-accent/30 hover:scale-105 active:scale-95 transition-transform z-50"
          aria-label="Abrir chat"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Modals */}
      {showVideoSelector && (
        <VideoSelectorModal
          videos={videos}
          currentUrl={localVideoUrl}
          onSelect={handleVideoChange}
          onClose={() => setShowVideoSelector(false)}
        />
      )}

      {showShareModal && (
        <ShareModal
          roomId={roomId}
          viewerCount={viewers.length}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  )
}
