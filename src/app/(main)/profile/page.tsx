'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  User,
  Palette,
  Save,
  Check,
  Camera,
  Mail,
  Calendar,
  Loader2,
  Crown,
  Zap,
  CreditCard,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  RefreshCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  HardDrive,
  Folder,
  Users,
  Tv,
  Activity,
  Infinity as InfinityIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { generateReactHelpers } from '@uploadthing/react'
import type { OurFileRouter } from '@/app/api/uploadthing/core'
import { updateProfile } from '../actions'
import { ProfileCore3DView } from '@/components/dashboard/profile-core-3d'
import { cn } from '@/lib/utils'

const { uploadFiles } = generateReactHelpers<OurFileRouter>()

const PRESET_COLORS = [
  '#FF5A00',
  '#FFE600',
  '#00F0FF',
  '#22C55E',
  '#A855F7',
  '#EC4899',
  '#3B82F6',
  '#EF4444',
  '#F97316',
  '#14B8A6',
]

interface UserProfile {
  name: string
  email: string
  chatColor: string
  image: string
  createdAt: string
}

interface SubscriptionData {
  plan: 'FREE' | 'PRO' | 'MAXPRO'
  isPro: boolean
  isCanceled?: boolean
  stripeCurrentPeriodEnd?: string
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
}

interface UsageData {
  videosCount: number
  maxVideos: number | null
  foldersCount: number
  maxFolders: number | null
  friendsCount: number
  maxRoomParticipants: number
  streamingQuality: string
  meshNetwork: string
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'identity' | 'billing'>('billing')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#FF5A00')
  const [imageUrl, setImageUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [subData, setSubData] = useState<SubscriptionData>({
    plan: 'FREE',
    isPro: false,
  })
  const [usageData, setUsageData] = useState<UsageData>({
    videosCount: 0,
    maxVideos: 10,
    foldersCount: 0,
    maxFolders: 3,
    friendsCount: 0,
    maxRoomParticipants: 2,
    streamingQuality: '720p HD Padrão',
    meshNetwork: 'P2P Padrão',
  })
  const [loadingStripe, setLoadingStripe] = useState(false)

  // Load current profile, subscription & usage metrics
  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/user/usage')
      if (res.ok) {
        const data = await res.json()
        if (data.user) {
          const u = data.user
          setProfile({
            name: u.name || '',
            email: u.email || '',
            chatColor: u.chatColor || '#FF5A00',
            image: u.image || '',
            createdAt: u.createdAt || '',
          })
          setName(u.name || '')
          setColor(u.chatColor || '#FF5A00')
          setImageUrl(u.image || '')
        }
        if (data.subscription) {
          setSubData(data.subscription)
        }
        if (data.usage) {
          setUsageData(data.usage)
        }
      }
    } catch {
      toast.error('Erro ao carregar dados da conta.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSubscribePro = async () => {
    setLoadingStripe(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data?.url) {
        window.location.href = data.url
      } else {
        toast.error(data?.error || 'Erro ao iniciar checkout')
      }
    } catch {
      toast.error('Erro ao conectar com o servidor do Stripe')
    } finally {
      setLoadingStripe(false)
    }
  }

