'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Users, UserPlus, Check, X, Trash2, Send,
  Mail, Play, Loader2, Sparkles, Clock, SquareCheck
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import io, { Socket } from 'socket.io-client'
import {
  getFriendsAndRequests, sendFriendRequest,
  acceptFriendRequest, rejectFriendRequest, removeFriend
} from '../../actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'https://services-videomax-websocket.khdya3.easypanel.host/'

interface FriendUser {
  id: string
  name: string | null
  email: string
  image: string | null
  chatColor?: string | null
}

interface FriendRequestItem {
  id: string
  senderId: string
  receiverId: string
  createdAt: Date | string
  sender?: FriendUser
  receiver?: FriendUser
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export default function FriendsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [friends, setFriends] = useState<FriendUser[]>([])
  const [receivedRequests, setReceivedRequests] = useState<FriendRequestItem[]>([])
  const [sentRequests, setSentRequests] = useState<FriendRequestItem[]>([])
  const [loading, setLoading] = useState(true)

  const [targetInput, setTargetInput] = useState('')
  const [sending, setSending] = useState(false)
  const [activeTab, setActiveTab] = useState<'friends' | 'received' | 'sent'>('friends')

  // Room invite modal
  const [inviteFriend, setInviteFriend] = useState<FriendUser | null>(null)
  const [customRoomCode, setCustomRoomCode] = useState('')

  // Multi-friend select mode
  const [selectMode, setSelectMode] = useState(false)
  const [selectedFriendIds, setSelectedFriendIds] = useState<Set<string>>(new Set())
  const [batchRoomCode, setBatchRoomCode] = useState('')

  const [socket, setSocket] = useState<Socket | null>(null)

