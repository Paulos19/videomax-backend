'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  Menu,
  X,
  Play,
  User,
  ChevronDown,
  LayoutDashboard,
  Tv,
  Folder,
  Users,
  Settings,
  LogOut,
  Sparkles,
  ShieldCheck,
  Crown,
  Flame,
  Zap,
} from 'lucide-react'
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion'
import { useLandingSocket } from '@/lib/useLandingSocket'
import { useLenis } from 'lenis/react'
import { useSession, signOut } from 'next-auth/react'
import { UnverifiedEmailBanner } from '@/components/unverified-email-banner'

const NAV_LINKS = [
  { label: 'SALAS_AO_VIVO', href: '#salas' },
  { label: 'SISTEMA', href: '#funcionalidades' },
  { label: 'SINCRONIA', href: '#sincronizacao' },
  { label: 'CHAT', href: '#chat' },
  { label: 'BIBLIOTECA', href: '#biblioteca' },
  { label: 'PLANOS', href: '#planos' },
]

// ── 3D HOLOGRAPHIC MAXPRO REACTOR / DIAMOND ──────────────────────
function ProHologram3D() {
  const meshRef = useRef<THREE.Mesh>(null)
  const innerRef = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)

  const [particlePositions] = useState(() => {
    const count = 40
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const radius = 1.3 + Math.random() * 0.4
      pos[i * 3] = Math.cos(angle) * radius
      pos[i * 3 + 1] = (Math.random() - 0.5) * 1.2
      pos[i * 3 + 2] = Math.sin(angle) * radius
    }
    return pos
  })

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 1.4
      meshRef.current.rotation.x += delta * 0.7
    }
    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 1.8
      innerRef.current.rotation.z += delta * 0.9
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y -= delta * 0.9
    }
  })

  return (
    <group>
      {/* Outer Rotating Wireframe Diamond */}
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.95, 0]} />
        <meshBasicMaterial color="#FFB800" wireframe transparent opacity={0.85} />
      </mesh>

      {/* Inner Glowing Crystal */}
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.5, 0]} />
        <meshBasicMaterial color="#FF5A00" wireframe transparent opacity={0.7} />
      </mesh>

      {/* Orbiting Golden Particle Cloud */}
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
        <pointsMaterial size={0.07} color="#FFE600" transparent opacity={0.95} />
      </points>
    </group>
  )
}

