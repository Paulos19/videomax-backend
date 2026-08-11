'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Compass, Tv, Users, User, Bell } from 'lucide-react'
import { toast } from 'sonner'
import io from 'socket.io-client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { AppSidebar } from '@/app/(main)/dashboard/components/app-sidebar'

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'https://services-videomax-websocket.khdya3.easypanel.host/'

interface AppShellProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
  children: React.ReactNode
}

const mobileNavItems = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/dashboard/explore', label: 'Explorar', icon: Compass },
  { href: '/dashboard/rooms', label: 'Salas', icon: Tv },
  { href: '/dashboard/friends', label: 'Amigos', icon: Users },
  { href: '/profile', label: 'Perfil', icon: User },
]

export function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [pendingInvitesCount, setPendingInvitesCount] = useState(0)

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
      } catch {}

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
        setPendingInvitesCount(c => c + 1)
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

  const initials =
    user?.name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    'U'

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5]">
      {/* Desktop Sidebar (260px fixed) — Hidden on Mobile (<768px) */}
      <div className="hidden md:block">
        <AppSidebar user={user} pendingInvitesCount={pendingInvitesCount} />
      </div>

      {/* Main Container */}
      <div className="md:pl-[260px] flex flex-col min-h-screen pb-16 md:pb-0">
        {/* Mobile Header (<768px) */}
        <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 bg-[#050505]/95 backdrop-blur-md border-b border-[#242424] md:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/logo/simplelogo.png"
              alt="VideoMax Logo"
              width={28}
              height={28}
              className="object-contain"
            />
            <span className="font-bold text-sm">
              <span className="text-[#F5F5F5]">VIDEO</span>
              <span className="brand-gradient-text ml-0.5">MAX</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard/notifications')}
              className="relative p-1.5 rounded-lg text-[#8A8A8A] hover:text-[#F5F5F5]"
              aria-label="Notificações"
            >
              <Bell className="w-5 h-5" />
              {pendingInvitesCount > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#EF2020] animate-ping" />
              )}
            </button>

            <Link href="/profile">
              <Avatar className="w-7 h-7 border border-[#242424]">
                <AvatarImage src={user?.image || undefined} />
                <AvatarFallback className="bg-[#151515] text-[#FF5A00] font-bold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 relative">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation (<768px) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B0B0B]/95 backdrop-blur-md border-t border-[#242424] h-16 flex items-center justify-around md:hidden px-2">
        {mobileNavItems.map((item) => {
          const active = pathname === item.href || (item.href === '/dashboard' && pathname === '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-semibold transition-all",
                active ? "text-[#FF5A00]" : "text-[#8A8A8A] hover:text-[#F5F5F5]"
              )}
            >
              <item.icon className={cn("w-5 h-5", active ? "text-[#FF5A00]" : "text-[#8A8A8A]")} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
