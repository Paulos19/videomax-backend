'use client'

import { useEffect, useState, useMemo } from 'react'
import { io, Socket } from 'socket.io-client'
import { Tv, Radio, Search, Plus, Grid, Flame, Monitor, Users, Play, Shield, Sparkles } from 'lucide-react'
import { LiveRoomCard, LiveRoomData } from '../components/live-room-card'
import { CreateRoomDialog } from '../components/create-room-dialog'
import { RoomsBroadcast3DView } from '@/components/dashboard/rooms-broadcast-3d'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'https://services-videomax-websocket.khdya3.easypanel.host/'

export default function RoomsPage() {
  const { data: session } = useSession()
  const [liveRooms, setLiveRooms] = useState<LiveRoomData[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'popular'>('all')
  const [createRoomOpen, setCreateRoomOpen] = useState(false)
  const [liveUser, setLiveUser] = useState<any>(null)

  // Fetch live user info
  useEffect(() => {
    fetch('/api/user/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setLiveUser(data.user)
      })
      .catch(() => {})
  }, [])

  // Real WebSocket connection to fetch active rooms (100% real data)
  useEffect(() => {
    let socket: Socket | null = null
    let cancelled = false

    const initSocket = async () => {
      let wsToken: string | undefined
      try {
        const tokenRes = await fetch('/api/auth/token')
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json()
          wsToken = tokenData.token
        }
      } catch {}

      if (cancelled) return

      socket = io(SOCKET_SERVER_URL, {
        auth: wsToken ? { token: wsToken } : undefined,
        transports: ['websocket', 'polling'],
      })

      socket.on('connect', () => {
        if (cancelled) return
        socket?.emit('get-active-rooms')
      })

      const handleRooms = (rooms: any[]) => {
        if (cancelled || !Array.isArray(rooms)) return
        const mapped: LiveRoomData[] = rooms.map((r) => ({
          roomId: r.roomId,
          hostUserId: r.hostUserId || '',
          hostName: r.hostName || r.viewers?.[0]?.userName || 'Host',
          hostImage: r.viewers?.[0]?.userImage,
          videoTitle: r.videoTitle || `Sala #${r.roomId}`,
          videoUrl: r.videoUrl,
          viewerCount: r.viewers?.length || 0,
          viewers: r.viewers || [],
        }))
        setLiveRooms(mapped)
      }

      socket.on('active-rooms-update', handleRooms)
      socket.on('active-rooms-list', handleRooms)
    }

    initSocket()

    return () => {
      cancelled = true
      if (socket) socket.disconnect()
    }
  }, [])

  // Calculate total viewers across all active rooms
  const totalViewers = useMemo(() => {
    return liveRooms.reduce((acc, r) => acc + (r.viewerCount || 0), 0)
  }, [liveRooms])

  // Filter & Search logic
  const filteredRooms = useMemo(() => {
    let result = [...liveRooms]

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (r) =>
          r.videoTitle?.toLowerCase().includes(q) ||
          r.hostName?.toLowerCase().includes(q) ||
          r.roomId?.toLowerCase().includes(q)
      )
    }

    // 2. Category Filters
    if (activeFilter === 'popular') {
      result.sort((a, b) => b.viewerCount - a.viewerCount)
    }

    return result
  }, [liveRooms, searchQuery, activeFilter])

  const user = liveUser || session?.user
  const userPlan = (user?.plan || 'FREE').toUpperCase()
  const isPro = userPlan === 'PRO' || userPlan === 'MAXPRO'

  return (
    <div className="space-y-6">
      
      {/* ── CYBERPUNK BRUTALIST COMMAND HEADER ─────────────────────── */}
      <div className="relative overflow-hidden bg-[#09090D] border border-[#222] p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        {/* Background ambient lighting */}
        <div
          className={cn(
            'absolute top-0 right-0 w-80 h-full blur-3xl pointer-events-none opacity-20 transition-colors',
            isPro ? 'bg-[#FFE600]' : 'bg-[#FF5A00]'
          )}
        />

        {/* Left Title & Status */}
        <div className="flex items-center gap-4 relative z-10 flex-1 min-w-0">
          <div
            className={cn(
              'w-12 h-12 flex items-center justify-center font-black shrink-0 transition-transform shadow-[0_0_20px_rgba(255,90,0,0.3)]',
              isPro ? 'bg-[#FFE600] text-black' : 'bg-[#FF5A00] text-black'
            )}
          >
            <Tv className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-[#FF5A00] uppercase font-bold tracking-widest bg-[#14141E] px-2 py-0.5 border border-[#222]">
                [ PROTOCOLO MESH 0MS ]
              </span>
              <span className="flex items-center gap-1.5 bg-[#EF2020] px-2 py-0.2 text-white font-mono text-[9px] font-bold uppercase tracking-wider shadow-[0_0_8px_rgba(239,32,32,0.5)]">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                AO VIVO
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black font-mono text-white uppercase tracking-tight truncate">
              SALAS EM TRANSMISSÃO AO VIVO
            </h1>
            <p className="text-[11px] font-mono text-[#888] truncate">
              Explore canais públicos e privados ativos no cluster WebRTC em tempo real.
            </p>
          </div>
        </div>

        {/* Center/Right Stats & 3D Radar */}
        <div className="flex flex-wrap items-center gap-4 relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 bg-[#060608] border border-[#222] font-mono text-[10px]">
              <span className="text-[#777] uppercase">SALAS:</span>
              <strong className="text-white font-bold text-sm">{liveRooms.length}</strong>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 bg-[#060608] border border-[#222] font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-ping" />
              <span className="text-[#777] uppercase">ONLINE:</span>
              <strong className="text-[#22C55E] font-bold text-sm">{totalViewers}</strong>
            </div>
          </div>

          <button
            onClick={() => setCreateRoomOpen(true)}
            className="py-3 px-5 bg-[#FF5A00] hover:bg-white text-black font-mono font-black text-[11px] uppercase tracking-widest transition-all duration-150 shadow-[0_0_25px_rgba(255,90,0,0.35)] flex items-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>[ CRIAR NOVA SALA ]</span>
          </button>
        </div>
      </div>

      {/* ── CONTROLS BAR: BRUTALIST SEARCH & FILTER TABS ───────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-[#222] pb-4">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none text-[#FF5A00] font-mono text-[11px]">
            <span className="animate-pulse">_</span>
            <Search className="w-3.5 h-3.5 text-[#777]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="BUSCAR SALA POR TÍTULO, HOST OU CÓDIGO..."
            className="w-full h-10 bg-[#09090D] border border-[#222] text-[#F5F5F5] pl-10 pr-12 text-[11px] font-mono placeholder:text-[#555] outline-none focus:border-[#FF5A00] transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 border border-[#333] bg-[#050505] text-[9px] font-mono text-[#777] pointer-events-none hidden sm:block">
            ⌘ K
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveFilter('all')}
            className={cn(
              'px-3 py-1.5 text-[10px] font-mono uppercase font-bold border transition-all cursor-pointer flex items-center gap-1.5',
              activeFilter === 'all'
                ? 'bg-[#FF5A00] text-black border-[#FF5A00] shadow-[0_0_12px_rgba(255,90,0,0.3)]'
                : 'bg-[#09090D] text-[#777] border-[#222] hover:text-white hover:border-[#333]'
            )}
          >
            <Grid className="w-3 h-3" />
            <span>[ TODAS AS SALAS ]</span>
            <span className="text-[9px] px-1 py-0.2 bg-black/40 text-current font-bold">
              {liveRooms.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('popular')}
            className={cn(
              'px-3 py-1.5 text-[10px] font-mono uppercase font-bold border transition-all cursor-pointer flex items-center gap-1.5',
              activeFilter === 'popular'
                ? 'bg-[#FF5A00] text-black border-[#FF5A00] shadow-[0_0_12px_rgba(255,90,0,0.3)]'
                : 'bg-[#09090D] text-[#777] border-[#222] hover:text-white hover:border-[#333]'
            )}
          >
            <Flame className="w-3 h-3 text-[#EF2020]" />
            <span>[ MAIS POPULARES ]</span>
          </button>
        </div>
      </div>

      {/* ── ROOMS GRID OR EMPTY STATE ──────────────────────────────── */}
      {filteredRooms.length === 0 ? (
        <div className="p-10 sm:p-14 bg-[#09090D] border border-[#222] text-center space-y-4 relative overflow-hidden">
          
          {/* Cyberpunk Grid Background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: 'linear-gradient(#FF5A00 1px, transparent 1px), linear-gradient(90deg, #FF5A00 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative z-10 max-w-[520px] mx-auto space-y-4">
            
            {/* 3D Scanning Radar Core in Empty State (Clean scale without clipping) */}
            <div className="flex justify-center py-2">
              <RoomsBroadcast3DView isPro={isPro} className="w-32 h-32 relative" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#121218] border border-[#333] text-[9px] font-mono text-[#888] uppercase">
              <span className="w-2 h-2 rounded-full bg-[#FF5A00] animate-ping" />
              <span>SYS_SCANNER: NENHUMA SALA ATIVA NESTE FILTRO NO MOMENTO</span>
            </div>

            <h3 className="text-xl font-black text-white font-mono uppercase">
              {searchQuery ? `Nenhum resultado para "${searchQuery}"` : 'Seja o Primeiro a Transmitir'}
            </h3>

            <p className="text-[11px] font-mono text-[#888] leading-relaxed">
              Crie sua sala instantânea sincronizada via WebRTC, compartilhe vídeos do YouTube ou sua tela ao vivo com amigos em tempo real.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setCreateRoomOpen(true)}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#FF5A00] hover:bg-white text-black font-mono font-black text-[11px] uppercase tracking-widest transition-all duration-150 shadow-[0_0_25px_rgba(255,90,0,0.35)] cursor-pointer"
              >
                [ + INICIAR PRIMEIRA SALA AGORA ]
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRooms.map((room) => (
            <LiveRoomCard key={room.roomId} room={room} />
          ))}
        </div>
      )}

      {/* Create Room Dialog */}
      {createRoomOpen && (
        <CreateRoomDialog onClose={() => setCreateRoomOpen(false)} />
      )}
    </div>
  )
}
