'use client'

import Link from 'next/link'
import { Play, Terminal } from 'lucide-react'
import { ThreeFooterWave } from './three-footer-wave'

export function LandingFooter() {
  return (
    <footer className="w-full bg-[#050505] relative z-40 border-t border-[#222] min-h-[60vh] flex flex-col justify-end overflow-hidden">
      
      {/* 3D Interactive Cyberpunk Grid Ocean */}
      <ThreeFooterWave />

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12 pt-32 pb-12">
        
        {/* Main Footer Layout - Brutalist Table Structure */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-0 mb-24 border-t border-l border-[#222] bg-[#050505]/60 backdrop-blur-sm">
          
          {/* Brand Column */}
          <div className="md:col-span-5 flex flex-col p-8 border-r border-b border-[#222]">
            <Link href="/" className="flex items-center gap-3 group w-fit mb-6">
              <div className="w-10 h-10 bg-[#FF5A00] flex items-center justify-center transition-transform group-hover:skew-x-[-10deg]">
                <Play className="w-4 h-4 text-[#050505] fill-[#050505] ml-1" />
              </div>
              <span className="font-black text-3xl tracking-tighter text-white uppercase">
                VIDEOMAX
              </span>
            </Link>
            <p className="text-[#A3A3A3] text-[12px] font-mono leading-relaxed max-w-[320px]">
              Ecossistema de cinema sincronizado de ultra-baixa latência para web e mobile. Construído para engenheiros e cinéfilos.
            </p>
          </div>

          {/* Links Column 1 */}
          <div className="md:col-span-2 flex flex-col p-8 border-r border-b border-[#222]">
            <span className="text-[#FF5A00] font-bold tracking-widest text-[10px] mb-6 font-mono uppercase bg-[#111] px-2 py-1 w-fit">
              [PRODUTO]
            </span>
            <div className="flex flex-col gap-4">
              <a href="#sincronizacao" className="text-[#8A8A8A] hover:text-white text-[12px] font-mono uppercase transition-colors hover:translate-x-1 transform duration-200">Sincronia 0ms</a>
              <a href="#chat" className="text-[#8A8A8A] hover:text-white text-[12px] font-mono uppercase transition-colors hover:translate-x-1 transform duration-200">Chat em Rede</a>
              <a href="#biblioteca" className="text-[#8A8A8A] hover:text-white text-[12px] font-mono uppercase transition-colors hover:translate-x-1 transform duration-200">Biblioteca Cloud</a>
            </div>
          </div>

          {/* Links Column 2 */}
          <div className="md:col-span-2 flex flex-col p-8 border-r border-b border-[#222]">
            <span className="text-[#FF5A00] font-bold tracking-widest text-[10px] mb-6 font-mono uppercase bg-[#111] px-2 py-1 w-fit">
              [SISTEMA]
            </span>
            <div className="flex flex-col gap-4">
              <Link href="/login" className="text-[#8A8A8A] hover:text-white text-[12px] font-mono uppercase transition-colors hover:translate-x-1 transform duration-200">Autenticar</Link>
              <Link href="/register" className="text-[#8A8A8A] hover:text-white text-[12px] font-mono uppercase transition-colors hover:translate-x-1 transform duration-200">Criar Instância</Link>
              <a href="#" className="text-[#8A8A8A] hover:text-white text-[12px] font-mono uppercase transition-colors hover:translate-x-1 transform duration-200">Documentação API</a>
            </div>
          </div>

          {/* Links Column 3 */}
          <div className="md:col-span-3 flex flex-col p-8 border-r border-b border-[#222]">
            <span className="text-[#FF5A00] font-bold tracking-widest text-[10px] mb-6 font-mono uppercase bg-[#111] px-2 py-1 w-fit">
              [SEGURANÇA]
            </span>
            <div className="flex flex-col gap-4">
              <a href="#" className="text-[#8A8A8A] hover:text-white text-[12px] font-mono uppercase transition-colors hover:translate-x-1 transform duration-200">Termos de Uso</a>
              <a href="#" className="text-[#8A8A8A] hover:text-white text-[12px] font-mono uppercase transition-colors hover:translate-x-1 transform duration-200">Privacidade</a>
              <a href="#" className="text-[#8A8A8A] hover:text-white text-[12px] font-mono uppercase transition-colors hover:translate-x-1 transform duration-200">Status dos Nós WebRTC</a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-[#333]">
          <p className="text-[#5F5F5F] text-[10px] font-mono uppercase tracking-widest">
            © {new Date().getFullYear()} VIDEOMAX INC. // TODOS OS DIREITOS RESERVADOS.
          </p>
          <div className="flex items-center gap-2 bg-[#080808] border border-[#333] px-4 py-2">
            <Terminal className="w-3.5 h-3.5 text-[#22C55E]" />
            <span className="text-[#A3A3A3] text-[10px] font-mono tracking-wider uppercase">
              SISTEMAS OPERACIONAIS EM <span className="text-[#22C55E] animate-pulse">GREEN STATUS</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  )
}
