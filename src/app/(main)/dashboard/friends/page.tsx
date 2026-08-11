'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Users, UserPlus, Check, X, Trash2, Send,
  Mail, Play, Loader2, Sparkles, Clock, SquareCheck,
  Search, SlidersHorizontal, MessageSquare, MoreHorizontal, ShieldOff
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { HomeHeader } from '../components/home-header'
import { FriendSuggestions } from './components/friend-suggestions'
import { FriendStats } from './components/friend-stats'
import { FriendImport } from './components/friend-import'

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

function getThumbnailForVideo(url?: string | null, title?: string | null): string | null {
  if (url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`
    }
  }
  if (title) {
    const lower = title.toLowerCase()
    if (lower.includes('duna') || lower.includes('dune')) return 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80'
    if (lower.includes('one piece') || lower.includes('anime')) return 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=200&auto=format&fit=crop&q=80'
    if (lower.includes('arcane')) return 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&auto=format&fit=crop&q=80'
    if (lower.includes('spider') || lower.includes('aranha')) return 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=200&auto=format&fit=crop&q=80'
  }
  return null
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
  const [activeTab, setActiveTab] = useState<'friends' | 'pending' | 'requests' | 'blocked'>('friends')
  const [searchFilter, setSearchFilter] = useState('')

  // Multi-friend select mode
  const [selectMode, setSelectMode] = useState(false)
  const [selectedFriendIds, setSelectedFriendIds] = useState<Set<string>>(new Set())
  const [socket, setSocket] = useState<Socket | null>(null)
  const [activeRooms, setActiveRooms] = useState<Array<{ roomId: string; videoTitle: string; videoUrl?: string; viewers: Array<{ userId: string }> }>>([])
  const [presenceMap, setPresenceMap] = useState<Record<string, { status: 'online' | 'in_room'; roomId?: string; videoTitle?: string; videoUrl?: string }>>({})

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

      newSocket.on('active-rooms-update', (rooms) => {
        if (!cancelled && Array.isArray(rooms)) {
          setActiveRooms(rooms)
        }
      })

      newSocket.on('active-rooms-list', (rooms) => {
        if (!cancelled && Array.isArray(rooms)) {
          setActiveRooms(rooms)
        }
      })

      newSocket.on('presence-update', (list) => {
        if (!cancelled && Array.isArray(list)) {
          const map: Record<string, any> = {}
          for (const item of list) {
            if (item.userId) map[item.userId] = item
          }
          setPresenceMap(map)
        }
      })

      newSocket.on('presence-list', (list) => {
        if (!cancelled && Array.isArray(list)) {
          const map: Record<string, any> = {}
          for (const item of list) {
            if (item.userId) map[item.userId] = item
          }
          setPresenceMap(map)
        }
      })

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

  const handleSendRoomInvite = useCallback((friend: FriendUser) => {
    const code = generateRoomCode()
    if (!socket) return

    socket.emit('invite-to-room', {
      targetUserId: friend.id,
      roomCode: code,
      senderName: session?.user?.name || session?.user?.email || 'Um amigo'
    })

    toast.success(`Convite para a sala ${code} enviado para ${friend.name || friend.email}!`)
    router.push(`/room/${code}`)
  }, [socket, session, router])

  const toggleFriendSelection = useCallback((id: string) => {
    setSelectedFriendIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const filteredFriends = friends.filter((f) => {
    if (!searchFilter.trim()) return true
    const term = searchFilter.toLowerCase()
    return (
      (f.name && f.name.toLowerCase().includes(term)) ||
      f.email.toLowerCase().includes(term)
    )
  })

  return (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <HomeHeader user={session?.user} />

      {/* Main Grid: 3 columns main, 1 column right sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
        {/* Main Column */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-6 min-w-0">
          
          {/* ═══ HERO BANNER ═══ */}
          <div className="relative overflow-hidden rounded-2xl border border-[#242424] p-6 sm:p-8 bg-gradient-to-r from-[rgba(255,90,0,0.12)] via-[#0B0B0B] to-[#0B0B0B] flex items-center justify-between">
            <div className="space-y-2 max-w-lg z-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF5A00]/10 border border-[#FF5A00]/20 text-[#FF5A00] text-[11px] font-bold uppercase tracking-wider">
                <Users className="w-3.5 h-3.5" />
                Rede Social
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5]">
                Gerenciar <span className="brand-gradient-text">amigos</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#8A8A8A] leading-relaxed">
                Adicione amigos pelo nome de usuário ou e-mail e convide-os em tempo real para assistir com você nas salas.
              </p>
            </div>

            <div className="relative hidden md:flex items-center justify-center w-28 h-28 shrink-0">
              <div className="absolute inset-0 bg-[#FF5A00]/15 rounded-full blur-2xl pointer-events-none" />
              <div className="w-20 h-20 rounded-full border border-[#FF5A00]/40 bg-[#151515] flex items-center justify-center relative shadow-2xl">
                <Users className="w-10 h-10 text-[#FF5A00]" />
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full brand-gradient flex items-center justify-center text-white text-xs font-bold border-2 border-[#0B0B0B] shadow-md">
                  +
                </div>
              </div>
            </div>
          </div>

          {/* ═══ CARD: ADICIONAR NOVO AMIGO ═══ */}
          <div className="bg-[#0B0B0B] border border-[#242424] rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#FF5A00]" />
              <h3 className="text-[#F5F5F5] font-bold text-sm">Adicionar novo amigo</h3>
            </div>

            <form onSubmit={handleSendRequest} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-[#5F5F5F] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  placeholder="Digite o nome de usuário ou e-mail..."
                  className="w-full bg-[#151515] border border-[#242424] text-[#F5F5F5] pl-11 pr-4 py-3 rounded-xl text-sm placeholder:text-[#5F5F5F] outline-none focus:border-[#FF5A00] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={sending || !targetInput.trim()}
                className={cn(
                  "px-5 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shrink-0",
                  targetInput.trim() && !sending
                    ? "brand-gradient text-white brand-glow-strong hover:brightness-110 active:scale-[0.98]"
                    : "bg-[#151515] text-[#5F5F5F] cursor-not-allowed"
                )}
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? 'Enviando...' : 'Enviar pedido'}
              </button>
            </form>
          </div>

          {/* ═══ MAIN FRIENDS LIST & TABS CARD ═══ */}
          <div className="bg-[#0B0B0B] border border-[#242424] rounded-2xl p-5 sm:p-6 space-y-5">
            {/* Navigation Tabs Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#242424] pb-4">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setActiveTab('friends')}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative",
                    activeTab === 'friends'
                      ? "text-[#F5F5F5] bg-[#151515] border border-[#242424]"
                      : "text-[#8A8A8A] hover:text-[#F5F5F5]"
                  )}
                >
                  Amigos
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-extrabold",
                    activeTab === 'friends' ? "bg-[#FF5A00] text-white" : "bg-[#151515] text-[#8A8A8A]"
                  )}>
                    {friends.length}
                  </span>
                  {activeTab === 'friends' && (
                    <div className="absolute -bottom-4 left-0 right-0 h-[2px] brand-gradient" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('pending')}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative",
                    activeTab === 'pending'
                      ? "text-[#F5F5F5] bg-[#151515] border border-[#242424]"
                      : "text-[#8A8A8A] hover:text-[#F5F5F5]"
                  )}
                >
                  Pendentes
                  <span className="px-2 py-0.5 rounded-full bg-[#151515] text-[#8A8A8A] text-[10px] font-extrabold">
                    {sentRequests.length}
                  </span>
                  {activeTab === 'pending' && (
                    <div className="absolute -bottom-4 left-0 right-0 h-[2px] brand-gradient" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('requests')}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative",
                    activeTab === 'requests'
                      ? "text-[#F5F5F5] bg-[#151515] border border-[#242424]"
                      : "text-[#8A8A8A] hover:text-[#F5F5F5]"
                  )}
                >
                  Solicitações
                  {receivedRequests.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#EF2020] text-white text-[10px] font-extrabold animate-pulse">
                      {receivedRequests.length}
                    </span>
                  )}
                  {activeTab === 'requests' && (
                    <div className="absolute -bottom-4 left-0 right-0 h-[2px] brand-gradient" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('blocked')}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative",
                    activeTab === 'blocked'
                      ? "text-[#F5F5F5] bg-[#151515] border border-[#242424]"
                      : "text-[#8A8A8A] hover:text-[#F5F5F5]"
                  )}
                >
                  Bloqueados
                  <span className="px-2 py-0.5 rounded-full bg-[#151515] text-[#8A8A8A] text-[10px] font-extrabold">0</span>
                  {activeTab === 'blocked' && (
                    <div className="absolute -bottom-4 left-0 right-0 h-[2px] brand-gradient" />
                  )}
                </button>
              </div>

              {/* Table controls: Search filter & Selection mode */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#5F5F5F] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filtrar por nome..."
                    className="bg-[#151515] border border-[#242424] text-[#F5F5F5] pl-8 pr-3 py-1.5 rounded-xl text-xs placeholder:text-[#5F5F5F] outline-none focus:border-[#FF5A00] transition-all w-36 sm:w-44"
                  />
                </div>

                <button
                  onClick={() => setSelectMode(!selectMode)}
                  className={cn(
                    "p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all",
                    selectMode
                      ? "border-[#FF5A00] bg-[#FF5A00]/10 text-[#FF5A00]"
                      : "border-[#242424] bg-[#151515] text-[#8A8A8A] hover:text-[#F5F5F5]"
                  )}
                  title="Seleção múltipla"
                >
                  <SquareCheck className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List Rows */}
            {loading ? (
              <div className="py-12 text-center text-xs text-[#8A8A8A]">Carregando amigos...</div>
            ) : activeTab === 'friends' ? (
              <div>
                {filteredFriends.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#8A8A8A]">
                    Nenhum amigo encontrado.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredFriends.map((friend) => {
                      const activeRoom = activeRooms.find(r => r.viewers.some(v => v.userId === friend.id))
                      const presence = presenceMap[friend.id]

                      const isWatching = !!activeRoom || presence?.status === 'in_room'
                      const isOnline = !isWatching && (presence?.status === 'online' || presence?.status === 'in_room')
                      const videoTitle = activeRoom?.videoTitle || presence?.videoTitle || null
                      const videoUrl = activeRoom?.videoUrl || presence?.videoUrl || null
                      const roomId = activeRoom?.roomId || presence?.roomId
                      const miniThumb = videoTitle ? getThumbnailForVideo(videoUrl, videoTitle) : null

                      return (
                        <div
                          key={friend.id}
                          className="bg-[#0B0B0B] hover:bg-[#111111] border border-[#242424] hover:border-[#FF5A00]/30 rounded-xl p-3 flex items-center justify-between gap-4 transition-all group"
                        >
                          {/* Left: Checkbox (if select mode), Avatar & Name */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {selectMode && (
                              <div
                                onClick={() => toggleFriendSelection(friend.id)}
                                className={cn(
                                  "w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all shrink-0",
                                  selectedFriendIds.has(friend.id)
                                    ? "bg-[#FF5A00] border-[#FF5A00]"
                                    : "border-[#242424] bg-[#151515]"
                                )}
                              >
                                {selectedFriendIds.has(friend.id) && <Check className="w-3 h-3 text-white" />}
                              </div>
                            )}

                            <div className="relative shrink-0">
                              <Avatar className="w-11 h-11 border border-[#242424]">
                                <AvatarImage src={friend.image || undefined} />
                                <AvatarFallback className="bg-[#151515] text-[#FF5A00] font-bold text-xs">
                                  {(friend.name || friend.email).charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className={cn(
                                "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0B0B0B]",
                                isWatching ? "bg-[#EF2020] animate-pulse" : isOnline ? "bg-emerald-500" : "bg-zinc-600"
                              )} />
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#F5F5F5] group-hover:text-[#FF5A00] transition-colors truncate">
                                {friend.name || friend.email.split('@')[0]}
                              </p>
                              <p className="text-[11px] text-[#8A8A8A] truncate">
                                @{friend.name ? friend.name.toLowerCase().replace(/\s+/g, '') : friend.email.split('@')[0]}
                              </p>
                            </div>
                          </div>

                          {/* Middle: Rich Presence Status & Mini Video Thumbnail */}
                          <div className="flex items-center gap-3 flex-1 justify-center hidden sm:flex">
                            {isWatching && videoTitle ? (
                              <div className="flex items-center gap-3">
                                <div className="text-left">
                                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                    Assistindo agora
                                  </span>
                                  <p className="text-[11px] text-[#8A8A8A] truncate max-w-[150px]">
                                    {videoTitle}
                                  </p>
                                </div>

                                {miniThumb && (
                                  <div className="w-10 h-7 rounded-md bg-[#151515] overflow-hidden border border-[#242424] shrink-0">
                                    <img src={miniThumb} alt={videoTitle} className="w-full h-full object-cover" />
                                  </div>
                                )}
                              </div>
                            ) : isOnline ? (
                              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                Online
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs text-[#5F5F5F] font-medium">
                                <span className="w-2 h-2 rounded-full bg-zinc-600" />
                                Offline
                              </span>
                            )}
                          </div>

                          {/* Right: Action Buttons */}
                          <div className="flex items-center gap-2 shrink-0">
                            {isWatching && roomId ? (
                              <button
                                onClick={() => router.push(`/room/${roomId}`)}
                                className="px-3.5 py-1.5 rounded-xl brand-gradient text-white text-xs font-bold brand-glow-strong hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
                              >
                                <Play className="w-3 h-3 fill-white" />
                                Entrar
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSendRoomInvite(friend)}
                                className="p-2 rounded-xl bg-[#151515] hover:bg-[#FF5A00] text-[#8A8A8A] hover:text-white transition-all"
                                title="Convidar para sala"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                            )}

                            <DropdownMenu>
                              <DropdownMenuTrigger className="p-2 rounded-xl bg-[#151515] hover:bg-[#242424] text-[#8A8A8A] hover:text-[#F5F5F5] transition-all outline-none">
                                <MoreHorizontal className="w-4 h-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 bg-[#0B0B0B] border-[#242424] text-[#F5F5F5] p-1.5 shadow-2xl">
                                <DropdownMenuItem
                                  onClick={() => handleSendRoomInvite(friend)}
                                  className="px-3 py-2 rounded-lg text-xs font-medium hover:bg-[#151515] hover:text-[#FF5A00] cursor-pointer flex items-center gap-2"
                                >
                                  <Play className="w-3.5 h-3.5 text-[#FF5A00]" />
                                  Convidar para sala
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-[#242424]" />
                                <DropdownMenuItem
                                  onClick={() => handleRemoveFriend(friend)}
                                  className="px-3 py-2 rounded-lg text-xs font-medium hover:bg-[#EF2020]/10 hover:text-[#EF2020] text-[#EF2020] cursor-pointer flex items-center gap-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-[#EF2020]" />
                                  Remover amigo
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : activeTab === 'requests' ? (
              <div className="space-y-2">
                {receivedRequests.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#8A8A8A]">
                    Nenhuma solicitação de amizade pendente.
                  </div>
                ) : (
                  receivedRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-[#0B0B0B] border border-[#242424] rounded-xl p-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="w-10 h-10 border border-[#242424] shrink-0">
                          <AvatarImage src={req.sender?.image || undefined} />
                          <AvatarFallback className="bg-[#151515] text-[#FF5A00] font-bold text-xs">
                            {(req.sender?.name || req.sender?.email || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#F5F5F5] truncate">
                            {req.sender?.name || req.sender?.email.split('@')[0]}
                          </p>
                          <p className="text-[11px] text-[#8A8A8A] truncate">{req.sender?.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleAccept(req.id)}
                          className="px-3.5 py-1.5 rounded-xl brand-gradient text-white text-xs font-bold flex items-center gap-1 hover:brightness-110 active:scale-95 transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Aceitar
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="p-1.5 rounded-xl bg-[#151515] hover:bg-[#EF2020]/20 text-[#8A8A8A] hover:text-[#EF2020] transition-all"
                          title="Recusar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : activeTab === 'pending' ? (
              <div className="space-y-2">
                {sentRequests.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#8A8A8A]">
                    Nenhuma solicitação enviada.
                  </div>
                ) : (
                  sentRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-[#0B0B0B] border border-[#242424] rounded-xl p-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="w-10 h-10 border border-[#242424] shrink-0">
                          <AvatarImage src={req.receiver?.image || undefined} />
                          <AvatarFallback className="bg-[#151515] text-[#FF5A00] font-bold text-xs">
                            {(req.receiver?.name || req.receiver?.email || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#F5F5F5] truncate">
                            {req.receiver?.name || req.receiver?.email.split('@')[0]}
                          </p>
                          <p className="text-[11px] text-[#8A8A8A] truncate">Aguardando resposta...</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[#8A8A8A] bg-[#151515] px-3 py-1 rounded-lg border border-[#242424]">
                        Enviado
                      </span>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#8A8A8A]">
                Nenhum usuário bloqueado.
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6 lg:sticky lg:top-6">
          <FriendSuggestions />
          <FriendStats
            friendsCount={friends.length}
            pendingCount={sentRequests.length}
            requestsCount={receivedRequests.length}
          />
          <FriendImport />
        </div>
      </div>
    </div>
  )
}