  const handleManageSubscription = async () => {
    setLoadingStripe(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data?.url) {
        window.location.href = data.url
      } else {
        toast.error(data?.error || 'Erro ao abrir o portal do Stripe')
      }
    } catch {
      toast.error('Erro ao conectar com o Stripe Customer Portal')
    } finally {
      setLoadingStripe(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile({ name, chatColor: color, image: imageUrl || undefined })
      setSuccess(true)
      setProfile((prev) =>
        prev ? { ...prev, name, chatColor: color, image: imageUrl } : prev
      )
      toast.success('Perfil atualizado com sucesso!')
      setTimeout(() => setSuccess(false), 2500)
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Erro ao salvar perfil'
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—'
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const hasChanges =
    name !== (profile?.name || '') ||
    color !== (profile?.chatColor || '#FF5A00') ||
    imageUrl !== (profile?.image || '')

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (file.size > 4 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 4MB')
        return
      }

      setUploadingImage(true)
      try {
        const res = await uploadFiles('imageUploader', { files: [file] })
        if (res?.[0]) {
          setImageUrl(res[0].url)
          toast.success('Foto atualizada!')
        }
      } catch {
        toast.error('Erro ao fazer upload da imagem')
      } finally {
        setUploadingImage(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    },
    []
  )

  if (loading) {
    return (
      <div className="p-12 bg-[#09090D] border border-[#222] text-center font-mono text-[11px] text-[#777]">
        CARREGANDO TELEMETRIA DO PERFIL & ASSINATURA...
      </div>
    )
  }

  const isPro = subData.isPro || subData.plan === 'PRO' || subData.plan === 'MAXPRO'

  return (
    <div className="space-y-6">
      
      {/* ── HEADER COMMAND BANNER ─────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[#09090D] border border-[#222] p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div
          className={cn(
            'absolute top-0 right-0 w-80 h-full blur-3xl pointer-events-none opacity-20 transition-colors',
            isPro ? 'bg-[#FFE600]' : 'bg-[#FF5A00]'
          )}
        />

        {/* Left Info */}
        <div className="flex items-center gap-4 relative z-10 flex-1 min-w-0">
          <div
            className={cn(
              'w-12 h-12 flex items-center justify-center font-black shrink-0 shadow-[0_0_20px_rgba(255,90,0,0.3)]',
              isPro ? 'bg-[#FFE600] text-black' : 'bg-[#FF5A00] text-black'
            )}
          >
            <User className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-[#FF5A00] uppercase font-bold tracking-widest bg-[#14141E] px-2 py-0.5 border border-[#222]">
                [ USER_NODE // CONFIGURAÇÕES ]
              </span>
              {isPro ? (
                <span className="flex items-center gap-1 bg-[#1E1408] border border-[#FFE600]/40 px-2 py-0.2 text-[#FFE600] font-mono text-[9px] font-bold uppercase">
                  <Crown className="w-2.5 h-2.5 fill-[#FFE600]" />
                  MAXPRO VIP ATIVO
                </span>
              ) : (
                <span className="text-[9px] font-mono text-[#777] bg-[#111] border border-[#222] px-2 py-0.2 uppercase">
                  PLANO FREE (2 PESSOAS/SALA)
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black font-mono text-white uppercase tracking-tight truncate">
              {profile?.name || 'PERFIL DO USUÁRIO'}
            </h1>
            <p className="text-[11px] font-mono text-[#888] truncate">
              Gerencie seus dados de exibição, telemetria de uso e plano de assinatura.
            </p>
          </div>
        </div>

        {/* Center: 3D Biometric Core */}
        <div className="hidden lg:flex items-center justify-center relative z-10">
          <ProfileCore3DView isPro={isPro} className="w-24 h-24 relative" />
        </div>

        {/* Switch / Tab Navigator in Header */}
        <div className="flex items-center gap-1.5 p-1 bg-[#050508] border border-[#333] relative z-10 shrink-0">
          <button
            onClick={() => setActiveTab('identity')}
            className={cn(
              'px-4 py-2 font-mono font-bold text-[10px] uppercase transition-all flex items-center gap-1.5 cursor-pointer',
              activeTab === 'identity'
                ? 'bg-[#FF5A00] text-black shadow-[0_0_12px_rgba(255,90,0,0.3)]'
                : 'text-[#888] hover:text-white'
            )}
          >
            <User className="w-3.5 h-3.5" />
            <span>[ DADOS DO PERFIL ]</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={cn(
              'px-4 py-2 font-mono font-bold text-[10px] uppercase transition-all flex items-center gap-1.5 cursor-pointer',
              activeTab === 'billing'
                ? isPro
                  ? 'bg-[#FFE600] text-black shadow-[0_0_12px_rgba(255,230,0,0.3)]'
                  : 'bg-[#FF5A00] text-black shadow-[0_0_12px_rgba(255,90,0,0.3)]'
                : 'text-[#888] hover:text-white'
            )}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>[ ASSINATURA & BILLING ]</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: IDENTITY & PROFILE ──────────────────────────────── */}
      {activeTab === 'identity' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left: Avatar & Identity Card */}
          <div className="bg-[#09090D] border border-[#222] p-6 text-center space-y-4 shadow-xl">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            <div className="relative inline-block mx-auto group">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="w-28 h-28 border-2 border-[#333] group-hover:border-[#FF5A00] overflow-hidden relative cursor-pointer block transition-colors"
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#14141E] flex items-center justify-center font-mono font-black text-3xl text-[#FF5A00]">
                    {(name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity font-mono text-[9px] uppercase gap-1">
                  {uploadingImage ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#FF5A00]" />
                  ) : (
                    <>
                      <Camera className="w-5 h-5" />
                      <span>TROCAR FOTO</span>
                    </>
                  )}
                </div>
              </button>
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-mono font-bold text-white uppercase truncate">
                {name || 'SEM NOME'}
              </h2>
              <p className="text-[11px] font-mono text-[#777] truncate">
                {profile?.email || '—'}
              </p>
            </div>

            <div className="pt-3 border-t border-[#1C1C24] space-y-2 text-left text-[10px] font-mono">
              <div className="flex items-center justify-between p-2 bg-[#050508] border border-[#222]">
                <span className="text-[#666] uppercase">MEMBRO DESDE:</span>
                <span className="text-white font-bold">{formatDate(profile?.createdAt || '')}</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-[#050508] border border-[#222]">
                <span className="text-[#666] uppercase">COR DE CHAT:</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border border-white/20" style={{ backgroundColor: color }} />
                  <span className="text-white font-bold">{color}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Editable Profile Settings */}
          <div className="lg:col-span-2 bg-[#09090D] border border-[#222] p-6 space-y-6 shadow-xl">
            <div className="border-b border-[#222] pb-3 flex items-center justify-between">
              <h3 className="font-mono font-bold text-white text-sm uppercase">
                [ CONFIGURAÇÕES DE EXIBIÇÃO ]
              </h3>
              {hasChanges && (
                <span className="text-[9px] font-mono text-[#FFE600] font-bold uppercase animate-pulse">
                  ● ALTERAÇÕES PENDENTES
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-[#888] uppercase block">
                  NOME DE EXIBIÇÃO NO CHAT E SALAS
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome público..."
                  className="w-full h-11 bg-[#050508] border border-[#333] text-white px-3 text-[11px] font-mono outline-none focus:border-[#FF5A00]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-[#888] uppercase block">
                  E-MAIL DA CONTA (NÃO EDITÁVEL)
                </label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full h-11 bg-[#050508] border border-[#222] text-[#666] px-3 text-[11px] font-mono outline-none cursor-not-allowed"
                />
              </div>

              {/* Chat Color Picker */}
              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-mono text-[#888] uppercase block">
                  COR DA SUA IDENTIDADE NO CHAT AO VIVO
                </label>

                <div className="flex flex-wrap gap-2.5">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={cn(
                        'w-8 h-8 rounded-none border-2 transition-transform cursor-pointer',
                        color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                {/* Live Chat Message Bubble Preview */}
                <div className="p-3.5 bg-[#050508] border border-[#222] space-y-1.5">
                  <span className="text-[9px] font-mono text-[#555] uppercase block">
                    PRÉVIA DA SUA MENSAGEM NO CHAT:
                  </span>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="font-bold uppercase" style={{ color }}>
                      {name || 'Usuário'}:
                    </span>
                    <span className="text-[#CCC]">Fala galera! Bora assistir esse vídeo juntos na sala? 🔥</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Action */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#222]">
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="px-6 py-3 bg-[#FF5A00] hover:bg-white text-black font-mono font-black text-[11px] uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,90,0,0.35)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : success ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{success ? 'SALVO COM SUCESSO' : 'SALVAR ALTERAÇÕES'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: SUBSCRIPTION & USAGE ────────────────────────────── */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          
          {/* Main Plan Status Box */}
          <div className="bg-[#09090D] border border-[#222] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
            <div
              className={cn(
                'absolute top-0 right-0 w-96 h-96 blur-3xl pointer-events-none opacity-20',
                isPro ? 'bg-[#FFE600]' : 'bg-[#FF5A00]'
              )}
            />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'px-3 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest border',
                      isPro
                        ? 'bg-[#1E1408] border-[#FFE600]/40 text-[#FFE600]'
                        : 'bg-[#14141E] border-[#333] text-[#FF5A00]'
                    )}
                  >
                    {isPro ? '👑 ASSINATURA VIP ATIVA' : '★ PLANO BÁSICO GRATUITO'}
                  </span>
                  <span className="text-[9px] font-mono text-[#777] uppercase">
                    STRIPE BILLING SECURE
                  </span>
                </div>

                <h2 className="text-2xl font-black font-mono text-white uppercase tracking-tight">
                  {isPro ? 'PLANO MAXPRO (CLUSTER VIP ATIVO)' : 'PLANO FREE (2 PESSOAS POR SALA)'}
                </h2>

                <p className="text-[11px] font-mono text-[#AAA] leading-relaxed">
                  {isPro
                    ? 'Sua conta possui acesso prioritário com infraestrutura Mesh 6X, transmissão 1080p Full HD 60FPS, armazenamento em nuvem sem limites e selo de Host VIP.'
                    : 'No Plano Free você pode criar salas para até 2 pessoas e salvar até 10 vídeos na biblioteca. Faça upgrade para o MAXPRO para desbloquear capacidade de 6 pessoas e salas ilimitadas.'}
                </p>

                {/* Telemetry Perks Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  <div className="flex items-center gap-2 p-2.5 bg-[#050508] border border-[#222] font-mono text-[10px]">
                    <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                    <span className="text-white font-bold">
                      {isPro ? 'Até 6 pessoas por sala simultâneas' : 'Até 2 pessoas por sala'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 bg-[#050508] border border-[#222] font-mono text-[10px]">
                    <Zap className="w-4 h-4 text-[#FFE600]" />
                    <span className="text-white font-bold">
                      {isPro ? 'Infraestrutura WebRTC Mesh 6X' : 'WebRTC Padrão'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Billing Action Box */}
              <div className="shrink-0 flex flex-col gap-3 w-full lg:w-72 bg-[#050508] border border-[#222] p-5 text-center">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-[#777] uppercase block">
                    VALOR DA ASSINATURA
                  </span>
                  <p className="text-xl font-mono font-black text-white">
                    {isPro ? 'R$ 19,90' : 'R$ 0,00'}
                    <span className="text-[11px] font-normal text-[#777]">/mês</span>
                  </p>
                </div>

                {isPro ? (
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={handleManageSubscription}
                      disabled={loadingStripe}
                      className="w-full py-3 bg-[#FFE600] hover:bg-white text-black font-mono font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,230,0,0.3)] disabled:opacity-50"
                    >
                      {loadingStripe ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ExternalLink className="w-3.5 h-3.5" />
                      )}
                      <span>GERENCIAR OU CANCELAR</span>
                    </button>

                    <p className="text-[9px] font-mono text-[#666] leading-tight">
                      Abre o Portal Stripe para alterar cartão de crédito, baixar notas fiscais ou cancelar a assinatura sem multas.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={handleSubscribePro}
                      disabled={loadingStripe}
                      className="w-full py-3.5 bg-[#FF5A00] hover:bg-white text-black font-mono font-black text-[11px] uppercase tracking-widest transition-all duration-150 shadow-[0_0_25px_rgba(255,90,0,0.4)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                    >
                      {loadingStripe ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4 fill-black" />
                      )}
                      <span>ASSINAR MAXPRO AGORA</span>
                    </button>

                    <p className="text-[9px] font-mono text-[#666] leading-tight">
                      Cobrança mensal segura via Stripe. Cancele quando quiser.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── LIVE USAGE TELEMETRY HUD ───────────────────────────── */}
          <div className="bg-[#09090D] border border-[#222] p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#FF5A00]" />
                <h3 className="font-mono font-bold text-white text-sm uppercase">
                  [ TELEMETRIA DE USO & LIMITES DA CONTA ]
                </h3>
              </div>
              <span className="text-[9px] font-mono text-[#22C55E] uppercase font-bold">
                ● CONSUMO EM TEMPO REAL
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Metric 1: Video Storage */}
              <div className="p-4 bg-[#050508] border border-[#1C1C24] space-y-2.5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 text-[#AAA]">
                    <HardDrive className="w-3.5 h-3.5 text-[#FF5A00]" />
                    <span className="uppercase">VÍDEOS NA NUVEM</span>
                  </div>
                  <strong className="text-white font-bold">
                    {usageData.videosCount} / {isPro ? '∞ Ilimitado' : `${usageData.maxVideos || 10}`}
                  </strong>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-[#14141E] overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-500',
                      isPro ? 'bg-[#FFE600] w-full' : 'bg-[#FF5A00]'
                    )}
                    style={{
                      width: isPro
                        ? '100%'
                        : `${Math.min(100, (usageData.videosCount / (usageData.maxVideos || 10)) * 100)}%`,
                    }}
                  />
                </div>

                <p className="text-[9px] font-mono text-[#666]">
                  {isPro
                    ? 'Armazenamento sem cotas ativado para MAXPRO.'
                    : `${Math.max(0, (usageData.maxVideos || 10) - usageData.videosCount)} slots de vídeo restantes no plano gratuito.`}
                </p>
              </div>

              {/* Metric 2: Folders */}
              <div className="p-4 bg-[#050508] border border-[#1C1C24] space-y-2.5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 text-[#AAA]">
                    <Folder className="w-3.5 h-3.5 text-[#3B82F6]" />
                    <span className="uppercase">PASTAS ORGANIZADAS</span>
                  </div>
                  <strong className="text-white font-bold">
                    {usageData.foldersCount} / {isPro ? '∞ Ilimitado' : `${usageData.maxFolders || 3}`}
                  </strong>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-[#14141E] overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-500',
                      isPro ? 'bg-[#FFE600] w-full' : 'bg-[#3B82F6]'
                    )}
                    style={{
                      width: isPro
                        ? '100%'
                        : `${Math.min(100, (usageData.foldersCount / (usageData.maxFolders || 3)) * 100)}%`,
                    }}
                  />
                </div>

                <p className="text-[9px] font-mono text-[#666]">
                  {isPro
                    ? 'Criação ilimitada de diretórios na nuvem.'
                    : `${Math.max(0, (usageData.maxFolders || 3) - usageData.foldersCount)} pastas restantes no plano gratuito.`}
                </p>
              </div>

              {/* Metric 3: Room Mesh Capacity */}
              <div className="p-4 bg-[#050508] border border-[#1C1C24] space-y-2.5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 text-[#AAA]">
                    <Users className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span className="uppercase">CAPACIDADE POR SALA</span>
                  </div>
                  <strong className="text-[#22C55E] font-bold">
                    {usageData.maxRoomParticipants} PESSOAS
                  </strong>
                </div>

                <div className="w-full h-1.5 bg-[#14141E] overflow-hidden">
                  <div
                    className="h-full bg-[#22C55E]"
                    style={{ width: isPro ? '100%' : '33.3%' }}
                  />
                </div>

                <p className="text-[9px] font-mono text-[#666]">
                  {usageData.meshNetwork}
                </p>
              </div>

              {/* Metric 4: Stream Quality */}
              <div className="p-4 bg-[#050508] border border-[#1C1C24] space-y-2.5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 text-[#AAA]">
                    <Tv className="w-3.5 h-3.5 text-[#FFE600]" />
                    <span className="uppercase">QUALIDADE DE TRANSMISSÃO</span>
                  </div>
                  <strong className="text-white font-bold">
                    {usageData.streamingQuality}
                  </strong>
                </div>

                <p className="text-[9px] font-mono text-[#666]">
                  {isPro ? 'Bitrate desbloqueado em 60 FPS com áudio cristalino.' : 'Taxa de quadros padrão (30 FPS).'}
                </p>
              </div>

              {/* Metric 5: Friends Network */}
              <div className="p-4 bg-[#050508] border border-[#1C1C24] space-y-2.5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 text-[#AAA]">
                    <Users className="w-3.5 h-3.5 text-[#A855F7]" />
                    <span className="uppercase">REDE DE AMIGOS</span>
                  </div>
                  <strong className="text-white font-bold">
                    {usageData.friendsCount} CONEXÕES
                  </strong>
                </div>

                <p className="text-[9px] font-mono text-[#666]">
                  Nós de sincronia P2P ativos na sua rede de contatos.
                </p>
              </div>

              {/* Metric 6: Security & Encryption */}
              <div className="p-4 bg-[#050508] border border-[#1C1C24] space-y-2.5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 text-[#AAA]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span className="uppercase">CRIPTOGRAFIA WEBRTC</span>
                  </div>
                  <strong className="text-[#22C55E] font-bold">
                    DTLS / SRTP 256-BIT
                  </strong>
                </div>

                <p className="text-[9px] font-mono text-[#666]">
                  Canais de dados e áudio/vídeo ponto-a-ponto protegidos.
                </p>
              </div>
            </div>
          </div>

          {/* Billing FAQs & Security Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] font-mono">
            <div className="p-4 bg-[#09090D] border border-[#222] space-y-2">
              <h4 className="font-bold text-white uppercase flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#FF5A00]" />
                FORMAS DE PAGAMENTO
              </h4>
              <p className="text-[#888] leading-relaxed">
                Aceitamos cartões de crédito e débito internacionais e nacionais (Mastercard, Visa, Elo, American Express) processados de forma criptografada pelo Stripe.
              </p>
            </div>

            <div className="p-4 bg-[#09090D] border border-[#222] space-y-2">
              <h4 className="font-bold text-white uppercase flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                CANCELAMENTO A QUALQUER MOMENTO
              </h4>
              <p className="text-[#888] leading-relaxed">
                Você pode cancelar sua renovação a qualquer momento pelo portal do assinante com apenas 1 clique, mantendo seus benefícios até o final do período pago.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
