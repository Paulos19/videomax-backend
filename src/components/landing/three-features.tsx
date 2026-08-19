'use client'

import { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Play, Pause, Radio, RefreshCw, Zap, ShieldCheck, AlertTriangle, Monitor, Smartphone, Laptop, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ── LIGHTWEIGHT 3D BACKGROUND PARTICLES ───────────────────────────
function BackgroundTelemetryParticles({ isSynced }: { isSynced: boolean }) {
  const pointsRef = useRef<THREE.Points>(null)
  const particleCount = 80

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2
      const radius = 3.5 + Math.random() * 2
      pos[i * 3] = Math.cos(angle) * radius
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4
      pos[i * 3 + 2] = Math.sin(angle) * radius - 2
    }
    return pos
  }, [particleCount])

  useFrame((state, delta) => {
    if (!pointsRef.current) return
    const speed = isSynced ? 0.3 : 0.8
    pointsRef.current.rotation.y += delta * speed
    pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.05
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color={isSynced ? '#22C55E' : '#FF5A00'}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// ── MAIN INTERACTIVE CO-WATCHING TELEMETRY COMPONENT ──────────────
export function ThreeFeatures() {
  const [mounted, setMounted] = useState(false)
  const [isSynced, setIsSynced] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(38.4)
  const [audioWaves, setAudioWaves] = useState<number[]>([40, 75, 55, 90, 65, 30, 85, 95, 60, 45])

  useEffect(() => setMounted(true), [])

  // Live timer tick
  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setCurrentTime((prev) => (prev + 0.1) % 120)
      setAudioWaves([
        Math.floor(Math.random() * 60 + 30),
        Math.floor(Math.random() * 70 + 25),
        Math.floor(Math.random() * 85 + 15),
        Math.floor(Math.random() * 50 + 40),
        Math.floor(Math.random() * 95 + 5),
        Math.floor(Math.random() * 65 + 30),
        Math.floor(Math.random() * 80 + 20),
        Math.floor(Math.random() * 75 + 25),
        Math.floor(Math.random() * 90 + 10),
        Math.floor(Math.random() * 55 + 35),
      ])
    }, 100)
    return () => clearInterval(interval)
  }, [isPlaying])

  if (!mounted) return null

  // Calculate times for each viewer
  const hostTime = currentTime
  const peer1Time = isSynced ? currentTime : (currentTime - 2.85 + 120) % 120
  const peer2Time = isSynced ? currentTime : (currentTime + 3.40) % 120

  const formatTime = (timeInSec: number) => {
    const mins = Math.floor(timeInSec / 60).toString().padStart(2, '0')
    const secs = Math.floor(timeInSec % 60).toString().padStart(2, '0')
    const ms = Math.floor((timeInSec % 1) * 10).toString()
    return `${mins}:${secs}.${ms}00`
  }

  const formatProgress = (timeInSec: number) => {
    return Math.min(100, Math.max(0, (timeInSec / 120) * 100))
  }

  return (
    <div className="relative w-full h-full min-h-[500px] lg:min-h-[560px] bg-[#070709] border border-[#222] flex flex-col justify-between overflow-hidden select-none">
      
      {/* 1. Subtle Lightweight 3D Canvas in the Background */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <BackgroundTelemetryParticles isSynced={isSynced} />
        </Canvas>
      </div>

      {/* 2. Top Cyberpunk HUD Header */}
      <div className="relative z-10 p-4 sm:p-6 border-b border-[#222] bg-[#0A0A0E]/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isSynced ? 'bg-[#22C55E] animate-pulse shadow-[0_0_10px_#22C55E]' : 'bg-[#EF4444]'}`} />
          <span className="text-[11px] font-mono font-bold uppercase text-white tracking-widest">
            {isSynced ? 'PROTOCOLO VIDEOMAX: 0MS SINCRONIA ATIVA' : 'MODO DESALINHADO: CONTAGEM DISCORD'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono px-2.5 py-1 uppercase font-bold border ${
            isSynced ? 'bg-[#22C55E]/10 border-[#22C55E]/40 text-[#22C55E]' : 'bg-[#EF4444]/10 border-[#EF4444]/40 text-[#EF4444]'
          }`}>
            {isSynced ? 'LATÊNCIA: 0.00MS (P2P MESH)' : 'LATÊNCIA: +3.40S (SPOILERS)'}
          </span>
        </div>
      </div>

      {/* 3. Interactive Multi-Device Cards Grid */}
      <div className="relative z-10 flex-1 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
        
        {/* CARD 1: PEER A (São Paulo - Mobile) */}
        <div className={`p-4 bg-[#0D0D12] border transition-all duration-300 relative ${
          isSynced 
            ? 'border-[#22C55E]/40 shadow-[0_0_20px_rgba(34,197,94,0.08)]' 
            : 'border-red-500/30'
        }`}>
          {/* Status Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#222]">
            <div className="flex items-center gap-2">
              <Smartphone className="w-3.5 h-3.5 text-[#A3A3A3]" />
              <span className="text-[10px] font-mono text-[#F5F5F5] font-bold uppercase">Peer: Matheus</span>
            </div>
            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 ${
              isSynced ? 'text-[#22C55E] bg-[#22C55E]/10' : 'text-red-400 bg-red-500/10'
            }`}>
              {isSynced ? '● 0ms LOCK' : '▲ -2.85s ATRASO'}
            </span>
          </div>

          {/* Mini Scene Preview */}
          <div className="w-full h-24 bg-[#050508] border border-[#222] relative overflow-hidden flex flex-col justify-between p-2.5 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-[#555]">SÃO PAULO (4G)</span>
              <span className={`text-[10px] font-mono font-bold ${isSynced ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                {formatTime(peer1Time)}
              </span>
            </div>

            {/* Audio waveform */}
            <div className="flex items-end gap-1 h-8">
              {audioWaves.map((h, i) => (
                <div 
                  key={i} 
                  className={`flex-1 transition-all duration-100 ${isSynced ? 'bg-[#22C55E]' : 'bg-[#FF5A00]'}`}
                  style={{ height: `${isSynced ? h : Math.max(10, (h + i * 8) % 100)}%` }}
                />
              ))}
            </div>

            {/* Scrubber bar */}
            <div className="w-full h-1 bg-[#222] rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-100 ${isSynced ? 'bg-[#22C55E]' : 'bg-[#FF5A00]'}`}
                style={{ width: `${formatProgress(peer1Time)}%` }}
              />
            </div>
          </div>

          <div className="text-[10px] font-mono text-[#777] flex items-center justify-between">
            <span>Buffer: 100%</span>
            <span className={isSynced ? 'text-[#22C55E]' : 'text-[#EF4444]'}>
              {isSynced ? '✓ Sincronizado' : '✖ Ouvindo piada atrasado'}
            </span>
          </div>
        </div>

        {/* CARD 2: HOST (Você - Master Node - Center Highlight) */}
        <div className={`p-4 bg-[#111118] border-2 transition-all duration-300 relative lg:-translate-y-1 ${
          isSynced 
            ? 'border-[#22C55E] shadow-[0_0_30px_rgba(34,197,94,0.15)]' 
            : 'border-[#FF5A00] shadow-[0_0_20px_rgba(255,90,0,0.15)]'
        }`}>
          <div className="absolute -top-3 left-4 bg-[#FF5A00] text-black text-[9px] font-mono font-black uppercase px-2 py-0.5 tracking-widest">
            HOST DA SALA (MASTER)
          </div>

          {/* Status Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#222] pt-1">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-[#FF5A00]" />
              <span className="text-[11px] font-mono text-white font-bold uppercase">Lucas (Você)</span>
            </div>
            <span className="text-[9px] font-mono font-bold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5">
              ORIGEM MASTER
            </span>
          </div>

          {/* Cinema Scene Simulator */}
          <div className="w-full h-28 bg-[#050508] border border-[#333] relative overflow-hidden flex flex-col justify-between p-3 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF5A00] animate-pulse" />
                <span className="text-[9px] font-mono text-[#A3A3A3]">1080P // 60FPS</span>
              </div>
              <span className="text-[13px] font-mono font-black text-white">
                {formatTime(hostTime)}
              </span>
            </div>

            {/* Center audio visualizer */}
            <div className="flex items-end gap-1.5 h-10 px-2">
              {audioWaves.map((h, i) => (
                <div 
                  key={i} 
                  className={`flex-1 transition-all duration-100 ${isSynced ? 'bg-[#22C55E]' : 'bg-[#FF5A00]'}`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>

            {/* Scrubber bar */}
            <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#FF5A00] transition-all duration-100"
                style={{ width: `${formatProgress(hostTime)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-[#A3A3A3]">Transmissão: Fibra 1Gbps</span>
            <span className="text-[#22C55E] font-bold">● Transmitindo</span>
          </div>
        </div>

        {/* CARD 3: PEER B (Lisboa - Laptop - Spoilers) */}
        <div className={`p-4 bg-[#0D0D12] border transition-all duration-300 relative ${
          isSynced 
            ? 'border-[#22C55E]/40 shadow-[0_0_20px_rgba(34,197,94,0.08)]' 
            : 'border-red-500/30'
        }`}>
          {/* Status Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#222]">
            <div className="flex items-center gap-2">
              <Laptop className="w-3.5 h-3.5 text-[#A3A3A3]" />
              <span className="text-[10px] font-mono text-[#F5F5F5] font-bold uppercase">Peer: Carol</span>
            </div>
            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 ${
              isSynced ? 'text-[#22C55E] bg-[#22C55E]/10' : 'text-red-400 bg-red-500/10'
            }`}>
              {isSynced ? '● 0ms LOCK' : '▲ +3.40s SPOILER!'}
            </span>
          </div>

          {/* Mini Scene Preview */}
          <div className="w-full h-24 bg-[#050508] border border-[#222] relative overflow-hidden flex flex-col justify-between p-2.5 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-[#555]">LISBOA (WIFI 6)</span>
              <span className={`text-[10px] font-mono font-bold ${isSynced ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                {formatTime(peer2Time)}
              </span>
            </div>

            {/* Audio waveform */}
            <div className="flex items-end gap-1 h-8">
              {audioWaves.map((h, i) => (
                <div 
                  key={i} 
                  className={`flex-1 transition-all duration-100 ${isSynced ? 'bg-[#22C55E]' : 'bg-[#EF4444]'}`}
                  style={{ height: `${isSynced ? h : Math.max(15, (h - i * 6 + 100) % 100)}%` }}
                />
              ))}
            </div>

            {/* Scrubber bar */}
            <div className="w-full h-1 bg-[#222] rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-100 ${isSynced ? 'bg-[#22C55E]' : 'bg-[#EF4444]'}`}
                style={{ width: `${formatProgress(peer2Time)}%` }}
              />
            </div>
          </div>

          <div className="text-[10px] font-mono text-[#777] flex items-center justify-between">
            <span>Buffer: 100%</span>
            <span className={isSynced ? 'text-[#22C55E]' : 'text-[#EF4444]'}>
              {isSynced ? '✓ Sincronizado' : '✖ Rindo da piada antes!'}
            </span>
          </div>
        </div>

      </div>

      {/* 4. Interactive Bottom Control Deck */}
      <div className="relative z-10 bg-[#0A0A0E] border-t border-[#222] p-4 sm:p-5 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          {/* Play/Pause & Status */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 bg-[#FF5A00] hover:bg-[#F5F5F5] text-black flex items-center justify-center transition-colors cursor-pointer"
              title={isPlaying ? 'Pausar reprodução' : 'Reproduzir'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
            </button>
            <div>
              <span className="text-[11px] font-mono font-bold text-white uppercase block">
                {isPlaying ? 'Reproduzindo em Tempo Real' : 'Pausado em Todas as Telas'}
              </span>
              <span className="text-[10px] font-mono text-[#777] uppercase">
                {isSynced ? '3 Dispositivos Travados no mesmo Frame' : 'Dispositivos com Desvio Temporal'}
              </span>
            </div>
          </div>

          {/* Sincronia Toggle Button */}
          <button
            onClick={() => setIsSynced(!isSynced)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-[11px] font-mono font-bold uppercase transition-all cursor-pointer border ${
              isSynced
                ? 'bg-[#22C55E] hover:bg-[#16A34A] text-black border-[#22C55E] shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                : 'bg-[#111] hover:bg-[#FF5A00] text-white hover:text-black border-[#333]'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSynced ? '' : 'animate-spin'}`} />
            <span>{isSynced ? '✓ 0MS SINCRONIA ATIVA' : '⚡ CLIQUE PARA FORÇAR 0MS SYNC'}</span>
          </button>
        </div>

        {/* Master Timeline Scrubber */}
        <div className="flex items-center gap-3 pt-2 border-t border-[#1a1a24]">
          <span className="text-[10px] font-mono text-[#777] uppercase shrink-0">Arraste o Vídeo:</span>
          <input
            type="range"
            min="0"
            max="120"
            step="0.1"
            value={currentTime}
            onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-[#222] rounded-lg appearance-none cursor-pointer accent-[#FF5A00]"
          />
          <span className="text-[10px] font-mono font-bold text-white shrink-0">
            {formatTime(currentTime)}
          </span>
        </div>
      </div>

    </div>
  )
}
