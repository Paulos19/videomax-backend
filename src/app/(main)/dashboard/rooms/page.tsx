'use client'

import { useEffect, useState, useMemo } from 'react'
import { io, Socket } from 'socket.io-client'
import { Tv, Radio, Search, Plus, Grid, Flame, Monitor, Users, Play } from 'lucide-react'
import { LiveRoomCard, LiveRoomData } from '../components/live-room-card'
import { CreateRoomDialog } from '../components/create-room-dialog'
import { cn } from '@/lib/utils'

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'https://services-videomax-websocket.khdya3.easypanel.host/'

export default function RoomsPage() {
  const [liveRooms, setLiveRooms] = useState<LiveRoomData[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'popular' | 'streaming'>('all')
  const [createRoomOpen, setCreateRoomOpen] = useState(false)

  // Real WebSocket connection to fetch active rooms (0 mocked data)
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

      socket.on('active-rooms-update', (rooms: any[]) => {
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
          isStreamingScreen: r.isStreamingScreen || false
        }))
        setLiveRooms(mapped)
      })

      socket.on('active-rooms-list', (rooms: any[]) => {
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
          isStreamingScreen: r.isStreamingScreen || false
        }))
        setLiveRooms(mapped)
      })
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
    } else if (activeFilter === 'streaming') {
      result = result.filter((r: any) => r.isStreamingScreen)
    }

    return result
  }, [liveRooms, searchQuery, activeFilter])

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-[#0B0B0B] border border-[#242424] relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF5A00]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl brand-gradient flex items-center justify-center text-white brand-glow-strong shrink-0">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] tracking-tight">
                  Salas Ao Vivo
                </h1>
                <span className="flex items-center gap-1.5 bg-[#EF2020] px-2.5 py-0.5 rounded-full text-white text-[10px] font-extrabold uppercase tracking-wider animate-pulse">
                  <Radio className="w-3 h-3" /> LIVE
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#8A8A8A]">
                Explore salas públicas e privadas ativas no momento em tempo real.
              </p>
            </div>
          </div>
        </div>

        {/* CTA & Stats */}
        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <div className="hidden sm:flex flex-col items-end px-4 py-2 rounded-xl bg-[#151515] border border-[#242424]">
            <span className="text-xs text-[#8A8A8A] font-semibold">Salas Abertas</span>
            <span className="text-base font-extrabold text-[#F5F5F5] font-mono">{liveRooms.length}</span>
          </div>

          <div className="hidden sm:flex flex-col items-end px-4 py-2 rounded-xl bg-[#151515] border border-[#242424]">
            <span className="text-xs text-[#8A8A8A] font-semibold">Pessoas Online</span>
            <span className="text-base font-extrabold text-emerald-400 font-mono">{totalViewers}</span>
          </div>

          <button
            onClick={() => setCreateRoomOpen(true)}
            className="py-3 px-5 rounded-xl font-bold text-xs sm:text-sm text-white brand-gradient brand-glow-strong hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 shadow-xl border border-amber-400/30"
          >
            <Plus className="w-4 h-4" />
            <span>Criar nova sala</span>
          </button>
        </div>
      </div>

      {/* Controls Bar: Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar sala por título, host ou código..."
            className="w-full bg-[#0B0B0B] border border-[#242424] text-[#F5F5F5] pl-11 pr-4 py-2.5 rounded-xl text-xs sm:text-sm placeholder:text-[#5F5F5F] outline-none focus:border-[#FF5A00] transition-all"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 bg-[#0B0B0B] p-1 rounded-xl border border-[#242424] overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveFilter('all')}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
              activeFilter === 'all'
                ? "brand-gradient text-white shadow-md"
                : "text-[#8A8A8A] hover:text-[#F5F5F5]"
            )}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Todas as Salas ({liveRooms.length})</span>
          </button>

          <button
            onClick={() => setActiveFilter('popular')}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
              activeFilter === 'popular'
                ? "brand-gradient text-white shadow-md"
                : "text-[#8A8A8A] hover:text-[#F5F5F5]"
            )}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Mais Populares</span>
          </button>

          <button
            onClick={() => setActiveFilter('streaming')}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
              activeFilter === 'streaming'
                ? "brand-gradient text-white shadow-md"
                : "text-[#8A8A8A] hover:text-[#F5F5F5]"
            )}
          >
            <Monitor className="w-3.5 h-3.5 text-sky-400" />
            <span>Tela Compartilhada</span>
          </button>
        </div>
      </div>

      {/* Grid of Rooms or Empty State */}
      {filteredRooms.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRooms.map((room) => (
            <LiveRoomCard key={room.roomId} room={room} />
          ))}
        </div>
      ) : (
        <div className="py-20 rounded-2xl bg-[#0B0B0B] border border-[#242424] text-center space-y-5 shadow-2xl relative overflow-hidden max-w-xl mx-auto p-6 sm:p-8">
          <div className="w-16 h-16 rounded-2xl bg-[#151515] border border-[#242424] flex items-center justify-center mx-auto text-[#FF5A00] brand-glow">
            <Radio className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#F5F5F5]">
              {searchQuery ? 'Nenhuma sala encontrada' : 'Nenhuma sala aberta no momento'}
            </h2>
            <p className="text-xs sm:text-sm text-[#8A8A8A] max-w-sm mx-auto leading-relaxed">
              {searchQuery
                ? `Nenhum resultado para "${searchQuery}". Tente buscar com outros termos.`
                : 'Seja o primeiro a criar uma sala ao vivo para transmitir vídeos ou compartilhar sua tela com amigos!'}
            </p>
          </div>

          <button
            onClick={() => setCreateRoomOpen(true)}
            className="py-3.5 px-6 rounded-xl font-extrabold text-xs sm:text-sm text-white brand-gradient brand-glow-strong hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2 shadow-2xl border border-amber-400/40"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Primeira Sala</span>
          </button>
        </div>
      )}

      {/* Create Room Modal */}
      {createRoomOpen && (
        <CreateRoomDialog onClose={() => setCreateRoomOpen(false)} />
      )}
    </div>
  )
}
