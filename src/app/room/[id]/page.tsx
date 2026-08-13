'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useSocket } from '@/lib/useSocket'
import { WatchRoom } from '@/components/watch-room/watch-room'
import { Video, PlayerStateData } from '@/types'
import { ShieldAlert, Clock, UserCheck, UserX, ArrowLeft, Crown, Loader2, Sparkles } from 'lucide-react'

export default function RoomPage() {
  const params = useParams()
  const roomId = params.id as string
  const router = useRouter()
  const { data: session, status } = useSession()

  const [videos, setVideos] = useState<Video[]>([])
  const [remotePlayerEvent, setRemotePlayerEvent] = useState<{ data: PlayerStateData; version: number } | null>(null)
  const remoteStateVersion = useRef(0)

  // Room access state
  const [accessChecked, setAccessChecked] = useState(false)
  const [accessGranted, setAccessGranted] = useState(false)
  const [requestSent, setRequestSent] = useState(false)

  const {
    socket,
    isConnected,
    messages,
    viewers,
    currentVideoUrl,
    userRole,
    roomInfo,
    lastPlayerAction,
    roomFullError,
    pendingAccessRequests,
    accessApproved,
    accessRejectedReason,
    sendMessage,
    syncPlayerState,
    changeUserRole,
    requestRoomAccess,
    approveAccessRequest,
    rejectAccessRequest,
    currentUserId,
    selectedColor,
    changeChatColor
  } = useSocket(roomId)

  // 1. Check friendship access with backend once roomInfo.hostUserId is known
  useEffect(() => {
    if (!roomInfo?.hostUserId || !session?.user?.id) return

    const targetHostUserId = roomInfo.hostUserId
    const userObj = session.user

    async function checkAccess() {
      try {
        const res = await fetch('/api/rooms/check-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hostUserId: targetHostUserId })
        })

        if (res.ok) {
          const data = await res.json()
          if (data.allowed) {
            setAccessGranted(true)
          } else if (data.requiresApproval) {
            setAccessGranted(false)
            if (!requestSent && socket) {
              requestRoomAccess({
                roomId,
                hostUserId: targetHostUserId,
                userName: userObj.name || userObj.email || 'Usuário',
                userImage: userObj.image || undefined
              })
              setRequestSent(true)
            }
          }
        }
      } catch (err) {
        console.error('Erro na verificação de acesso da sala:', err)
      } finally {
        setAccessChecked(true)
      }
    }

    checkAccess()
  }, [roomInfo?.hostUserId, session?.user?.id, socket, requestSent, requestRoomAccess, roomId, session?.user?.name, session?.user?.email, session?.user?.image])

  // 2. React to real-time host approval
  useEffect(() => {
    if (accessApproved) {
      setAccessGranted(true)
    }
  }, [accessApproved])

  // Listen for remote player-state-change events from socket
  useEffect(() => {
    if (!socket) return

    const handlePlayerState = (data: PlayerStateData) => {
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

  const handleVideoChange = useCallback((url: string) => {
    syncPlayerState({ type: 'change-video', url })
  }, [syncPlayerState])

  const handleRemotePlayerStateConsumed = useCallback(() => {
    setRemotePlayerEvent(null)
  }, [])

  // Loading state
  if (status === 'loading') {
    return (
      <div className="h-screen bg-room-bg flex items-center justify-center">
        <div className="text-room-text-secondary flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-room-accent" />
          <span>Carregando sala...</span>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!session) {
    router.push('/login')
    return null
  }

  // SCREEN A: ROOM FULL ERROR
  if (roomFullError) {
    return (
      <div className="h-screen bg-[#07070B] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0F0F17] border border-red-500/30 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-500">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Limite de Participantes Atingido</h2>
            <p className="text-xs text-[#A0A0B0] leading-relaxed">{roomFullError}</p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => router.push('/profile')}
              className="w-full py-3 rounded-xl brand-gradient text-white font-bold text-xs shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Conhecer o Plano PRO (Até 6 Pessoas)</span>
            </button>

            <button
              onClick={() => router.push('/')}
              className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 font-semibold text-xs transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Início</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // SCREEN B: ACCESS REJECTED BY HOST
  if (accessRejectedReason) {
    return (
      <div className="h-screen bg-[#07070B] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0F0F17] border border-amber-500/30 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
            <UserX className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Solicitação Recusada</h2>
            <p className="text-xs text-[#A0A0B0] leading-relaxed">{accessRejectedReason}</p>
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para o Painel</span>
          </button>
        </div>
      </div>
    )
  }

  // SCREEN C: WAITING HOST CONFIRMATION (User is not host and not friend)
  if (accessChecked && !accessGranted && userRole !== 'host') {
    return (
      <div className="h-screen bg-[#07070B] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0F0F17] border border-room-accent/30 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 brand-gradient animate-pulse" />

          <div className="w-16 h-16 rounded-2xl bg-room-accent/10 border border-room-accent/30 flex items-center justify-center mx-auto text-room-accent">
            <Clock className="w-8 h-8 animate-spin" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-room-accent/10 border border-room-accent/20 text-room-accent text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Solicitação Enviada</span>
            </div>
            <h2 className="text-xl font-bold text-white">Aguardando Confirmação do Host</h2>
            <p className="text-xs text-[#A0A0B0] leading-relaxed">
              Você não possui vínculo de amizade direta com o Host desta sala. Uma solicitação em tempo real foi enviada ao Host para autorizar sua entrada.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left space-y-2">
            <div className="flex items-center justify-between text-xs text-white/80 font-semibold">
              <span>Sala:</span>
              <span className="font-mono text-room-accent">{roomId}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-white/80 font-semibold">
              <span>Status:</span>
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Aguardando Host...
              </span>
            </div>
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 font-semibold text-xs transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancelar e Sair</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* HOST APPROVAL BANNER (Floating at top if host has pending entry requests) */}
      {userRole === 'host' && pendingAccessRequests.length > 0 && (
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 border-b border-amber-400/40 text-white px-4 py-3 z-50 flex flex-wrap items-center justify-between gap-3 shadow-2xl animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-black/30 flex items-center justify-center font-bold text-amber-300">
              🙋‍♂️
            </div>
            <div>
              <p className="text-xs sm:text-sm font-extrabold">
                {pendingAccessRequests[0].requestingUserName} solicitou entrada na sua sala
              </p>
              <p className="text-[11px] opacity-90">
                Este participante precisa da sua confirmação para entrar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => approveAccessRequest(pendingAccessRequests[0].socketId)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Aceitar Entrada</span>
            </button>

            <button
              onClick={() => rejectAccessRequest(pendingAccessRequests[0].socketId)}
              className="px-3.5 py-2 rounded-xl bg-black/40 hover:bg-black/60 text-white font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <UserX className="w-4 h-4 text-red-300" />
              <span>Recusar</span>
            </button>
          </div>
        </div>
      )}

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
    </div>
  )
}
