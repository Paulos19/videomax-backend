'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Play } from 'lucide-react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useLandingSocket } from '@/lib/useLandingSocket'

const NAV_LINKS = [
  { label: 'SALAS_AO_VIVO', href: '#salas' },
  { label: 'SISTEMA', href: '#funcionalidades' },
  { label: 'BIBLIOTECA', href: '#biblioteca' },
]

export function HeroNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  
  const { scrollY } = useScroll()
  const { isConnected, viewerCount } = useLandingSocket()

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious()
    if (latest > 50) {
      setScrolled(true)
    } else {
      setScrolled(false)
    }
    
    // Hide when scrolling down past 150px, show when scrolling up
    if (latest > 150 && latest > previous!) {
      setHidden(true)
    } else {
      setHidden(false)
    }
  })

  return (
    <>
      <motion.header
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" }
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 border-b border-[#222] ${
          scrolled ? 'bg-[#050505]/90 backdrop-blur-md' : 'bg-[#050505]'
        }`}
      >
        <div className="w-full flex items-center justify-between">
          
          {/* Logo - Brutalist Block */}
          <Link href="/" className="flex items-center gap-3 group shrink-0 border-r border-[#222] px-6 lg:px-12 py-5 hover:bg-[#111] transition-colors h-full">
            <div className="w-6 h-6 bg-[#FF5A00] flex items-center justify-center transition-transform group-hover:skew-x-[-10deg]">
              <Play className="w-3 h-3 text-[#050505] fill-[#050505] ml-0.5" />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase text-[#F5F5F5]">
              VIDEOMAX
            </span>
          </Link>

          {/* Center Links - Terminal Style */}
          <nav className="hidden lg:flex items-center h-full">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[10px] font-mono font-bold text-[#A3A3A3] hover:text-white hover:bg-[#111] px-8 py-6 border-r border-[#222] transition-colors tracking-widest"
              >
                [{link.label}]
              </a>
            ))}
            
            {/* System Status Node */}
            <div className="flex items-center gap-2 px-8 py-6 border-r border-[#222]">
              <span className={`w-2 h-2 ${isConnected ? 'bg-[#22C55E] animate-pulse' : 'bg-[#EF2020]'}`} />
              <span className="text-[10px] font-mono text-[#5F5F5F] tracking-widest">
                {isConnected ? `SYS_ONLINE: ${viewerCount}` : 'SYS_OFFLINE'}
              </span>
            </div>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center h-full ml-auto">
            <Link
              href="/login"
              className="hidden md:flex text-[10px] font-mono font-bold text-white hover:text-[#FF5A00] px-8 py-6 transition-colors tracking-widest uppercase h-full items-center"
            >
              Autenticar
            </Link>

            <Link
              href="/register"
              className="hidden md:flex text-[12px] font-mono font-bold bg-[#F5F5F5] hover:bg-[#FF5A00] text-[#050505] hover:text-[#050505] px-10 py-6 transition-colors tracking-widest uppercase h-full items-center"
            >
              INICIAR SESSÃO
            </Link>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="w-16 flex lg:hidden items-center justify-center bg-[#111] hover:bg-[#FF5A00] text-white hover:text-[#050505] transition-colors cursor-pointer border-l border-[#222] h-[68px]"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer - Terminal Style */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex flex-col pt-[68px]" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-[#050505]/95 backdrop-blur-xl" />
          
          <div 
            className="relative z-50 w-full bg-[#080808] border-b border-[#222] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Socket Status */}
            <div className="flex items-center gap-2 px-6 py-4 border-b border-[#222] bg-[#111]">
              <span className={`w-2 h-2 ${isConnected ? 'bg-[#22C55E] animate-pulse' : 'bg-[#EF2020]'}`} />
              <span className="text-[10px] font-mono text-[#A3A3A3] uppercase tracking-widest">
                STATUS: {isConnected ? 'ONLINE' : 'OFFLINE'} // NODES: {viewerCount}
              </span>
            </div>

            <div className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[12px] font-mono font-bold text-[#A3A3A3] hover:text-white hover:bg-[#111] px-6 py-5 border-b border-[#222] transition-colors uppercase tracking-widest"
                  onClick={() => setMobileOpen(false)}
                >
                  &gt; {link.label}
                </a>
              ))}
            </div>

            <div className="flex flex-col bg-[#050505]">
              <Link
                href="/login"
                className="text-center text-[12px] font-mono font-bold text-white hover:text-[#FF5A00] py-5 border-b border-[#222] transition-colors uppercase tracking-widest"
                onClick={() => setMobileOpen(false)}
              >
                [ AUTENTICAR ]
              </Link>
              <Link
                href="/register"
                className="text-center text-[12px] font-mono font-bold bg-[#F5F5F5] hover:bg-[#FF5A00] text-[#050505] py-6 transition-colors uppercase tracking-widest"
                onClick={() => setMobileOpen(false)}
              >
                INICIAR SESSÃO
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
