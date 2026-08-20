'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Users,
  UserPlus,
  Check,
  X,
  Trash2,
  Send,
  Mail,
  Play,
  Loader2,
  Sparkles,
  Clock,
  SquareCheck,
  Search,
  SlidersHorizontal,
  MessageSquare,
  MoreHorizontal,
  Crown,
  Radio,
  Share2,
  CheckSquare,
  Square,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import io, { Socket } from 'socket.io-client'
import {
  getFriendsAndRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  createRoomInviteNotification,
} from '../../actions'
import { cn } from '@/lib/utils'
import { useNotifications } from '@/contexts/notification-context'
import { HomeHeader } from '../components/home-header'
import { FriendSuggestions } from './components/friend-suggestions'
import { FriendStats } from './components/friend-stats'
import { FriendsMesh3DView } from '@/components/dashboard/friends-mesh-3d'
import { CreateRoomDialog, InvitedFriendPayload } from '../components/create-room-dialog'

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'https://services-videomax-websocket.khdya3.easypanel.host/'

interface FriendUser {
  id: string
  name: string | null
  email: string
  image: string | null
  chatColor?: string | null
  plan?: string | null
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

function getThumbnailForVideo(url?: string | null, title?: string | null): string | null {
  if (url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/
    const match = url.match(regExp)
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`
    }
  }
  return null
}

export default function FriendsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { emailVerified } = useNotifications()
  const [friends, setFriends] = useState<FriendUser[]>([])
  const [receivedRequests, setReceivedRequests] = useState<FriendRequestItem[]>([])
  const [sentRequests, setSentRequests] = useState<FriendRequestItem[]>([])
  const [loading, setLoading] = useState(true)

  const [targetInput, setTargetInput] = useState('')
  const [sending, setSending] = useState(false)
  const [activeTab, setActiveTab] = useState<'friends' | 'pending' | 'requests'>('friends')
  const [searchFilter, setSearchFilter] = useState('')
  const [liveUser, setLiveUser] = useState<any>(null)

  // Multi-friend selection mode
  const [selectedFriendIds, setSelectedFriendIds] = useState<Set<string>>(new Set())
  const [createRoomOpen, setCreateRoomOpen] = useState(false)

  const [socket, setSocket] = useState<Socket | null>(null)
  const [activeRooms, setActiveRooms] = useState<Array<{ roomId: string; videoTitle: string; videoUrl?: string; viewers: Array<{ userId: string }> }>>([])
  const [presenceMap, setPresenceMap] = useState<Record<string, { status: 'online' | 'in_room'; roomId?: string; videoTitle?: string; videoUrl?: string }>>({})

  // Fetch live user info
  useEffect(() => {
    fetch('/api/user/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setLiveUser(data.user)
      })
      .catch(() => {})
  }, [])

  // Socket connection
  useEffect(() => {
    const userId = session?.user?.id
    if (!userId) return

    let newSocket: Socket | null = null
    let cancelled = false

    const init = async () => {
      let wsToken: string | undefined
      try {
        const tokenRes = await fetch('/api/auth/token')
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json()
          wsToken = tokenData.token
        }
      } catch {}

      if (cancelled) return

      newSocket = io(SOCKET_SERVER_URL, {
        auth: wsToken ? { token: wsToken } : undefined,
        transports: ['websocket', 'polling'],
      })

      newSocket.on('connect', () => {
        if (cancelled) return
        newSocket?.emit('join-user-room', { userId })
        newSocket?.emit('get-active-rooms')
        newSocket?.emit('get-presence-list')
      })

      const handleRooms = (rooms: any[]) => {
        if (!cancelled && Array.isArray(rooms)) {
          setActiveRooms(rooms)
        }
      }

      newSocket.on('active-rooms-update', handleRooms)
      newSocket.on('active-rooms-list', handleRooms)

      const handlePresence = (list: any[]) => {
        if (!cancelled && Array.isArray(list)) {
          const map: Record<string, any> = {}
          for (const item of list) {
            if (item.userId) map[item.userId] = item
          }
          setPresenceMap(map)
        }
      }

      newSocket.on('presence-update', handlePresence)
      newSocket.on('presence-list', handlePresence)

      setSocket(newSocket)
    }

    init()

    return () => {
      cancelled = true
      if (newSocket) newSocket.disconnect()
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

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSendRequest = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!emailVerified) {
        toast.error('Por favor, confirme seu e-mail para adicionar amigos.')
        return
      }
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

        if (socket && result.receiverId) {
          socket.emit('friend-request-sent', {
            receiverId: result.receiverId,
            senderName: session?.user?.name || session?.user?.email,
          })
        }
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Erro ao enviar pedido'
        toast.error(errorMessage)
      } finally {
        setSending(false)
      }
    },
    [targetInput, loadData, socket, session]
  )

  const handleAccept = useCallback(
    async (requestId: string) => {
      try {
        const res = await acceptFriendRequest(requestId)
        toast.success(`Você e ${res.senderName} agora são amigos!`)
        await loadData()

        if (socket && res.senderId) {
          socket.emit('friend-request-accepted', {
            senderId: res.senderId,
            receiverName: session?.user?.name || session?.user?.email,
          })
        }
      } catch {
        toast.error('Erro ao aceitar pedido de amizade')
      }
    },
    [loadData, socket, session]
  )

  const handleReject = useCallback(
    async (requestId: string) => {
      try {
        await rejectFriendRequest(requestId)
        toast.info('Pedido de amizade recusado')
        await loadData()
      } catch {
        toast.error('Erro ao recusar pedido')
      }
    },
    [loadData]
  )

  const handleRemoveFriend = useCallback(
    async (friend: FriendUser) => {
      const friendName = friend.name || friend.email
      if (!confirm(`Remover ${friendName} da sua lista de amigos?`)) return

      try {
        await removeFriend(friend.id)
        toast.info(`${friendName} foi removido dos seus amigos`)
        await loadData()
      } catch {
        toast.error('Erro ao remover amigo')
      }
    },
    [loadData]
  )

  const handleSendSingleRoomInvite = useCallback(
    async (friend: FriendUser) => {
      const code = generateRoomCode()
      const senderName = session?.user?.name || session?.user?.email || 'Um amigo'

      await createRoomInviteNotification(friend.id, code, senderName).catch(() => {})

      if (socket) {
        socket.emit('invite-to-room', {
          targetUserId: friend.id,
          roomCode: code,
          senderName,
        })
      }

      toast.success(`Convite para a sala #${code} enviado para ${friend.name || friend.email}!`)
      router.push(`/room/${code}`)
    },
    [socket, session, router]
  )

