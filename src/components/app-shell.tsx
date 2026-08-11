'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home, Film, User, LogOut, Menu, X, Plus,
  PanelLeftClose, PanelLeftOpen, Play, Users
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'
import io from 'socket.io-client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

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
  { href: '/dashboard/videos', label: 'Vídeos', icon: Film },
  { href: '/dashboard/friends', label: 'Amigos', icon: Users },
  { href: '/profile', label: 'Perfil', icon: User },
]

export function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Real-time notification listener
  useEffect(() => {
    if (!user) return
    let socket: ReturnType<typeof io> | null = null
    let cancelled = false

    const init = async () => {
      let wsToken: string | undefined
      try {
        const tokenRes = await fetch('/api/auth/token')
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json()
          wsToken = tokenData.token
        }
      } catch {
        // Token fetch failed
      }

      if (cancelled) return

      socket = io(SOCKET_SERVER_URL, {
        auth: wsToken ? { token: wsToken } : undefined,
        transports: ['websocket', 'polling'],
      })

      socket.on('connect', () => {
        if (cancelled) return
        fetch('/api/mobile/profile').then(r => r.json()).then(data => {
          if (data?.user?.id && socket) {
            socket.emit('join-user-room', { userId: data.user.id })
          }
        }).catch(() => {})
      })

      socket.on('friend-request-received', (data: { senderName: string }) => {
        if (cancelled) return
        toast.info(`Novo pedido de amizade de ${data.senderName}!`, {
          action: {
            label: 'Ver pedidos',
            onClick: () => router.push('/dashboard/friends')
          }
        })
      })

      socket.on('friend-request-accepted', (data: { receiverName: string }) => {
        if (cancelled) return
        toast.success(`${data.receiverName} aceitou seu pedido de amizade!`, {
          action: {
            label: 'Ver amigos',
            onClick: () => router.push('/dashboard/friends')
          }
        })
      })

      socket.on('room-invite-received', (data: { senderName: string; roomCode: string }) => {
        if (cancelled) return
        toast.info(`${data.senderName} convidou você para assistir na sala ${data.roomCode}!`, {
          action: {
            label: 'Entrar na Sala',
            onClick: () => router.push(`/room/${data.roomCode}`)
          },
          duration: 10000
        })
      })
    }

    init()

    return () => {
      cancelled = true
      if (socket) socket.disconnect()
    }
  }, [user, router])

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/'
    return pathname.startsWith(href)
  }

  const initials =
    user?.name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    'U'

  /* ── Reusable nav items rendering ── */
  const renderNav = (isCollapsed: boolean) => (
    <nav className="flex-1 overflow-y-auto scrollbar-none px-3 py-4 space-y-1">
      {navItems.map((item) => {
        const active = isActive(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            title={isCollapsed ? item.label : undefined}
            className={cn(
              'relative flex items-center gap-3.5 rounded-xl transition-all duration-200 group',
              isCollapsed ? 'justify-center px-0 py-3' : 'px-4 py-3',
              active
                ? 'bg-room-accent/10 text-room-accent'
                : 'text-room-text-secondary hover:text-room-text hover:bg-room-surface-2'
            )}
          >
            <item.icon
              className={cn(
                'w-[22px] h-[22px] shrink-0 transition-all duration-200',
                active
                  ? 'text-room-accent drop-shadow-[0_0_6px_rgba(232,89,12,0.5)]'
                  : 'group-hover:text-room-text'
              )}
            />
            {!isCollapsed && (
              <span className="text-sm font-medium whitespace-nowrap">
                {item.label}
              </span>
            )}
            {active && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full brand-gradient" />
            )}
          </Link>
        )
      })}
    </nav>
  )

  const renderCta = (isCollapsed: boolean) => (
    <div className="px-3 pb-4">
      <Link
        href="/dashboard"
        title={isCollapsed ? 'Criar sala' : undefined}
        className={cn(
          'flex items-center justify-center gap-2.5 rounded-xl font-semibold text-sm text-white',
          'brand-gradient hover:opacity-90 active:scale-[0.98] brand-glow-strong transition-all',
          isCollapsed ? 'w-12 h-12 mx-auto' : 'py-3 px-4'
        )}
      >
        <Plus className="w-5 h-5 shrink-0" />
        {!isCollapsed && <span>Criar sala</span>}
      </Link>
    </div>
  )

  const renderUserFooter = (isCollapsed: boolean) => (
    <div className="px-3 pb-4 border-t border-room-border pt-4 shrink-0">
      <div className={cn('flex items-center gap-3', isCollapsed && 'flex-col')}>
        <Avatar className="w-10 h-10 shrink-0 ring-2 ring-room-accent/20 ring-offset-2 ring-offset-room-bg">
          <AvatarImage src={user?.image || undefined} />
          <AvatarFallback className="bg-room-surface-3 text-room-accent font-bold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>

        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-room-text truncate">
              {user?.name || user?.email?.split('@')[0] || 'Usuário'}
            </p>
            <p className="text-xs text-room-text-secondary truncate">
              {user?.email || ''}
            </p>
          </div>
        )}

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={cn(
            'p-2 rounded-lg text-room-text-secondary hover:text-room-red hover:bg-room-red/10 transition-colors shrink-0',
            isCollapsed && 'mt-1'
          )}
          title="Sair"
        >
          <LogOut className="w-[18px] h-[18px]" />
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-room-bg">

      {/* ══════════════════════════════════════════════════════════════ */}
      {/*  DESKTOP SIDEBAR — visible at ≥ 1024px                        */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 sidebar-gradient border-r border-room-border',
          'transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          'hidden lg:!flex lg:!flex-col',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        {/* Header */}
        <div className={cn(
          'h-[72px] flex items-center shrink-0 border-b border-room-border relative overflow-hidden',
          collapsed ? 'justify-center px-3' : 'px-5'
        )}>
          <div className="absolute -top-8 -left-8 w-28 h-28 rounded-full bg-room-accent/6 blur-3xl pointer-events-none" />
          <Link href="/dashboard" className="flex items-center gap-3 relative z-10 overflow-hidden">
            <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center shrink-0 shadow-lg shadow-room-accent/20">
              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
            </div>
            {!collapsed && (
              <span className="font-bold text-lg tracking-tight whitespace-nowrap">
                <span className="brand-gradient-text">Video</span>
                <span className="text-room-text"> Max</span>
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(c => !c)}
            className="ml-auto p-2 rounded-lg text-room-text-secondary hover:text-room-accent hover:bg-room-surface-2 transition-colors"
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-[18px] h-[18px]" />
            ) : (
              <PanelLeftClose className="w-[18px] h-[18px]" />
            )}
          </button>
        </div>

        {renderNav(collapsed)}
        {renderCta(collapsed)}
        {renderUserFooter(collapsed)}
      </aside>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/*  MOBILE OVERLAY — visible at < 1024px when open              */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300',
          'lg:!hidden',
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setMobileOpen(false)}
      />

      {/* ══════════════════════════════════════════════════════════════ */}
      {/*  MOBILE DRAWER — visible at < 1024px                          */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <aside
        style={{ transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)' }}
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col sidebar-gradient border-r border-room-border',
          'transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          'lg:!hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="h-[72px] flex items-center px-5 shrink-0 border-b border-room-border relative overflow-hidden">
          <div className="absolute -top-8 -left-8 w-28 h-28 rounded-full bg-room-accent/6 blur-3xl pointer-events-none" />
          <Link href="/dashboard" className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center shrink-0 shadow-lg shadow-room-accent/20">
              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
            </div>
            <span className="font-bold text-lg tracking-tight whitespace-nowrap">
              <span className="brand-gradient-text">Video</span>
              <span className="text-room-text"> Max</span>
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto p-2 rounded-lg text-room-text-secondary hover:text-room-text hover:bg-room-surface-2 transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {renderNav(false)}
        {renderCta(false)}
        {renderUserFooter(false)}
      </aside>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/*  MAIN CONTENT                                                 */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div
        className={cn(
          'min-h-screen flex flex-col',
          'transition-[padding-left] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          collapsed ? 'lg:pl-[72px]' : 'lg:pl-64'
        )}
      >
        {/* Mobile top bar — visible at < 1024px */}
        <header className="sticky top-0 z-30 h-16 flex items-center gap-3 px-4 bg-room-bg/90 backdrop-blur-lg border-b border-room-border lg:!hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-1 rounded-lg text-room-text-secondary hover:text-room-text hover:bg-room-surface-2 transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center shadow-sm">
              <Play className="w-3 h-3 text-white fill-white ml-0.5" />
            </div>
            <span className="font-bold text-sm">
              <span className="brand-gradient-text">Video</span>
              <span className="text-room-text"> Max</span>
            </span>
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 relative">
          {children}
        </main>
      </div>
    </div>
  )
}