  // Socket connection
  useEffect(() => {
    const userId = session?.user?.id
    if (!userId) return
    const newSocket = io(SOCKET_SERVER_URL)
    
    newSocket.on('connect', () => {
      newSocket.emit('join-user-room', { userId })
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [session?.user?.id])

  const loadData = useCallback(async () => {
    try {
      const data = await getFriendsAndRequests()
      setFriends(data.friends as FriendUser[])
      setReceivedRequests(data.receivedRequests as FriendRequestItem[])
      setSentRequests(data.sentRequests as FriendRequestItem[])
    } catch {
      toast.error('Erro ao carregar lista de amigos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleSendRequest = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetInput.trim()) {
      toast.error('Insira um e-mail ou nome de usuário')
      return
    }

    setSending(true)
    try {
      const result = await sendFriendRequest(targetInput.trim())
      toast.success(`Pedido de amizade enviado para ${result.receiverName}!`)
      setTargetInput('')
      await loadData()

      // Realtime socket alert to target user
      if (socket && result.receiverId) {
        socket.emit('friend-request-sent', {
          receiverId: result.receiverId,
          senderName: session?.user?.name || session?.user?.email
        })
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Erro ao enviar pedido'
      toast.error(errorMessage)
    } finally {
      setSending(false)
    }
  }, [targetInput, loadData, socket, session])

  const handleAccept = useCallback(async (requestId: string) => {
    try {
      const res = await acceptFriendRequest(requestId)
      toast.success(`Você e ${res.senderName} agora são amigos!`)
      await loadData()

      if (socket && res.senderId) {
        socket.emit('friend-request-accepted', {
          senderId: res.senderId,
          receiverName: session?.user?.name || session?.user?.email
        })
      }
    } catch {
      toast.error('Erro ao aceitar pedido de amizade')
    }
  }, [loadData, socket, session])

  const handleReject = useCallback(async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId)
      toast.info('Pedido de amizade recusado')
      await loadData()
    } catch {
      toast.error('Erro ao recusar pedido')
    }
  }, [loadData])

  const handleRemoveFriend = useCallback(async (friend: FriendUser) => {
    const friendName = friend.name || friend.email
    if (!confirm(`Remover ${friendName} da sua lista de amigos?`)) return

    try {
      await removeFriend(friend.id)
      toast.info(`${friendName} foi removido dos seus amigos`)
      await loadData()
    } catch {
      toast.error('Erro ao remover amigo')
    }
  }, [loadData])

  const handleSendRoomInvite = useCallback((roomCode: string) => {
    const code = roomCode.trim().toUpperCase() || generateRoomCode()
    if (!inviteFriend || !socket) return

    socket.emit('invite-to-room', {
      targetUserId: inviteFriend.id,
      roomCode: code,
      senderName: session?.user?.name || session?.user?.email || 'Um amigo'
    })

    toast.success(`Convite para a sala ${code} enviado para ${inviteFriend.name || inviteFriend.email}!`)
    setInviteFriend(null)
    setCustomRoomCode('')
    router.push(`/room/${code}`)
  }, [inviteFriend, socket, session, router])

  // Batch invite to multiple friends
  const handleBatchInvite = useCallback(() => {
    const code = batchRoomCode.trim().toUpperCase() || generateRoomCode()
    if (selectedFriendIds.size === 0 || !socket) return

    const selected = friends.filter(f => selectedFriendIds.has(f.id))
    for (const friend of selected) {
      socket.emit('invite-to-room', {
        targetUserId: friend.id,
        roomCode: code,
        senderName: session?.user?.name || session?.user?.email || 'Um amigo'
      })
    }

    toast.success(`Convites para a sala ${code} enviados para ${selected.length} amigo(s)!`)
    setSelectedFriendIds(new Set())
    setBatchRoomCode('')
    setSelectMode(false)
    router.push(`/room/${code}`)
  }, [selectedFriendIds, friends, socket, session, router, batchRoomCode])

  const toggleFriendSelection = useCallback((id: string) => {
    setSelectedFriendIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleSelectAllFriends = useCallback(() => {
    if (selectedFriendIds.size === friends.length) {
      setSelectedFriendIds(new Set())
    } else {
      setSelectedFriendIds(new Set(friends.map(f => f.id)))
    }
  }, [friends, selectedFriendIds.size])

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-6 py-4 sm:py-8 space-y-5 sm:space-y-8">
      {/* ═══ HERO / HEADER ═══ */}
      <div className="relative overflow-hidden rounded-2xl border border-room-border p-4 sm:p-6 lg:p-8">
        <div className="absolute inset-0 brand-gradient-subtle" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-room-accent/8 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/4 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-room-accent/10 border border-room-accent/20">
              <Users className="w-4 h-4 text-room-accent" />
              <span className="text-room-accent text-xs font-semibold tracking-wide uppercase">Rede Social</span>
            </div>
          </div>

          <h1 className="text-room-text text-xl sm:text-2xl lg:text-3xl font-bold mb-1.5 sm:mb-2">
            Gerenciar <span className="brand-gradient-text">amigos</span>
          </h1>
          <p className="text-room-text-secondary text-xs sm:text-sm max-w-md">
            Adicione amigos pelo nome de usuário ou e-mail e convide-os em tempo real para assistir com você nas salas.
          </p>
        </div>
      </div>

      {/* ═══ ADD FRIEND FORM ═══ */}
      <div className="bg-room-surface border border-room-border rounded-2xl p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] brand-gradient opacity-40" />

        <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-room-accent/10 flex items-center justify-center shrink-0">
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-room-accent" />
          </div>
          <div className="min-w-0">
            <h2 className="text-room-text font-bold text-base sm:text-lg">Adicionar novo amigo</h2>
            <p className="text-room-text-secondary text-xs hidden sm:block">Busque por nome de usuário único ou e-mail cadastrado</p>
          </div>
        </div>

        <form onSubmit={handleSendRequest} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Mail className="w-4 h-4 text-room-text-secondary/40 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              placeholder="Digite o nome de usuário ou e-mail..."
              className="w-full bg-room-surface-2 border border-room-border-light text-room-text pl-11 pr-4 py-3 rounded-xl text-sm placeholder:text-room-text-secondary/40 outline-none focus:border-room-accent/50 focus:ring-1 focus:ring-room-accent/20 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={sending || !targetInput.trim()}
            className={cn(
              "px-6 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shrink-0",
              !sending && targetInput.trim()
                ? "brand-gradient text-white brand-glow-strong hover:opacity-90 active:scale-[0.98]"
                : "bg-room-surface-3 text-room-text-secondary/40 cursor-not-allowed"
            )}
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {sending ? 'Enviando...' : 'Enviar pedido'}
          </button>
        </form>
      </div>

      {/* ═══ TABS & LIST ═══ */}
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-room-border gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('friends')}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0",
              activeTab === 'friends'
                ? "border-room-accent text-room-accent"
                : "border-transparent text-room-text-secondary hover:text-room-text"
            )}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Amigos</span>
            <span className="sm:hidden">Rede</span>
            <span className="ml-1 bg-room-accent/10 text-room-accent text-xs px-2 py-0.5 rounded-full">
              {friends.length}
            </span>
          </button>

          {/* Select mode toggle — only on friends tab */}
          {activeTab === 'friends' && friends.length > 0 && (
            <button
              onClick={() => {
                setSelectMode(s => !s)
                setSelectedFriendIds(new Set())
                setBatchRoomCode('')
              }}
              className={cn(
                "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 text-xs font-semibold rounded-lg transition-all ml-auto shrink-0",
                selectMode
                  ? "bg-room-accent/10 text-room-accent border border-room-accent/30"
                  : "text-room-text-secondary hover:text-room-text hover:bg-room-surface-2 border border-transparent"
              )}
            >
              <SquareCheck className="w-4 h-4" />
              <span className="hidden sm:inline">{selectMode ? 'Cancelar seleção' : 'Selecionar'}</span>
              <span className="sm:hidden">{selectMode ? 'Cancelar' : 'Selecionar'}</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('received')}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all relative shrink-0",
              activeTab === 'received'
                ? "border-room-accent text-room-accent"
                : "border-transparent text-room-text-secondary hover:text-room-text"
            )}
          >
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Pedidos recebidos</span>
            <span className="sm:hidden">Recebidos</span>
            {receivedRequests.length > 0 && (
              <span className="ml-1 bg-room-red text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                {receivedRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('sent')}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0",
              activeTab === 'sent'
                ? "border-room-accent text-room-accent"
                : "border-transparent text-room-text-secondary hover:text-room-text"
            )}
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Enviados</span>
            <span className="sm:hidden">Saídos</span>
            <span className="ml-1 bg-room-surface-3 text-room-text-secondary text-xs px-2 py-0.5 rounded-full">
              {sentRequests.length}
            </span>
          </button>
        </div>

