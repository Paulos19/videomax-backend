'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { motion } from 'framer-motion'
import { Check, Zap, Crown, ShieldCheck, Sparkles, ArrowRight, Loader2, Users, Flame, Lock } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useLandingSocket } from '@/lib/useLandingSocket'

// ── 3D WEBRTC MESH HOLOGRAPHIC TOPOLOGY COMPARISON ────────────────
function MeshTopologyNodes({ isProMode }: { isProMode: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const nodeCount = isProMode ? 6 : 2

  // Create node positions in circular orbit
  const nodes = useMemo(() => {
    const arr: [number, number, number][] = []
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2
      const radius = isProMode ? 2.2 : 1.8
      arr.push([Math.cos(angle) * radius, Math.sin(angle) * (radius * 0.5), Math.sin(angle) * 0.8])
    }
    return arr
  }, [nodeCount, isProMode])

  // Lines connecting all nodes in full mesh
  const linePositions = useMemo(() => {
    const pos: number[] = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        pos.push(...nodes[i], ...nodes[j])
      }
    }
    return new Float32Array(pos)
  }, [nodes])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const speed = isProMode ? 0.6 : 0.25
    groupRef.current.rotation.y += delta * speed
    groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1
  })

  return (
    <group ref={groupRef}>
      {/* Mesh lines */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={linePositions.length / 3}
            array={linePositions}
            itemSize={3}
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={isProMode ? '#FF5A00' : '#3B82F6'}
          transparent
          opacity={isProMode ? 0.8 : 0.4}
          linewidth={2}
        />
      </lineSegments>

      {/* Nodes */}
      {nodes.map((p, idx) => (
        <mesh key={idx} position={p}>
          <sphereGeometry args={[isProMode ? 0.18 : 0.14, 16, 16]} />
          <meshBasicMaterial
            color={isProMode ? (idx === 0 ? '#FFE600' : '#FF5A00') : '#3B82F6'}
          />
        </mesh>
      ))}
    </group>
  )
}

