'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserPlus,
  Check,
  Copy,
  Radio,
  Tv,
  ShieldCheck,
  LogIn,
  ExternalLink,
  Users,
  Clock,
  Sparkles,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLandingSocket } from '@/lib/useLandingSocket'
import { sendFriendRequest } from '@/app/(main)/actions'
import { toast } from 'sonner'
import Link from 'next/link'

interface DisplayUser {
  id: string
  name: string
  alias: string
  color: string
  image?: string
  status: 'online' | 'in_room' | 'offline'
  roomInfo?: string | null
  roomId?: string | null
  lastSeen: number
  isFriend?: boolean
  isPending?: boolean
  invited?: boolean
}

export function SectionSocial() {
  const { data: session } = useSession()
  const router = useRouter()
  const { isConnected, viewerCount, activeRooms, presenceUsers, inviteToRoom } =
    useLandingSocket()

  const [dbUsers, setDbUsers] = useState<DisplayUser[]>([])
  const [invitedMap, setInvitedMap] = useState<Record<string, boolean>>({})
  const [pendingFriendMap, setPendingFriendMap] = useState<Record<string, boolean>>({})
  const [copiedLink, setCopiedLink] = useState(false)
  const [currentOrigin, setCurrentOrigin] = useState('https://videomax-backend.vercel.app')
  const [currentHost, setCurrentHost] = useState('videomax-backend.vercel.app')

  // Set real domain once on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentOrigin(window.location.origin)
      setCurrentHost(window.location.host)
    }
  }, [])

  // 1. Fetch initial real database users & friendship relation
  useEffect(() => {
    let isSubscribed = true
    async function loadRecentUsers() {
      try {
        const res = await fetch('/api/landing/recent-users')
        const data = await res.json()
        if (isSubscribed && data.success && Array.isArray(data.users)) {
          setDbUsers(data.users)
        }
      } catch (err) {
        console.error('Failed to load recent users:', err)
      }
    }
    loadRecentUsers()
    return () => {
      isSubscribed = false
    }
  }, [session?.user?.id])

  // 2. Real-time Merge: Database Users + WebSocket Live Presence (excluding Anonymous & Current User)
  const displayedUsers = useMemo(() => {
    const userMap = new Map<string, DisplayUser>()
    const currentUserId = session?.user?.id

    // 1. Seed with real registered database users
    for (const u of dbUsers) {
      if (currentUserId && u.id === currentUserId) continue
      userMap.set(u.id, {
        ...u,
        isPending: u.isPending || !!pendingFriendMap[u.id],
        invited: !!invitedMap[u.id],
      })
    }

    // 2. Merge WebSocket live presence for real users
    for (const p of presenceUsers) {
      if (!p.userId) continue
      if (currentUserId && p.userId === currentUserId) continue

      // Filter out guest/anonymous sockets
      const rawName = p.userName || ''
      if (
        rawName.toLowerCase() === 'anonymous' ||
        rawName.toLowerCase() === 'usuário' ||
        p.userId.startsWith('socket_') ||
        p.userId.length < 5
      ) {
        continue
      }

      const existing = userMap.get(p.userId)
      const alias = rawName.includes('@') ? rawName.split('@')[0] : rawName

      const finalStatus: 'online' | 'in_room' | 'offline' =
        p.status === 'in_room' ? 'in_room' : p.status === 'online' ? 'online' : 'offline'

      userMap.set(p.userId, {
        id: p.userId,
        name: rawName || existing?.name || 'Usuário VideoMax',
        alias: alias.toUpperCase(),
        color: p.chatColor || existing?.color || '#FF5A00',
        image: p.userImage || existing?.image || '',
        status: finalStatus,
        roomId: p.roomId || null,
        roomInfo: p.roomId ? `SALA ${p.roomId}` : p.videoTitle || null,
        lastSeen: p.lastSeen || Date.now(),
        isFriend: existing?.isFriend || false,
        isPending: existing?.isPending || !!pendingFriendMap[p.userId],
        invited: !!invitedMap[p.userId],
      })
    }

    // 3. Sort by priority: (in_room -> online -> offline) and then lastSeen descending
    const list = Array.from(userMap.values()).sort((a, b) => {
      const priority = (s: string) => (s === 'in_room' ? 3 : s === 'online' ? 2 : 1)
      const diffPriority = priority(b.status) - priority(a.status)
      if (diffPriority !== 0) return diffPriority
      return (b.lastSeen || 0) - (a.lastSeen || 0)
    })

    // Take top 5 most recently active real users
    return list.slice(0, 5)
  }, [dbUsers, presenceUsers, session?.user?.id, invitedMap, pendingFriendMap])

  // Handle room link copy
  const realRoomUrl = `${currentOrigin}/room/MAX-8829`
  const displayRoomUrl = `${currentHost}/room/MAX-8829`

  const copyRoomLink = () => {
    navigator.clipboard?.writeText(realRoomUrl)
    setCopiedLink(true)
    toast.success('Link da sala copiado!', {
      description: realRoomUrl,
    })
    setTimeout(() => setCopiedLink(false), 2500)
  }

  // Handle invite / friend actions
  const handleAction = async (user: DisplayUser) => {
    // If not authenticated, redirect to login
    if (!session?.user) {
      toast.info('Autenticação necessária', {
        description: 'Faça login para interagir com os membros da rede.',
      })
      router.push(`/login?callbackUrl=${encodeURIComponent('/#comunidade')}`)
      return
    }

    // 1. If user is in a room and is a friend, allow jumping to that room
    if (user.status === 'in_room' && user.roomId) {
      router.push(`/room/${user.roomId}`)
      return
    }

    // 2. If user is already a friend, send real room invite via WebSocket
    if (user.isFriend) {
      const senderName = session.user.name || session.user.email || 'Alguém'
      inviteToRoom(user.id, 'MAX-8829', senderName)

      setInvitedMap((prev) => ({ ...prev, [user.id]: true }))
      toast.success(`Convite para sala enviado para ${user.name}!`, {
        description: `Convite instantâneo para a sala MAX-8829 transmitido via WebSocket.`,
      })
      return
    }

    // 3. If not friend, send friend request
    try {
      await sendFriendRequest(user.name || user.id)
      setPendingFriendMap((prev) => ({ ...prev, [user.id]: true }))
      toast.success(`Pedido de amizade enviado para ${user.name}!`, {
        description: 'Quando aceito, vocês poderão convidar-se com 1 clique.',
      })
    } catch (err: any) {
      toast.error('Erro ao enviar pedido', {
        description: err.message || 'Não foi possível enviar o pedido de amizade.',
      })
    }
  }

  return (
    <section
      id="comunidade"
      className="relative min-h-[100vh] w-full bg-[#050505] flex flex-col justify-center py-24 sm:py-32 overflow-hidden border-t border-[#222]"
    >
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12 w-full flex flex-col">
        
        {/* Asymmetric Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-[#222] pb-12 gap-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isConnected ? 'bg-[#22C55E] animate-pulse' : 'bg-[#EF4444]'
                }`}
              />
              <span className="text-[10px] font-mono text-[#FF5A00] tracking-widest uppercase">
                {isConnected
                  ? `[SYS_NETWORK: CONECTADO // ${viewerCount} USUÁRIOS ONLINE]`
                  : '[SYS_NETWORK: RECONECTANDO AO WEBSOCKET...]'}
              </span>
            </div>
            <h2 className="text-[44px] sm:text-[76px] font-black leading-[0.88] tracking-tight text-white uppercase">
              Sua Sala.<br />
              <span className="text-transparent" style={{ WebkitTextStroke: '2px #F5F5F5' }}>
                Seus Amigos.
              </span>
            </h2>
          </div>
          <div className="max-w-[340px]">
            <p className="text-[13px] sm:text-[14px] font-mono text-[#A3A3A3] leading-relaxed border-l-2 border-[#FF5A00] pl-4">
              Transmissão de status via WebSocket em tempo real. Identificação automática de amigos da sua rede para convites instantâneos a 0ms.
            </p>
          </div>
        </div>

        {/* Real Quick Access Room Link Sharing Widget */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-5 sm:p-6 bg-[#09090D] border border-[#222] mb-10 gap-4">
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A00]" />
              <span className="text-[10px] font-mono text-[#A3A3A3] uppercase tracking-wider">
                Link de Acesso Rápido
              </span>
            </div>
            <a
              href={realRoomUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[15px] sm:text-[17px] font-mono font-bold text-white hover:text-[#FF5A00] transition-colors break-all flex items-center gap-1.5 group"
            >
              <span>{displayRoomUrl}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={copyRoomLink}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FF5A00] hover:bg-white text-black text-[11px] uppercase font-mono font-black px-6 py-3.5 transition-all cursor-pointer shadow-[0_0_20px_rgba(255,90,0,0.25)] hover:scale-105 active:scale-95"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'COPIADO!' : 'COPIAR LINK'}</span>
            </button>
          </div>
        </div>

        {/* Live WebSocket Presence Friends Database Table */}
        <div className="w-full bg-[#070709] border border-[#222] shadow-2xl">
          
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-3 sm:gap-4 p-4 border-b border-[#222] bg-[#0C0C12] text-[#A3A3A3] text-[10px] font-mono font-bold uppercase tracking-wider">
            <div className="col-span-2 sm:col-span-1">NODE</div>
            <div className="col-span-4 sm:col-span-4">USUÁRIO REAL</div>
            <div className="col-span-3 sm:col-span-3">STATUS AO VIVO</div>
            <div className="col-span-3 sm:col-span-4 text-right">REDE / AÇÃO</div>
          </div>

          {/* Table Rows (Top 5 Real Active Users) */}
          <div className="divide-y divide-[#1A1A24]">
            <AnimatePresence mode="popLayout">
              {displayedUsers.length === 0 ? (
                <div className="p-8 text-center text-[12px] font-mono text-[#777]">
                  Sincronizando usuários ativos na rede...
                </div>
              ) : (
                displayedUsers.map((user, idx) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    key={user.id}
                    className="grid grid-cols-12 gap-3 sm:gap-4 p-4 items-center hover:bg-[#101018] transition-colors group"
                  >
                    {/* Node Index */}
                    <div className="col-span-2 sm:col-span-1 text-[11px] font-mono text-[#555] font-bold">
                      {String(idx + 1).padStart(2, '0')}
                    </div>

                    {/* User Identity */}
                    <div className="col-span-4 sm:col-span-4 flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 shrink-0 rounded flex items-center justify-center text-[11px] font-mono font-black text-black shadow-inner"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.alias.substring(0, 2)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] sm:text-[13px] font-mono font-bold text-white uppercase truncate group-hover:text-[#FF5A00] transition-colors">
                            {user.alias}
                          </span>
                          {user.isFriend && (
                            <span className="hidden sm:inline-block text-[8px] font-mono font-bold bg-[#22C55E]/10 border border-[#22C55E]/40 text-[#22C55E] px-1 py-0.2 rounded-xs uppercase">
                              AMIGO
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-[#777] truncate">
                          {user.name}
                        </span>
                      </div>
                    </div>

                    {/* Live Presence Status */}
                    <div className="col-span-3 sm:col-span-3 flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          user.status === 'in_room'
                            ? 'bg-[#3B82F6] animate-pulse shadow-[0_0_8px_#3B82F6]'
                            : user.status === 'online'
                            ? 'bg-[#22C55E] animate-pulse shadow-[0_0_8px_#22C55E]'
                            : 'bg-[#555]'
                        }`}
                      />
                      <div className="flex flex-col">
                        <span
                          className={`text-[10px] sm:text-[11px] font-mono font-bold uppercase ${
                            user.status === 'in_room'
                              ? 'text-[#60A5FA]'
                              : user.status === 'online'
                              ? 'text-[#22C55E]'
                              : 'text-[#777]'
                          }`}
                        >
                          {user.status === 'in_room'
                            ? 'EM SALA'
                            : user.status === 'online'
                            ? 'ONLINE'
                            : 'OFFLINE'}
                        </span>
                        {user.roomInfo && (
                          <span className="text-[9px] font-mono text-[#888] truncate max-w-[140px]">
                            {user.roomInfo}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="col-span-3 sm:col-span-4 flex justify-end">
                      <button
                        onClick={() => handleAction(user)}
                        className={`w-full sm:w-auto text-[10px] font-mono font-bold px-3.5 sm:px-4 py-2 uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                          user.invited
                            ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]'
                            : user.isFriend
                            ? 'bg-[#FF5A00]/10 hover:bg-[#FF5A00] text-[#FF5A00] hover:text-black border-[#FF5A00]/40 shadow-[0_0_15px_rgba(255,90,0,0.15)]'
                            : user.isPending
                            ? 'bg-[#111] text-[#A3A3A3] border-[#333]'
                            : 'bg-transparent text-white border-[#333] hover:border-[#FF5A00] hover:text-[#FF5A00]'
                        }`}
                      >
                        {user.invited ? (
                          <>
                            <Check className="w-3 h-3 text-[#22C55E]" />
                            <span>CONVIDADO</span>
                          </>
                        ) : user.isFriend ? (
                          user.status === 'in_room' ? (
                            <>
                              <Tv className="w-3 h-3" />
                              <span>ENTRAR NA SALA</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3" />
                              <span>CONVIDAR P/ SALA</span>
                            </>
                          )
                        ) : user.isPending ? (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>PENDENTE</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3 h-3 text-[#FF5A00]" />
                            <span>ADICIONAR</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Table Footer Telemetry Info */}
          <div className="p-3.5 bg-[#09090D] border-t border-[#222] flex flex-wrap items-center justify-between text-[10px] font-mono text-[#777] gap-2">
            <span>● USUÁRIOS REAIS COM ATIVIDADE RECENTE // REDE DINÂMICA WEBSOCKET</span>
            {!session?.user ? (
              <Link
                href="/login"
                className="text-[#FF5A00] hover:underline flex items-center gap-1 font-bold uppercase"
              >
                <LogIn className="w-3 h-3" />
                <span>Faça login para interagir com a rede</span>
              </Link>
            ) : (
              <Link
                href="/dashboard/friends"
                className="text-[#22C55E] hover:underline flex items-center gap-1 font-bold uppercase"
              >
                <Users className="w-3 h-3" />
                <span>Gerenciar Todos os Amigos no Painel &gt;</span>
              </Link>
            )}
          </div>

        </div>

      </div>
    </section>
  )
}
