'use client'

import { useState, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { RefreshCw, Radio } from 'lucide-react'

export function SectionSync() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [sliderPos, setSliderPos] = useState(50) // Host position %
  const [userPos, setUserPos] = useState(85)   // User initial out of sync position %
  const [isSyncing, setIsSyncing] = useState(false)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // Horizontal parallax for the giant text (Marquee effect)
  const xLeft = useTransform(scrollYProgress, [0, 1], ['0%', '-30%'])
  const xRight = useTransform(scrollYProgress, [0, 1], ['-30%', '0%'])

  const triggerAutoSync = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setUserPos(sliderPos)
      setIsSyncing(false)
    }, 600)
  }

  return (
    <section
      ref={sectionRef}
      id="sincronizacao"
      className="relative min-h-[100vh] w-full bg-[#050505] flex flex-col justify-center py-32 overflow-hidden border-t border-white/[0.04]"
    >
      {/* Background Marquee Text */}
      <div className="absolute inset-0 flex flex-col justify-center pointer-events-none opacity-[0.15] select-none overflow-hidden">
        <motion.div style={{ x: xLeft }} className="whitespace-nowrap">
          <span className="text-[15vw] font-black leading-none text-transparent" style={{ WebkitTextStroke: '2px #F5F5F5' }}>
            TELEMETRIA 0MS EM TEMPO REAL. TELEMETRIA 0MS EM TEMPO REAL. 
          </span>
        </motion.div>
        <motion.div style={{ x: xRight }} className="whitespace-nowrap mt-4">
          <span className="text-[15vw] font-black leading-none text-transparent" style={{ WebkitTextStroke: '2px #FF5A00' }}>
            SINCRONIA PERFEITA. SEM DELAYS. SINCRONIA PERFEITA. SEM DELAYS.
          </span>
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-center">
        
        {/* Left: Asymmetric Typography */}
        <div className="lg:col-span-5 flex flex-col">
          <span className="text-[10px] font-mono text-[#FF5A00] tracking-widest uppercase mb-4">
            [SYS_SYNC: ENABLED]
          </span>
          <h2 className="text-[40px] sm:text-[60px] font-black leading-[0.9] tracking-tight text-white mb-8 uppercase">
            Sem atrasos.<br/>Sem spoilers.
          </h2>
          <p className="text-[14px] font-mono text-[#A3A3A3] leading-relaxed border-l-2 border-[#FF5A00] pl-4">
            Se alguém pausar, avançar ou voltar 10 segundos, todos os participantes na sala recebem o comando instantaneamente via WebSockets. 
            <br/><br/>
            Experimente no simulador ao lado: mude a posição do vídeo como Host e force o Sync.
          </p>
        </div>

        {/* Right: Technical Brutalist Simulator */}
        <div className="lg:col-span-7">
          <div className="w-full bg-[#080808] border border-[#222] p-8 relative">
            {/* Corner accoutrements for brutalist/tech feel */}
            <div className="absolute top-0 left-0 w-2 h-2 bg-[#FF5A00]" />
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#FF5A00]" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-[#222]" />
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#222]" />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12 pb-6 border-b border-[#222]">
              <div>
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#FF5A00] animate-pulse" />
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    Painel de Telemetria
                  </span>
                </div>
              </div>

              <button
                onClick={triggerAutoSync}
                disabled={isSyncing}
                className="inline-flex items-center gap-2 bg-[#F5F5F5] hover:bg-[#FFF] text-[#050505] text-[10px] uppercase font-mono font-bold px-4 py-3 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{userPos === sliderPos ? '0MS (SYNCED)' : 'FORÇAR SYNC'}</span>
              </button>
            </div>

            {/* Timeline Track */}
            <div className="relative py-16 px-2">
              {/* Technical Line */}
              <div className="w-full h-[1px] bg-[#333] relative">
                <div
                  className="absolute top-0 left-0 h-full bg-[#FF5A00]"
                  style={{ width: `${sliderPos}%` }}
                />
              </div>

              {/* HOST Marker */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 flex flex-col items-center transition-all duration-300"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="w-[2px] h-8 bg-[#FF5A00]" />
                <div className="absolute top-10 flex flex-col items-center">
                  <span className="text-[10px] font-mono text-[#FF5A00] bg-[#111] px-1">HOST</span>
                </div>
              </div>

              {/* USER Marker */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 flex flex-col items-center transition-all ${
                  isSyncing ? 'duration-500 ease-out' : 'duration-100'
                }`}
                style={{ left: `${userPos}%` }}
              >
                <div className={`w-4 h-4 rounded-none cursor-grab ${
                  userPos === sliderPos ? 'bg-[#F5F5F5]' : 'bg-[#EF2020]'
                }`} />
                <div className="absolute -top-10 flex flex-col items-center">
                  <span className="text-[10px] font-mono text-white bg-[#111] px-1">VOCÊ</span>
                  <span className={`text-[10px] font-mono whitespace-nowrap mt-1 ${userPos === sliderPos ? 'text-[#A3A3A3]' : 'text-[#EF2020]'}`}>
                    {userPos === sliderPos ? '0ms' : `+${Math.abs(userPos - sliderPos)}s`}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-8 pt-6 border-t border-[#222] flex flex-col items-start gap-4">
              <span className="text-[10px] font-mono text-[#A3A3A3] uppercase">Ajustar Timeline do Host:</span>
              <input
                type="range"
                min="10"
                max="90"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="w-full sm:w-64 accent-[#FF5A00] cursor-pointer"
              />
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