        {/* Content lists */}
        {loading ? (
          <div className="text-center py-16 text-room-text-secondary">Carregando amigos...</div>
        ) : activeTab === 'friends' ? (
          <div>
            {friends.length === 0 ? (
              <div className="text-center py-16 bg-room-surface border border-room-border rounded-2xl">
                <Users className="w-12 h-12 text-room-text-secondary/20 mx-auto mb-3" />
                <p className="text-room-text-secondary text-sm">Você ainda não tem nenhum amigo adicionado</p>
                <p className="text-room-text-secondary/60 text-xs mt-1">Use o campo acima para enviar seu primeiro convite</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    onClick={selectMode ? () => toggleFriendSelection(friend.id) : undefined}
                    className={cn(
                      "bg-room-surface border rounded-2xl p-4 flex items-center justify-between gap-3 transition-all group",
                      selectMode
                        ? selectedFriendIds.has(friend.id)
                          ? "border-room-accent/50 bg-room-accent/5 cursor-pointer"
                          : "border-room-border hover:border-room-accent/30 cursor-pointer"
                        : "border-room-border hover:border-room-accent/30"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Checkbox — visible in select mode */}
                      {selectMode && (
                        <div className={cn(
                          "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0",
                          selectedFriendIds.has(friend.id)
                            ? "bg-room-accent border-room-accent"
                            : "border-room-border-light bg-room-surface-2"
                        )}>
                          {selectedFriendIds.has(friend.id) && <Check className="w-3 h-3 text-white" />}
                        </div>
                      )}

                      <Avatar className="w-12 h-12 shrink-0 border border-room-border">
                        <AvatarImage src={friend.image || undefined} />
                        <AvatarFallback className="bg-room-surface-3 text-room-accent font-bold">
                          {(friend.name || friend.email).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <p className="text-room-text font-semibold text-sm truncate">
                          {friend.name || friend.email.split('@')[0]}
                        </p>
                        <p className="text-room-text-secondary text-xs truncate">
                          {friend.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {!selectMode && (
                        <button
                          onClick={() => { setInviteFriend(friend); setCustomRoomCode(generateRoomCode()) }}
                          className="p-2 rounded-xl bg-room-accent/10 hover:bg-room-accent text-room-accent hover:text-white transition-all"
                          title="Convidar para sala"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}

                      {!selectMode && (
                        <button
                          onClick={() => handleRemoveFriend(friend)}
                          className="p-2 rounded-xl bg-room-surface-2 hover:bg-room-red/10 text-room-text-secondary hover:text-room-red transition-all"
                          title="Remover amigo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Select all link — only in select mode */}
            {selectMode && friends.length > 0 && (
              <div className="flex items-center justify-between mt-3 px-1">
                <button
                  onClick={toggleSelectAllFriends}
                  className="text-room-accent text-xs font-semibold hover:underline"
                >
                  {selectedFriendIds.size === friends.length ? 'Desmarcar todos' : 'Selecionar todos'}
                </button>
                {selectedFriendIds.size > 0 && (
                  <span className="text-room-text-secondary text-xs">
                    {selectedFriendIds.size} selecionado(s)
                  </span>
                )}
              </div>
            )}
          </div>
        ) : activeTab === 'received' ? (
          <div>
            {receivedRequests.length === 0 ? (
              <div className="text-center py-16 bg-room-surface border border-room-border rounded-2xl">
                <Clock className="w-12 h-12 text-room-text-secondary/20 mx-auto mb-3" />
                <p className="text-room-text-secondary text-sm">Nenhum pedido de amizade pendente</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {receivedRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-room-surface border border-room-border rounded-2xl p-4 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="w-11 h-11 shrink-0 border border-room-border">
                        <AvatarImage src={req.sender?.image || undefined} />
                        <AvatarFallback className="bg-room-surface-3 text-room-accent font-bold">
                          {(req.sender?.name || req.sender?.email || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <p className="text-room-text font-semibold text-sm truncate">
                          {req.sender?.name || req.sender?.email.split('@')[0]}
                        </p>
                        <p className="text-room-text-secondary text-xs truncate">
                          {req.sender?.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleAccept(req.id)}
                        className="p-2 rounded-xl bg-room-online/10 hover:bg-room-online text-room-online hover:text-white transition-all"
                        title="Aceitar"
                      >
                        <Check className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleReject(req.id)}
                        className="p-2 rounded-xl bg-room-red/10 hover:bg-room-red text-room-red hover:text-white transition-all"
                        title="Recusar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {sentRequests.length === 0 ? (
              <div className="text-center py-16 bg-room-surface border border-room-border rounded-2xl">
                <Send className="w-12 h-12 text-room-text-secondary/20 mx-auto mb-3" />
                <p className="text-room-text-secondary text-sm">Você não tem nenhum pedido enviado pendente</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-room-surface border border-room-border rounded-2xl p-4 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="w-11 h-11 shrink-0 border border-room-border">
                        <AvatarImage src={req.receiver?.image || undefined} />
                        <AvatarFallback className="bg-room-surface-3 text-room-accent font-bold">
                          {(req.receiver?.name || req.receiver?.email || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <p className="text-room-text font-semibold text-sm truncate">
                          {req.receiver?.name || req.receiver?.email.split('@')[0]}
                        </p>
                        <p className="text-room-text-secondary text-xs truncate">
                          {req.receiver?.email}
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold text-room-yellow bg-room-yellow/10 px-2.5 py-1 rounded-full shrink-0">
                      Pendente
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══ BATCH INVITE ACTION BAR ═══ */}
      {selectMode && selectedFriendIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-room-surface/95 backdrop-blur-lg border-t border-room-border p-3 sm:p-4 animate-fade-in">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <div className="flex-1">
              <label className="text-room-text-secondary text-xs font-semibold mb-1 block uppercase tracking-wider">
                Código da sala
              </label>
              <input
                type="text"
                value={batchRoomCode}
                onChange={(e) => setBatchRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                placeholder="Gerar automaticamente"
                className="w-full bg-room-surface-2 border border-room-border-light text-room-text px-3 sm:px-4 py-2.5 rounded-xl text-sm font-mono tracking-widest text-center uppercase outline-none focus:border-room-accent/50 transition-colors"
              />
            </div>
            <button
              onClick={handleBatchInvite}
              disabled={!socket}
              className="px-5 sm:px-6 py-3 rounded-xl font-semibold text-sm brand-gradient text-white brand-glow-strong hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <Send className="w-4 h-4" />
              Convidar {selectedFriendIds.size} amigo(s)
            </button>
          </div>
        </div>
      )}

      {/* ═══ ROOM INVITE MODAL ═══ */}
      {inviteFriend && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setInviteFriend(null) }}
        >
          <div className="bg-room-surface border border-room-border rounded-2xl w-full max-w-md mx-4 animate-scale-in relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] brand-gradient" />

            <div className="flex items-center justify-between px-5 py-4 border-b border-room-border">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-room-accent" />
                <h2 className="text-room-text font-semibold">Convidar para Sala</h2>
              </div>
              <button
                onClick={() => setInviteFriend(null)}
                className="w-8 h-8 rounded-full bg-room-surface-2 hover:bg-room-surface-3 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-room-text-secondary" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-room-surface-2 border border-room-border-light">
                <Avatar className="w-10 h-10 border border-room-border">
                  <AvatarImage src={inviteFriend.image || undefined} />
                  <AvatarFallback className="bg-room-surface-3 text-room-accent font-bold">
                    {(inviteFriend.name || inviteFriend.email).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-room-text text-sm font-semibold">{inviteFriend.name || inviteFriend.email}</p>
                  <p className="text-room-text-secondary text-xs">Enviar notificação em tempo real</p>
                </div>
              </div>

              <div>
                <label className="text-room-text-secondary text-xs font-semibold mb-1.5 block uppercase tracking-wider">
                  Código da Sala
                </label>
                <input
                  type="text"
                  value={customRoomCode}
                  onChange={(e) => setCustomRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  placeholder="EX: DEMO01"
                  className="w-full bg-room-surface-3 border border-room-border-light text-room-text px-4 py-2.5 rounded-xl text-sm font-mono tracking-widest text-center uppercase outline-none focus:border-room-accent/50 transition-colors"
                />
              </div>

              <button
                onClick={() => handleSendRoomInvite(customRoomCode)}
                className="w-full py-3 rounded-xl font-semibold text-sm brand-gradient text-white brand-glow-strong hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Criar sala e Enviar Convite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
