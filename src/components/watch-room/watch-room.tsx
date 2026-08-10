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
  onCanPlay?: () => void
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
  onBack,
  onCanPlay
}: WatchRoomProps) {
  const [localVideoUrl, setLocalVideoUrl] = useState(DEFAULT_VIDEO)
  const [showChat, setShowChat] = useState(true)
  const [showVideoSelector, setShowVideoSelector] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  const videoPlayerRef = useRef<VideoPlayerHandle>(null)
  const isRemoteUpdateRef = useRef(false)
  const pendingRemotePlay = useRef<PlayerStateData | null>(null)

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
        videoPlayerRef.current.play().catch(() => {
          // Video not ready yet — queue for when it loads
          pendingRemotePlay.current = { ...onRemotePlayerState }
        })
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

  // When video is ready to play, execute any pending remote play/pause/seek
  const handleVideoReady = useCallback(() => {
    onCanPlay?.()
    if (pendingRemotePlay.current && videoPlayerRef.current) {
      const state = pendingRemotePlay.current
      pendingRemotePlay.current = null
      isRemoteUpdateRef.current = true

      if (state.currentTime !== undefined) {
        videoPlayerRef.current.seek(state.currentTime)
      }
      if (state.type === 'play') {
        videoPlayerRef.current.play()
      } else if (state.type === 'pause') {
        videoPlayerRef.current.pause()
      }

      setTimeout(() => {
        isRemoteUpdateRef.current = false
        onRemotePlayerStateConsumed?.()
      }, 100)
    }
  }, [onCanPlay, onRemotePlayerStateConsumed])

  const handleVideoChange = useCallback((url: string) => {
    setLocalVideoUrl(url)
    onVideoChange?.(url)
    // After changing video, wait for it to load then play and sync to remote users
    pendingRemotePlay.current = null
    setTimeout(() => {
      if (videoPlayerRef.current) {
        isRemoteUpdateRef.current = true
        videoPlayerRef.current.play()
        onSyncPlayerState?.({ type: 'play', currentTime: 0 })
        setTimeout(() => {
          isRemoteUpdateRef.current = false
        }, 200)
      }
    }, 500)
  }, [onVideoChange, onSyncPlayerState])

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
        showChat={showChat}
        onBack={onBack}
        onChangeVideo={() => setShowVideoSelector(true)}
        onShare={() => setShowShareModal(true)}
        onToggleChat={() => setShowChat(!showChat)}
        onMore={() => {/* More options menu */}}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 p-3 lg:p-4 gap-3 lg:gap-4 overflow-hidden">
        {/* Left: Video + Viewers */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto lg:overflow-visible">
          {/* Video Player */}
          <VideoPlayer
            ref={videoPlayerRef}
            src={localVideoUrl}
            onPlay={handlePlay}
            onPause={handlePause}
            onSeek={handleSeek}
            onCanPlay={handleVideoReady}
          />

          {/* Viewers Panel */}
          <ViewersPanel
            viewers={viewers}
            onInvite={() => setShowShareModal(true)}
          />
        </div>

        {/* Right: Chat */}
        {showChat && (
          <div className="flex flex-col min-h-0 h-[50vh] lg:h-full lg:w-80 xl:w-96 shrink-0">
            <ChatPanel
              messages={messages}
              currentUserId={currentUserId}
              viewerCount={viewers.length}
              viewers={viewers}
              onSend={onSendMessage}
              onClose={() => setShowChat(false)}
            />
          </div>
        )}
      </div>

      {/* Floating reopen chat button (visible on all screens when chat is closed) */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 px-4 py-3 bg-room-accent hover:bg-room-accent/90 text-white rounded-full flex items-center gap-2 shadow-xl shadow-room-accent/30 hover:scale-105 active:scale-95 transition-all z-50"
          aria-label="Abrir chat ao vivo"
          title="Abrir chat ao vivo"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs font-semibold tracking-wide">Abrir Chat</span>
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