export function HeroNavbar() {
  const { data: session, status: authStatus } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { scrollY } = useScroll()
  const { isConnected, viewerCount } = useLandingSocket()
  const lenis = useLenis()

  // Live user state directly from database
  const [liveUser, setLiveUser] = useState<{
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
    plan?: string | null
  } | null>(null)

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetch('/api/user/me')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) {
            setLiveUser(data.user)
          }
        })
        .catch(() => {})
    }
  }, [authStatus])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      const targetId = href.slice(1)
      const targetEl = document.getElementById(targetId)
      if (targetEl) {
        if (lenis) {
          lenis.scrollTo(targetEl, { offset: -75, duration: 1.2 })
        } else {
          const rect = targetEl.getBoundingClientRect()
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop
          window.scrollTo({
            top: rect.top + scrollTop - 75,
            behavior: 'smooth',
          })
        }
      }
      setMobileOpen(false)
    }
  }

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0
    if (latest > 40) {
      setScrolled(true)
    } else {
      setScrolled(false)
    }

    // Hide when scrolling down past 150px, show when scrolling up
    if (latest > 150 && latest > previous + 5) {
      setHidden(true)
      setDropdownOpen(false)
    } else if (latest < previous - 5 || latest <= 100) {
      setHidden(false)
    }
  })

  const user = liveUser || session?.user
  const userInitials = user?.name
    ? user.name.substring(0, 2).toUpperCase()
    : user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : 'VM'

  const userPlan = liveUser?.plan || (session?.user as any)?.plan || 'FREE'
  const isPro = userPlan.toUpperCase() === 'PRO' || userPlan.toUpperCase() === 'MAXPRO'

  return (
    <>
      <motion.header
        variants={{
          visible: { y: 0 },
          hidden: { y: '-100%' },
        }}
        animate={hidden ? 'hidden' : 'visible'}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed top-0 left-0 right-0 z-[999] transition-colors duration-300 border-b border-[#222] ${
          scrolled ? 'bg-[#050505]/95 backdrop-blur-md shadow-2xl' : 'bg-[#050505]'
        }`}
      >
        <UnverifiedEmailBanner />
        <div className="w-full flex items-center justify-between">
          
          {/* Logo - Brutalist Block */}
          <Link
            href="/"
            className="flex items-center gap-3 group shrink-0 border-r border-[#222] px-6 lg:px-10 py-5 hover:bg-[#111] transition-colors h-full cursor-pointer"
          >
            <div className="w-6 h-6 bg-[#FF5A00] flex items-center justify-center transition-transform group-hover:skew-x-[-10deg]">
              <Play className="w-3 h-3 text-[#050505] fill-[#050505] ml-0.5" />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase text-[#F5F5F5]">
              VIDEOMAX
            </span>
          </Link>

          {/* Center Links - Terminal Style */}
          <nav className="hidden xl:flex items-center h-full">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-[10px] font-mono font-bold text-[#A3A3A3] hover:text-white hover:bg-[#111] px-6 py-6 border-r border-[#222] transition-colors tracking-widest cursor-pointer"
              >
                [{link.label}]
              </a>
            ))}

            {/* System Status Node */}
            <div className="flex items-center gap-2 px-6 py-6 border-r border-[#222]">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-[#22C55E] animate-pulse' : 'bg-[#EF2020]'
                }`}
              />
              <span className="text-[10px] font-mono text-[#5F5F5F] tracking-widest">
                {isConnected ? `SYS_ONLINE: ${viewerCount}` : 'SYS_OFFLINE'}
              </span>
            </div>
          </nav>

          {/* Right Section: Auth vs Special User Dropdown */}
          <div className="flex items-center h-full ml-auto">
            {authStatus === 'authenticated' && user ? (
              // ── AUTHENTICATED USER DROPDOWN (MAXPRO SPECIAL) ────────
              <div className="relative h-full" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center gap-3 px-5 lg:px-7 py-4.5 h-full border-l transition-all cursor-pointer group select-none ${
                    isPro
                      ? 'border-[#FF5A00]/40 bg-gradient-to-r from-[#FF5A00]/5 to-[#1A1208] hover:from-[#FF5A00]/10 hover:to-[#22160A]'
                      : 'border-[#222] hover:bg-[#111]'
                  }`}
                >
                  {/* Avatar Frame with special halo for MAXPRO */}
                  <div className="relative">
                    {isPro && (
                      <div className="absolute -inset-1 rounded-sm bg-gradient-to-r from-[#FF5A00] via-[#FFE600] to-[#FF0055] opacity-75 blur-[3px] animate-pulse" />
                    )}

                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || 'User'}
                        className={`relative w-8 h-8 rounded border object-cover ${
                          isPro ? 'border-[#FFE600]' : 'border-[#333]'
                        }`}
                      />
                    ) : (
                      <div
                        className={`relative w-8 h-8 rounded flex items-center justify-center font-mono font-black text-[11px] ${
                          isPro
                            ? 'bg-gradient-to-br from-[#FFE600] to-[#FF5A00] text-black shadow-[0_0_15px_rgba(255,90,0,0.5)]'
                            : 'bg-[#FF5A00] text-black'
                        }`}
                      >
                        {userInitials}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#22C55E] rounded-full border-2 border-[#050505] z-10" />
                  </div>

                  {/* Name & Plan Badge */}
                  <div className="hidden sm:flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[12px] font-mono font-bold uppercase truncate max-w-[130px] transition-colors ${
                          isPro
                            ? 'text-[#FFF] group-hover:text-[#FFE600]'
                            : 'text-white group-hover:text-[#FF5A00]'
                        }`}
                      >
                        {user.name || user.email?.split('@')[0]}
                      </span>

                      {isPro ? (
                        <span className="text-[9px] font-mono font-black bg-gradient-to-r from-[#FFE600] to-[#FF5A00] text-black px-1.5 py-0.2 rounded-xs shadow-[0_0_10px_rgba(255,90,0,0.4)] flex items-center gap-0.5">
                          <Crown className="w-2.5 h-2.5 fill-black" />
                          <span>MAXPRO</span>
                        </span>
                      ) : (
                        <span className="text-[8px] font-mono font-bold bg-[#222] text-[#A3A3A3] px-1 rounded-xs">
                          FREE
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] font-mono text-[#777] tracking-wider flex items-center gap-1">
                      {isPro ? (
                        <span className="text-[#FFB800] font-bold">● MESH 6X ATIVO</span>
                      ) : (
                        'CONECTADO'
                      )}
                    </span>
                  </div>

                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      dropdownOpen
                        ? `rotate-180 ${isPro ? 'text-[#FFE600]' : 'text-[#FF5A00]'}`
                        : 'text-[#A3A3A3] group-hover:text-white'
                    }`}
                  />
                </button>

                {/* ── DROPDOWN MENU POPUP (SPECIAL 3D FOR MAXPRO) ── */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      className={`absolute right-0 top-full mt-1.5 w-80 shadow-[0_15px_50px_rgba(0,0,0,0.9)] z-[1000] overflow-hidden border ${
                        isPro
                          ? 'bg-[#0B0806] border-[#FF5A00] shadow-[0_0_40px_rgba(255,90,0,0.25)]'
                          : 'bg-[#09090D] border-[#222]'
                      }`}
                    >
                      {/* Special Header: Contains 3D Hologram for MAXPRO */}
                      <div
                        className={`p-4 border-b relative overflow-hidden ${
                          isPro
                            ? 'bg-gradient-to-b from-[#1C1209] to-[#0E0905] border-[#3D2512]'
                            : 'bg-[#0E0E14] border-[#222]'
                        }`}
                      >
                        {/* 3D ThreeJS Canvas in Background for MAXPRO */}
                        {isPro && (
                          <div className="absolute right-0 top-0 w-28 h-full pointer-events-none opacity-85 z-0">
                            <Canvas camera={{ position: [0, 0, 3], fov: 40 }}>
                              <ambientLight intensity={0.6} />
                              <ProHologram3D />
                            </Canvas>
                          </div>
                        )}

                        <div className="relative z-10 flex items-center gap-3">
                          <div className="relative">
                            {user.image ? (
                              <img
                                src={user.image}
                                alt={user.name || 'User'}
                                className={`w-11 h-11 rounded border object-cover ${
                                  isPro ? 'border-[#FFE600]' : 'border-[#333]'
                                }`}
                              />
                            ) : (
                              <div
                                className={`w-11 h-11 rounded flex items-center justify-center font-mono font-black text-[14px] ${
                                  isPro
                                    ? 'bg-gradient-to-br from-[#FFE600] to-[#FF5A00] text-black shadow-[0_0_15px_rgba(255,90,0,0.5)]'
                                    : 'bg-[#FF5A00] text-black'
                                }`}
                              >
                                {userInitials}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col min-w-0 pr-16">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[13px] font-mono font-black text-white uppercase truncate">
                                {user.name || 'Usuário'}
                              </span>
                              {isPro && <Sparkles className="w-3.5 h-3.5 text-[#FFE600] shrink-0 animate-spin" />}
                            </div>
                            <span className="text-[10px] font-mono text-[#888] truncate">
                              {user.email}
                            </span>
                          </div>
                        </div>

                        {/* Status Bar */}
                        <div
                          className={`mt-3 flex items-center justify-between pt-2 border-t text-[9px] font-mono ${
                            isPro ? 'border-[#3D2512]' : 'border-[#1C1C28]'
                          }`}
                        >
                          <span className="text-[#888] uppercase tracking-wider">
                            STATUS DA CONTA:
                          </span>
                          {isPro ? (
                            <span className="text-[#FFE600] font-black flex items-center gap-1">
                              <Crown className="w-3 h-3 fill-[#FFE600]" />
                              MAXPRO VIP ATIVO
                            </span>
                          ) : (
                            <span className="text-[#22C55E] font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                              FREE (2 NÓS)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Upgrade callout if user is Free */}
                      {!isPro && (
                        <div className="p-3 bg-gradient-to-r from-[#FF5A00]/10 to-transparent border-b border-[#222] flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5 text-[#FF5A00]" />
                            <span className="text-[10px] font-mono text-white font-bold">
                              Desbloqueie Mesh 6X
                            </span>
                          </div>
                          <Link
                            href="/#planos"
                            onClick={() => setDropdownOpen(false)}
                            className="text-[9px] font-mono font-black text-black bg-[#FF5A00] hover:bg-white px-2.5 py-1 uppercase transition-colors"
                          >
                            VIRAR PRO
                          </Link>
                        </div>
                      )}

                      {/* Navigation Links */}
                      <div className="py-2 flex flex-col">
                        <Link
                          href="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 text-[11px] font-mono font-bold transition-colors ${
                            isPro
                              ? 'text-[#F5F5F5] hover:text-[#FFE600] hover:bg-[#1A1208]'
                              : 'text-[#D4D4D4] hover:text-white hover:bg-[#151520]'
                          }`}
                        >
                          <LayoutDashboard className={`w-4 h-4 ${isPro ? 'text-[#FFE600]' : 'text-[#FF5A00]'}`} />
                          <span>{isPro ? 'PAINEL HOST MAXPRO' : 'PAINEL PRINCIPAL'}</span>
                        </Link>

                        <Link
                          href="/dashboard/rooms"
                          onClick={() => setDropdownOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 text-[11px] font-mono font-bold transition-colors ${
                            isPro
                              ? 'text-[#F5F5F5] hover:text-[#FFE600] hover:bg-[#1A1208]'
                              : 'text-[#D4D4D4] hover:text-white hover:bg-[#151520]'
                          }`}
                        >
                          <Tv className="w-4 h-4 text-[#3B82F6]" />
                          <span>SALAS AO VIVO (6X MESH)</span>
                        </Link>

                        <Link
                          href="/dashboard/videos"
                          onClick={() => setDropdownOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 text-[11px] font-mono font-bold transition-colors ${
                            isPro
                              ? 'text-[#F5F5F5] hover:text-[#FFE600] hover:bg-[#1A1208]'
                              : 'text-[#D4D4D4] hover:text-white hover:bg-[#151520]'
                          }`}
                        >
                          <Folder className="w-4 h-4 text-[#A855F7]" />
                          <span>MINHA BIBLIOTECA CLOUD</span>
                        </Link>

                        <Link
                          href="/dashboard/friends"
                          onClick={() => setDropdownOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 text-[11px] font-mono font-bold transition-colors ${
                            isPro
                              ? 'text-[#F5F5F5] hover:text-[#FFE600] hover:bg-[#1A1208]'
                              : 'text-[#D4D4D4] hover:text-white hover:bg-[#151520]'
                          }`}
                        >
                          <Users className="w-4 h-4 text-[#10B981]" />
                          <span>AMIGOS & CONVITES</span>
                        </Link>

                        <Link
                          href="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 text-[11px] font-mono font-bold transition-colors ${
                            isPro
                              ? 'text-[#F5F5F5] hover:text-[#FFE600] hover:bg-[#1A1208]'
                              : 'text-[#D4D4D4] hover:text-white hover:bg-[#151520]'
                          }`}
                        >
                          <Settings className="w-4 h-4 text-[#A3A3A3]" />
                          <span>CONFIGURAÇÕES DE CONTA</span>
                        </Link>
                      </div>

                      {/* Sign Out Action */}
                      <div
                        className={`p-2 border-t ${
                          isPro ? 'border-[#2A180C] bg-[#0E0905]' : 'border-[#222] bg-[#0C0C12]'
                        }`}
                      >
                        <button
                          onClick={() => {
                            setDropdownOpen(false)
                            signOut({ callbackUrl: '/' })
                          }}
                          className="w-full flex items-center justify-center gap-2 py-2.5 text-[11px] font-mono font-bold text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors border border-[#EF4444]/20 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>SAIR DA CONTA</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // ── GUEST VISITORS AUTH BUTTONS ──────────────────────
              <>
                <Link
                  href="/login"
                  className="hidden md:flex text-[10px] font-mono font-bold text-white hover:text-[#FF5A00] hover:bg-[#111] px-6 lg:px-8 py-6 transition-colors tracking-widest uppercase h-full items-center border-l border-[#222] cursor-pointer"
                >
                  Entrar
                </Link>

                <Link
                  href="/register"
                  className="hidden md:flex text-[11px] font-mono font-bold bg-[#F5F5F5] hover:bg-[#FF5A00] text-[#050505] hover:text-[#050505] px-8 lg:px-10 py-6 transition-colors tracking-widest uppercase h-full items-center cursor-pointer shadow-md"
                >
                  CRIAR CONTA
                </Link>
              </>
            )}

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="w-16 flex xl:hidden items-center justify-center bg-[#111] hover:bg-[#FF5A00] text-white hover:text-[#050505] transition-colors cursor-pointer border-l border-[#222] h-[68px]"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer - Terminal Style */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[1000] xl:hidden flex flex-col pt-[68px]"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-[#050505]/95 backdrop-blur-xl" />

          <div
            className="relative z-[1001] w-full bg-[#080808] border-b border-[#222] flex flex-col shadow-2xl animate-in slide-in-from-top-2 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Socket Status */}
            <div className="flex items-center gap-2 px-6 py-4 border-b border-[#222] bg-[#111]">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-[#22C55E] animate-pulse' : 'bg-[#EF2020]'
                }`}
              />
              <span className="text-[10px] font-mono text-[#A3A3A3] uppercase tracking-widest">
                STATUS: {isConnected ? 'ONLINE' : 'OFFLINE'} // NÓS: {viewerCount}
              </span>
            </div>

            {/* Nav links */}
            <div className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[12px] font-mono font-bold text-[#A3A3A3] hover:text-white hover:bg-[#111] px-6 py-4 border-b border-[#222] transition-colors uppercase tracking-widest cursor-pointer flex items-center justify-between"
                  onClick={(e) => handleNavClick(e, link.href)}
                >
                  <span>&gt; {link.label}</span>
                  <span className="text-[10px] text-[#555]">GOTO</span>
                </a>
              ))}
            </div>

            {/* Mobile Auth / Profile Footer */}
            {authStatus === 'authenticated' && user ? (
              <div
                className={`flex flex-col p-4 border-t gap-3 ${
                  isPro
                    ? 'bg-gradient-to-b from-[#1C1209] to-[#0A0704] border-[#FF5A00]/40'
                    : 'bg-[#0A0A0E] border-[#222]'
                }`}
              >
                <div className="flex items-center gap-3 p-2.5 bg-[#111] border border-[#222]">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || 'User'}
                      className={`w-9 h-9 rounded object-cover ${
                        isPro ? 'border border-[#FFE600]' : ''
                      }`}
                    />
                  ) : (
                    <div
                      className={`w-9 h-9 rounded flex items-center justify-center font-mono font-bold text-[12px] ${
                        isPro
                          ? 'bg-gradient-to-br from-[#FFE600] to-[#FF5A00] text-black font-black'
                          : 'bg-[#FF5A00] text-black'
                      }`}
                    >
                      {userInitials}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-mono font-bold text-white uppercase truncate">
                        {user.name || user.email}
                      </span>
                      {isPro && (
                        <span className="text-[8px] font-mono font-black bg-[#FF5A00] text-black px-1 rounded-xs">
                          PRO
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[9px] font-mono ${
                        isPro ? 'text-[#FFE600] font-bold' : 'text-[#22C55E]'
                      }`}
                    >
                      {isPro ? '👑 MAXPRO VIP (6X MESH)' : '● CONECTADO'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="text-center text-[11px] font-mono font-black bg-gradient-to-r from-[#FF5A00] to-[#FFE600] text-black py-3 uppercase tracking-wider shadow-[0_0_15px_rgba(255,90,0,0.3)]"
                  >
                    PAINEL PRO
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false)
                      signOut({ callbackUrl: '/' })
                    }}
                    className="text-center text-[11px] font-mono font-bold bg-[#1A1A24] text-[#EF4444] border border-[#EF4444]/30 py-3 uppercase tracking-wider cursor-pointer"
                  >
                    SAIR
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col bg-[#050505]">
                <Link
                  href="/login"
                  className="text-center text-[12px] font-mono font-bold text-white hover:text-[#FF5A00] py-4 border-b border-[#222] transition-colors uppercase tracking-widest cursor-pointer"
                  onClick={() => setMobileOpen(false)}
                >
                  [ ENTRAR ]
                </Link>
                <Link
                  href="/register"
                  className="text-center text-[12px] font-mono font-bold bg-[#F5F5F5] hover:bg-[#FF5A00] text-[#050505] hover:text-white py-5 transition-colors uppercase tracking-widest cursor-pointer"
                  onClick={() => setMobileOpen(false)}
                >
                  CRIAR CONTA GRÁTIS
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