export function SectionPlans() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const { isConnected, activeRooms } = useLandingSocket()
  const [loadingCheckout, setLoadingCheckout] = useState(false)
  const [activeTab, setActiveTab] = useState<'PRO' | 'FREE'>('PRO')

  // Live database user state
  const [liveUser, setLiveUser] = useState<{
    id?: string
    name?: string | null
    email?: string | null
    plan?: string | null
  } | null>(null)

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetch('/api/user/me')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) {
            setLiveUser(data.user)
            const plan = (data.user.plan || '').toUpperCase()
            if (plan === 'PRO' || plan === 'MAXPRO') {
              setActiveTab('PRO')
            }
          }
        })
        .catch(() => {})
    }
  }, [authStatus])

  const userPlan = (liveUser?.plan || (session?.user as any)?.plan || 'FREE').toUpperCase()
  const isUserPro = userPlan === 'PRO' || userPlan === 'MAXPRO'
  const isLoggedIn = authStatus === 'authenticated' && !!session?.user

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      toast.info('Autenticação necessária', {
        description: 'Faça login para assinar o Plano PRO.',
      })
      router.push(`/login?callbackUrl=${encodeURIComponent('/#planos')}`)
      return
    }

    if (isUserPro) {
      toast.success('Você já é um assinante MAXPRO!', {
        description: 'Redirecionando para o seu painel de controle.',
      })
      router.push('/dashboard')
      return
    }

    setLoadingCheckout(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data?.url) {
        window.location.href = data.url
      } else {
        toast.error(data?.error || 'Erro ao iniciar o checkout do Stripe')
      }
    } catch {
      toast.error('Erro ao conectar com os servidores de pagamento')
    } finally {
      setLoadingCheckout(false)
    }
  }

  return (
    <section
      id="planos"
      className="relative min-h-[100vh] w-full bg-[#050505] flex flex-col justify-center py-24 sm:py-32 overflow-hidden border-t border-[#222]"
    >
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12 w-full flex flex-col">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 border-b border-[#222] pb-12 gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-[#FF5A00] tracking-widest uppercase mb-4 bg-[#111] w-fit px-2 py-1">
              [06 — MONETIZAÇÃO & ESCALA // STRIPE GATEWAY]
            </span>
            <h2 className="text-[44px] sm:text-[76px] font-black leading-[0.88] tracking-tight text-white uppercase">
              Poder Total.<br />
              <span className="text-transparent" style={{ WebkitTextStroke: '2px #FF5A00' }}>
                Sem Limites.
              </span>
            </h2>
          </div>
          <div className="max-w-[380px]">
            <p className="text-[13px] sm:text-[14px] font-mono text-[#A3A3A3] leading-relaxed border-l-2 border-[#FF5A00] pl-4">
              {isUserPro ? (
                <span className="text-white">
                  Você possui o <strong className="text-[#FFE600]">Plano MAXPRO ⭐</strong> ativo com suporte completo a Mesh 6X e Full HD 1080p 60FPS.
                </span>
              ) : (
                'Comece grátis ou desbloqueie o poder máximo do WebRTC Mesh para até 6 amigos com streaming em 1080p 60FPS.'
              )}
            </p>
          </div>
        </div>

        {/* Interactive 3D Mesh Topology Visualizer HUD */}
        <div className="w-full bg-[#08080C] border border-[#222] p-6 mb-12 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="flex flex-col z-10 max-w-[500px]">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">
                TOPOLOGIA WEBRTC MESH // SIMULADOR DE CAPACIDADE
              </span>
            </div>
            <h3 className="text-[20px] sm:text-[24px] font-black text-white uppercase mb-2">
              {activeTab === 'PRO' ? 'MESH PRO: 6 NÓS SIMULTÂNEOS' : 'MESH FREE: 2 NÓS P2P'}
            </h3>
            <p className="text-[12px] font-mono text-[#A3A3A3] mb-6">
              {activeTab === 'PRO'
                ? 'Com o Plano PRO, o servidor websocket escala uma rede mesh completa de 6 conexões diretas bidirecionais com sincronia em 0.00ms.'
                : 'O Plano Free permite conexão direta ponto-a-ponto entre 2 amigos com chat e sincronia 0ms garantida.'}
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('FREE')}
                className={`px-4 py-2 text-[10px] font-mono font-bold uppercase border transition-all cursor-pointer ${
                  activeTab === 'FREE'
                    ? 'bg-[#3B82F6] text-black border-[#3B82F6]'
                    : 'bg-[#111] text-[#A3A3A3] border-[#333] hover:text-white'
                }`}
              >
                SIMULAR NÓ FREE (2 USERS)
              </button>
              <button
                onClick={() => setActiveTab('PRO')}
                className={`px-4 py-2 text-[10px] font-mono font-bold uppercase border transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'PRO'
                    ? 'bg-[#FF5A00] text-black border-[#FF5A00] shadow-[0_0_20px_rgba(255,90,0,0.3)]'
                    : 'bg-[#111] text-[#A3A3A3] border-[#333] hover:text-white'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>SIMULAR MESH PRO (6 USERS)</span>
              </button>
            </div>
          </div>

          {/* 3D Canvas */}
          <div className="w-full lg:w-[480px] h-[220px] bg-[#050508] border border-[#222] relative flex items-center justify-center">
            <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
              <ambientLight intensity={0.5} />
              <MeshTopologyNodes isProMode={activeTab === 'PRO'} />
            </Canvas>
            <div className="absolute bottom-2 right-3 text-[9px] font-mono text-[#555] uppercase">
              RENDER: R3F MESH GRAPH
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid (FREE vs PRO) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* ── CARD 1: PLANO FREE ────────────────────────── */}
          <div
            className={`p-8 bg-[#09090D] border flex flex-col justify-between relative transition-all ${
              isLoggedIn && !isUserPro
                ? 'border-[#3B82F6] ring-1 ring-[#3B82F6]/30'
                : 'border-[#222] hover:border-[#444]'
            }`}
          >
            {/* User current plan tag if on Free */}
            {isLoggedIn && !isUserPro && (
              <div className="absolute -top-3.5 left-6 bg-[#3B82F6] text-black font-mono font-black text-[9px] uppercase px-3 py-1 tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                ✓ SEU PLANO ATUALMENTE ATIVO
              </div>
            )}

            <div>
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#222]">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#A3A3A3] uppercase tracking-widest block mb-1">
                    [ NÓ PADRÃO ]
                  </span>
                  <h3 className="text-[28px] font-black text-white uppercase">Plano Gratuito</h3>
                </div>
                <div className="text-right">
                  <span className="text-[36px] font-black text-white font-mono leading-none">R$ 0</span>
                  <span className="text-[11px] font-mono text-[#777] block mt-1">/ para sempre</span>
                </div>
              </div>

              <p className="text-[12px] font-mono text-[#8A8A8A] mb-8 leading-relaxed">
                Perfeito para assistir filmes e séries a dois com sincronia absoluta e zero complicação.
              </p>

              {/* Feature List */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-[#151520] border border-[#333] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                  </div>
                  <span className="text-[12px] font-mono text-[#D4D4D4]">
                    <strong>Até 2 Participantes</strong> por sala simultâneos
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-[#151520] border border-[#333] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                  </div>
                  <span className="text-[12px] font-mono text-[#D4D4D4]">
                    Protocolo de Sincronia <strong>0ms WebRTC</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-[#151520] border border-[#333] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                  </div>
                  <span className="text-[12px] font-mono text-[#D4D4D4]">
                    Transmissão padrão em 720p HD
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-[#151520] border border-[#333] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                  </div>
                  <span className="text-[12px] font-mono text-[#D4D4D4]">
                    Chat em tempo real, figurinhas e reações
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-[#151520] border border-[#333] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                  </div>
                  <span className="text-[12px] font-mono text-[#D4D4D4]">
                    Salas públicas e privadas ilimitadas
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push(isLoggedIn ? '/dashboard' : '/register')}
              className={`w-full py-4 font-mono font-bold text-[11px] uppercase tracking-widest border transition-all cursor-pointer ${
                isLoggedIn && !isUserPro
                  ? 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6] hover:bg-[#3B82F6] hover:text-black'
                  : 'bg-[#111] hover:bg-white text-white hover:text-black border-[#333] hover:border-white'
              }`}
            >
              {isUserPro
                ? 'INCLUSO NO SEU PLANO PRO'
                : isLoggedIn
                ? 'SEU PLANO ATUAL (ACESSAR PAINEL)'
                : 'CRIAR CONTA GRÁTIS'}
            </button>
          </div>

          {/* ── CARD 2: PLANO PRO (DESTACADO & DINÂMICO) ──── */}
          <div
            className={`p-8 flex flex-col justify-between relative transition-all ${
              isUserPro
                ? 'bg-gradient-to-b from-[#1C1208] to-[#0A0806] border-2 border-[#FFE600] shadow-[0_0_50px_rgba(255,184,0,0.3)] ring-1 ring-[#FFE600]/40'
                : 'bg-gradient-to-b from-[#120C08] to-[#0A0A0E] border-2 border-[#FF5A00] shadow-[0_0_50px_rgba(255,90,0,0.2)]'
            }`}
          >
            {/* Dynamic Top Ribbon Badge */}
            <div
              className={`absolute -top-3.5 right-6 text-black font-mono font-black text-[9px] uppercase px-3 py-1 tracking-widest flex items-center gap-1.5 ${
                isUserPro
                  ? 'bg-gradient-to-r from-[#FFE600] to-[#FF5A00] shadow-[0_0_20px_rgba(255,184,0,0.5)]'
                  : 'bg-[#FF5A00] shadow-[0_0_15px_rgba(255,90,0,0.4)]'
              }`}
            >
              {isUserPro ? (
                <>
                  <Crown className="w-3.5 h-3.5 fill-black" />
                  <span>SEU PLANO ATIVO // MAXPRO ⭐</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 fill-black" />
                  <span>MAIS RECOMENDADO // MESH 6X</span>
                </>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#2A1D15]">
                <div>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-widest block mb-1 ${
                      isUserPro ? 'text-[#FFE600]' : 'text-[#FF5A00]'
                    }`}
                  >
                    [ {isUserPro ? 'ASSINATURA VIP ATIVA' : 'POTÊNCIA MÁXIMA'} ]
                  </span>
                  <div className="flex items-center gap-2">
                    <Crown className={`w-6 h-6 ${isUserPro ? 'text-[#FFE600]' : 'text-[#FF5A00]'}`} />
                    <h3 className="text-[28px] font-black text-white uppercase">Plano PRO</h3>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-[36px] font-black font-mono leading-none ${
                      isUserPro ? 'text-[#FFE600]' : 'text-[#FF5A00]'
                    }`}
                  >
                    R$ 19,90
                  </span>
                  <span className="text-[11px] font-mono text-[#A3A3A3] block mt-1">/ mensal (Stripe)</span>
                </div>
              </div>

              <p className="text-[12px] font-mono text-[#D4D4D4] mb-8 leading-relaxed">
                {isUserPro ? (
                  <span className="text-[#FFE600] font-bold">
                    Sua conta possui acesso ilimitado com transmissão Full HD 1080p, salas para até 6 amigos e selo VIP.
                  </span>
                ) : (
                  'A experiência definitiva para watch parties em grupo, comunidades de amigos e cinéfilos exigentes.'
                )}
              </p>

              {/* Feature List */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                      isUserPro
                        ? 'bg-[#FFE600]/20 border-[#FFE600]'
                        : 'bg-[#FF5A00]/20 border-[#FF5A00]'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${isUserPro ? 'text-[#FFE600]' : 'text-[#FF5A00]'}`} />
                  </div>
                  <span className="text-[12px] font-mono text-white">
                    <strong>Até 6 Participantes</strong> por sala simultâneos (Mesh 6x)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                      isUserPro
                        ? 'bg-[#FFE600]/20 border-[#FFE600]'
                        : 'bg-[#FF5A00]/20 border-[#FF5A00]'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${isUserPro ? 'text-[#FFE600]' : 'text-[#FF5A00]'}`} />
                  </div>
                  <span className="text-[12px] font-mono text-white">
                    Transmissão <strong>Full HD 1080p a 60FPS</strong> com bitrate elevado
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                      isUserPro
                        ? 'bg-[#FFE600]/20 border-[#FFE600]'
                        : 'bg-[#FF5A00]/20 border-[#FF5A00]'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${isUserPro ? 'text-[#FFE600]' : 'text-[#FF5A00]'}`} />
                  </div>
                  <span className="text-[12px] font-mono text-white">
                    <strong>Selo Exclusivo Host PRO ⭐</strong> com moldura reluzente
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                      isUserPro
                        ? 'bg-[#FFE600]/20 border-[#FFE600]'
                        : 'bg-[#FF5A00]/20 border-[#FF5A00]'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${isUserPro ? 'text-[#FFE600]' : 'text-[#FF5A00]'}`} />
                  </div>
                  <span className="text-[12px] font-mono text-white">
                    Prioridade no servidor WebSockets (Zero buffering)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                      isUserPro
                        ? 'bg-[#FFE600]/20 border-[#FFE600]'
                        : 'bg-[#FF5A00]/20 border-[#FF5A00]'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${isUserPro ? 'text-[#FFE600]' : 'text-[#FF5A00]'}`} />
                  </div>
                  <span className="text-[12px] font-mono text-white">
                    Upload expandido de arquivos e histórico prolongado
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Action Trigger */}
            <button
              onClick={handleCheckout}
              disabled={loadingCheckout}
              className={`w-full py-4 font-mono font-black text-[12px] uppercase tracking-widest transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                isUserPro
                  ? 'bg-gradient-to-r from-[#FFE600] to-[#FF5A00] text-black shadow-[0_0_35px_rgba(255,184,0,0.5)] hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-[#FF5A00] hover:bg-white text-black shadow-[0_0_30px_rgba(255,90,0,0.35)] hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {loadingCheckout ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>CONECTANDO AO STRIPE...</span>
                </>
              ) : isUserPro ? (
                <>
                  <Crown className="w-4 h-4 fill-black" />
                  <span>👑 SEU PLANO ATIVO (ACESSAR PAINEL PRO)</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 fill-black" />
                  <span>ASSINAR PLANO PRO — R$ 19,90/MÊS</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Security & Stripe Telemetry Footer */}
        <div className="mt-12 p-4 bg-[#08080C] border border-[#222] flex flex-wrap items-center justify-between text-[10px] font-mono text-[#777] gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
            <span>PAGAMENTO SEGURO VIA STRIPE // CRIPTOGRAFIA DE PONTA A PONTA (SSL 256-BIT)</span>
          </div>
          <div className="flex items-center gap-4">
            <span>● CANCELAMENTO COM 1 CLIQUE</span>
            <span>● ATIVAÇÃO INSTANTÂNEA NO WEBSOCKET</span>
          </div>
        </div>

      </div>
    </section>
  )
}
