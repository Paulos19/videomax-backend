'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Terminal, Code, Cpu } from 'lucide-react'
import { ThreeFeatures } from './three-features'

export function FeaturesParallax() {
  const [roomCode, setRoomCode] = useState('JF4LU8')

  return (
    <section id="funcionalidades" className="relative w-full bg-[#050505] text-white z-20 border-t border-[#222] flex flex-col">
      
      {/* BLOCK 1: O PROBLEMA */}
      <div className="w-full min-h-[100vh] grid grid-cols-1 lg:grid-cols-2 border-b border-[#222]">
        {/* TEXT */}
        <div className="flex flex-col justify-center p-8 lg:p-24 border-r border-[#222]">
          <span className="text-[10px] font-mono text-[#FF5A00] tracking-widest uppercase mb-6 bg-[#111] w-fit px-2 py-1">
            [01 — O PROBLEMA]
          </span>
          <h2 className="text-[50px] sm:text-[70px] font-black leading-[0.9] tracking-tight mb-8 text-[#F5F5F5] uppercase">
            Adeus ao<br/>"1, 2, 3 e Já".
          </h2>
          <p className="text-[#A3A3A3] text-[14px] font-mono leading-relaxed border-l-2 border-[#FF5A00] pl-4 max-w-[500px]">
            Esqueça a contagem regressiva manual pelo Discord. Nosso protocolo de SINCRONIA 0MS garante que todos riam da mesma piada no milissegundo exato. Sem lag, sem spoilers acidentais.
          </p>
        </div>
        
        {/* VISUAL (ThreeJS Interactive Co-Watching Array) */}
        <div className="relative h-[600px] lg:h-auto min-h-[520px] bg-[#080808] flex flex-col justify-center">
          {/* Overlay Grid lines for extra technical feel */}
          <div className="absolute inset-0 pointer-events-none z-10 opacity-20" 
               style={{ backgroundImage: 'linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          <ThreeFeatures />
          
          <div className="absolute top-8 right-8 w-2 h-2 bg-[#FF5A00] z-20 pointer-events-none" />
          <div className="absolute bottom-8 right-8 w-2 h-2 bg-[#F5F5F5] z-20 pointer-events-none" />
        </div>
      </div>

      {/* BLOCK 2: A SOLUÇÃO (Alternated Layout) */}
      <div className="w-full min-h-[100vh] grid grid-cols-1 lg:grid-cols-2 border-b border-[#222]">
        
        {/* VISUAL (Code/Tech element) */}
        <div className="relative h-[60vh] lg:h-auto bg-[#0A0A0A] border-r border-[#222] p-8 lg:p-16 flex flex-col justify-center order-2 lg:order-1 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF5A00] to-transparent opacity-50" />
          
          <div className="w-full border border-[#333] bg-[#050505] p-6 shadow-2xl relative z-10">
            <div className="flex items-center gap-2 mb-6 border-b border-[#222] pb-4">
              <Cpu className="w-4 h-4 text-[#FF5A00]" />
              <span className="text-[10px] font-mono text-white tracking-widest uppercase">
                WEBRTC_SYNC_NODE
              </span>
            </div>
            
            <div className="font-mono text-[10px] sm:text-[12px] text-[#A3A3A3] flex flex-col gap-2">
              <p><span className="text-[#5F5F5F]">01</span> <span className="text-[#FF5A00]">const</span> room = <span className="text-[#3B82F6]">join</span>('MAX_8829')</p>
              <p><span className="text-[#5F5F5F]">02</span> room.<span className="text-[#3B82F6]">on</span>('seek', (time) =&gt; {'{'}</p>
              <p><span className="text-[#5F5F5F]">03</span> &nbsp;&nbsp;player.<span className="text-[#3B82F6]">seekTo</span>(time)</p>
              <p><span className="text-[#5F5F5F]">04</span> &nbsp;&nbsp;buffer.<span className="text-[#3B82F6]">sync</span>()</p>
              <p><span className="text-[#5F5F5F]">05</span> {'}'})</p>
              <p className="mt-4 text-[#22C55E] animate-pulse">&gt; CONNECTION ESTABLISHED [0MS LATENCY]</p>
            </div>
          </div>
        </div>

        {/* TEXT */}
        <div className="flex flex-col justify-center p-8 lg:p-24 order-1 lg:order-2">
          <span className="text-[10px] font-mono text-[#FF5A00] tracking-widest uppercase mb-6 bg-[#111] w-fit px-2 py-1">
            [02 — A SOLUÇÃO]
          </span>
          <h2 className="text-[50px] sm:text-[70px] font-black leading-[0.9] tracking-tight mb-8 text-[#F5F5F5] uppercase">
            Controles<br/>Em Rede.
          </h2>
          <p className="text-[#A3A3A3] text-[14px] font-mono leading-relaxed border-l-2 border-[#FF5A00] pl-4 max-w-[500px]">
            Qualquer pessoa na sala pode pausar ou avançar. A infraestrutura WebRTC cuida para que o player de todo mundo pule para o exato frame sem engasgos.
          </p>
        </div>
      </div>

      {/* BLOCK 3: ACESSO */}
      <div id="salas" className="w-full min-h-[80vh] grid grid-cols-1 lg:grid-cols-2">
        {/* TEXT */}
        <div className="flex flex-col justify-center p-8 lg:p-24 border-r border-[#222]">
          <span className="text-[10px] font-mono text-[#FF5A00] tracking-widest uppercase mb-6 bg-[#111] w-fit px-2 py-1">
            [03 — ACESSO]
          </span>
          <h2 className="text-[50px] sm:text-[70px] font-black leading-[0.9] tracking-tight mb-8 text-transparent uppercase" style={{ WebkitTextStroke: '2px #FF5A00' }}>
            Crie Seu<br/>Cinema.
          </h2>
          <p className="text-[#A3A3A3] text-[14px] font-mono leading-relaxed border-l-2 border-[#FF5A00] pl-4 max-w-[500px]">
            Tudo direto no navegador. Insira seu código de sala abaixo para assumir o controle da sessão como Host.
          </p>
        </div>
        
        {/* VISUAL (Action Form) */}
        <div className="bg-[#080808] flex flex-col justify-center p-8 lg:p-24">
          <div className="w-full max-w-[500px] flex flex-col">
            <div className="border-l-4 border-[#FF5A00] pl-4 mb-8">
              <h3 className="text-[20px] font-black text-white uppercase tracking-wider mb-2">Entrar na Sessão</h3>
              <p className="text-[12px] font-mono text-[#5F5F5F] uppercase">System Access Protocol</p>
            </div>

            {/* Brutalist Input Form */}
            <div className="flex flex-col border border-[#333] bg-[#050505]">
              <div className="flex items-center px-6 w-full h-16 border-b border-[#333]">
                <Terminal className="w-5 h-5 text-[#5F5F5F] mr-4" />
                <span className="text-[12px] text-[#A3A3A3] font-mono mr-2 uppercase">SALA_ID:</span>
                <input 
                  type="text" 
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="bg-transparent border-none outline-none text-white font-mono text-[16px] w-full uppercase placeholder:text-[#333]"
                  placeholder="CÓDIGO"
                />
              </div>
              <Link href={`/room/${roomCode}`} className="w-full h-16 bg-[#F5F5F5] hover:bg-[#FF5A00] text-[#050505] hover:text-white text-[14px] font-mono font-bold transition-colors flex items-center justify-center uppercase cursor-pointer">
                INICIAR SESSÃO
              </Link>
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}
