'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home, Tv, Users, Bell, ShoppingBag, Folder, Mail,
  Menu, X, Plus, Settings, PanelLeftClose, PanelLeftOpen
} from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useNotifications } from '@/contexts/notification-context'
import { CreateRoomDialog } from '@/app/(main)/dashboard/components/create-room-dialog'

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'https://services-videomax-websocket.khdya3.easypanel.host/'

interface AppShellProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
  children: React.ReactNode
}

const navItems = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/dashboard/rooms', label: 'Salas', icon: Tv },
  { href: '/dashboard/loja', label: 'Loja', icon: ShoppingBag },
  { href: '/dashboard/videos', label: 'Biblioteca', icon: Folder },
  { href: '/dashboard/friends', label: 'Amigos', icon: Users },
  { href: '/dashboard/invites', label: 'Convites', icon: Mail, badgeKey: 'invites' },
]

export function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { unreadCount } = useNotifications()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [createRoomOpen, setCreateRoomOpen] = useState(false)

  // Restore desktop sidebar collapsed state
  useEffect(() => {
    try {
      const saved = localStorage.getItem('videomax_sidebar_collapsed')
      if (saved !== null) {
        setIsSidebarCollapsed(saved === 'true')
      }
    } catch {}
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem('videomax_sidebar_collapsed', String(next))
      } catch {}
      return next
    })
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/'
    return pathname.startsWith(href)
  }

  const initials =
    user?.name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    'U'

  return (
    <div className="h-screen w-full bg-[#050505] text-[#F5F5F5] flex overflow-hidden">
      {/* Desktop Permanent Sidebar (>= 768px md) */}
      <aside
        className={cn(
          "hidden md:flex flex-col h-full z-40 bg-[#050505] border-r border-[#242424] justify-between p-3.5 transition-all duration-300 ease-in-out shrink-0 select-none",
          isSidebarCollapsed ? "w-[80px]" : "w-[260px]"
        )}
      >
        {/* Top: Logo & Nav */}
        <div className="space-y-6 flex-1 flex flex-col min-h-0">
          <div className={cn("flex items-center justify-between px-1.5 py-1", isSidebarCollapsed && "justify-center")}>
            <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                <Image
                  src="/logo/simplelogo.png"
                  alt="VideoMax Logo"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex items-center text-lg font-bold tracking-tight truncate">
                  <span className="text-[#F5F5F5]">VIDEO</span>
                  <span className="brand-gradient-text ml-0.5">MAX</span>
                </div>
              )}
            </Link>

            {!isSidebarCollapsed && (
              <button
                onClick={handleToggleSidebar}
                className="p-1.5 rounded-lg text-[#8A8A8A] hover:text-[#F5F5F5] hover:bg-[#151515] transition-colors"
                title="Recolher menu"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
          </div>

          {isSidebarCollapsed && (
            <button
              onClick={handleToggleSidebar}
              className="w-full py-2 flex items-center justify-center text-[#8A8A8A] hover:text-[#F5F5F5] hover:bg-[#151515] rounded-lg transition-colors"
              title="Expandir menu"
            >
              <PanelLeftOpen className="w-5 h-5" />
            </button>
          )}

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const active = isActive(item.href)
              const hasBadge = item.badgeKey === 'invites' && unreadCount > 0

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={cn(
                    "relative flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group",
                    isSidebarCollapsed ? "justify-center" : "justify-between",
                    active
                      ? "bg-[rgba(255,90,0,0.12)] text-[#F5F5F5]"
                      : "text-[#8A8A8A] hover:text-[#F5F5F5] hover:bg-[#111111]"
                  )}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#FF5A00]" />
                  )}

                  <div className="flex items-center gap-3">
                    <item.icon
                      key={active ? `active-${pathname}` : item.href}
                      className={cn(
                        "w-5 h-5 transition-colors shrink-0",
                        active ? "text-[#FF5A00] draw-icon" : "text-[#8A8A8A] group-hover:text-[#F5F5F5]"
                      )}
                    />
                    {!isSidebarCollapsed && <span>{item.label}</span>}
                  </div>

                  {hasBadge && (
                    isSidebarCollapsed ? (
                      <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#EF2020] rounded-full ring-2 ring-[#050505] animate-pulse" />
                    ) : (
                      <span className="bg-[#EF2020] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        {unreadCount}
                      </span>
                    )
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bottom CTA & Profile */}
        <div className="space-y-3 pt-3 border-t border-[#242424] shrink-0">
          {isSidebarCollapsed ? (
            <button
              onClick={() => setCreateRoomOpen(true)}
              className="w-full h-11 rounded-xl brand-gradient brand-glow-strong hover:brightness-110 active:scale-[0.95] transition-all flex items-center justify-center text-white"
              title="Criar sala"
            >
              <Plus className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setCreateRoomOpen(true)}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white brand-gradient brand-glow-strong hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Criar sala</span>
            </button>
          )}

          {isSidebarCollapsed ? (
            <div className="flex justify-center p-1.5">
              <button
                onClick={() => router.push('/profile')}
                className="relative group"
                title={user?.name || user?.email || 'Perfil'}
              >
                <Avatar className="w-10 h-10 border border-[#242424] group-hover:border-[#FF5A00] transition-colors">
                  <AvatarImage src={user?.image || undefined} />
                  <AvatarFallback className="bg-[#151515] text-[#FF5A00] font-bold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#050505]" />
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-gradient-to-b from-[#111111] to-[#0A0A0A] border border-[#242424] hover:border-[#FF5A00]/30 transition-colors relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF5A00]/5 blur-2xl rounded-full pointer-events-none group-hover:bg-[#FF5A00]/10 transition-colors" />
              
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <Avatar className="w-10 h-10 border-2 border-[#151515] shadow-lg">
                      <AvatarImage src={user?.image || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-[#242424] to-[#151515] text-[#FF5A00] font-bold text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0A0A0A]" />
                  </div>
                  
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#F5F5F5] truncate">
                      {user?.name || user?.email?.split('@')[0] || 'Usuário'}
                    </p>
                    <p className="text-[11px] text-[#8A8A8A] font-medium truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => router.push('/profile')}
                  className="p-2 rounded-xl text-[#8A8A8A] hover:text-[#F5F5F5] hover:bg-[#1A1A1A] transition-colors"
                  title="Configurações"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
              
              <div className="relative z-10 flex items-center justify-between p-2 rounded-xl bg-[#050505] border border-[#1A1A1A]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A00] animate-pulse" />
                  <span className="text-[11px] font-bold text-[#F5F5F5] tracking-wide">MAXPRO</span>
                </div>
                <span className="text-[10px] text-[#FF5A00] font-semibold bg-[#FF5A00]/10 px-2 py-0.5 rounded-md">
                  ATIVO
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content & Mobile Header Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto relative">
        {/* Mobile Top Header (< 768px md) */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 bg-[#050505]/95 backdrop-blur-md border-b border-[#242424] md:hidden shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-[#151515] border border-[#242424] text-[#F5F5F5] hover:bg-[#242424] transition-colors"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/dashboard" className="flex items-center gap-2">
              <Image
                src="/logo/simplelogo.png"
                alt="VideoMax Logo"
                width={30}
                height={30}
                className="object-contain"
              />
              <span className="font-bold text-base tracking-tight">
                <span className="text-[#F5F5F5]">VIDEO</span>
                <span className="brand-gradient-text ml-0.5">MAX</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard/notifications')}
              className="relative p-2 rounded-xl bg-[#151515] border border-[#242424] text-[#8A8A8A] hover:text-[#F5F5F5]"
              aria-label="Notificações"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#EF2020] animate-ping" />
              )}
            </button>

            <Link href="/profile">
              <Avatar className="w-8 h-8 border border-[#242424]">
                <AvatarImage src={user?.image || undefined} />
                <AvatarFallback className="bg-[#151515] text-[#FF5A00] font-bold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Overlay (< 768px md) */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside
            className="w-[280px] h-full bg-[#050505] border-r border-[#242424] p-5 flex flex-col justify-between animate-slide-in-left select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#242424] pb-4">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <Image
                    src="/logo/simplelogo.png"
                    alt="VideoMax Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                  <span className="font-bold text-lg">
                    <span className="text-[#F5F5F5]">VIDEO</span>
                    <span className="brand-gradient-text ml-0.5">MAX</span>
                  </span>
                </Link>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl bg-[#151515] text-[#8A8A8A] hover:text-[#F5F5F5]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const active = isActive(item.href)
                  const hasBadge = item.badgeKey === 'invites' && unreadCount > 0

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                        active
                          ? "bg-[rgba(255,90,0,0.12)] text-[#F5F5F5] border border-[#FF5A00]/30"
                          : "text-[#8A8A8A] hover:text-[#F5F5F5] hover:bg-[#111111]"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon
                          key={active ? `active-mobile-${pathname}` : item.href}
                          className={cn(
                            "w-5 h-5",
                            active ? "text-[#FF5A00] draw-icon" : "text-[#8A8A8A]"
                          )}
                        />
                        <span>{item.label}</span>
                      </div>

                      {hasBadge && (
                        <span className="bg-[#EF2020] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="space-y-4 pt-4 border-t border-[#242424]">
              <button
                onClick={() => { setMobileMenuOpen(false); setCreateRoomOpen(true) }}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white brand-gradient brand-glow-strong flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Criar nova sala</span>
              </button>

              <div className="p-3 rounded-2xl bg-gradient-to-b from-[#111111] to-[#0A0A0A] border border-[#242424] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF5A00]/5 blur-2xl rounded-full pointer-events-none" />
                
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <Avatar className="w-10 h-10 border-2 border-[#151515] shadow-lg">
                        <AvatarImage src={user?.image || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-[#242424] to-[#151515] text-[#FF5A00] font-bold text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0A0A0A]" />
                    </div>
                    
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#F5F5F5] truncate">
                        {user?.name || user?.email?.split('@')[0] || 'Usuário'}
                      </p>
                      <p className="text-[11px] text-[#8A8A8A] font-medium truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => { setMobileMenuOpen(false); router.push('/profile') }}
                    className="p-2 rounded-xl text-[#8A8A8A] hover:text-[#F5F5F5] hover:bg-[#1A1A1A] transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="relative z-10 flex items-center justify-between p-2 rounded-xl bg-[#050505] border border-[#1A1A1A]">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A00] animate-pulse" />
                    <span className="text-[11px] font-bold text-[#F5F5F5] tracking-wide">MAXPRO</span>
                  </div>
                  <span className="text-[10px] text-[#FF5A00] font-semibold bg-[#FF5A00]/10 px-2 py-0.5 rounded-md">
                    ATIVO
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Create Room Dialog */}
      {createRoomOpen && (
        <CreateRoomDialog onClose={() => setCreateRoomOpen(false)} />
      )}
    </div>
  )
}
