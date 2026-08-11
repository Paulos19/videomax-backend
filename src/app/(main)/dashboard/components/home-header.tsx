'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Bell, MessageCircle, ChevronDown, User, Settings, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface HomeHeaderProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
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

  return (
    <header className="w-full flex items-center justify-between gap-4 pb-4 border-b border-[#242424]">
      {/* Search Input (~580px, 44px height) */}
      <form onSubmit={handleSearch} className="relative flex-1 max-w-[580px]">
        <Search className="w-4 h-4 text-[#8A8A8A] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar vídeos, salas ou amigos..."
          className="w-full h-[44px] bg-[#0B0B0B] border border-[#242424] text-[#F5F5F5] pl-11 pr-16 rounded-xl text-sm placeholder:text-[#5F5F5F] outline-none focus:border-[#FF5A00] focus:ring-1 focus:ring-[#FF5A00]/20 transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-[#151515] border border-[#242424] text-[11px] font-mono text-[#8A8A8A] pointer-events-none hidden sm:block">
          ⌘ K
        </div>
      </form>

      {/* Right Side Icons & User Menu */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Notifications Button */}
        <button
          onClick={() => router.push('/dashboard/notifications')}
          className="relative w-10 h-10 rounded-xl bg-[#0B0B0B] border border-[#242424] hover:bg-[#111111] hover:border-[#FF5A00]/30 flex items-center justify-center transition-all group"
          title="Notificações"
          aria-label="Notificações"
        >
          <Bell className="w-4 h-4 text-[#8A8A8A] group-hover:text-[#F5F5F5] transition-colors" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 bg-[#EF2020] text-white text-[10px] font-bold px-1 rounded-full flex items-center justify-center shadow-sm">
              {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Messages Button */}
        <button
          onClick={() => router.push('/dashboard/friends')}
          className="relative w-10 h-10 rounded-xl bg-[#0B0B0B] border border-[#242424] hover:bg-[#111111] hover:border-[#FF5A00]/30 flex items-center justify-center transition-all group"
          title="Mensagens"
          aria-label="Mensagens"
        >
          <MessageCircle className="w-4 h-4 text-[#8A8A8A] group-hover:text-[#F5F5F5] transition-colors" />
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 bg-[#EF2020] text-white text-[10px] font-bold px-1 rounded-full flex items-center justify-center shadow-sm">
              {unreadMessagesCount}
            </span>
          )}
        </button>

        {/* User Menu Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 p-1.5 rounded-xl bg-[#0B0B0B] border border-[#242424] hover:bg-[#111111] transition-all outline-none">
            <div className="relative">
              <Avatar className="w-8 h-8 ring-1 ring-[#242424]">
                <AvatarImage src={user?.image || undefined} />
                <AvatarFallback className="bg-[#151515] text-[#FF5A00] font-bold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0B0B0B]" />
            </div>
            <span className="text-xs font-semibold text-[#F5F5F5] hidden md:inline truncate max-w-[120px]">
              {user?.name || user?.email?.split('@')[0] || 'Usuário'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#8A8A8A] hidden md:inline" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 bg-[#0B0B0B] border-[#242424] text-[#F5F5F5] p-1.5 shadow-2xl">
            <div className="px-3 py-2 text-xs text-[#8A8A8A] font-normal">
              Conectado como <strong className="block text-[#F5F5F5] font-semibold truncate">{user?.email}</strong>
            </div>
            <DropdownMenuSeparator className="bg-[#242424]" />
            <DropdownMenuItem
              onClick={() => router.push('/profile')}
              className="px-3 py-2 rounded-lg text-xs font-medium hover:bg-[#151515] hover:text-[#FF5A00] cursor-pointer flex items-center gap-2"
            >
              <User className="w-4 h-4 text-[#8A8A8A]" />
              Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push('/profile')}
              className="px-3 py-2 rounded-lg text-xs font-medium hover:bg-[#151515] hover:text-[#FF5A00] cursor-pointer flex items-center gap-2"
            >
              <Settings className="w-4 h-4 text-[#8A8A8A]" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#242424]" />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="px-3 py-2 rounded-lg text-xs font-medium hover:bg-[#EF2020]/10 hover:text-[#EF2020] text-[#EF2020] cursor-pointer flex items-center gap-2"
            >
              <LogOut className="w-4 h-4 text-[#EF2020]" />
              Sair da conta
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
