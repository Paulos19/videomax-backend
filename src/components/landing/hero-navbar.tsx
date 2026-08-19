'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
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
  Shield,
} from 'lucide-react'
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion'
import { useLandingSocket } from '@/lib/useLandingSocket'
import { useLenis } from '@studio-freight/react-lenis'
import { useSession, signOut } from 'next-auth/react'

const NAV_LINKS = [
  { label: 'SALAS_AO_VIVO', href: '#salas' },
  { label: 'SISTEMA', href: '#funcionalidades' },
  { label: 'SINCRONIA', href: '#sincronizacao' },
  { label: 'CHAT', href: '#chat' },
  { label: 'BIBLIOTECA', href: '#biblioteca' },
]

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

  const user = session?.user
  const userInitials = user?.name
    ? user.name.substring(0, 2).toUpperCase()
    : user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : 'VM'

  const isPro = (user as any)?.plan === 'PRO'

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

          {/* Right Section: Auth vs User Dropdown */}
          <div className="flex items-center h-full ml-auto">
            {authStatus === 'authenticated' && user ? (
              // ── AUTHENTICATED USER DROPDOWN ──────────────────────
              <div className="relative h-full" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 px-6 lg:px-8 py-4.5 h-full border-l border-[#222] hover:bg-[#111] transition-colors cursor-pointer group select-none"
                >
                  <div className="relative">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || 'User'}
                        className="w-8 h-8 rounded border border-[#333] object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-[#FF5A00] flex items-center justify-center text-black font-mono font-black text-[11px] shadow-[0_0_10px_rgba(255,90,0,0.3)]">
                        {userInitials}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#22C55E] rounded-full border-2 border-[#050505]" />
                  </div>

                  <div className="hidden sm:flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-mono font-bold text-white uppercase group-hover:text-[#FF5A00] transition-colors truncate max-w-[130px]">
                        {user.name || user.email?.split('@')[0]}
                      </span>
                      {isPro ? (
                        <span className="text-[8px] font-mono font-bold bg-[#FF5A00] text-black px-1 rounded-xs">
                          PRO
                        </span>
                      ) : (
                        <span className="text-[8px] font-mono font-bold bg-[#222] text-[#A3A3A3] px-1 rounded-xs">
                          FREE
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] font-mono text-[#777] tracking-wider">
                      CONECTADO
                    </span>
                  </div>

                  <ChevronDown
                    className={`w-4 h-4 text-[#A3A3A3] group-hover:text-white transition-transform duration-200 ${
                      dropdownOpen ? 'rotate-180 text-[#FF5A00]' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu Popup */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1 w-72 bg-[#09090D] border border-[#222] shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-[1000] overflow-hidden"
                    >
                      {/* User Header Summary */}
                      <div className="p-4 border-b border-[#222] bg-[#0E0E14]">
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name || 'User'}
                              className="w-10 h-10 rounded border border-[#333] object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-[#FF5A00] flex items-center justify-center text-black font-mono font-black text-[13px]">
                              {userInitials}
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="text-[13px] font-mono font-bold text-white uppercase truncate">
                              {user.name || 'Usuário'}
                            </span>
                            <span className="text-[11px] font-mono text-[#777] truncate">
                              {user.email}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#1C1C28]">
                          <span className="text-[9px] font-mono text-[#888] uppercase tracking-wider">
                            STATUS DO NÓ:
                          </span>
                          <span className="text-[9px] font-mono font-bold text-[#22C55E] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                            SESSÃO ATIVA
                          </span>
                        </div>
                      </div>

                      {/* Navigation Links */}
                      <div className="py-2 flex flex-col">
                        <Link
                          href="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-mono font-bold text-[#D4D4D4] hover:text-white hover:bg-[#151520] transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#FF5A00]" />
                          <span>PAINEL PRINCIPAL</span>
                        </Link>

                        <Link
                          href="/dashboard/rooms"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-mono font-bold text-[#D4D4D4] hover:text-white hover:bg-[#151520] transition-colors"
                        >
                          <Tv className="w-4 h-4 text-[#3B82F6]" />
                          <span>SALAS AO VIVO</span>
                        </Link>

                        <Link
                          href="/dashboard/videos"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-mono font-bold text-[#D4D4D4] hover:text-white hover:bg-[#151520] transition-colors"
                        >
                          <Folder className="w-4 h-4 text-[#A855F7]" />
                          <span>MINHA BIBLIOTECA</span>
                        </Link>

                        <Link
                          href="/dashboard/friends"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-mono font-bold text-[#D4D4D4] hover:text-white hover:bg-[#151520] transition-colors"
                        >
                          <Users className="w-4 h-4 text-[#10B981]" />
                          <span>AMIGOS & CONVITES</span>
                        </Link>

                        <Link
                          href="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-mono font-bold text-[#D4D4D4] hover:text-white hover:bg-[#151520] transition-colors"
                        >
                          <Settings className="w-4 h-4 text-[#A3A3A3]" />
                          <span>CONFIGURAÇÕES DE CONTA</span>
                        </Link>
                      </div>

                      {/* Sign Out Action */}
                      <div className="p-2 border-t border-[#222] bg-[#0C0C12]">
                        <button
                          onClick={() => {
                            setDropdownOpen(false)
                            signOut({ callbackUrl: '/' })
                          }}
                          className="w-full flex items-center justify-center gap-2 py-2.5 text-[11px] font-mono font-bold text-[#EF4444] hover:bg-[#EF4444]/10 hover:text-[#EF4444] transition-colors border border-[#EF4444]/20 cursor-pointer"
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
                  Autenticar
                </Link>

                <Link
                  href="/register"
                  className="hidden md:flex text-[11px] font-mono font-bold bg-[#F5F5F5] hover:bg-[#FF5A00] text-[#050505] hover:text-[#050505] px-8 lg:px-10 py-6 transition-colors tracking-widest uppercase h-full items-center cursor-pointer"
                >
                  INICIAR SESSÃO
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
              <div className="flex flex-col bg-[#0A0A0E] p-4 border-t border-[#222] gap-3">
                <div className="flex items-center gap-3 p-2 bg-[#111] border border-[#222]">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || 'User'}
                      className="w-8 h-8 rounded object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-[#FF5A00] flex items-center justify-center text-black font-mono font-bold text-[11px]">
                      {userInitials}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="text-[12px] font-mono font-bold text-white uppercase truncate">
                      {user.name || user.email}
                    </span>
                    <span className="text-[9px] font-mono text-[#22C55E]">● CONECTADO</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="text-center text-[11px] font-mono font-bold bg-[#FF5A00] text-black py-3 uppercase tracking-wider"
                  >
                    PAINEL
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
                  [ AUTENTICAR ]
                </Link>
                <Link
                  href="/register"
                  className="text-center text-[12px] font-mono font-bold bg-[#F5F5F5] hover:bg-[#FF5A00] text-[#050505] hover:text-white py-5 transition-colors uppercase tracking-widest cursor-pointer"
                  onClick={() => setMobileOpen(false)}
                >
                  INICIAR SESSÃO
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
