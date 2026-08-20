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
import { ThemeToggle } from '@/components/theme-toggle'

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
    <header className="w-full hidden md:flex items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-[#222] transition-colors">
      
      {/* Cyberpunk Brutalist Search Input */}
      <form onSubmit={handleSearch} className="relative flex-1 max-w-[560px]">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none text-[#FF5A00] font-mono text-[11px]">
          <span className="animate-pulse">_</span>
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-[#777]" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="BUSCAR VÍDEOS, SALAS OU AMIGOS..."
          className="w-full h-11 bg-white dark:bg-[#09090D] border border-slate-200 dark:border-[#222] text-slate-900 dark:text-[#F5F5F5] pl-10 pr-16 text-[11px] font-mono placeholder:text-slate-400 dark:placeholder:text-[#555] outline-none focus:border-[#FF5A00] focus:shadow-[0_0_15px_rgba(255,90,0,0.15)] transition-all shadow-xs"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 border border-slate-200 dark:border-[#333] bg-slate-100 dark:bg-[#050505] text-[9px] font-mono text-slate-500 dark:text-[#777] pointer-events-none hidden sm:block">
          ⌘ K
        </div>
      </form>

      {/* Telemetry Indicator (LP Style) */}
      <div className="hidden xl:flex items-center gap-3 px-4 py-2 border border-slate-200 dark:border-[#222] bg-white dark:bg-[#09090D] font-mono text-[10px] shadow-xs">
        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#16A34A] dark:bg-[#22C55E] animate-ping' : 'bg-[#EF2020]'}`} />
        <span className="text-slate-600 dark:text-[#888] uppercase tracking-wider">
          STATUS: <strong className="text-slate-900 dark:text-white">{isConnected ? 'WEBRTC ATIVO' : 'OFFLINE'}</strong>
        </span>
        <span className="text-slate-300 dark:text-[#333]">|</span>
        <span className="text-[#16A34A] dark:text-[#22C55E] font-bold">LATÊNCIA: 0.00MS</span>
      </div>

      {/* Right Side Actions & Mini User Profile */}
      <div className="flex items-center gap-2.5 shrink-0">
        
        {/* Quick Theme Toggle */}
        <ThemeToggle variant="compact" />

        {/* Notifications Button */}
        <button
          onClick={() => router.push('/dashboard/invites')}
          className="relative w-10 h-10 border border-slate-200 dark:border-[#222] bg-white dark:bg-[#09090D] hover:border-[#FF5A00] hover:bg-slate-100 dark:hover:bg-[#111] flex items-center justify-center transition-all cursor-pointer group shadow-xs"
          title="Notificações e Convites"
          aria-label="Notificações"
        >
          <Bell className="w-4 h-4 text-slate-500 dark:text-[#888] group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 bg-[#EF2020] text-white text-[9px] font-mono font-bold px-1 flex items-center justify-center shadow-[0_0_8px_rgba(239,32,32,0.6)]">
              {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Messages / Friends Button */}
        <button
          onClick={() => router.push('/dashboard/friends')}
          className="relative w-10 h-10 border border-slate-200 dark:border-[#222] bg-white dark:bg-[#09090D] hover:border-[#FF5A00] hover:bg-slate-100 dark:hover:bg-[#111] flex items-center justify-center transition-all cursor-pointer group shadow-xs"
          title="Rede de Amigos"
          aria-label="Mensagens"
        >
          <MessageCircle className="w-4 h-4 text-slate-500 dark:text-[#888] group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 bg-[#FF5A00] text-white dark:text-black text-[9px] font-mono font-bold px-1 flex items-center justify-center shadow-[0_0_8px_rgba(255,90,0,0.6)]">
              {unreadMessagesCount}
            </span>
          )}
        </button>

        {/* User Profile Trigger */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 px-3 py-1.5 border border-slate-200 dark:border-[#222] bg-white dark:bg-[#09090D] hover:border-[#FF5A00] transition-all outline-none cursor-pointer shadow-xs">
            <div className="relative">
              {user?.image ? (
                <img
                  src={user.image}
                  alt="Avatar"
                  className={`w-7 h-7 rounded border object-cover ${
                    isPro ? 'border-amber-400 dark:border-[#FFE600]' : 'border-slate-300 dark:border-[#333]'
                  }`}
                />
              ) : (
                <div
                  className={`w-7 h-7 rounded flex items-center justify-center font-mono font-black text-[10px] ${
                    isPro
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white dark:from-[#FFE600] dark:to-[#FF5A00] dark:text-black'
                      : 'bg-[#FF5A00] text-white dark:text-black'
                  }`}
                >
                  {initials}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[#22C55E] rounded-full border border-white dark:border-[#050505]" />
            </div>

            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-mono font-bold text-slate-900 dark:text-white uppercase max-w-[100px] truncate">
                  {user?.name || user?.email?.split('@')[0] || 'Usuário'}
                </span>
                {isPro && <Crown className="w-3 h-3 text-amber-500 dark:text-[#FFE600] fill-current shrink-0" />}
              </div>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-[#777]" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 bg-white dark:bg-[#09090D] border border-slate-200 dark:border-[#222] text-slate-900 dark:text-[#F5F5F5] rounded-none p-1 shadow-2xl font-mono text-[11px]"
          >
            <div className="p-3 border-b border-slate-200 dark:border-[#222] bg-slate-50 dark:bg-[#0E0E14]">
              <p className="font-bold text-slate-900 dark:text-white uppercase truncate">
                {user?.name || 'Usuário'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-[#777] truncate">
                {user?.email}
              </p>
              <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-slate-200 dark:border-[#1C1C24] text-[9px]">
                <span className="text-slate-500 dark:text-[#888]">STATUS:</span>
                <span className={isPro ? 'text-amber-600 dark:text-[#FFE600] font-black' : 'text-[#16A34A] dark:text-[#22C55E] font-bold'}>
                  {isPro ? 'MAXPRO VIP' : 'FREE'}
                </span>
              </div>
            </div>

            <DropdownMenuItem
              onClick={() => router.push('/profile')}
              className="px-3 py-2 text-slate-700 dark:text-[#D4D4D4] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#151520] cursor-pointer rounded-none"
            >
              <Settings className="w-3.5 h-3.5 mr-2 text-[#FF5A00]" />
              <span>CONFIGURAÇÕES</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push('/dashboard/loja')}
              className="px-3 py-2 text-slate-700 dark:text-[#D4D4D4] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#151520] cursor-pointer rounded-none"
            >
              <Sparkles className="w-3.5 h-3.5 mr-2 text-amber-500 dark:text-[#FFE600]" />
              <span>LOJA & PLANOS VIP</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-slate-200 dark:bg-[#222]" />

            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-3 py-2 text-[#EF4444] hover:bg-red-50 dark:hover:bg-[#EF4444]/10 cursor-pointer rounded-none"
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
