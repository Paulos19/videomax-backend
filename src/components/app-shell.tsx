'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  Menu,
  X,
  Plus,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  Crown,
  Play,
  LogOut,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useNotifications } from '@/contexts/notification-context'
import { CreateRoomDialog } from '@/app/(main)/dashboard/components/create-room-dialog'
import { UnverifiedEmailBanner } from '@/components/unverified-email-banner'
import { useLandingSocket } from '@/lib/useLandingSocket'
import { signOut } from 'next-auth/react'
import {
  NavIconHome,
  NavIconRooms,
  NavIconShop,
  NavIconLibrary,
  NavIconFriends,
  NavIconInvites,
} from '@/components/dashboard/animated-nav-icons'

// ── 3D CYBERPUNK NODE REACTOR IN THREE.JS ─────────────────────────
function SidebarReactor3D({ isPro }: { isPro: boolean }) {
  const coreRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)

  const [particlePositions] = useState(() => {
    const count = 28
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const radius = 1.1 + Math.random() * 0.35
      pos[i * 3] = Math.cos(angle) * radius
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.9
      pos[i * 3 + 2] = Math.sin(angle) * radius
    }
    return pos
  })

  useFrame((state, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * (isPro ? 1.6 : 0.8)
      coreRef.current.rotation.x += delta * (isPro ? 0.9 : 0.4)
    }
    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * (isPro ? 1.2 : 0.6)
      ringRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.8) * 0.3
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y -= delta * (isPro ? 1.0 : 0.5)
    }
  })

  const primaryColor = isPro ? '#FFE600' : '#FF5A00'
  const secondaryColor = isPro ? '#FF5A00' : '#3B82F6'

  return (
    <group>
      {/* 3D Geometric Core */}
      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.65, 0]} />
        <meshBasicMaterial color={primaryColor} wireframe transparent opacity={0.9} />
      </mesh>

      {/* Outer Orbiting Gyro Ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[0.95, 0.025, 8, 24]} />
        <meshBasicMaterial color={secondaryColor} transparent opacity={0.7} />
      </mesh>

      {/* Orbiting Quantum Sparkles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlePositions.length / 3}
            array={particlePositions}
            itemSize={3}
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.06} color={primaryColor} transparent opacity={0.85} />
      </points>
    </group>
  )
}

interface AppShellProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
    plan?: string | null
  } | null
  children: React.ReactNode
}

const navItems = [
  { href: '/dashboard', label: 'INÍCIO', icon: NavIconHome },
  { href: '/dashboard/rooms', label: 'SALAS', icon: NavIconRooms },
  { href: '/dashboard/loja', label: 'LOJA VIP', icon: NavIconShop, isProTag: true },
  { href: '/dashboard/videos', label: 'BIBLIOTECA', icon: NavIconLibrary },
  { href: '/dashboard/friends', label: 'AMIGOS', icon: NavIconFriends },
  { href: '/dashboard/invites', label: 'CONVITES', icon: NavIconInvites, badgeKey: 'invites' },
]

export function AppShell({ user: initialUser, children }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { unreadCount } = useNotifications()
  const { isConnected } = useLandingSocket()

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [createRoomOpen, setCreateRoomOpen] = useState(false)

  // Live user profile fetched directly from /api/user/me
  const [liveUser, setLiveUser] = useState(initialUser)

  useEffect(() => {
    fetch('/api/user/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setLiveUser(data.user)
        }
      })
      .catch(() => {})
  }, [])

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

  const user = liveUser || initialUser
  const initials =
    user?.name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    'U'

  const userPlan = (user?.plan || 'FREE').toUpperCase()
  const isPro = userPlan === 'PRO' || userPlan === 'MAXPRO'

  return (
    <div className="h-screen w-full bg-[#050505] text-[#F5F5F5] flex overflow-hidden font-sans">
      
      {/* ── DESKTOP BRUTALIST SIDEBAR (>= 768px md) ────────────────── */}
      <aside
        className={cn(
          'hidden md:flex flex-col h-full z-40 bg-[#050505] border-r border-[#222] justify-between transition-all duration-300 ease-in-out shrink-0 select-none relative overflow-hidden',
          isSidebarCollapsed ? 'w-[84px]' : 'w-[270px]'
        )}
      >
        {/* Subtle Ambient Glow inside sidebar */}
        <div
          className={cn(
            'absolute top-0 left-0 w-full h-40 pointer-events-none opacity-20 blur-3xl z-0 transition-colors',
            isPro ? 'bg-[#FFE600]' : 'bg-[#FF5A00]'
          )}
        />

        {/* Top: Logo & Telemetry Header */}
        <div className="relative z-10 flex flex-col flex-1 min-h-0">
          
          {/* Header Brutalist Brand Block */}
          <div className="p-4 border-b border-[#222] flex items-center justify-between">
            <Link
              href="/"
              className={cn(
                'flex items-center gap-3 group transition-transform duration-200',
                isSidebarCollapsed && 'mx-auto justify-center'
              )}
            >
              {/* Logo Emblem (MAXPRO vs FREE) */}
              {isPro ? (
                <div className="w-8 h-8 bg-gradient-to-br from-[#FFE600] via-[#FFB800] to-[#FF5A00] border border-[#FFE600]/80 flex items-center justify-center transition-transform group-hover:scale-105 shadow-[0_0_20px_rgba(255,230,0,0.5)] shrink-0">
                  <Crown className="w-4 h-4 text-black fill-black stroke-[2.5]" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-[#FF5A00] flex items-center justify-center transition-transform group-hover:skew-x-[-8deg] shadow-[0_0_15px_rgba(255,90,0,0.4)] shrink-0">
                  <Play className="w-4 h-4 text-[#050505] fill-[#050505] ml-0.5" />
                </div>
              )}

              {!isSidebarCollapsed && (
                <div className="flex flex-col">
                  {isPro ? (
                    <>
                      <span className="font-black text-lg tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-[#FFE600] via-[#FFFFFF] to-[#FF8A00] drop-shadow-[0_0_12px_rgba(255,230,0,0.45)]">
                        VIDEOMAX
                      </span>
                      <span className="text-[8px] font-mono font-black text-[#FFE600] tracking-widest uppercase mt-0.5 flex items-center gap-1">
                        ★ MAXPRO VIP // MESH 6X
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="font-black text-lg tracking-tighter text-white uppercase leading-none">
                        VIDEOMAX
                      </span>
                      <span className="text-[8px] font-mono text-[#777] tracking-widest uppercase mt-0.5">
                        SYS_FREE // 2 NÓS
                      </span>
                    </>
                  )}
                </div>
              )}
            </Link>

            {!isSidebarCollapsed && (
              <button
                onClick={handleToggleSidebar}
                className="p-1.5 border border-[#222] hover:border-[#FF5A00] hover:bg-[#111] text-[#8A8A8A] hover:text-white transition-all cursor-pointer"
                title="Recolher menu"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Expand Button when Collapsed */}
          {isSidebarCollapsed && (
            <div className="p-2 border-b border-[#222] flex justify-center">
              <button
                onClick={handleToggleSidebar}
                className="p-2 border border-[#222] hover:border-[#FF5A00] hover:bg-[#111] text-[#8A8A8A] hover:text-white transition-all cursor-pointer"
                title="Expandir menu"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 3D Interactive Quantum Node Reactor (LP Style) */}
          {!isSidebarCollapsed && (
            <div className="mx-4 my-3 p-3 bg-[#08080C] border border-[#1F1F28] flex items-center justify-between relative overflow-hidden group">
              <div className="flex flex-col z-10">
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isConnected ? 'bg-[#22C55E] animate-ping' : 'bg-[#EF2020]'
                    }`}
                  />
                  <span className="text-[9px] font-mono font-bold text-white uppercase tracking-widest">
                    {isConnected ? 'NODE ATIVO 0MS' : 'DESCONECTADO'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#888]">
                  {isPro ? '★ SALAS VIP 1080P' : 'SALAS P2P 720P'}
                </span>
              </div>

              {/* 3D Mini Viewport */}
              <div className="w-12 h-12 relative flex items-center justify-center">
                <Canvas camera={{ position: [0, 0, 2.5], fov: 45 }}>
                  <ambientLight intensity={0.6} />
                  <SidebarReactor3D isPro={isPro} />
                </Canvas>
              </div>
            </div>
          )}

          {/* Navigation Links List with Bespoke Animated Icons */}
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const active = isActive(item.href)
              const hasBadge = item.badgeKey === 'invites' && unreadCount > 0
              const IconComponent = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={cn(
                    'relative flex items-center px-3 py-2.5 font-mono text-[11px] uppercase tracking-wider transition-all duration-150 group border',
                    isSidebarCollapsed ? 'justify-center' : 'justify-between',
                    active
                      ? isPro
                        ? 'bg-[#FFE600]/10 border-[#FFE600]/50 text-white font-black shadow-[0_0_15px_rgba(255,230,0,0.15)]'
                        : 'bg-[#FF5A00]/10 border-[#FF5A00]/50 text-white font-black shadow-[0_0_15px_rgba(255,90,0,0.15)]'
                      : 'border-transparent text-[#8A8A8A] hover:text-white hover:bg-[#101015] hover:border-[#222]'
                  )}
                >
                  {/* Left Neon Glowing Edge */}
                  {active && (
                    <motion.div
                      layoutId="activeNavEdge"
                      className={cn(
                        'absolute left-0 top-0 bottom-0 w-1 shadow-[0_0_10px]',
                        isPro ? 'bg-[#FFE600] shadow-[#FFE600]' : 'bg-[#FF5A00] shadow-[#FF5A00]'
                      )}
                    />
                  )}

                  <div className="flex items-center gap-3">
                    <IconComponent
                      active={active}
                      className={cn(
                        'w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-115',
                        active
                          ? isPro
                            ? 'text-[#FFE600] drop-shadow-[0_0_8px_rgba(255,230,0,0.6)]'
                            : 'text-[#FF5A00] drop-shadow-[0_0_8px_rgba(255,90,0,0.6)]'
                          : 'text-[#8A8A8A] group-hover:text-white'
                      )}
                    />

                    {!isSidebarCollapsed && (
                      <span className="truncate">
                        [ {item.label} ]
                      </span>
                    )}
                  </div>

                  {/* Badges / Indicators */}
                  {!isSidebarCollapsed && (
                    <div className="flex items-center gap-1.5">
                      {item.isProTag && (
                        <span className="text-[8px] font-mono font-bold bg-[#FF5A00] text-black px-1.5 py-0.2 uppercase">
                          VIP
                        </span>
                      )}

                      {hasBadge && (
                        <span className="bg-[#EF2020] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-xs font-mono shadow-[0_0_8px_rgba(239,32,32,0.6)]">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  )}

                  {isSidebarCollapsed && hasBadge && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#EF2020] rounded-full animate-ping" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* ── BOTTOM AREA: CTA + DYNAMIC USER VIP CARD ───────────── */}
        <div className="p-3 border-t border-[#222] bg-[#07070A] space-y-3 relative z-10">
          
          {/* Primary Action: + CRIAR SALA */}
          {isSidebarCollapsed ? (
            <button
              onClick={() => setCreateRoomOpen(true)}
              className="w-full h-11 bg-[#FF5A00] hover:bg-white text-black transition-all flex items-center justify-center shadow-[0_0_20px_rgba(255,90,0,0.35)] cursor-pointer"
              title="Criar sala agora"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
            </button>
          ) : (
            <button
              onClick={() => setCreateRoomOpen(true)}
              className="w-full py-3 px-4 bg-[#FF5A00] hover:bg-white text-black font-mono font-black text-[11px] uppercase tracking-widest transition-all duration-200 shadow-[0_0_25px_rgba(255,90,0,0.35)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>[ CRIAR NOVA SALA ]</span>
            </button>
          )}

          {/* User Profile Card */}
          {isSidebarCollapsed ? (
            <div className="flex justify-center py-1">
              <button
                onClick={() => router.push('/profile')}
                className="relative group cursor-pointer"
                title={user?.name || user?.email || 'Perfil'}
              >
                <div
                  className={cn(
                    'w-10 h-10 border rounded flex items-center justify-center font-mono font-bold text-xs transition-colors',
                    isPro
                      ? 'border-[#FFE600] bg-gradient-to-br from-[#FFE600]/20 to-black text-[#FFE600] shadow-[0_0_12px_rgba(255,230,0,0.4)]'
                      : 'border-[#333] bg-[#111] text-[#FF5A00] group-hover:border-[#FF5A00]'
                  )}
                >
                  {user?.image ? (
                    <img src={user.image} alt="User" className="w-full h-full object-cover rounded" />
                  ) : (
                    initials
                  )}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#22C55E] rounded-full border-2 border-[#050505]" />
              </button>
            </div>
          ) : (
            <div
              className={cn(
                'p-3 border relative overflow-hidden transition-all',
                isPro
                  ? 'bg-gradient-to-b from-[#1A1208] to-[#0A0704] border-[#FF5A00]/60 shadow-[0_0_20px_rgba(255,90,0,0.2)]'
                  : 'bg-[#0A0A0E] border-[#222] hover:border-[#333]'
              )}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt="Avatar"
                        className={cn(
                          'w-9 h-9 rounded border object-cover',
                          isPro ? 'border-[#FFE600]' : 'border-[#333]'
                        )}
                      />
                    ) : (
                      <div
                        className={cn(
                          'w-9 h-9 rounded flex items-center justify-center font-mono font-black text-xs',
                          isPro
                            ? 'bg-gradient-to-br from-[#FFE600] to-[#FF5A00] text-black shadow-[0_0_10px_rgba(255,90,0,0.4)]'
                            : 'bg-[#FF5A00] text-black'
                        )}
                      >
                        {initials}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[#22C55E] rounded-full border-2 border-[#050505]" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[12px] font-mono font-black text-white uppercase truncate">
                        {user?.name || user?.email?.split('@')[0] || 'Usuário'}
                      </span>
                      {isPro && <Crown className="w-3 h-3 text-[#FFE600] fill-[#FFE600] shrink-0" />}
                    </div>
                    <span className="text-[10px] font-mono text-[#777] truncate block">
                      {user?.email}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/profile')}
                  className="p-1.5 border border-[#222] hover:border-[#FF5A00] hover:bg-[#151520] text-[#8A8A8A] hover:text-white transition-colors cursor-pointer"
                  title="Configurações"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Status Footer Badge */}
              <div
                className={cn(
                  'flex items-center justify-between p-1.5 border text-[9px] font-mono',
                  isPro
                    ? 'bg-[#150F08] border-[#3D2512] text-[#FFE600]'
                    : 'bg-[#060608] border-[#1C1C24] text-[#888]'
                )}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      isPro ? 'bg-[#FFE600] animate-ping' : 'bg-[#22C55E]'
                    )}
                  />
                  <span className="font-bold uppercase tracking-wider">
                    {isPro ? 'MAXPRO ATIVO' : 'PLANO FREE'}
                  </span>
                </div>

                {isPro ? (
                  <span className="text-[8px] font-black bg-[#FFE600] text-black px-1.5 py-0.2 uppercase">
                    MESH 6X
                  </span>
                ) : (
                  <Link
                    href="/dashboard/loja"
                    className="text-[8px] font-bold text-[#FF5A00] hover:text-white uppercase tracking-wider"
                  >
                    UPGRADE →
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT & MOBILE HEADER ───────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto relative bg-[#050505]">
        
        {/* Unverified Email Warning Banner */}
        <UnverifiedEmailBanner />

        {/* Mobile Top Header (< 768px md) */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 bg-[#050505]/95 backdrop-blur-md border-b border-[#222] md:hidden shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 border border-[#222] bg-[#0E0E14] text-white hover:border-[#FF5A00] transition-colors cursor-pointer"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/dashboard" className="flex items-center gap-2.5">
              {isPro ? (
                <div className="w-7 h-7 bg-gradient-to-br from-[#FFE600] to-[#FF5A00] border border-[#FFE600]/80 flex items-center justify-center shadow-[0_0_15px_rgba(255,230,0,0.5)]">
                  <Crown className="w-3.5 h-3.5 text-black fill-black" />
                </div>
              ) : (
                <div className="w-7 h-7 bg-[#FF5A00] flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 text-black fill-black ml-0.5" />
                </div>
              )}
              <span
                className={cn(
                  'font-black text-lg tracking-tighter uppercase',
                  isPro
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#FFE600] to-[#FF8A00]'
                    : 'text-white'
                )}
              >
                VIDEOMAX
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard/invites')}
              className="relative p-2 border border-[#222] bg-[#0E0E14] text-[#A3A3A3] hover:text-white hover:border-[#FF5A00] transition-colors cursor-pointer"
              aria-label="Notificações"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#EF2020] animate-ping" />
              )}
            </button>

            <Link href="/profile">
              <div className="w-8 h-8 border border-[#333] rounded flex items-center justify-center font-mono font-bold text-xs text-[#FF5A00] bg-[#111]">
                {user?.image ? (
                  <img src={user.image} alt="User" className="w-full h-full object-cover rounded" />
                ) : (
                  initials
                )}
              </div>
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* ── MOBILE DRAWER OVERLAY (< 768px md) ─────────────────────── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md md:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside
            className="w-[290px] h-full bg-[#08080C] border-r border-[#222] p-5 flex flex-col justify-between select-none animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#222] pb-4">
                <Link href="/dashboard" className="flex items-center gap-2.5">
                  {isPro ? (
                    <div className="w-7 h-7 bg-gradient-to-br from-[#FFE600] to-[#FF5A00] border border-[#FFE600]/80 flex items-center justify-center shadow-[0_0_15px_rgba(255,230,0,0.5)]">
                      <Crown className="w-3.5 h-3.5 text-black fill-black" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 bg-[#FF5A00] flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 text-black fill-black ml-0.5" />
                    </div>
                  )}
                  <span
                    className={cn(
                      'font-black text-lg tracking-tighter uppercase',
                      isPro
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#FFE600] to-[#FF8A00]'
                        : 'text-white'
                    )}
                  >
                    VIDEOMAX
                  </span>
                </Link>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 border border-[#222] text-[#8A8A8A] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Nav Links with animated icons */}
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const active = isActive(item.href)
                  const hasBadge = item.badgeKey === 'invites' && unreadCount > 0
                  const IconComponent = item.icon

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center justify-between px-3.5 py-3 border font-mono text-[11px] uppercase tracking-wider transition-all',
                        active
                          ? isPro
                            ? 'bg-[#FFE600]/10 border-[#FFE600] text-[#FFE600] font-black'
                            : 'bg-[#FF5A00]/10 border-[#FF5A00] text-[#FF5A00] font-black'
                          : 'border-[#1C1C24] text-[#A3A3A3] hover:text-white hover:bg-[#111]'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent active={active} className="w-4 h-4" />
                        <span>[ {item.label} ]</span>
                      </div>

                      {hasBadge && (
                        <span className="bg-[#EF2020] text-white text-[9px] font-bold px-2 py-0.5">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#222]">
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  setCreateRoomOpen(true)
                }}
                className="w-full py-3.5 bg-[#FF5A00] text-black font-mono font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,90,0,0.35)]"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>CRIAR NOVA SALA</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  signOut({ callbackUrl: '/' })
                }}
                className="w-full py-2.5 border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/10 font-mono font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>SAIR DA CONTA</span>
              </button>
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
