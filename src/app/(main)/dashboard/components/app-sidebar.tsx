'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home, Tv, Compass, Folder, Users, Mail, Clock, Bookmark,
  Heart, Plus, Settings, Play
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { CreateRoomDialog } from './create-room-dialog'

interface AppSidebarProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
  pendingInvitesCount?: number
}

const mainNavItems = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/dashboard/rooms', label: 'Salas', icon: Tv },
  { href: '/dashboard/explore', label: 'Explorar', icon: Compass },
  { href: '/dashboard/videos', label: 'Biblioteca', icon: Folder },
  { href: '/dashboard/friends', label: 'Amigos', icon: Users },
  { href: '/dashboard/invites', label: 'Convites', icon: Mail, badgeKey: 'invites' },
]

const secondaryNavItems = [
  { href: '/dashboard/history', label: 'Histórico', icon: Clock },
  { href: '/dashboard/watch-later', label: 'Assistir mais tarde', icon: Bookmark },
  { href: '/dashboard/likes', label: 'Curtidos', icon: Heart },
]

export function AppSidebar({ user, pendingInvitesCount = 0 }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [createRoomOpen, setCreateRoomOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/'
    return pathname.startsWith(href)
  }

  const initials =
    user?.name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    'U'

  return (
    <>
      <aside className="w-[260px] h-screen fixed left-0 top-0 z-40 bg-[#050505] border-r border-[#242424] flex flex-col justify-between p-4 shrink-0 select-none">
        {/* Top: Logo & Navs */}
        <div className="space-y-6 flex-1 flex flex-col min-h-0">
          {/* Logo VIDEOMAX */}
          <Link href="/dashboard" className="flex items-center gap-3 px-2 py-1">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <Image
                src="/logo/simplelogo.png"
                alt="VideoMax Logo"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div className="flex items-center text-lg font-bold tracking-tight">
              <span className="text-[#F5F5F5]">VIDEO</span>
              <span className="brand-gradient-text ml-0.5">MAX</span>
            </div>
          </Link>

          {/* Primary Navigation */}
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const active = isActive(item.href)
              const hasBadge = item.badgeKey === 'invites' && pendingInvitesCount > 0

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center justify-between px-3.5 py-2.5 rounded-[10px] text-sm font-medium transition-all group",
                    active
                      ? "bg-[rgba(255,90,0,0.10)] text-[#F5F5F5]"
                      : "text-[#8A8A8A] hover:text-[#F5F5F5] hover:bg-[#111111]"
                  )}
                >
                  {/* Left accent bar on active */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#FF5A00]" />
                  )}

                  <div className="flex items-center gap-3">
                    <item.icon
                      className={cn(
                        "w-4 h-4 transition-colors",
                        active ? "text-[#FF5A00]" : "text-[#8A8A8A] group-hover:text-[#F5F5F5]"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>

                  {hasBadge && (
                    <span className="bg-[#EF2020] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      {pendingInvitesCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="h-[1px] bg-[#242424] my-2" />

          {/* Secondary Navigation */}
          <nav className="space-y-1">
            {secondaryNavItems.map((item) => {
              const active = isActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-sm font-medium transition-all group",
                    active
                      ? "bg-[rgba(255,90,0,0.10)] text-[#F5F5F5]"
                      : "text-[#8A8A8A] hover:text-[#F5F5F5] hover:bg-[#111111]"
                  )}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#FF5A00]" />
                  )}

                  <item.icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      active ? "text-[#FF5A00]" : "text-[#8A8A8A] group-hover:text-[#F5F5F5]"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bottom Section: Create Room CTA & User Footer */}
        <div className="space-y-4 pt-4 border-t border-[#242424] shrink-0">
          {/* + Criar sala button */}
          <button
            onClick={() => setCreateRoomOpen(true)}
            className="w-full py-3 px-4 rounded-[10px] font-bold text-sm text-white brand-gradient brand-glow-strong hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Criar sala
          </button>

          {/* User Profile Footer */}
          <div className="flex items-center justify-between p-2 rounded-[10px] bg-[#0B0B0B] border border-[#242424]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <Avatar className="w-9 h-9 border border-[#242424]">
                  <AvatarImage src={user?.image || undefined} />
                  <AvatarFallback className="bg-[#151515] text-[#FF5A00] font-bold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0B0B0B]" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#F5F5F5] truncate">
                  {user?.name || user?.email?.split('@')[0] || 'Paulin'}
                </p>
                <p className="text-[11px] text-emerald-400 font-medium">Online</p>
              </div>
            </div>

            <button
              onClick={() => router.push('/profile')}
              className="p-1.5 rounded-lg text-[#8A8A8A] hover:text-[#F5F5F5] hover:bg-[#151515] transition-colors"
              title="Configurações"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Create Room Modal */}
      {createRoomOpen && (
        <CreateRoomDialog onClose={() => setCreateRoomOpen(false)} />
      )}
    </>
  )
}