  const toggleFriendSelection = useCallback((id: string) => {
    setSelectedFriendIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const selectAllFriends = useCallback(() => {
    if (selectedFriendIds.size === friends.length) {
      setSelectedFriendIds(new Set())
    } else {
      setSelectedFriendIds(new Set(friends.map((f) => f.id)))
    }
  }, [friends, selectedFriendIds])

  const filteredFriends = useMemo(() => {
    if (!searchFilter.trim()) return friends
    const term = searchFilter.toLowerCase().trim()
    return friends.filter(
      (f) =>
        (f.name && f.name.toLowerCase().includes(term)) ||
        f.email.toLowerCase().includes(term)
    )
  }, [friends, searchFilter])

  // Selected friends object list for CreateRoomDialog
  const selectedFriendsList: InvitedFriendPayload[] = useMemo(() => {
    return friends
      .filter((f) => selectedFriendIds.has(f.id))
      .map((f) => ({
        id: f.id,
        name: f.name,
        email: f.email,
      }))
  }, [friends, selectedFriendIds])

  const user = liveUser || session?.user
  const userPlan = (user?.plan || 'FREE').toUpperCase()
  const isPro = userPlan === 'PRO' || userPlan === 'MAXPRO'

  return (
    <div className="space-y-6 pb-24 relative">
      
      {/* ── HEADER COMMAND BANNER ─────────────────────────────────── */}
      <div className="relative overflow-hidden bg-white dark:bg-[#09090D] border border-slate-200 dark:border-[#222] p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm dark:shadow-2xl transition-colors">
        <div
          className={cn(
            'absolute top-0 right-0 w-80 h-full blur-3xl pointer-events-none opacity-20 transition-colors',
            isPro ? 'bg-amber-400 dark:bg-[#FFE600]' : 'bg-orange-400 dark:bg-[#FF5A00]'
          )}
        />

        {/* Left Info */}
        <div className="flex items-center gap-4 relative z-10 flex-1 min-w-0">
          <div
            className={cn(
              'w-12 h-12 flex items-center justify-center font-black shrink-0 shadow-[0_0_20px_rgba(255,90,0,0.3)]',
              isPro ? 'bg-amber-500 text-white dark:bg-[#FFE600] dark:text-black' : 'bg-[#FF5A00] text-white dark:text-black'
            )}
          >
            <Users className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-orange-600 dark:text-[#FF5A00] uppercase font-bold tracking-widest bg-orange-50 dark:bg-[#14141E] px-2 py-0.5 border border-orange-200 dark:border-[#222]">
                [ REDE SOCIAL // NÓS P2P WEBRTC ]
              </span>
              <span className="text-[9px] font-mono text-[#16A34A] dark:text-[#22C55E] uppercase font-bold bg-emerald-50 dark:bg-[#061508] border border-emerald-200 dark:border-[#16381C] px-2 py-0.5">
                ● SINCRONIA ATIVA
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white uppercase tracking-tight truncate">
              GERENCIAR REDE DE AMIGOS
            </h1>
            <p className="text-[11px] font-mono text-slate-500 dark:text-[#888] truncate">
              Adicione conexões por e-mail ou nickname e inicie salas compartilhadas instantâneas.
            </p>
          </div>
        </div>

        {/* Center: 3D Neural P2P Mesh */}
        <div className="hidden lg:flex items-center justify-center relative z-10">
          <FriendsMesh3DView isPro={isPro} className="w-24 h-24 relative" />
        </div>

        {/* Right Stats */}
        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 dark:bg-[#060608] border border-slate-200 dark:border-[#222] font-mono text-[10px] transition-colors">
            <span className="text-slate-500 dark:text-[#777] uppercase">AMIGOS:</span>
            <strong className="text-slate-900 dark:text-white font-bold text-sm">{friends.length}</strong>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 dark:bg-[#060608] border border-slate-200 dark:border-[#222] font-mono text-[10px] transition-colors">
            <span className="text-slate-500 dark:text-[#777] uppercase">SOLICITAÇÕES:</span>
            <strong className="text-[#FF5A00] font-bold text-sm">{receivedRequests.length}</strong>
          </div>
        </div>
      </div>

      {/* ── ADD FRIEND QUICK INPUT BAR ─────────────────────────────── */}
      <form
        onSubmit={handleSendRequest}
        className="p-4 bg-white dark:bg-[#09090D] border border-slate-200 dark:border-[#222] flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shadow-sm dark:shadow-xl relative transition-colors"
      >
        <div className="flex items-center gap-2 text-orange-600 dark:text-[#FF5A00] font-mono text-[11px] font-bold uppercase shrink-0">
          <UserPlus className="w-4 h-4" />
          <span>[ ADICIONAR NOVO AMIGO ]:</span>
        </div>

        <input
          type="text"
          value={targetInput}
          disabled={!emailVerified}
          onChange={(e) => setTargetInput(e.target.value)}
          placeholder={!emailVerified ? "Confirme seu e-mail para desbloquear a adição de amigos..." : "Digite o e-mail ou nickname exato do amigo..."}
          className="flex-1 h-10 bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-[#333] text-slate-900 dark:text-white px-3 text-[11px] font-mono outline-none focus:border-[#FF5A00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        />

        <button
          type="submit"
          disabled={sending || !emailVerified}
          className="px-6 py-2.5 bg-[#FF5A00] hover:bg-slate-900 dark:hover:bg-white text-white dark:text-black font-mono font-black text-[11px] uppercase tracking-widest transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          <span>{!emailVerified ? 'E-MAIL NÃO CONFIRMADO' : 'ENVIAR PEDIDO'}</span>
        </button>
      </form>

      {/* ── MAIN GRID: LIST (LEFT) & STATS/SUGGESTIONS (RIGHT) ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
        
        {/* Main Friends List Area */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-4 min-w-0">
          
          {/* Tabs and Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#222] pb-3">
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab('friends')}
                className={cn(
                  'px-3.5 py-1.5 text-[10px] font-mono uppercase font-bold border transition-all cursor-pointer flex items-center gap-1.5',
                  activeTab === 'friends'
                    ? 'bg-[#FF5A00] text-white dark:text-black border-[#FF5A00] shadow-sm'
                    : 'bg-white dark:bg-[#09090D] text-slate-600 dark:text-[#777] border-slate-200 dark:border-[#222] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-[#333]'
                )}
              >
                <span>[ AMIGOS ]</span>
                <span className="text-[9px] px-1 py-0.2 bg-black/10 dark:bg-black/40 text-current font-bold">
                  {friends.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('requests')}
                className={cn(
                  'px-3.5 py-1.5 text-[10px] font-mono uppercase font-bold border transition-all cursor-pointer flex items-center gap-1.5',
                  activeTab === 'requests'
                    ? 'bg-[#FF5A00] text-white dark:text-black border-[#FF5A00] shadow-sm'
                    : 'bg-white dark:bg-[#09090D] text-slate-600 dark:text-[#777] border-slate-200 dark:border-[#222] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-[#333]'
                )}
              >
                <span>[ SOLICITAÇÕES ]</span>
                {receivedRequests.length > 0 && (
                  <span className="text-[9px] px-1.5 py-0.2 bg-[#EF2020] text-white font-bold animate-pulse">
                    {receivedRequests.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('pending')}
                className={cn(
                  'px-3.5 py-1.5 text-[10px] font-mono uppercase font-bold border transition-all cursor-pointer flex items-center gap-1.5',
                  activeTab === 'pending'
                    ? 'bg-[#FF5A00] text-white dark:text-black border-[#FF5A00] shadow-sm'
                    : 'bg-white dark:bg-[#09090D] text-slate-600 dark:text-[#777] border-slate-200 dark:border-[#222] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-[#333]'
                )}
              >
                <span>[ PENDENTES ]</span>
                <span className="text-[9px] px-1 py-0.2 bg-black/10 dark:bg-black/40 text-current font-bold">
                  {sentRequests.length}
                </span>
              </button>
            </div>

            {/* Search & Select All Controls */}
            {activeTab === 'friends' && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 dark:text-[#555] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filtrar amigo..."
                    className="bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-[#222] text-slate-900 dark:text-[#F5F5F5] pl-8 pr-3 py-1 text-[10px] font-mono outline-none focus:border-[#FF5A00] w-36 sm:w-44 transition-colors"
                  />
                </div>

                <button
                  onClick={selectAllFriends}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-[#121218] hover:bg-slate-200 dark:hover:bg-[#1A1A24] border border-slate-300 dark:border-[#333] hover:border-[#FF5A00] text-[9px] font-mono uppercase text-slate-700 dark:text-[#AAA] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                  title="Selecionar / Desmarcar Todos"
                >
                  {selectedFriendIds.size === friends.length && friends.length > 0 ? (
                    <CheckSquare className="w-3 h-3 text-[#FF5A00]" />
                  ) : (
                    <Square className="w-3 h-3" />
                  )}
                  <span>TODOS</span>
                </button>
              </div>
            )}
          </div>

          {/* List Content */}
          {loading ? (
            <div className="p-12 bg-white dark:bg-[#09090D] border border-slate-200 dark:border-[#222] text-center font-mono text-[11px] text-slate-500 dark:text-[#777]">
              CARREGANDO REDE DE AMIGOS...
            </div>
          ) : activeTab === 'friends' ? (
            <div>
              {filteredFriends.length === 0 ? (
                <div className="p-12 bg-white dark:bg-[#09090D] border border-slate-200 dark:border-[#222] text-center font-mono text-[11px] text-slate-500 dark:text-[#777] space-y-2">
                  <p>NENHUM AMIGO ENCONTRADO.</p>
                  <p className="text-[9px] text-slate-400 dark:text-[#555]">
                    Envie pedidos de amizade utilizando o campo acima para formar seu grupo de transmissão.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFriends.map((friend) => {
                    const activeRoom = activeRooms.find((r) =>
                      r.viewers.some((v) => v.userId === friend.id)
                    )
                    const presence = presenceMap[friend.id]

                    const isWatching = !!activeRoom || presence?.status === 'in_room'
                    const isOnline = !isWatching && (presence?.status === 'online' || presence?.status === 'in_room')
                    const videoTitle = activeRoom?.videoTitle || presence?.videoTitle || null
                    const videoUrl = activeRoom?.videoUrl || presence?.videoUrl || null
                    const roomId = activeRoom?.roomId || presence?.roomId
                    const miniThumb = videoTitle ? getThumbnailForVideo(videoUrl, videoTitle) : null
                    const isSelected = selectedFriendIds.has(friend.id)

                    return (
                      <div
                        key={friend.id}
                        onClick={() => toggleFriendSelection(friend.id)}
                        className={cn(
                          'p-3 border flex items-center justify-between gap-4 transition-all duration-150 cursor-pointer select-none',
                          isSelected
                            ? 'bg-orange-50 dark:bg-[#1E1408] border-[#FF5A00] shadow-sm dark:shadow-[0_0_15px_rgba(255,90,0,0.15)]'
                            : 'bg-white dark:bg-[#09090D] border-slate-200 dark:border-[#1C1C24] hover:bg-slate-50 dark:hover:bg-[#0E0E14] hover:border-slate-300 dark:hover:border-[#333]'
                        )}
                      >
                        {/* Left: Checkbox, Avatar, Name & Handle */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          
                          {/* Brutalist Checkbox */}
                          <div
                            className={cn(
                              'w-5 h-5 border flex items-center justify-center transition-all shrink-0',
                              isSelected
                                ? 'bg-[#FF5A00] border-[#FF5A00] text-white dark:text-black font-black'
                                : 'bg-slate-50 dark:bg-[#050508] border-slate-300 dark:border-[#333] group-hover:border-[#FF5A00]'
                            )}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>

                          {/* Avatar with live presence ring */}
                          <div className="relative shrink-0">
                            {friend.image ? (
                              <img
                                src={friend.image}
                                alt={friend.name || 'Friend'}
                                className="w-9 h-9 rounded border border-slate-200 dark:border-[#333] object-cover"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded bg-slate-100 dark:bg-[#151520] border border-slate-200 dark:border-[#333] flex items-center justify-center font-mono font-bold text-xs text-[#FF5A00]">
                                {(friend.name || friend.email).charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div
                              className={cn(
                                'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#050505]',
                                isWatching
                                  ? 'bg-[#EF2020] animate-ping'
                                  : isOnline
                                  ? 'bg-[#22C55E]'
                                  : 'bg-slate-400 dark:bg-[#555]'
                              )}
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[12px] font-mono font-bold text-slate-900 dark:text-white uppercase truncate">
                              {friend.name || friend.email.split('@')[0]}
                            </p>
                            <p className="text-[10px] font-mono text-slate-500 dark:text-[#777] truncate">
                              {friend.email}
                            </p>
                          </div>
                        </div>

                        {/* Middle: Live Watch Status & Preview */}
                        <div className="hidden sm:flex items-center gap-3 flex-1 justify-center">
                          {isWatching && videoTitle ? (
                            <div className="flex items-center gap-2.5">
                              {miniThumb && (
                                <div className="w-12 h-8 bg-black border border-slate-300 dark:border-[#333] overflow-hidden shrink-0">
                                  <img src={miniThumb} alt="Video" className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div className="text-left min-w-0">
                                <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold text-[#EF2020] uppercase">
                                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                                  ASSISTINDO AGORA
                                </span>
                                <p className="text-[10px] font-mono text-slate-700 dark:text-[#BBB] truncate max-w-[140px]">
                                  {videoTitle}
                                </p>
                              </div>
                            </div>
                          ) : isOnline ? (
                            <span className="inline-flex items-center gap-1.5 font-mono text-[9px] text-[#16A34A] dark:text-[#22C55E] font-bold uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] dark:bg-[#22C55E]" />
                              ONLINE NO LOBBY
                            </span>
                          ) : (
                            <span className="font-mono text-[9px] text-slate-400 dark:text-[#555] uppercase">
                              OFFLINE
                            </span>
                          )}
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                          {isWatching && roomId ? (
                            <button
                              onClick={() => router.push(`/room/${roomId}`)}
                              className="px-3 py-1.5 bg-[#EF2020] text-white hover:bg-slate-900 dark:hover:bg-white dark:hover:text-black font-mono font-bold text-[9px] uppercase transition-colors flex items-center gap-1 cursor-pointer shadow-[0_0_10px_rgba(239,32,32,0.4)]"
                            >
                              <Play className="w-2.5 h-2.5 fill-current" />
                              <span>ENTRAR</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSendSingleRoomInvite(friend)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-[#FF5A00] dark:bg-[#151520] dark:hover:bg-[#FF5A00] text-slate-800 hover:text-white dark:text-white dark:hover:text-black font-mono font-bold text-[9px] uppercase border border-slate-300 dark:border-[#333] hover:border-[#FF5A00] transition-colors flex items-center gap-1 cursor-pointer"
                              title="Convidar para sala"
                            >
                              <Play className="w-2.5 h-2.5 fill-current" />
                              <span>CONVIDAR</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleRemoveFriend(friend)}
                            className="p-1.5 border border-slate-200 dark:border-[#222] hover:border-[#EF2020] text-slate-400 dark:text-[#666] hover:text-[#EF2020] transition-colors cursor-pointer"
                            title="Remover amigo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ) : activeTab === 'requests' ? (
            /* Tab: Requests */
            <div className="space-y-2">
              {receivedRequests.length === 0 ? (
                <div className="p-12 bg-white dark:bg-[#09090D] border border-slate-200 dark:border-[#222] text-center font-mono text-[11px] text-slate-500 dark:text-[#777]">
                  NENHUMA SOLICITAÇÃO DE AMIZADE PENDENTE.
                </div>
              ) : (
                receivedRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white dark:bg-[#09090D] border border-slate-200 dark:border-[#1C1C24] p-3 flex items-center justify-between gap-3 shadow-xs transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-slate-100 dark:bg-[#151520] border border-slate-300 dark:border-[#333] flex items-center justify-center font-mono font-bold text-xs text-[#FF5A00]">
                        {(req.sender?.name || req.sender?.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-mono font-bold text-slate-900 dark:text-white uppercase truncate">
                          {req.sender?.name || req.sender?.email.split('@')[0]}
                        </p>
                        <p className="text-[10px] font-mono text-slate-500 dark:text-[#777] truncate">{req.sender?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleAccept(req.id)}
                        className="px-3.5 py-1.5 bg-[#FF5A00] hover:bg-slate-900 dark:hover:bg-white text-white dark:text-black font-mono font-black text-[10px] uppercase transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>ACEITAR</span>
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        className="p-1.5 border border-slate-300 dark:border-[#333] hover:border-[#EF2020] text-slate-400 dark:text-[#777] hover:text-[#EF2020] transition-colors cursor-pointer"
                        title="Recusar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Tab: Pending */
            <div className="space-y-2">
              {sentRequests.length === 0 ? (
                <div className="p-12 bg-white dark:bg-[#09090D] border border-slate-200 dark:border-[#222] text-center font-mono text-[11px] text-slate-500 dark:text-[#777]">
                  NENHUMA SOLICITAÇÃO ENVIADA PENDENTE.
                </div>
              ) : (
                sentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white dark:bg-[#09090D] border border-slate-200 dark:border-[#1C1C24] p-3 flex items-center justify-between gap-3 shadow-xs transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-slate-100 dark:bg-[#151520] border border-slate-300 dark:border-[#333] flex items-center justify-center font-mono font-bold text-xs text-[#FF5A00]">
                        {(req.receiver?.name || req.receiver?.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-mono font-bold text-slate-900 dark:text-white uppercase truncate">
                          {req.receiver?.name || req.receiver?.email.split('@')[0]}
                        </p>
                        <p className="text-[10px] font-mono text-slate-500 dark:text-[#777] truncate">Aguardando resposta...</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 dark:text-[#888] bg-slate-100 dark:bg-[#111] px-2.5 py-1 border border-slate-200 dark:border-[#222] uppercase">
                      ENVIADO
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6 lg:sticky lg:top-6">
          <FriendSuggestions onRequestSent={loadData} />
          <FriendStats
            friendsCount={friends.length}
            pendingCount={sentRequests.length}
            requestsCount={receivedRequests.length}
          />
        </div>
      </div>

      {/* ── FLOATING CYBERPUNK COMMAND DOCK (MULTI-SELECT ROOM CREATOR) ── */}
      {selectedFriendIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-in slide-in-from-bottom duration-200">
          <div className="bg-white dark:bg-[#0D0D12] border-2 border-[#FF5A00] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
            
            {/* Selection info & Stacked Avatars */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2 overflow-hidden">
                {selectedFriendsList.slice(0, 5).map((f, idx) => (
                  <div
                    key={f.id}
                    className="w-8 h-8 rounded-full border-2 border-white dark:border-[#0D0D12] bg-[#FF5A00] flex items-center justify-center font-mono font-bold text-xs text-white dark:text-black"
                  >
                    {(f.name || f.email).charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>

              <div>
                <span className="text-sm font-mono font-black text-slate-900 dark:text-white uppercase block">
                  {selectedFriendIds.size} AMIGO(S) SELECIONADO(S)
                </span>
                <span className="text-[10px] font-mono text-orange-600 dark:text-[#FF5A00]">
                  PRONTO PARA INICIAR WATCH PARTY EM GRUPO
                </span>
              </div>
            </div>

            {/* Actions: Deselect & Launch Room Dialog */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setSelectedFriendIds(new Set())}
                className="px-3.5 py-2.5 border border-slate-300 dark:border-[#333] hover:border-[#EF2020] text-slate-600 dark:text-[#888] hover:text-[#EF2020] font-mono text-[10px] uppercase font-bold transition-colors cursor-pointer"
              >
                DESMARCAR
              </button>

              <button
                onClick={() => setCreateRoomOpen(true)}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-[#FF5A00] hover:bg-slate-900 dark:hover:bg-white text-white dark:text-black font-mono font-black text-[11px] uppercase tracking-widest transition-all duration-150 shadow-[0_0_20px_rgba(255,90,0,0.4)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>[ CRIAR SALA COM ELES ({selectedFriendIds.size}) ]</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Room Dialog with auto-inviting multi-selected friends */}
      {createRoomOpen && (
        <CreateRoomDialog
          invitedFriends={selectedFriendsList}
          onClose={() => setCreateRoomOpen(false)}
        />
      )}
    </div>
  )
}
