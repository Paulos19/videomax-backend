'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useSocket } from '@/lib/useSocket'
import { WatchRoom } from '@/components/watch-room/watch-room'
import { Video, PlayerStateData } from '@/types'
import { ensureAndAcceptFriendship, sendFriendRequest } from '@/app/(main)/actions'
import {
  ShieldAlert,
  Clock,
  UserCheck,
  UserX,
  ArrowLeft,
  Crown,
  Loader2,
  Sparkles,
  UserPlus,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface HostUserInfo {
  id: string
  name: string | null
  email: string
  image: string | null
  plan?: string | null
}

export default function RoomPage() {
  const params = useParams()
  const roomId = params.id as string
  const router = useRouter()
  const { data: session, status } = useSession()

  const [videos, setVideos] = useState<Video[]>([])
  const [remotePlayerEvent, setRemotePlayerEvent] = useState<{
    data: PlayerStateData
    version: number
  } | null>(null)
  const remoteStateVersion = useRef(0)

  // Room access state
  const [accessChecked, setAccessChecked] = useState(false)
  const [accessGranted, setAccessGranted] = useState(false)
  const [hostUser, setHostUser] = useState<HostUserInfo | null>(null)
  const [requestSent, setRequestSent] = useState(false)
  const [sendingRequest, setSendingRequest] = useState(false)
  const [loadingCheckout, setLoadingCheckout] = useState(false)
  const [dismissHostUpgradeModal, setDismissHostUpgradeModal] = useState(false)

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
    isBlocked,
    blockedReason,
    blockedHostUserId,
    kickUser,
    sendMessage,
    syncPlayerState,
    changeUserRole,
    requestRoomAccess,
    approveAccessRequest,
    rejectAccessRequest,
    currentUserId,
    selectedColor,
    changeChatColor,
    reactToMessage,
  } = useSocket(roomId, hostUser?.id)

  // 1. Check friendship access with backend once roomInfo.hostUserId is known
  useEffect(() => {
    if (!roomInfo?.hostUserId || !session?.user?.id) return

    const targetHostUserId = roomInfo.hostUserId

    async function checkAccess() {
      try {
        const res = await fetch('/api/rooms/check-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hostUserId: targetHostUserId }),
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
      toast.success('O Host aprovou sua entrada na sala!')
    }
  }, [accessApproved])

  // 3. Listen to player remote sync
  useEffect(() => {
    if (!socket) return

    const handlePlayerState = (data: PlayerStateData) => {
      remoteStateVersion.current += 1
      setRemotePlayerEvent({ data, version: remoteStateVersion.current })
    }

    socket.on('player-state-change', handlePlayerState)

    return () => {
      socket.off('player-state-change', handlePlayerState)
    }
  }, [socket])

  const handleSendFriendshipAndAccessRequest = async () => {
    const targetHostUserId = hostUser?.id || blockedHostUserId || roomInfo?.hostUserId
    if (!session?.user?.id || !targetHostUserId) return
    setSendingRequest(true)
    try {
      if (hostUser?.email) {
        await sendFriendRequest(hostUser.email)
      }
      requestRoomAccess({
        roomId,
        hostUserId: targetHostUserId,
        userName: session.user.name || session.user.email || 'Usuário',
      })
      setRequestSent(true)
      toast.success('Solicitação de autorização enviada ao Host!')
    } catch {
      requestRoomAccess({
        roomId,
        hostUserId: targetHostUserId,
        userName: session.user.name || session.user.email || 'Usuário',
      })
      setRequestSent(true)
      toast.info('Solicitação enviada ao Host!')
    } finally {
      setSendingRequest(false)
    }
  }

  const handleHostApproveGuest = async (req: {
    socketId: string
    requestingUserId: string
    requestingUserName: string
  }) => {
    try {
      await ensureAndAcceptFriendship(req.requestingUserId)
      approveAccessRequest(req.socketId)
      toast.success(`${req.requestingUserName} agora é seu amigo e entrou na sala!`)
    } catch (err) {
      console.error('Erro ao aprovar participante:', err)
      approveAccessRequest(req.socketId)
      toast.success(`Entrada de ${req.requestingUserName} autorizada!`)
    }
  }

  const handleHostUpgradeCheckout = async () => {
    setLoadingCheckout(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (data?.url) {
        window.location.href = data.url
      } else {
        toast.error('Erro ao conectar com o gateway do Stripe.')
      }
    } catch {
      toast.error('Erro ao iniciar assinatura.')
    } finally {
      setLoadingCheckout(false)
    }
  }

  const handleVideoChange = useCallback(
    (url: string) => {
      syncPlayerState({ type: 'change-video', url })
    },
    [syncPlayerState]
  )

  const handleRemotePlayerStateConsumed = useCallback(() => {
    setRemotePlayerEvent(null)
  }, [])

  // Loading state
  if (status === 'loading') {
    return (
      <div className="h-screen bg-[#050508] flex items-center justify-center font-mono">
        <div className="text-white flex items-center gap-2 text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-[#FF5A00]" />
          <span>INICIALIZANDO CONEXÃO QUÂNTICA...</span>
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
      <div className="h-screen bg-[#050508] flex items-center justify-center p-4 font-mono select-none">
        <div className="max-w-md w-full bg-[#0A0A0F] border-2 border-[#EF2020] p-6 text-center space-y-4 shadow-[0_0_35px_rgba(239,32,32,0.3)]">
          <div className="w-12 h-12 bg-[#EF2020] text-white flex items-center justify-center mx-auto shadow-lg">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-black text-white uppercase tracking-wider">
              LOTAÇÃO MÁXIMA DA SALA ATINGIDA
            </h2>
            <p className="text-xs text-[#888] leading-relaxed">
              A sala do Host atingiu o limite do Plano Free (2 pessoas).
            </p>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 bg-[#121218] hover:bg-[#1C1C24] text-white font-bold text-xs uppercase transition-colors border border-[#333] flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>VOLTAR AO DASHBOARD</span>
          </button>
        </div>
      </div>
    )
  }

  // SCREEN: BLOCKED / REMOVED BY HOST
  if (isBlocked && userRole !== 'host') {
    return (
      <div className="h-screen bg-[#050508] flex items-center justify-center p-4 font-mono select-none">
        <div className="max-w-md w-full bg-[#0A0A0F] border-2 border-[#EF2020] p-6 text-center space-y-4 shadow-[0_0_35px_rgba(239,32,32,0.3)]">
          <div className="w-12 h-12 bg-[#EF2020] text-white flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(239,32,32,0.5)] animate-pulse">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-black text-white uppercase tracking-wider">
              ACESSO BLOQUEADO PELO HOST
            </h2>
            <p className="text-xs text-[#888] leading-relaxed">
              {blockedReason || 'Você foi removido desta sala pelo Host. Caso deseje retornar, solicite uma nova autorização ao Host da sessão.'}
            </p>
          </div>

          {!requestSent ? (
            <div className="space-y-2 pt-2">
              <button
                onClick={handleSendFriendshipAndAccessRequest}
                disabled={sendingRequest}
                className="w-full py-3 bg-[#EF2020] hover:bg-white text-white hover:text-black font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(239,32,32,0.3)]"
              >
                {sendingRequest ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>SOLICITAR AUTORIZAÇÃO DE ENTRADA</span>
                  </>
                )}
              </button>

              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-2 border border-[#333] hover:border-white text-[#888] hover:text-white text-xs font-bold uppercase transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>VOLTAR AO DASHBOARD</span>
              </button>
            </div>
          ) : (
            <div className="p-4 bg-[#121218] border border-[#FFE600] text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-[#FFE600] text-xs font-bold uppercase">
                <Clock className="w-4 h-4 animate-spin" />
                <span>SOLICITAÇÃO ENVIADA AO HOST</span>
              </div>
              <p className="text-[10px] text-[#888]">
                Aguardando o Host analisar sua solicitação de reentrada na sala...
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-2 mt-2 border border-[#333] hover:border-white text-[#888] hover:text-white text-xs font-bold uppercase transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>VOLTAR AO DASHBOARD</span>
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // SCREEN B: ACCESS REJECTED BY HOST
  if (accessRejectedReason) {
    return (
      <div className="h-screen bg-[#050508] flex items-center justify-center p-4 font-mono select-none">
        <div className="max-w-md w-full bg-[#0A0A0F] border-2 border-[#FF5A00] p-6 text-center space-y-4 shadow-[0_0_35px_rgba(255,90,0,0.3)]">
          <div className="w-12 h-12 bg-[#FF5A00] text-black flex items-center justify-center mx-auto">
            <UserX className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-black text-white uppercase tracking-wider">
              SOLICITAÇÃO RECUSADA
            </h2>
            <p className="text-xs text-[#888] leading-relaxed">{accessRejectedReason}</p>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 bg-[#FF5A00] hover:bg-white text-black font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 inline mr-1" />
            <span>VOLTAR AO DASHBOARD</span>
          </button>
        </div>
      </div>
    )
  }

  // SCREEN C: FRIENDSHIP & ENTRANCE GATE SCREEN
  if (accessChecked && !accessGranted && userRole !== 'host') {
    return (
      <div className="h-screen bg-[#050508] flex items-center justify-center p-4 font-mono select-none">
        <div className="max-w-md w-full bg-[#0A0A0F] border-2 border-[#FF5A00] p-6 sm:p-8 text-center space-y-5 shadow-[0_0_40px_rgba(255,90,0,0.25)]">
          
          <div className="flex flex-col items-center">
            <Avatar className="w-16 h-16 border-2 border-[#FFE600] rounded-none mb-3">
              <AvatarImage src={hostUser?.image || undefined} className="object-cover" />
              <AvatarFallback className="bg-[#121218] text-[#FF5A00] font-black text-xl rounded-none">
                {hostUser?.name?.charAt(0)?.toUpperCase() || 'H'}
              </AvatarFallback>
            </Avatar>

            <h2 className="text-base font-black text-white uppercase">
              {hostUser?.name || 'Host da Sala'}
            </h2>
            <span className="text-[10px] text-[#FF5A00] mt-0.5 uppercase">
              SALA #{roomId} // REDE PRIVADA
            </span>
          </div>

          <div className="p-3.5 bg-[#07070B] border border-[#222] text-left space-y-1.5">
            <span className="text-[10px] font-bold text-[#FFE600] uppercase flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              [ PROTEÇÃO DE TRANSMISSÃO ]
            </span>
            <p className="text-[11px] text-[#888] leading-relaxed">
              Apenas amigos autorizados podem entrar na sala. Envie um pedido de amizade ao Host para liberar sua entrada instantaneamente.
            </p>
          </div>

          {!requestSent ? (
            <div className="space-y-2.5">
              <button
                onClick={handleSendFriendshipAndAccessRequest}
                disabled={sendingRequest}
                className="w-full py-3 bg-[#FF5A00] hover:bg-white text-black font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,90,0,0.3)]"
              >
                {sendingRequest ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>SOLICITAR AMIZADE & ENTRADA</span>
                  </>
                )}
              </button>

              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-2 border border-[#333] hover:border-white text-[#888] hover:text-white text-xs font-bold uppercase transition-colors cursor-pointer"
              >
                CANCELAR E VOLTAR
              </button>
            </div>
          ) : (
            <div className="p-4 bg-[#121218] border border-[#FFE600] text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-[#FFE600] text-xs font-bold uppercase">
                <Clock className="w-4 h-4 animate-spin" />
                <span>SOLICITAÇÃO ENVIADA AO HOST</span>
              </div>
              <p className="text-[10px] text-[#888]">
                Aguarde o Host aceitar seu pedido para liberar sua entrada automaticamente.
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-2 bg-transparent hover:bg-white/5 border border-[#333] text-white text-[10px] uppercase font-bold transition-colors"
              >
                VOLTAR AO DASHBOARD
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full flex flex-col font-sans">
      
      {/* HOST UPGRADE MODAL (WHEN A 3rd PERSON TRIES TO ENTER A FREE ROOM) */}
      {userRole === 'host' && roomFullError && !dismissHostUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-mono select-none animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-[#0A0A0F] border-2 border-[#FFE600] p-6 sm:p-8 text-center space-y-5 shadow-[0_0_40px_rgba(255,230,0,0.3)]">
            <div className="w-14 h-14 bg-gradient-to-br from-[#FFE600] to-[#FF5A00] flex items-center justify-center mx-auto text-black shadow-lg">
              <Crown className="w-7 h-7 fill-black" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                LIMITE DO PLANO FREE ATINGIDO
              </h2>
              <p className="text-xs text-[#888] leading-relaxed">
                Um convidado tentou entrar, mas salas no <strong>Plano Free</strong> aceitam no máximo 2 pessoas. Faça upgrade para o <strong>MAXPRO VIP</strong> e libere salas para até 6 participantes com áudio e vídeo em 1080p!
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleHostUpgradeCheckout}
                disabled={loadingCheckout}
                className="w-full py-3.5 bg-[#FFE600] hover:bg-white text-black font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(255,230,0,0.4)]"
              >
                {loadingCheckout ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-black" />
                    <span>ASSINAR MAXPRO VIP (STRIPE)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setDismissHostUpgradeModal(true)}
                className="w-full py-2 border border-[#333] hover:border-white text-[#888] hover:text-white text-[10px] font-bold uppercase transition-colors cursor-pointer"
              >
                MANTER PLANO FREE (2 PESSOAS)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HOST FRIENDSHIP & ENTRANCE APPROVAL BANNER */}
      {userRole === 'host' && pendingAccessRequests.length > 0 && (
        <div className="bg-[#0D0D14] border-b-2 border-[#FF5A00] text-white px-4 py-3 z-50 flex flex-wrap items-center justify-between gap-3 font-mono shadow-2xl animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#FF5A00] text-black flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-white">
                <span className="text-[#FF5A00]">{pendingAccessRequests[0].requestingUserName}</span>{' '}
                QUER ENTRAR NA SUA SALA!
              </p>
              <p className="text-[10px] text-[#888]">
                Aceite para incluir na sua rede de amigos e autorizar a entrada ao vivo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleHostApproveGuest(pendingAccessRequests[0])}
              className="px-3.5 py-1.5 bg-[#22C55E] hover:bg-white text-black font-black text-[10px] uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>ACEITAR ENTRADA</span>
            </button>

            <button
              onClick={() => rejectAccessRequest(pendingAccessRequests[0].socketId)}
              className="px-3 py-1.5 border border-[#333] hover:border-white text-[#888] hover:text-white font-bold text-[10px] uppercase transition-colors cursor-pointer"
            >
              RECUSAR
            </button>
          </div>
        </div>
      )}

      {/* Main Watch Room Component */}
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
        hostPlan={roomInfo?.hostPlan || hostUser?.plan || 'FREE'}
        maxViewers={
          roomInfo?.maxViewers ||
          ((roomInfo?.hostPlan || hostUser?.plan) === 'MAXPRO' ||
          (roomInfo?.hostPlan || hostUser?.plan) === 'PRO'
            ? 6
            : 2)
        }
        lastPlayerAction={lastPlayerAction}
        selectedColor={selectedColor}
        onSelectColor={changeChatColor}
        onSendMessage={sendMessage}
        onReactMessage={reactToMessage}
        onSyncPlayerState={syncPlayerState}
        onRemotePlayerState={remotePlayerEvent?.data ?? null}
        onRemotePlayerStateVersion={remotePlayerEvent?.version}
        onRemotePlayerStateConsumed={handleRemotePlayerStateConsumed}
        onVideoChange={handleVideoChange}
        onChangeUserRole={changeUserRole}
        onKickUser={kickUser}
        onBack={() => router.push('/dashboard')}
        socket={socket}
        senderName={session?.user?.name || session?.user?.email || 'Um amigo'}
      />
    </div>
  )
}
