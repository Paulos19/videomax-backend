'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  MessageSquare,
  ShieldAlert,
  LogOut,
  Users,
  Info,
  Play,
  Pause,
  FastForward,
  Film,
  Crown,
} from 'lucide-react'
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
import { Video, ChatMessage, PlayerStateData, ChatReplyInfo } from '@/types'
import { Viewer, PlayerActionNotice } from '@/lib/useSocket'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

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
  hostPlan?: 'FREE' | 'PRO' | 'MAXPRO' | string
  maxViewers?: number
  lastPlayerAction?: PlayerActionNotice | null
  selectedColor?: string
  onSelectColor?: (color: string) => void
  onSendMessage: (
    message: string,
    type?: 'text' | 'sticker',
    stickerUrl?: string,
    replyTo?: ChatReplyInfo | null
  ) => void
  onReactMessage?: (messageId: string, emoji: string) => void
  onSyncPlayerState?: (state: PlayerStateData) => void
  onRemotePlayerState?: PlayerStateData | null
  onRemotePlayerStateVersion?: number
  onRemotePlayerStateConsumed?: () => void
  onVideoChange?: (url: string) => void
  onChangeUserRole?: (targetUserId: string, newRole: 'host' | 'cohost' | 'viewer') => void
  onKickUser?: (targetUserId: string) => void
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
  hostPlan = 'FREE',
  maxViewers = 2,
  lastPlayerAction,
  selectedColor,
  onSelectColor,
  onSendMessage,
  onReactMessage,
  onSyncPlayerState,
  onRemotePlayerState,
  onRemotePlayerStateVersion,
  onRemotePlayerStateConsumed,
  onVideoChange,
  onChangeUserRole,
  onKickUser,
  onBack,
  onCanPlay,
  socket = null,
  senderName,
}: WatchRoomProps) {
  const [localVideoUrl, setLocalVideoUrl] = useState(socketVideoUrl || '')
  const [currentTitle, setCurrentTitle] = useState(propVideoTitle || 'Sessão de Vídeo')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showChat, setShowChat] = useState(true)
  const [showVideoSelector, setShowVideoSelector] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  const [activeMobileTab, setActiveMobileTab] = useState<'chat' | 'viewers' | 'info'>('chat')

  const videoPlayerRef = useRef<VideoPlayerHandle>(null)
  const isRemoteUpdateRef = useRef(false)
  const pendingRemotePlay = useRef<PlayerStateData | null>(null)

  const { data: session } = useSession()
  const currentUserPlan = (session?.user as any)?.plan || 'FREE'
  const isCurrentUserPro = currentUserPlan === 'MAXPRO' || currentUserPlan === 'PRO'

  const isHostPro = hostPlan === 'PRO' || hostPlan === 'MAXPRO'
  const hostUser = viewers.find((v) => v.role === 'host')
  const hostName = hostUser?.name || 'Host'
  const canControl = userRole === 'host' || userRole === 'cohost'

  const {
    localStream,
    remoteStream,
    isStreaming: isStreamingScreen,
    streamerId,
    streamerName: screenStreamerName,
    isLocalStreamer,
    startScreenShare,
    stopScreenShare,
  } = useWebRTC({
    socket: socket ?? null,
    roomId,
    currentUserId,
    viewers: viewers.map((v) => ({ id: v.id, name: v.name })),
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
        toast.error('Seu navegador não possui suporte para captura de tela.')
      } else {
        toast.error(res.message || 'Não foi possível iniciar a captura de tela.')
      }
    }
  }, [canControl, isStreamingScreen, isLocalStreamer, stopScreenShare, startScreenShare])

  // Update title if received from socket room-info
  useEffect(() => {
    if (propVideoTitle) {
      setCurrentTitle(propVideoTitle)
    }
  }, [propVideoTitle])

  // Sync video URL from socket
  useEffect(() => {
    if (socketVideoUrl !== undefined && socketVideoUrl !== null) {
      setLocalVideoUrl(socketVideoUrl)
    }
  }, [socketVideoUrl])

  // Periodic sync of player time and duration for HUD & VideoInfo
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoPlayerRef.current) {
        try {
          const cur = videoPlayerRef.current.getCurrentTime()
          const dur = videoPlayerRef.current.getDuration()
          if (typeof cur === 'number' && !isNaN(cur)) setCurrentTime(cur)
          if (typeof dur === 'number' && !isNaN(dur) && dur > 0) setDuration(dur)
        } catch {}
      }
    }, 500)
    return () => clearInterval(interval)
  }, [])

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
        videoPlayerRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {
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
  }, [onRemotePlayerState, onRemotePlayerStateVersion, onRemotePlayerStateConsumed, localVideoUrl])

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

  const handleVideoChange = useCallback(
    (url: string, title?: string) => {
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
          onSyncPlayerState?.({
            type: 'play',
            currentTime: 0,
            url,
            videoTitle: title || currentTitle,
          })
          setTimeout(() => {
            isRemoteUpdateRef.current = false
          }, 200)
        }
      }, 500)
    },
    [canControl, onVideoChange, onSyncPlayerState, currentTitle]
  )

  const handleUpdateTitle = useCallback(
    (newTitle: string) => {
      if (!canControl) {
        toast.error('Somente o Host ou Co-host pode alterar o título!')
        return
      }
      setCurrentTitle(newTitle)
      onSyncPlayerState?.({ type: 'change-video', url: localVideoUrl, videoTitle: newTitle })
      toast.success('Título atualizado para a sala!')
    },
    [canControl, localVideoUrl, onSyncPlayerState]
  )

  const handleSyncAll = useCallback(() => {
    if (!canControl) {
      toast.info('Seu player foi sincronizado com a sessão do Host!')
      return
    }
    const time = videoPlayerRef.current?.getCurrentTime() || 0
    onSyncPlayerState?.({ type: 'seek', currentTime: time, videoTitle: currentTitle })
    toast.success('Todos os espectadores foram sincronizados com seu tempo!')
  }, [canControl, currentTitle, onSyncPlayerState])

  const handlePlay = useCallback(() => {
    setIsPlaying(true)
    if (isRemoteUpdateRef.current) return
    if (!canControl) return
    onSyncPlayerState?.({
      type: 'play',
      currentTime: videoPlayerRef.current?.getCurrentTime(),
      videoTitle: currentTitle,
    })
  }, [canControl, onSyncPlayerState, currentTitle])

  const handlePause = useCallback(() => {
    setIsPlaying(false)
    if (isRemoteUpdateRef.current) return
    if (!canControl) return
    onSyncPlayerState?.({
      type: 'pause',
      currentTime: videoPlayerRef.current?.getCurrentTime(),
      videoTitle: currentTitle,
    })
  }, [canControl, onSyncPlayerState, currentTitle])

  const handleSeek = useCallback(
    (time: number) => {
      if (videoPlayerRef.current) {
        videoPlayerRef.current.seek(time)
      }
      if (isRemoteUpdateRef.current) return
      if (!canControl) return
      onSyncPlayerState?.({ type: 'seek', currentTime: time, videoTitle: currentTitle })
    },
    [canControl, onSyncPlayerState, currentTitle]
  )

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
    <div className="h-screen flex flex-col bg-[#050505] text-white overflow-y-auto lg:overflow-hidden relative font-sans">
      
      {/* Action Telemetry Toast (Floating) */}
      {!isStreamingScreen &&
        lastPlayerAction &&
        Date.now() - lastPlayerAction.serverTimestamp < 4000 && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-[#0A0A0F] border-2 border-[#FF5A00] text-white px-4 py-2 font-mono text-xs shadow-2xl flex items-center gap-2.5 animate-bounce">
            {lastPlayerAction.type === 'play' ? (
              <Play className="w-4 h-4 text-[#22C55E] fill-[#22C55E]" />
            ) : lastPlayerAction.type === 'pause' ? (
              <Pause className="w-4 h-4 text-[#FFE600] fill-[#FFE600]" />
            ) : (
              <FastForward className="w-4 h-4 text-[#00F0FF]" />
            )}
            <span className="uppercase font-bold">
              <strong className="text-[#FF5A00]">{lastPlayerAction.senderName}</strong>{' '}
              {lastPlayerAction.type === 'play'
                ? 'iniciou a reprodução'
                : lastPlayerAction.type === 'pause'
                ? 'pausou o vídeo'
                : 'avançou na linha do tempo'}
            </span>
          </div>
        )}

      {/* Room Header Bar */}
      <RoomHeader
        roomName={roomId}
        viewerCount={viewers.length}
        isConnected={isConnected}
        userRole={userRole}
        hostPlan={hostPlan}
        maxViewers={maxViewers}
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

      {/* Main Grid: Player Stage & Sidebar Chat */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 p-3 lg:p-4 gap-3 lg:gap-4 overflow-y-auto lg:overflow-hidden pb-12 lg:pb-4">
        
        {/* Left Column: Video Viewport, Control Bar, Viewers & VideoInfo */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-y-visible lg:overflow-y-auto pr-0 lg:pr-1 space-y-3">
          
          {/* 1. Video Player with 3D Standby Mode */}
          <VideoPlayer
            ref={videoPlayerRef}
            src={localVideoUrl}
            canControl={canControl}
            isHostPro={isHostPro}
            onPlay={handlePlay}
            onPause={handlePause}
            onSeek={handleSeek}
            onCanPlay={handleVideoReady}
            isStreamingScreen={isStreamingScreen}
            streamMedia={activeStreamMedia}
            streamerName={screenStreamerName || 'Host'}
            isLocalStreamer={isLocalStreamer}
            onStopStream={stopScreenShare}
            onSelectVideo={() => setShowVideoSelector(true)}
            onShareScreen={handleToggleScreenShare}
            onOpenLibrary={() => setShowVideoSelector(true)}
          />

          {/* 2. Player Controls Bar (Desktop only - Mobile uses native player gestures) */}
          <div className="hidden lg:block">
            <PlayerControlBar
              isPlaying={isPlaying}
              userRole={userRole}
              hostName={hostName}
              onTogglePlay={togglePlay}
              onSeekBack={() =>
                handleSeek(Math.max(0, (videoPlayerRef.current?.getCurrentTime() || 0) - 10))
              }
              onSeekForward={() =>
                handleSeek((videoPlayerRef.current?.getCurrentTime() || 0) + 10)
              }
              onNextVideo={() => setShowVideoSelector(true)}
              onSyncAll={handleSyncAll}
            />
          </div>

          {/* Mobile Tab Switcher (< lg breakpoint) */}
          <div className="flex lg:hidden items-center bg-[#08080C] border border-[#1F1F28] p-1 gap-1 font-mono">
            <button
              type="button"
              onClick={() => setActiveMobileTab('chat')}
              className={cn(
                'flex-1 py-2 px-3 text-[11px] font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer',
                activeMobileTab === 'chat'
                  ? 'bg-[#FF5A00] text-black shadow-md'
                  : 'text-[#888] hover:text-white hover:bg-[#111]'
              )}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>CHAT</span>
              {messages.length > 0 && (
                <span className="bg-black/30 text-black px-1.5 py-0.2 text-[9px]">
                  {messages.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveMobileTab('viewers')}
              className={cn(
                'flex-1 py-2 px-3 text-[11px] font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer',
                activeMobileTab === 'viewers'
                  ? 'bg-[#FF5A00] text-black shadow-md'
                  : 'text-[#888] hover:text-white hover:bg-[#111]'
              )}
            >
              <Users className="w-3.5 h-3.5" />
              <span>NÓS ({viewers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMobileTab('info')}
              className={cn(
                'flex-1 py-2 px-3 text-[11px] font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer',
                activeMobileTab === 'info'
                  ? 'bg-[#FF5A00] text-black shadow-md'
                  : 'text-[#888] hover:text-white hover:bg-[#111]'
              )}
            >
              <Info className="w-3.5 h-3.5" />
              <span>INFO</span>
            </button>
          </div>

          {/* Mobile Content View */}
          <div className="block lg:hidden">
            {activeMobileTab === 'chat' && (
              <div className="h-[460px] flex flex-col shrink-0 my-1">
                <ChatPanel
                  messages={messages}
                  currentUserId={currentUserId}
                  viewerCount={viewers.length}
                  viewers={viewers}
                  selectedColor={selectedColor}
                  isPro={isCurrentUserPro}
                  onSelectColor={onSelectColor}
                  onSend={onSendMessage}
                  onReact={onReactMessage}
                />
              </div>
            )}

            {activeMobileTab === 'viewers' && (
              <div className="space-y-3 my-1">
                <ViewersPanel
                  viewers={viewers}
                  currentUserRole={userRole}
                  isHostPro={isHostPro}
                  hostPlan={hostPlan}
                  onSyncAll={handleSyncAll}
                  onChangeUserRole={onChangeUserRole}
                  onKickUser={onKickUser}
                  onInvite={() => setShowShareModal(true)}
                />
                <InviteFriendsCard
                  roomId={roomId}
                  onOpenInviteModal={() => setShowShareModal(true)}
                />
              </div>
            )}

            {activeMobileTab === 'info' && (
              <div className="space-y-3 my-1">
                <VideoInfo
                  videoTitle={currentTitle}
                  currentTime={formatTime(currentTime)}
                  duration={formatTime(duration)}
                  queueCount={videos.length || 1}
                  canControl={canControl}
                  onUpdateTitle={handleUpdateTitle}
                  onToggleQueue={() => setShowVideoSelector(true)}
                />
              </div>
            )}
          </div>

          {/* Desktop Content Row (Viewers + Invite + Info) */}
          <div className="hidden lg:block space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <ViewersPanel
                  viewers={viewers}
                  currentUserRole={userRole}
                  isHostPro={isHostPro}
                  hostPlan={hostPlan}
                  onSyncAll={handleSyncAll}
                  onChangeUserRole={onChangeUserRole}
                  onKickUser={onKickUser}
                  onInvite={() => setShowShareModal(true)}
                />
              </div>
              <InviteFriendsCard
                roomId={roomId}
                onOpenInviteModal={() => setShowShareModal(true)}
              />
            </div>

            <VideoInfo
              videoTitle={currentTitle}
              currentTime={formatTime(currentTime)}
              duration={formatTime(duration)}
              queueCount={videos.length || 1}
              canControl={canControl}
              onUpdateTitle={handleUpdateTitle}
              onToggleQueue={() => setShowVideoSelector(true)}
            />
          </div>
        </div>

        {/* Right Column: Desktop Chat Panel */}
        {showChat && (
          <div className="hidden lg:flex w-80 xl:w-96 flex-col shrink-0 h-full">
            <ChatPanel
              messages={messages}
              currentUserId={currentUserId}
              viewerCount={viewers.length}
              viewers={viewers}
              selectedColor={selectedColor}
              isPro={isCurrentUserPro}
              onSelectColor={onSelectColor}
              onSend={onSendMessage}
              onReact={onReactMessage}
              onClose={() => setShowChat(false)}
            />
          </div>
        )}
      </div>

      {/* Video Selector Modal */}
      {showVideoSelector && (
        <VideoSelectorModal
          videos={videos}
          currentVideoUrl={localVideoUrl}
          onSelectVideo={(video) => {
            handleVideoChange(video.url, video.title)
            setShowVideoSelector(false)
          }}
          onClose={() => setShowVideoSelector(false)}
        />
      )}

      {/* Share / Invite Friends Modal */}
      {showShareModal && (
        <InviteFriendsModal
          roomId={roomId}
          viewerCount={viewers.length}
          viewers={viewers}
          socket={socket ?? null}
          senderName={senderName || 'Host'}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  )
}
