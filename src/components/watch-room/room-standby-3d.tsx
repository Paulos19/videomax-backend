'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Monitor, Film, FolderOpen, Play, Crown, Zap, Radio, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── 3D HOLOGRAPHIC VIDEOMAX STANDBY CORE ──────────────────────────
function StandbyCoreMesh({ isPro }: { isPro: boolean }) {
  const coreRef = useRef<THREE.Mesh>(null)
  const ring1Ref = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)
  const gridRef = useRef<THREE.GridHelper>(null)
  const particlesRef = useRef<THREE.Points>(null)

  const [particlePositions] = useMemo(() => {
    const count = 48
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const radius = 1.2 + Math.random() * 0.8
      pos[i * 3] = Math.cos(angle) * radius
      pos[i * 3 + 1] = (Math.random() - 0.5) * 1.2
      pos[i * 3 + 2] = Math.sin(angle) * radius
    }
    return [pos]
  }, [])

  const colorPrimary = isPro ? '#FFE600' : '#FF5A00'
  const colorSecondary = isPro ? '#FF8A00' : '#00F0FF'

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.9
      coreRef.current.rotation.x = Math.sin(t * 0.6) * 0.25
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 1.1
      ring1Ref.current.rotation.x = Math.PI / 4 + Math.sin(t * 0.5) * 0.2
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.9
      ring2Ref.current.rotation.y = Math.PI / 3 + Math.cos(t * 0.5) * 0.2
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.25
    }
  })

  return (
    <group>
      {/* 3D Central Polyhedral Videomax Core */}
      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.75, 0]} />
        <meshBasicMaterial color={colorPrimary} wireframe transparent opacity={0.85} />
      </mesh>

      {/* Orbiting Orbital Laser Ring 1 */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.3, 0.02, 8, 36]} />
        <meshBasicMaterial color={colorSecondary} transparent opacity={0.7} />
      </mesh>

      {/* Orbiting Orbital Laser Ring 2 */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.55, 0.018, 8, 36]} />
        <meshBasicMaterial color={colorPrimary} transparent opacity={0.5} />
      </mesh>

      {/* Quantum Sparkle Particles */}
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
        <pointsMaterial size={0.05} color={colorPrimary} transparent opacity={0.9} />
      </points>
    </group>
  )
}

interface RoomStandby3DViewProps {
  isPro?: boolean
  canControl?: boolean
  onSelectVideo?: () => void
  onShareScreen?: () => void
  onOpenLibrary?: () => void
}

export function RoomStandby3DView({
  isPro = false,
  canControl = true,
  onSelectVideo,
  onShareScreen,
  onOpenLibrary,
}: RoomStandby3DViewProps) {
  return (
    <div className="relative w-full h-full min-h-[360px] bg-slate-900 dark:bg-[#050508] flex items-center justify-center overflow-hidden select-none transition-colors">
      
      {/* Ambient background grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage: isPro
            ? 'linear-gradient(#FFE600 1px, transparent 1px), linear-gradient(90deg, #FFE600 1px, transparent 1px)'
            : 'linear-gradient(#FF5A00 1px, transparent 1px), linear-gradient(90deg, #FF5A00 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Center 3D Holographic Core Viewport */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-75">
        <Canvas camera={{ position: [0, 0, 3.8], fov: 45 }}>
          <ambientLight intensity={0.9} />
          <StandbyCoreMesh isPro={isPro} />
        </Canvas>
      </div>

      {/* Futuristic HUD Interactive Overlay */}
      <div className="relative z-10 max-w-lg mx-auto p-6 text-center space-y-5 bg-white/95 dark:bg-[#09090D]/85 border border-slate-200 dark:border-[#222] backdrop-blur-md shadow-2xl transition-colors">
        
        {/* Status Tag */}
        <div className="flex items-center justify-center gap-2">
          <span
            className={cn(
              'text-[9px] font-mono font-black uppercase tracking-widest px-2.5 py-1 border flex items-center gap-1.5',
              isPro
                ? 'bg-amber-50 dark:bg-[#1E1408] border-amber-300 dark:border-[#FFE600]/50 text-amber-800 dark:text-[#FFE600]'
                : 'bg-orange-50 dark:bg-[#150F08] border-orange-200 dark:border-[#FF5A00]/50 text-orange-600 dark:text-[#FF5A00]'
            )}
          >
            <Radio className="w-2.5 h-2.5 animate-pulse" />
            {isPro ? 'SALA VIP 1080P // STANDBY WEBRTC' : 'SALA ATIVA // STANDBY WEBRTC'}
          </span>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-mono font-black text-slate-900 dark:text-white uppercase tracking-tight">
            SALA PRONTA PARA TRANSMISSÃO
          </h2>
          <p className="text-[11px] font-mono text-slate-600 dark:text-[#888] max-w-md mx-auto leading-relaxed">
            {canControl
              ? 'Nenhum vídeo em reprodução no momento. Escolha uma das opções abaixo para iniciar a exibição para todos os participantes.'
              : 'Aguardando o Host ou Co-host iniciar um vídeo ou transmissão de tela.'}
          </p>
        </div>

        {/* Action Buttons for Host / Co-host */}
        {canControl ? (
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {onShareScreen && (
              <button
                onClick={onShareScreen}
                className={cn(
                  'px-4 py-2.5 font-mono font-black text-[10px] uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95',
                  isPro
                    ? 'bg-amber-500 hover:bg-slate-900 dark:bg-[#FFE600] dark:hover:bg-white text-white dark:text-black shadow-[0_0_20px_rgba(255,230,0,0.35)]'
                    : 'bg-[#FF5A00] hover:bg-slate-900 dark:hover:bg-white text-white dark:text-black shadow-[0_0_20px_rgba(255,90,0,0.35)]'
                )}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>COMPARTILHAR TELA</span>
              </button>
            )}

            {onSelectVideo && (
              <button
                onClick={onSelectVideo}
                className="px-4 py-2.5 bg-slate-100 dark:bg-[#121218] hover:bg-slate-200 dark:hover:bg-[#1C1C24] text-slate-900 dark:text-white border border-slate-300 dark:border-[#333] hover:border-[#FF5A00] font-mono font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Film className="w-3.5 h-3.5 text-[#FF5A00]" />
                <span>INSERIR VÍDEO / YOUTUBE</span>
              </button>
            )}

            {onOpenLibrary && (
              <button
                onClick={onOpenLibrary}
                className="px-4 py-2.5 bg-slate-100 dark:bg-[#121218] hover:bg-slate-200 dark:hover:bg-[#1C1C24] text-slate-900 dark:text-white border border-slate-300 dark:border-[#333] hover:border-[#FFE600] font-mono font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5 text-[#FF5A00] dark:text-[#FFE600]" />
                <span>MINHA BIBLIOTECA</span>
              </button>
            )}
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-[#121218] border border-slate-300 dark:border-[#333] text-slate-700 dark:text-[#AAA] font-mono text-[10px] uppercase">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] dark:bg-[#22C55E] animate-ping" />
            <span>SINCRONIZADO COM O HOST</span>
          </div>
        )}
      </div>
    </div>
  )
}
