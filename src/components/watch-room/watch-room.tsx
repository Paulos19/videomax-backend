'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { MessageCircle, ShieldAlert, LogOut } from 'lucide-react'
import { Socket } from 'socket.io-client'
import { RoomHeader } from './room-header'
import { VideoPlayer, VideoPlayerHandle } from './video-player'
import { PlayerControlBar } from './player-control-bar'
import { ViewersPanel } from './viewers-panel'
import { InviteFriendsCard } from './invite-friends-card'
import { VideoInfo } from './video-info'
import { ChatPanel } from './chat-panel'
import { VideoSelectorModal } from './video-selector-modal'
import { InviteFriendsModal } from './invite-friends-modal'
import { useWebRTC } from '@/lib/useWebRTC'
import { Video, ChatMessage, PlayerStateData } from '@/types'
import { Viewer } from '@/lib/useSocket'
import { PlayerActionNotice } from '@/lib/useSocket'
import { Play, Pause, FastForward, Film } from 'lucide-react'

import { toast } from 'sonner'

const DEFAULT_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

interface WatchRoomProps {
  roomId: string
  videos: Video[]
  messages: ChatMessage[]
  viewers: Viewer[]
  currentUserId: string | null
  isConnected: boolean
  currentVideoUrl: string | null
  videoTitle?: string
  userRole?: 'host' | 'cohost' | 'viewer'
  lastPlayerAction?: PlayerActionNotice | null
  selectedColor?: string
  onSelectColor?: (color: string) => void
  onSendMessage: (message: string) => void
  onSyncPlayerState?: (state: PlayerStateData) => void
  onRemotePlayerState?: PlayerStateData | null
  onRemotePlayerStateVersion?: number
  onRemotePlayerStateConsumed?: () => void
  onVideoChange?: (url: string) => void
  onChangeUserRole?: (targetUserId: string, newRole: 'host' | 'cohost' | 'viewer') => void
  onBack?: () => void
  onCanPlay?: () => void
  socket?: Socket | null
  senderName?: string
}

