'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useSocket } from '@/lib/useSocket'
import { WatchRoom } from '@/components/watch-room/watch-room'
import { Video, PlayerStateData } from '@/types'
import { ensureAndAcceptFriendship, sendFriendRequest } from '@/app/(main)/actions'
import { ShieldAlert, Clock, UserCheck, UserX, ArrowLeft, Crown, Loader2, Sparkles, UserPlus, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface HostUserInfo {
  id: string
  name: string | null
  email: string
  image: string | null
}

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
  const [hostUser, setHostUser] = useState<HostUserInfo | null>(null)
  const [requestSent, setRequestSent] = useState(false)
  const [sendingRequest, setSendingRequest] = useState(false)
  const [loadingCheckout, setLoadingCheckout] = useState(false)

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

    async function checkAccess() {
      try {
        const res = await fetch('/api/rooms/check-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hostUserId: targetHostUserId })
        })

        if (res.ok) {
          const data = await res.json()
          if (data.hostUser) {
            setHostUser(data.hostUser)
          }
          if (data.allowed) {
            setAccessGranted(true)
          } else {
            setAccessGranted(false)
          }
        }
      } catch (err) {
        console.error('Erro na verificação de acesso da sala:', err)
      } finally {
        setAccessChecked(true)
      }
    }

    checkAccess()
  }, [roomInfo?.hostUserId, session?.user?.id])

  // 2. React to real-time host approval
  useEffect(() => {
    if (accessApproved) {
      setAccessGranted(true)
      toast.success('Entrada aprovada pelo Host!')
    }
  }, [accessApproved])

  // 3. User manually sends friendship & room entrance request
  const handleSendFriendshipAndAccessRequest = async () => {
    if (!roomInfo?.hostUserId || !socket || !session?.user) return

    setSendingRequest(true)
    try {
      if (hostUser?.email || hostUser?.name) {
        try {
          await sendFriendRequest(hostUser.email || hostUser.name || '')
        } catch {
          // Friend request might already exist as pending
        }
      }

      requestRoomAccess({
        roomId,
        hostUserId: roomInfo.hostUserId,
        userName: session.user.name || session.user.email || 'Usuário',
        userImage: session.user.image || undefined
      })

      setRequestSent(true)
      toast.success('Solicitação enviada ao Host com sucesso!')
    } catch {
      toast.error('Erro ao enviar solicitação ao Host')
    } finally {
      setSendingRequest(false)
    }
  }

  // 4. Host approves guest request (creates friendship + approves room entry)
  const handleHostApproveGuest = async (req: { requestingUserId: string; socketId: string }) => {
    try {
      await ensureAndAcceptFriendship(req.requestingUserId)
      approveAccessRequest(req.socketId)
      toast.success('Solicitação aprovada e amizade confirmada!')
    } catch {
      toast.error('Erro ao aprovar solicitação')
    }
  }

  // 5. Host Checkout for Upgrade
  const handleHostUpgradeCheckout = async () => {
    setLoadingCheckout(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data?.url) {
        window.location.href = data.url
      } else {
        toast.error(data?.error || 'Erro ao iniciar checkout do Stripe')
      }
    } catch {
      toast.error('Erro ao conectar com o Stripe')
    } finally {
      setLoadingCheckout(false)
    }
  }

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

  // SCREEN A: ROOM FULL ERROR FOR GUEST
  if (roomFullError && userRole !== 'host') {
    return (
      <div className="h-screen bg-[#07070B] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0F0F17] border border-red-500/30 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-500">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Lotação Máxima da Sala</h2>
            <p className="text-xs text-[#A0A0B0] leading-relaxed">
              A sala do Host atingiu a lotação máxima de participantes do Plano Free (2 pessoas).
            </p>
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Início</span>
          </button>
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

  // SCREEN C: FRIENDSHIP & ENTRANCE REQUEST SCREEN FOR GUESTS NOT IN HOST'S FRIEND NETWORK
  if (accessChecked && !accessGranted && userRole !== 'host') {
    return (
      <div className="h-screen bg-[#07070B] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0F0F17] border border-room-accent/30 rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 brand-gradient" />

          {/* Host Card */}
          <div className="flex flex-col items-center pt-2">
            <Avatar className="w-20 h-20 border-4 border-room-surface-2 shadow-xl mb-3">
              <AvatarImage src={hostUser?.image || undefined} className="object-cover" />
              <AvatarFallback className="bg-room-accent/20 text-room-accent font-extrabold text-2xl">
                {hostUser?.name?.charAt(0)?.toUpperCase() || 'H'}
              </AvatarFallback>
            </Avatar>

            <h2 className="text-lg font-bold text-white">
              {hostUser?.name || 'Host da Sala'}
            </h2>
            <p className="text-xs text-room-accent font-mono mt-0.5">Sala: {roomId}</p>
          </div>

          <div className="space-y-2 text-left bg-white/5 p-4 rounded-xl border border-white/10">
            <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Host fora da sua rede de amigos</span>
            </p>
            <p className="text-xs text-[#A0A0B0] leading-relaxed">
              Para garantir a privacidade e segurança das transmissões, apenas amigos autorizados podem entrar na sala. Envie uma solicitação de amizade e autorização de entrada ao Host.
            </p>
          </div>

          {!requestSent ? (
            <div className="space-y-3">
              <button
                onClick={handleSendFriendshipAndAccessRequest}
                disabled={sendingRequest}
                className="w-full py-3.5 rounded-xl brand-gradient text-white font-extrabold text-xs shadow-xl brand-glow-strong hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 border border-amber-400/40"
              >
                {sendingRequest ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 text-white" />
                    <span>Solicitar Amizade & Entrar na Sala</span>
                  </>
                )}
              </button>

              <button
                onClick={() => router.push('/')}
                className="w-full py-2.5 rounded-xl text-white/60 hover:text-white text-xs font-semibold transition-colors"
              >
                Voltar ao Painel
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-bold">
                <Clock className="w-4 h-4 animate-spin" />
                <span>Solicitação enviada ao Host!</span>
              </div>
              <p className="text-[11px] text-[#A0A0B0]">
                Aguarde o Host aceitar seu pedido de amizade na tela dele para liberar sua entrada automaticamente.
              </p>
              <button
                onClick={() => router.push('/')}
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cancelar e Voltar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* HOST UPGRADE MODAL (OVERLAY WHEN A 3rd PERSON TRIES TO ENTER A FREE ROOM) */}
      {userRole === 'host' && roomFullError && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-[#0F0F17] border border-amber-500/40 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
              <Crown className="w-8 h-8 fill-amber-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white">Sua Sala Atingiu o Limite do Plano Free</h2>
              <p className="text-xs text-[#A0A0B0] leading-relaxed">
                Um participante tentou entrar na sua sala, mas salas no <strong>Plano Free</strong> aceitam no máximo 2 pessoas. Faça upgrade para o <strong>Plano PRO</strong> e libere salas para até 6 participantes!
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleHostUpgradeCheckout}
                disabled={loadingCheckout}
                className="w-full py-4 rounded-xl brand-gradient text-white font-extrabold text-xs shadow-2xl brand-glow-strong hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 border border-amber-400/40"
              >
                {loadingCheckout ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>⭐ Assinar Plano PRO no Stripe (Cartão de Crédito/Débito)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HOST FRIENDSHIP & ENTRANCE APPROVAL BANNER */}
      {userRole === 'host' && pendingAccessRequests.length > 0 && (
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 border-b border-amber-400/40 text-white px-4 py-3 z-50 flex flex-wrap items-center justify-between gap-3 shadow-2xl animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-black/30 flex items-center justify-center font-bold text-amber-300">
              🙋‍♂️
            </div>
            <div>
              <p className="text-xs sm:text-sm font-extrabold">
                {pendingAccessRequests[0].requestingUserName} quer adicionar você como amigo e entrar na sua sala
              </p>
              <p className="text-[11px] opacity-90">
                Aceite para incluir este usuário na sua rede de amigos e autorizar a entrada na sala.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleHostApproveGuest(pendingAccessRequests[0])}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Aceitar Amizade & Entrada</span>
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
