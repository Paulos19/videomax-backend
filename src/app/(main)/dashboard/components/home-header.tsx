'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Bell, MessageCircle, ChevronDown, User, Settings, LogOut, Crown, Radio, Sparkles } from 'lucide-react'
import { signOut } from 'next-auth/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLandingSocket } from '@/lib/useLandingSocket'

interface HomeHeaderProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
    plan?: string | null
  } | null
  unreadNotificationsCount?: number
  unreadMessagesCount?: number
}

export function HomeHeader({
  user,
  unreadNotificationsCount = 0,
  unreadMessagesCount = 0,
}: HomeHeaderProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const { isConnected, viewerCount } = useLandingSocket()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/dashboard/videos?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const initials =
    user?.name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    'U'

  const userPlan = (user?.plan || 'FREE').toUpperCase()
  const isPro = userPlan === 'PRO' || userPlan === 'MAXPRO'

  return (
    <header className="w-full hidden md:flex items-center justify-between gap-4 pb-5 border-b border-[#222]">
      
      {/* Cyberpunk Brutalist Search Input */}
      <form onSubmit={handleSearch} className="relative flex-1 max-w-[560px]">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none text-[#FF5A00] font-mono text-[11px]">
          <span className="animate-pulse">_</span>
          <Search className="w-3.5 h-3.5 text-[#777]" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="BUSCAR VÍDEOS, SALAS OU AMIGOS..."
          className="w-full h-11 bg-[#09090D] border border-[#222] text-[#F5F5F5] pl-10 pr-16 text-[11px] font-mono placeholder:text-[#555] outline-none focus:border-[#FF5A00] focus:shadow-[0_0_15px_rgba(255,90,0,0.15)] transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 border border-[#333] bg-[#050505] text-[9px] font-mono text-[#777] pointer-events-none hidden sm:block">
          ⌘ K
        </div>
      </form>

      {/* Telemetry Indicator (LP Style) */}
      <div className="hidden xl:flex items-center gap-3 px-4 py-2 border border-[#222] bg-[#09090D] font-mono text-[10px]">
        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#22C55E] animate-ping' : 'bg-[#EF2020]'}`} />
        <span className="text-[#888] uppercase tracking-wider">
          STATUS: <strong className="text-white">{isConnected ? 'WEBRTC ATIVO' : 'OFFLINE'}</strong>
        </span>
        <span className="text-[#333]">|</span>
        <span className="text-[#22C55E] font-bold">LATÊNCIA: 0.00MS</span>
      </div>

      {/* Right Side Actions & Mini User Profile */}
      <div className="flex items-center gap-2.5 shrink-0">
        
        {/* Notifications Button */}
        <button
          onClick={() => router.push('/dashboard/invites')}
          className="relative w-10 h-10 border border-[#222] bg-[#09090D] hover:border-[#FF5A00] hover:bg-[#111] flex items-center justify-center transition-all cursor-pointer group"
          title="Notificações e Convites"
          aria-label="Notificações"
        >
          <Bell className="w-4 h-4 text-[#888] group-hover:text-white transition-colors" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 bg-[#EF2020] text-white text-[9px] font-mono font-bold px-1 flex items-center justify-center shadow-[0_0_8px_rgba(239,32,32,0.6)]">
              {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Messages / Friends Button */}
        <button
          onClick={() => router.push('/dashboard/friends')}
          className="relative w-10 h-10 border border-[#222] bg-[#09090D] hover:border-[#FF5A00] hover:bg-[#111] flex items-center justify-center transition-all cursor-pointer group"
          title="Rede de Amigos"
          aria-label="Mensagens"
        >
          <MessageCircle className="w-4 h-4 text-[#888] group-hover:text-white transition-colors" />
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 bg-[#FF5A00] text-black text-[9px] font-mono font-bold px-1 flex items-center justify-center shadow-[0_0_8px_rgba(255,90,0,0.6)]">
              {unreadMessagesCount}
            </span>
          )}
        </button>

        {/* User Profile Trigger */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 px-3 py-1.5 border border-[#222] bg-[#09090D] hover:border-[#FF5A00] transition-all outline-none cursor-pointer">
            <div className="relative">
              {user?.image ? (
                <img
                  src={user.image}
                  alt="Avatar"
                  className={`w-7 h-7 rounded border object-cover ${
                    isPro ? 'border-[#FFE600]' : 'border-[#333]'
                  }`}
                />
              ) : (
                <div
                  className={`w-7 h-7 rounded flex items-center justify-center font-mono font-black text-[10px] ${
                    isPro
                      ? 'bg-gradient-to-br from-[#FFE600] to-[#FF5A00] text-black'
                      : 'bg-[#FF5A00] text-black'
                  }`}
                >
                  {initials}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[#22C55E] rounded-full border border-[#050505]" />
            </div>

            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-mono font-bold text-white uppercase max-w-[100px] truncate">
                  {user?.name || user?.email?.split('@')[0] || 'Usuário'}
                </span>
                {isPro && <Crown className="w-3 h-3 text-[#FFE600] fill-[#FFE600] shrink-0" />}
              </div>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-[#777]" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 bg-[#09090D] border border-[#222] text-[#F5F5F5] rounded-none p-1 shadow-2xl font-mono text-[11px]"
          >
            <div className="p-3 border-b border-[#222] bg-[#0E0E14]">
              <p className="font-bold text-white uppercase truncate">
                {user?.name || 'Usuário'}
              </p>
              <p className="text-[10px] text-[#777] truncate">
                {user?.email}
              </p>
              <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-[#1C1C24] text-[9px]">
                <span className="text-[#888]">STATUS:</span>
                <span className={isPro ? 'text-[#FFE600] font-black' : 'text-[#22C55E] font-bold'}>
                  {isPro ? 'MAXPRO VIP' : 'FREE'}
                </span>
              </div>
            </div>

            <DropdownMenuItem
              onClick={() => router.push('/profile')}
              className="px-3 py-2 text-[#D4D4D4] hover:text-white hover:bg-[#151520] cursor-pointer rounded-none"
            >
              <Settings className="w-3.5 h-3.5 mr-2 text-[#FF5A00]" />
              <span>CONFIGURAÇÕES</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push('/dashboard/loja')}
              className="px-3 py-2 text-[#D4D4D4] hover:text-white hover:bg-[#151520] cursor-pointer rounded-none"
            >
              <Sparkles className="w-3.5 h-3.5 mr-2 text-[#FFE600]" />
              <span>LOJA & PLANOS VIP</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-[#222]" />

            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-3 py-2 text-[#EF4444] hover:bg-[#EF4444]/10 cursor-pointer rounded-none"
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
              <span>SAIR DA CONTA</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  )
}