export function WatchRoom({
  roomId,
  videos,
  messages,
  viewers,
  currentUserId,
  isConnected,
  currentVideoUrl: socketVideoUrl,
  videoTitle: propVideoTitle,
  userRole = 'viewer',
  lastPlayerAction,
  selectedColor,
  onSelectColor,
  onSendMessage,
  onSyncPlayerState,
  onRemotePlayerState,
  onRemotePlayerStateVersion,
  onRemotePlayerStateConsumed,
  onVideoChange,
  onChangeUserRole,
  onBack,
  onCanPlay,
  socket,
  senderName
}: WatchRoomProps) {
  const [localVideoUrl, setLocalVideoUrl] = useState(socketVideoUrl || DEFAULT_VIDEO)
  const [currentTitle, setCurrentTitle] = useState(propVideoTitle || 'Sessão de Vídeo')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showChat, setShowChat] = useState(true)
  const [showVideoSelector, setShowVideoSelector] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  const videoPlayerRef = useRef<VideoPlayerHandle>(null)
  const isRemoteUpdateRef = useRef(false)
  const pendingRemotePlay = useRef<PlayerStateData | null>(null)

  const hostUser = viewers.find(v => v.role === 'host')
  const hostName = hostUser?.name || 'Henrique'
  const canControl = userRole === 'host' || userRole === 'cohost'

  const {
    localStream,
    remoteStream,
    isStreaming: isStreamingScreen,
    streamerId,
    streamerName: screenStreamerName,
    isLocalStreamer,
    startScreenShare,
    stopScreenShare
  } = useWebRTC({
    socket: socket ?? null,
    roomId,
    currentUserId,
    viewers: viewers.map(v => ({ id: v.id, name: v.name }))
  })

  const activeStreamMedia = isLocalStreamer ? localStream : remoteStream

  const handleToggleScreenShare = useCallback(async () => {
    if (!canControl) {
      toast.error('Somente o Host ou Co-host pode compartilhar a tela!')
      return
    }
    if (isStreamingScreen) {
      if (isLocalStreamer) {
        stopScreenShare()
        toast.info('Transmissão de tela encerrada.')
      } else {
        toast.error('Já existe outra pessoa transmitindo a tela no momento.')
      }
    } else {
      const res = await startScreenShare()
      if (res.success) {
        toast.success('Compartilhamento de tela ativo ao vivo!')
      } else if (res.reason === 'cancelled') {
        toast.info('Seleção de tela cancelada.')
      } else if (res.reason === 'not_supported') {
        toast.error('Seu navegador não possui suporte para compartilhamento de tela.')
      } else {
        toast.error(res.message || 'Não foi possível iniciar a captura da tela.')
      }
    }
  }, [canControl, isStreamingScreen, isLocalStreamer, stopScreenShare, startScreenShare])

  // Update title if received from socket room-info
  useEffect(() => {
    if (propVideoTitle) {
      setCurrentTitle(propVideoTitle)
    }
  }, [propVideoTitle])

  // Update duration/time periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoPlayerRef.current) {
        setCurrentTime(videoPlayerRef.current.getCurrentTime() || 0)
        setDuration(videoPlayerRef.current.getDuration() || 0)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [])

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

    if (onRemotePlayerState.url && onRemotePlayerState.url !== localVideoUrl) {
      setLocalVideoUrl(onRemotePlayerState.url)
    }

    if (onRemotePlayerState.videoTitle) {
      setCurrentTitle(onRemotePlayerState.videoTitle)
    }

    switch (onRemotePlayerState.type) {
      case 'play':
        if (onRemotePlayerState.currentTime !== undefined) {
          videoPlayerRef.current.seek(onRemotePlayerState.currentTime)
        }
        videoPlayerRef.current.play().then(() => setIsPlaying(true)).catch(() => {
          pendingRemotePlay.current = { ...onRemotePlayerState }
        })
        break
      case 'pause':
        if (onRemotePlayerState.currentTime !== undefined) {
          videoPlayerRef.current.seek(onRemotePlayerState.currentTime)
        }
        videoPlayerRef.current.pause()
        setIsPlaying(false)
        break
      case 'seek':
        if (onRemotePlayerState.currentTime !== undefined) {
          videoPlayerRef.current.seek(onRemotePlayerState.currentTime)
        }
        break
    }

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
        setIsPlaying(true)
      } else if (state.type === 'pause') {
        videoPlayerRef.current.pause()
        setIsPlaying(false)
      }

      setTimeout(() => {
        isRemoteUpdateRef.current = false
        onRemotePlayerStateConsumed?.()
      }, 100)
    }
  }, [onCanPlay, onRemotePlayerStateConsumed])

  const handleVideoChange = useCallback((url: string, title?: string) => {
    if (!canControl) {
      toast.error('Somente o Host ou Co-host pode alterar o vídeo!')
      return
    }
    setLocalVideoUrl(url)
    if (title) setCurrentTitle(title)
    onVideoChange?.(url)
    pendingRemotePlay.current = null
    setTimeout(() => {
      if (videoPlayerRef.current) {
        isRemoteUpdateRef.current = true
        videoPlayerRef.current.play()
        setIsPlaying(true)
        onSyncPlayerState?.({ type: 'play', currentTime: 0, url, videoTitle: title || currentTitle })
        setTimeout(() => {
          isRemoteUpdateRef.current = false
        }, 200)
      }
    }, 500)
  }, [canControl, onVideoChange, onSyncPlayerState, currentTitle])

  const handleUpdateTitle = useCallback((newTitle: string) => {
    if (!canControl) {
      toast.error('Somente o Host ou Co-host pode alterar o título!')
      return
    }
    setCurrentTitle(newTitle)
    onSyncPlayerState?.({ type: 'change-video', url: localVideoUrl, videoTitle: newTitle })
    toast.success('Título atualizado ao vivo para todos!')
  }, [canControl, localVideoUrl, onSyncPlayerState])

  const handleSyncAll = useCallback(() => {
    if (!canControl) {
      toast.info('Seu player foi sincronizado com a sessão do Host!')
      return
    }
    const time = videoPlayerRef.current?.getCurrentTime() || 0
    onSyncPlayerState?.({ type: 'seek', currentTime: time, videoTitle: currentTitle })
    toast.success('Todos os espectadores foram sincronizados com seu tempo atual!')
  }, [canControl, currentTitle, onSyncPlayerState])

  // Local user play/pause/seek → sync to other users if Host/Co-host
  const handlePlay = useCallback(() => {
    setIsPlaying(true)
    if (isRemoteUpdateRef.current) return
    if (!canControl) {
      toast.error('Apenas o Host ou Co-host pode alterar a reprodução.')
      return
    }
    onSyncPlayerState?.({ type: 'play', currentTime: videoPlayerRef.current?.getCurrentTime(), videoTitle: currentTitle })
  }, [canControl, onSyncPlayerState, currentTitle])

  const handlePause = useCallback(() => {
    setIsPlaying(false)
    if (isRemoteUpdateRef.current) return
    if (!canControl) {
      toast.error('Apenas o Host ou Co-host pode alterar a reprodução.')
      return
    }
    onSyncPlayerState?.({ type: 'pause', currentTime: videoPlayerRef.current?.getCurrentTime(), videoTitle: currentTitle })
  }, [canControl, onSyncPlayerState, currentTitle])

  const handleSeek = useCallback((time: number) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.seek(time)
    }
    if (isRemoteUpdateRef.current) return
    if (!canControl) {
      toast.error('Apenas o Host ou Co-host pode alterar o tempo do vídeo.')
      return
    }
    onSyncPlayerState?.({ type: 'seek', currentTime: time, videoTitle: currentTitle })
  }, [canControl, onSyncPlayerState, currentTitle])

  const togglePlay = useCallback(() => {
    if (!canControl) {
      toast.error('Apenas o Host ou Co-host pode controlar a reprodução.')
      return
    }
    if (isPlaying) {
      videoPlayerRef.current?.pause()
      handlePause()
    } else {
      videoPlayerRef.current?.play()
      handlePlay()
    }
  }, [canControl, isPlaying, handlePause, handlePlay])

  return (
    <div className="h-screen flex flex-col bg-[#050505] text-[#F5F5F5] overflow-y-auto lg:overflow-hidden relative font-sans">
      {/* Action Toast Overlay (Floating) */}
      {lastPlayerAction && (Date.now() - lastPlayerAction.serverTimestamp < 4000) && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-black/90 backdrop-blur-md border border-[#FF5A00]/40 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2.5 animate-bounce">
          {lastPlayerAction.type === 'play' ? (
            <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
          ) : lastPlayerAction.type === 'pause' ? (
            <Pause className="w-4 h-4 text-amber-400 fill-amber-400" />
          ) : lastPlayerAction.type === 'seek' ? (
            <FastForward className="w-4 h-4 text-sky-400" />
          ) : (
            <Film className="w-4 h-4 text-purple-400" />
          )}
          <span className="text-xs font-semibold">
            <strong className="text-[#FF5A00]">{lastPlayerAction.senderName}</strong>{' '}
            {lastPlayerAction.type === 'play'
              ? 'iniciou o vídeo'
              : lastPlayerAction.type === 'pause'
              ? 'pausou o vídeo'
              : lastPlayerAction.type === 'seek'
              ? 'avançou na linha do tempo'
              : 'alterou o vídeo'}
          </span>
        </div>
      )}

      {/* 64px Header */}
      <RoomHeader
        roomName={roomId}
        viewerCount={viewers.length}
        isConnected={isConnected}
        userRole={userRole}
        showChat={showChat}
        hostName={hostName}
        isStreamingScreen={isStreamingScreen}
        isLocalStreamer={isLocalStreamer}
        onBack={onBack}
        onChangeVideo={() => setShowVideoSelector(true)}
        onToggleScreenShare={handleToggleScreenShare}
        onShare={() => setShowShareModal(true)}
        onToggleChat={() => setShowChat(!showChat)}
        onMore={() => setShowShareModal(true)}
      />

      {/* Main Content Grid */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 p-3 lg:p-4 gap-3 lg:gap-4 overflow-y-auto lg:overflow-hidden pb-16 lg:pb-4">
        {/* Left Column: Video, Control Bar, Viewers & Invite, VideoInfo */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-y-visible lg:overflow-y-auto scrollbar-thin pr-0 lg:pr-1 space-y-3">
          {/* 1. Video Player */}
          <VideoPlayer
            ref={videoPlayerRef}
            src={localVideoUrl}
            canControl={canControl}
            onPlay={handlePlay}
            onPause={handlePause}
            onSeek={handleSeek}
            onCanPlay={handleVideoReady}
            isStreamingScreen={isStreamingScreen}
            streamMedia={activeStreamMedia}
            streamerName={screenStreamerName || 'Host'}
            isLocalStreamer={isLocalStreamer}
            onStopStream={stopScreenShare}
          />

          {/* 2. Player Controls Bar */}
          <PlayerControlBar
            isPlaying={isPlaying}
            userRole={userRole}
            hostName={hostName}
            onTogglePlay={togglePlay}
            onSeekBack={() => handleSeek(Math.max(0, (videoPlayerRef.current?.getCurrentTime() || 0) - 10))}
            onSeekForward={() => handleSeek((videoPlayerRef.current?.getCurrentTime() || 0) + 10)}
            onNextVideo={() => setShowVideoSelector(true)}
            onSyncAll={handleSyncAll}
          />

          {/* 3. Viewers Panel & Invite Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <ViewersPanel
                viewers={viewers}
                currentUserRole={userRole}
                onChangeUserRole={onChangeUserRole}
                onInvite={() => setShowShareModal(true)}
              />
            </div>
            <InviteFriendsCard
              roomId={roomId}
              onOpenInviteModal={() => setShowShareModal(true)}
            />
          </div>

          {/* 4. Video Information */}
          <VideoInfo
            videoTitle={currentTitle}
            currentTime={formatTime(currentTime)}
            duration={formatTime(duration)}
            queueCount={videos.length || 1}
            canControl={canControl}
            onUpdateTitle={handleUpdateTitle}
            onToggleQueue={() => setShowVideoSelector(true)}
          />

          {/* 5. Live Chat Panel (Mobile Inline Block - renders inline under VideoInfo on mobile) */}
          {showChat && (
            <div className="block lg:hidden h-[420px] shrink-0 my-3">
              <ChatPanel
                messages={messages}
                currentUserId={currentUserId}
                viewerCount={viewers.length}
                viewers={viewers}
                selectedColor={selectedColor}
                onSelectColor={onSelectColor}
                onSend={onSendMessage}
                onClose={() => setShowChat(false)}
              />
            </div>
          )}

          {/* 6. Footer Actions */}
          <div className="flex items-center justify-between pt-4 pb-6 border-t border-[#242424]">
            <button className="text-xs text-[#8A8A8A] hover:text-[#F5F5F5] flex items-center gap-1.5 font-semibold transition-colors">
              <ShieldAlert className="w-4 h-4 text-[#8A8A8A]" />
              Regras da sala
            </button>
            <button
              onClick={onBack}
              className="text-xs text-[#EF2020] hover:underline flex items-center gap-1.5 font-bold transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sair da sala
            </button>
          </div>
        </div>

        {/* Right Column: Live Chat Panel (Desktop 2-Column Sidebar) */}
        {showChat && (
          <div className="hidden lg:flex flex-col min-h-0 h-full lg:w-[380px] xl:w-[420px] shrink-0">
            <ChatPanel
              messages={messages}
              currentUserId={currentUserId}
              viewerCount={viewers.length}
              viewers={viewers}
              selectedColor={selectedColor}
              onSelectColor={onSelectColor}
              onSend={onSendMessage}
              onClose={() => setShowChat(false)}
            />
          </div>
        )}
      </div>

      {/* Floating reopen chat button when chat is closed */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 px-4 py-3 brand-gradient text-white rounded-full flex items-center gap-2 shadow-2xl brand-glow-strong hover:scale-105 active:scale-95 transition-all z-50 font-bold text-xs"
          aria-label="Abrir chat ao vivo"
          title="Abrir chat ao vivo"
        >
          <MessageCircle className="w-4 h-4 fill-white" />
          <span>Abrir Chat ({viewers.length})</span>
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
        <InviteFriendsModal
          roomId={roomId}
          viewerCount={viewers.length}
          viewers={viewers}
          socket={socket ?? null}
          senderName={senderName || 'Um amigo'}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  )
}
