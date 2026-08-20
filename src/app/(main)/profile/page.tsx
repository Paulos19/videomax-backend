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
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Send,
  Shield,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { generateReactHelpers } from '@uploadthing/react'
import type { OurFileRouter } from '@/app/api/uploadthing/core'
import { updateProfile, requestProfilePasswordResetCode, changeProfilePassword } from '../actions'
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
  const { theme, setTheme } = useTheme()
  const [themeMounted, setThemeMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'identity' | 'security' | 'billing'>('identity')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#FF5A00')
  const [imageUrl, setImageUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setThemeMounted(true)
  }, [])

  // Password change state
  const [pwdStep, setPwdStep] = useState<'request' | 'verify'>('request')
  const [pwdCode, setPwdCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [pwdCooldown, setPwdCooldown] = useState(0)

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

  // Request password reset token via email
  const handleRequestPasswordCode = async () => {
    if (pwdCooldown > 0 || sendingCode) return
    setSendingCode(true)
    try {
      const res = await requestProfilePasswordResetCode()
      toast.success(res.message || 'Código de 6 dígitos enviado para seu e-mail!')
      setPwdStep('verify')
      setPwdCooldown(60)
      const timer = setInterval(() => {
        setPwdCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar código de verificação.')
    } finally {
      setSendingCode(false)
    }
  }

  // Change password with token
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pwdCode || pwdCode.trim().length !== 6) {
      toast.error('Informe o código de 6 dígitos recebido por e-mail.')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem.')
      return
    }

    if (newPassword.length < 8) {
      toast.error('A nova senha deve ter pelo menos 8 caracteres.')
      return
    }

    setChangingPassword(true)
    try {
      const res = await changeProfilePassword({
        code: pwdCode.trim(),
        newPassword,
      })
      toast.success(res.message || 'Sua senha foi alterada com sucesso!')
      setPwdCode('')
      setNewPassword('')
      setConfirmPassword('')
      setPwdStep('request')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao alterar a senha.')
    } finally {
      setChangingPassword(false)
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
      <div className="p-12 bg-white dark:bg-[#09090D] border border-slate-200 dark:border-[#222] text-center font-mono text-[11px] text-slate-500 dark:text-[#777] shadow-sm">
        CARREGANDO TELEMETRIA DO PERFIL & ASSINATURA...
      </div>
    )
  }

  const isPro = subData.isPro || subData.plan === 'PRO' || subData.plan === 'MAXPRO'

  return (
    <div className="space-y-6">
      
      {/* ── HEADER COMMAND BANNER ─────────────────────────────────── */}
      <div className="relative overflow-hidden bg-white dark:bg-[#09090D] border border-slate-200 dark:border-[#222] p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm dark:shadow-2xl transition-colors">
        <div
          className={cn(
            'absolute top-0 right-0 w-80 h-full blur-3xl pointer-events-none opacity-20 transition-colors',
            isPro ? 'bg-amber-400 dark:bg-[#FFE600]' : 'bg-orange-400 dark:bg-[#FF5A00]'
          )}
        />

        {/* Left Info */}
        <div className="flex items-center gap-4 relative z-10 flex-1 min-w-0">
          <div
            className={cn(
              'w-12 h-12 flex items-center justify-center font-black shrink-0 shadow-md',
              isPro
                ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white dark:bg-[#FFE600] dark:text-black'
                : 'bg-[#FF5A00] text-white dark:text-black'
            )}
          >
            <User className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-orange-600 dark:text-[#FF5A00] uppercase font-bold tracking-widest bg-orange-50 dark:bg-[#14141E] px-2 py-0.5 border border-orange-200 dark:border-[#222]">
                [ USER_NODE // CONFIGURAÇÕES ]
              </span>
              {isPro ? (
                <span className="flex items-center gap-1 bg-amber-50 dark:bg-[#1E1408] border border-amber-300 dark:border-[#FFE600]/40 px-2 py-0.2 text-amber-700 dark:text-[#FFE600] font-mono text-[9px] font-bold uppercase">
                  <Crown className="w-2.5 h-2.5 fill-current" />
                  MAXPRO VIP ATIVO
                </span>
              ) : (
                <span className="text-[9px] font-mono text-slate-500 dark:text-[#777] bg-slate-100 dark:bg-[#111] border border-slate-200 dark:border-[#222] px-2 py-0.2 uppercase">
                  PLANO FREE (2 PESSOAS/SALA)
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white uppercase tracking-tight truncate">
              {profile?.name || 'PERFIL DO USUÁRIO'}
            </h1>
            <p className="text-[11px] font-mono text-slate-500 dark:text-[#888] truncate">
              Gerencie seus dados de exibição, telemetria de uso e plano de assinatura.
            </p>
          </div>
        </div>

        {/* Center: 3D Biometric Core */}
        <div className="hidden lg:flex items-center justify-center relative z-10">
          <ProfileCore3DView isPro={isPro} className="w-24 h-24 relative" />
        </div>

        {/* Switch / Tab Navigator in Header */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#050508] border border-slate-200 dark:border-[#333] relative z-10 shrink-0 flex-wrap">
          <button
            onClick={() => setActiveTab('identity')}
            className={cn(
              'px-3.5 py-2 font-mono font-bold text-[10px] uppercase transition-all flex items-center gap-1.5 cursor-pointer',
              activeTab === 'identity'
                ? 'bg-[#FF5A00] text-white dark:text-black shadow-sm'
                : 'text-slate-600 dark:text-[#888] hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <User className="w-3.5 h-3.5" />
            <span>[ PERFIL ]</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={cn(
              'px-3.5 py-2 font-mono font-bold text-[10px] uppercase transition-all flex items-center gap-1.5 cursor-pointer',
              activeTab === 'security'
                ? 'bg-[#16A34A] dark:bg-[#22C55E] text-white dark:text-black shadow-sm'
                : 'text-slate-600 dark:text-[#888] hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>[ SEGURANÇA & SENHA ]</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={cn(
              'px-3.5 py-2 font-mono font-bold text-[10px] uppercase transition-all flex items-center gap-1.5 cursor-pointer',
              activeTab === 'billing'
                ? isPro
                  ? 'bg-amber-500 dark:bg-[#FFE600] text-white dark:text-black shadow-sm'
                  : 'bg-[#FF5A00] text-white dark:text-black shadow-sm'
                : 'text-slate-600 dark:text-[#888] hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>[ ASSINATURA ]</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: IDENTITY & PROFILE ──────────────────────────────── */}
      {activeTab === 'identity' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left: Avatar & Identity Card */}
          <div className="bg-white dark:bg-[#09090D] border border-slate-200 dark:border-[#222] p-6 text-center space-y-4 shadow-sm dark:shadow-xl transition-colors">
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
                className="w-28 h-28 border-2 border-slate-300 dark:border-[#333] group-hover:border-[#FF5A00] overflow-hidden relative cursor-pointer block transition-colors"
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-100 dark:bg-[#14141E] flex items-center justify-center font-mono font-black text-3xl text-[#FF5A00]">
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
              <h2 className="text-base font-mono font-bold text-slate-900 dark:text-white uppercase truncate">
                {name || 'SEM NOME'}
              </h2>
              <p className="text-[11px] font-mono text-slate-500 dark:text-[#777] truncate">
                {profile?.email || '—'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-[#1C1C24] space-y-2 text-left text-[10px] font-mono">
              <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-[#222]">
                <span className="text-slate-500 dark:text-[#666] uppercase">MEMBRO DESDE:</span>
                <span className="text-slate-900 dark:text-white font-bold">{formatDate(profile?.createdAt || '')}</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-[#222]">
                <span className="text-slate-500 dark:text-[#666] uppercase">COR DE CHAT:</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border border-slate-300 dark:border-white/20" style={{ backgroundColor: color }} />
                  <span className="text-slate-900 dark:text-white font-bold">{color}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Editable Profile Settings */}
          <div className="lg:col-span-2 bg-white dark:bg-[#09090D] border border-slate-200 dark:border-[#222] p-6 space-y-6 shadow-sm dark:shadow-xl transition-colors">
            <div className="border-b border-slate-200 dark:border-[#222] pb-3 flex items-center justify-between">
              <h3 className="font-mono font-bold text-slate-900 dark:text-white text-sm uppercase">
                [ CONFIGURAÇÕES DE EXIBIÇÃO ]
              </h3>
              {hasChanges && (
                <span className="text-[9px] font-mono text-amber-600 dark:text-[#FFE600] font-bold uppercase animate-pulse">
                  ● ALTERAÇÕES PENDENTES
                </span>
              )}
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-600 dark:text-[#888] uppercase block">
                  NOME DE EXIBIÇÃO NO CHAT E SALAS
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome público..."
                  className="w-full h-11 bg-slate-50 dark:bg-[#050508] border border-slate-300 dark:border-[#333] text-slate-900 dark:text-white px-3 text-[11px] font-mono outline-none focus:border-[#FF5A00] transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-600 dark:text-[#888] uppercase block">
                  E-MAIL DA CONTA (NÃO EDITÁVEL)
                </label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full h-11 bg-slate-100 dark:bg-[#050508] border border-slate-200 dark:border-[#222] text-slate-400 dark:text-[#666] px-3 text-[11px] font-mono outline-none cursor-not-allowed"
                />
              </div>

              {/* Theme Preference Settings Selector */}
              {themeMounted && (
                <div className="space-y-2.5 pt-1">
                  <label className="text-[10px] font-mono text-slate-600 dark:text-[#888] uppercase block flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF5A00]" />
                    <span>TEMA VISUAL DA PLATAFORMA</span>
                  </label>

                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={cn(
                        'flex items-center justify-center gap-2 p-3 border font-mono text-[10px] font-bold uppercase transition-all cursor-pointer',
                        theme === 'dark'
                          ? 'bg-[#FF5A00] text-black border-[#FF5A00] shadow-sm'
                          : 'bg-slate-50 dark:bg-[#050508] border-slate-200 dark:border-[#222] text-slate-600 dark:text-[#888] hover:text-slate-900 dark:hover:text-white'
                      )}
                    >
                      <Moon className="w-3.5 h-3.5 fill-current" />
                      <span>DARK</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      className={cn(
                        'flex items-center justify-center gap-2 p-3 border font-mono text-[10px] font-bold uppercase transition-all cursor-pointer',
                        theme === 'light'
                          ? 'bg-[#FF5A00] text-white border-[#FF5A00] shadow-sm'
                          : 'bg-slate-50 dark:bg-[#050508] border-slate-200 dark:border-[#222] text-slate-600 dark:text-[#888] hover:text-slate-900 dark:hover:text-white'
                      )}
                    >
                      <Sun className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>LIGHT</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme('system')}
                      className={cn(
                        'flex items-center justify-center gap-2 p-3 border font-mono text-[10px] font-bold uppercase transition-all cursor-pointer',
                        theme === 'system'
                          ? 'bg-[#FF5A00] text-white dark:text-black border-[#FF5A00] shadow-sm'
                          : 'bg-slate-50 dark:bg-[#050508] border-slate-200 dark:border-[#222] text-slate-600 dark:text-[#888] hover:text-slate-900 dark:hover:text-white'
                      )}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>SISTEMA</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Chat Color Picker */}
              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-mono text-slate-600 dark:text-[#888] uppercase block">
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
                        color === c
                          ? 'border-slate-900 dark:border-white scale-110 shadow-lg'
                          : 'border-transparent hover:scale-105'
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                {/* Live Chat Message Bubble Preview */}
                <div className="p-3.5 bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-[#222] space-y-1.5 transition-colors">
                  <span className="text-[9px] font-mono text-slate-500 dark:text-[#555] uppercase block">
                    PRÉVIA DA SUA MENSAGEM NO CHAT:
                  </span>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="font-bold uppercase" style={{ color }}>
                      {name || 'Usuário'}:
                    </span>
                    <span className="text-slate-700 dark:text-[#CCC]">Fala galera! Bora assistir esse vídeo juntos na sala? 🔥</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Action */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-[#222]">
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="px-6 py-3 bg-[#FF5A00] hover:bg-slate-900 dark:hover:bg-white text-white dark:text-black font-mono font-black text-[11px] uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,90,0,0.35)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
          <div className="bg-white dark:bg-[#09090D] border border-slate-200 dark:border-[#222] p-6 sm:p-8 relative overflow-hidden shadow-sm dark:shadow-2xl transition-colors">
            <div
              className={cn(
                'absolute top-0 right-0 w-96 h-96 blur-3xl pointer-events-none opacity-20',
                isPro ? 'bg-amber-400 dark:bg-[#FFE600]' : 'bg-orange-400 dark:bg-[#FF5A00]'
              )}
            />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'px-3 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest border',
                      isPro
                        ? 'bg-amber-50 dark:bg-[#1E1408] border-amber-300 dark:border-[#FFE600]/40 text-amber-800 dark:text-[#FFE600]'
                        : 'bg-orange-50 dark:bg-[#14141E] border-orange-200 dark:border-[#333] text-orange-700 dark:text-[#FF5A00]'
                    )}
                  >
                    {isPro ? '👑 ASSINATURA VIP ATIVA' : '★ PLANO BÁSICO GRATUITO'}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 dark:text-[#777] uppercase">
                    STRIPE BILLING SECURE
                  </span>
                </div>

                <h2 className="text-2xl font-black font-mono text-slate-900 dark:text-white uppercase tracking-tight">
                  {isPro ? 'PLANO MAXPRO (CLUSTER VIP ATIVO)' : 'PLANO FREE (2 PESSOAS POR SALA)'}
                </h2>

                <p className="text-[11px] font-mono text-slate-600 dark:text-[#AAA] leading-relaxed">
                  {isPro
                    ? 'Sua conta possui acesso prioritário com infraestrutura Mesh 6X, transmissão 1080p Full HD 60FPS, armazenamento em nuvem sem limites e selo de Host VIP.'
                    : 'No Plano Free você pode criar salas para até 2 pessoas e salvar até 10 vídeos na biblioteca. Faça upgrade para o MAXPRO para desbloquear capacidade de 6 pessoas e salas ilimitadas.'}
                </p>

                {/* Telemetry Perks Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-[#222] font-mono text-[10px]">
                    <ShieldCheck className="w-4 h-4 text-[#16A34A] dark:text-[#22C55E]" />
                    <span className="text-slate-900 dark:text-white font-bold">
                      {isPro ? 'Até 6 pessoas por sala simultâneas' : 'Até 2 pessoas por sala'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-[#222] font-mono text-[10px]">
                    <Zap className="w-4 h-4 text-amber-500 dark:text-[#FFE600]" />
                    <span className="text-slate-900 dark:text-white font-bold">
                      {isPro ? 'Infraestrutura WebRTC Mesh 6X' : 'WebRTC Padrão'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Billing Action Box */}
              <div className="shrink-0 flex flex-col gap-3 w-full lg:w-72 bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-[#222] p-5 text-center transition-colors">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 dark:text-[#777] uppercase block">
                    VALOR DA ASSINATURA
                  </span>
                  <p className="text-xl font-mono font-black text-slate-900 dark:text-white">
                    {isPro ? 'R$ 19,90' : 'R$ 0,00'}
                    <span className="text-[11px] font-normal text-slate-500 dark:text-[#777]">/mês</span>
                  </p>
                </div>

                {isPro ? (
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={handleManageSubscription}
                      disabled={loadingStripe}
                      className="w-full py-3 bg-amber-500 hover:bg-slate-900 dark:bg-[#FFE600] dark:hover:bg-white text-white dark:text-black font-mono font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                    >
                      {loadingStripe ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ExternalLink className="w-3.5 h-3.5" />
                      )}
                      <span>GERENCIAR OU CANCELAR</span>
                    </button>

                    <p className="text-[9px] font-mono text-slate-500 dark:text-[#666] leading-tight">
                      Abre o Portal Stripe para alterar cartão de crédito, baixar notas fiscais ou cancelar a assinatura sem multas.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={handleSubscribePro}
                      disabled={loadingStripe}
                      className="w-full py-3.5 bg-[#FF5A00] hover:bg-slate-900 dark:hover:bg-white text-white dark:text-black font-mono font-black text-[11px] uppercase tracking-widest transition-all duration-150 shadow-[0_0_25px_rgba(255,90,0,0.4)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                    >
                      {loadingStripe ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4 fill-current" />
                      )}
                      <span>ASSINAR MAXPRO AGORA</span>
                    </button>

                    <p className="text-[9px] font-mono text-slate-500 dark:text-[#666] leading-tight">
                      Cobrança mensal segura via Stripe. Cancele quando quiser.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── LIVE USAGE TELEMETRY HUD ───────────────────────────── */}
          <div className="bg-white dark:bg-[#09090D] border border-slate-200 dark:border-[#222] p-6 space-y-5 shadow-sm dark:shadow-xl transition-colors">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#222] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#FF5A00]" />
                <h3 className="font-mono font-bold text-slate-900 dark:text-white text-sm uppercase">
                  [ TELEMETRIA DE USO & LIMITES DA CONTA ]
                </h3>
              </div>
              <span className="text-[9px] font-mono text-[#16A34A] dark:text-[#22C55E] uppercase font-bold">
                ● CONSUMO EM TEMPO REAL
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Metric 1: Video Storage */}
              <div className="p-4 bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-[#1C1C24] space-y-2.5 transition-colors">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-[#AAA]">
                    <HardDrive className="w-3.5 h-3.5 text-[#FF5A00]" />
                    <span className="uppercase">VÍDEOS NA NUVEM</span>
                  </div>
                  <strong className="text-slate-900 dark:text-white font-bold">
                    {usageData.videosCount} / {isPro ? '∞ Ilimitado' : `${usageData.maxVideos || 10}`}
                  </strong>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-200 dark:bg-[#14141E] overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-500',
                      isPro ? 'bg-amber-500 dark:bg-[#FFE600] w-full' : 'bg-[#FF5A00]'
                    )}
                    style={{
                      width: isPro
                        ? '100%'
                        : `${Math.min(100, (usageData.videosCount / (usageData.maxVideos || 10)) * 100)}%`,
                    }}
                  />
                </div>

                <p className="text-[9px] font-mono text-slate-500 dark:text-[#666]">
                  {isPro
                    ? 'Armazenamento sem cotas ativado para MAXPRO.'
                    : `${Math.max(0, (usageData.maxVideos || 10) - usageData.videosCount)} slots de vídeo restantes no plano gratuito.`}
                </p>
              </div>

              {/* Metric 2: Folders */}
              <div className="p-4 bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-[#1C1C24] space-y-2.5 transition-colors">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-[#AAA]">
                    <Folder className="w-3.5 h-3.5 text-[#3B82F6]" />
                    <span className="uppercase">PASTAS ORGANIZADAS</span>
                  </div>
                  <strong className="text-slate-900 dark:text-white font-bold">
                    {usageData.foldersCount} / {isPro ? '∞ Ilimitado' : `${usageData.maxFolders || 3}`}
                  </strong>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-200 dark:bg-[#14141E] overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-500',
                      isPro ? 'bg-amber-500 dark:bg-[#FFE600] w-full' : 'bg-[#3B82F6]'
                    )}
                    style={{
                      width: isPro
                        ? '100%'
                        : `${Math.min(100, (usageData.foldersCount / (usageData.maxFolders || 3)) * 100)}%`,
                    }}
                  />
                </div>

                <p className="text-[9px] font-mono text-slate-500 dark:text-[#666]">
                  {isPro
                    ? 'Criação ilimitada de diretórios na nuvem.'
                    : `${Math.max(0, (usageData.maxFolders || 3) - usageData.foldersCount)} pastas restantes no plano gratuito.`}
                </p>
              </div>

              {/* Metric 3: Room Mesh Capacity */}
              <div className="p-4 bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-[#1C1C24] space-y-2.5 transition-colors">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-[#AAA]">
                    <Users className="w-3.5 h-3.5 text-[#16A34A] dark:text-[#22C55E]" />
                    <span className="uppercase">CAPACIDADE POR SALA</span>
                  </div>
                  <strong className="text-[#16A34A] dark:text-[#22C55E] font-bold">
                    {usageData.maxRoomParticipants} PESSOAS
                  </strong>
                </div>

                <div className="w-full h-1.5 bg-slate-200 dark:bg-[#14141E] overflow-hidden">
                  <div
                    className="h-full bg-[#16A34A] dark:bg-[#22C55E]"
                    style={{ width: isPro ? '100%' : '33.3%' }}
                  />
                </div>

                <p className="text-[9px] font-mono text-slate-500 dark:text-[#666]">
                  {usageData.meshNetwork}
                </p>
              </div>

              {/* Metric 4: Stream Quality */}
              <div className="p-4 bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-[#1C1C24] space-y-2.5 transition-colors">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-[#AAA]">
                    <Tv className="w-3.5 h-3.5 text-amber-500 dark:text-[#FFE600]" />
                    <span className="uppercase">QUALIDADE DE TRANSMISSÃO</span>
                  </div>
                  <strong className="text-slate-900 dark:text-white font-bold">
                    {usageData.streamingQuality}
                  </strong>
                </div>

                <p className="text-[9px] font-mono text-slate-500 dark:text-[#666]">
                  {isPro ? 'Bitrate desbloqueado em 60 FPS com áudio cristalino.' : 'Taxa de quadros padrão (30 FPS).'}
                </p>
              </div>

              {/* Metric 5: Friends Network */}
              <div className="p-4 bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-[#1C1C24] space-y-2.5 transition-colors">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-[#AAA]">
                    <Users className="w-3.5 h-3.5 text-[#A855F7]" />
                    <span className="uppercase">REDE DE AMIGOS</span>
                  </div>
                  <strong className="text-slate-900 dark:text-white font-bold">
                    {usageData.friendsCount} CONEXÕES
                  </strong>
                </div>

                <p className="text-[9px] font-mono text-slate-500 dark:text-[#666]">
                  Nós de sincronia P2P ativos na sua rede de contatos.
                </p>
              </div>

              {/* Metric 6: Security & Encryption */}
              <div className="p-4 bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-[#1C1C24] space-y-2.5 transition-colors">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-[#AAA]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A] dark:text-[#22C55E]" />
                    <span className="uppercase">CRIPTOGRAFIA WEBRTC</span>
                  </div>
                  <strong className="text-[#16A34A] dark:text-[#22C55E] font-bold">
                    DTLS / SRTP 256-BIT
                  </strong>
                </div>

                <p className="text-[9px] font-mono text-slate-500 dark:text-[#666]">
                  Canais de dados e áudio/vídeo ponto-a-ponto protegidos.
                </p>
              </div>
            </div>
          </div>

          {/* Billing FAQs & Security Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] font-mono">
            <div className="p-4 bg-white dark:bg-[#09090D] border border-slate-200 dark:border-[#222] space-y-2 shadow-sm transition-colors">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#FF5A00]" />
                FORMAS DE PAGAMENTO
              </h4>
              <p className="text-slate-600 dark:text-[#888] leading-relaxed">
                Aceitamos cartões de crédito e débito internacionais e nacionais (Mastercard, Visa, Elo, American Express) processados de forma criptografada pelo Stripe.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-[#09090D] border border-slate-200 dark:border-[#222] space-y-2 shadow-sm transition-colors">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#16A34A] dark:text-[#22C55E]" />
                CANCELAMENTO A QUALQUER MOMENTO
              </h4>
              <p className="text-slate-600 dark:text-[#888] leading-relaxed">
                Você pode cancelar sua renovação a qualquer momento pelo portal do assinante com apenas 1 clique, mantendo seus benefícios até o final do período pago.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: SECURITY & PASSWORD CHANGE ────────────────────── */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Security Overview */}
          <div className="bg-white dark:bg-[#09090D] border border-slate-200 dark:border-[#222] p-6 space-y-5 shadow-sm dark:shadow-xl transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-[#22C55E]/10 border border-emerald-200 dark:border-[#22C55E]/40 text-[#16A34A] dark:text-[#22C55E] flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-mono font-black text-sm text-slate-900 dark:text-white uppercase">
                  SEGURANÇA DA CONTA
                </h3>
                <span className="text-[10px] font-mono text-slate-500 dark:text-[#777] block">
                  Autenticação em 2 etapas por token
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-[#1C1C24] space-y-3 font-mono text-xs transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-[#777]">E-MAIL VINCULADO:</span>
                <span className="text-slate-900 dark:text-white font-bold text-[11px] truncate max-w-[160px]">
                  {profile?.email}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-[#777]">CRIPTOGRAFIA:</span>
                <span className="text-[#16A34A] dark:text-[#22C55E] font-bold text-[10px] uppercase">
                  BCRYPT (12 ROUNDS)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-[#777]">PROTEÇÃO TOKEN:</span>
                <span className="text-[#FF5A00] font-bold text-[10px] uppercase">
                  6 DÍGITOS // 10 MIN
                </span>
              </div>
            </div>

            <div className="p-4 bg-orange-50/50 dark:bg-[#120A0A] border-l-2 border-[#FF5A00] text-[11px] font-sans text-slate-700 dark:text-[#CCC] leading-relaxed transition-colors">
              <strong className="text-slate-900 dark:text-white font-mono uppercase block mb-1">
                🔒 Como funciona a alteração de senha:
              </strong>
              Para proteger sua conta, você precisará solicitar um código de segurança que será enviado para seu e-mail cadastrado antes de definir a nova senha.
            </div>
          </div>

          {/* Right Column: Password Change Form / Steps */}
          <div className="lg:col-span-2 bg-white dark:bg-[#09090D] border border-slate-200 dark:border-[#222] p-6 sm:p-8 space-y-6 shadow-sm dark:shadow-xl relative transition-colors">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#222] pb-4">
              <div>
                <span className="text-[9px] font-mono text-orange-600 dark:text-[#FF5A00] uppercase font-bold tracking-widest bg-orange-50 dark:bg-[#14141E] px-2 py-0.5 border border-orange-200 dark:border-[#222]">
                  [ PROTOCOLO DE ALTERAÇÃO ]
                </span>
                <h3 className="text-lg font-black font-mono text-slate-900 dark:text-white uppercase mt-2">
                  ALTERAR SENHA DE ACESSO
                </h3>
              </div>

              <span className="text-[10px] font-mono font-bold px-2 py-0.5 border bg-emerald-50 dark:bg-[#0D0D14] border-emerald-200 dark:border-[#22C55E]/40 text-[#16A34A] dark:text-[#22C55E] uppercase">
                {pwdStep === 'request' ? 'ETAPA 1/2' : 'ETAPA 2/2'}
              </span>
            </div>

            {/* STEP 1: Request Code */}
            {pwdStep === 'request' && (
              <div className="space-y-6 py-4">
                <div className="p-5 bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-[#222] text-center space-y-3 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-[#FF5A00]/10 border border-orange-200 dark:border-[#FF5A00]/40 text-[#FF5A00] mx-auto flex items-center justify-center">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h4 className="font-mono font-bold text-sm text-slate-900 dark:text-white uppercase">
                    ENVIAR TOKEN DE AUTORIZAÇÃO
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-[#888] font-sans max-w-md mx-auto leading-relaxed">
                    Clique no botão abaixo para receber um código de 6 dígitos no seu endereço de e-mail{' '}
                    <strong className="text-slate-900 dark:text-white font-mono">{profile?.email}</strong>.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRequestPasswordCode}
                  disabled={sendingCode || pwdCooldown > 0}
                  className="w-full h-12 bg-gradient-to-r from-[#EF2020] via-[#FF5A00] to-[#FFB800] text-white dark:text-black font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(255,90,0,0.35)] hover:shadow-[0_0_35px_rgba(255,90,0,0.6)] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {sendingCode ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>GERANDO CÓDIGO DE SEGURANÇA...</span>
                    </>
                  ) : pwdCooldown > 0 ? (
                    <span>AGUARDE ({pwdCooldown}s) PARA NOVO CÓDIGO</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4 stroke-[2.5]" />
                      <span>SOLICITAR CÓDIGO POR E-MAIL</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* STEP 2: Enter Code & New Password */}
            {pwdStep === 'verify' && (
              <form onSubmit={handleChangePassword} className="space-y-5 animate-scale-in">
                <div className="p-3.5 bg-orange-50 dark:bg-[#140C06] border border-orange-200 dark:border-[#FF5A00]/40 flex items-center justify-between text-xs font-mono transition-colors">
                  <div className="flex items-center gap-2 text-orange-600 dark:text-[#FF5A00]">
                    <span className="w-2 h-2 rounded-full bg-[#FF5A00] animate-ping" />
                    <span>Código enviado para {profile?.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRequestPasswordCode}
                    disabled={sendingCode || pwdCooldown > 0}
                    className="text-[10px] text-orange-600 dark:text-[#FF5A00] hover:text-slate-900 dark:hover:text-white uppercase font-bold underline cursor-pointer disabled:opacity-50 disabled:no-underline"
                  >
                    {pwdCooldown > 0 ? `Reenviar (${pwdCooldown}s)` : 'Reenviar Código'}
                  </button>
                </div>

                {/* 6-Digit Token Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-600 dark:text-[#888] uppercase block">
                    CÓDIGO DE VERIFICAÇÃO (6 DÍGITOS)
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 dark:text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pwdCode}
                      onChange={(e) => setPwdCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ex: 849201"
                      className="w-full h-11 bg-slate-50 dark:bg-[#050508] border border-slate-300 dark:border-[#333] text-[#FF5A00] pl-10 pr-4 font-mono font-black text-lg tracking-[0.3em] outline-none focus:border-[#FF5A00] transition-colors"
                    />
                  </div>
                </div>

                {/* New Password Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-600 dark:text-[#888] uppercase block">
                    NOVA SENHA
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 dark:text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres (A-Z, a-z, 0-9)"
                      className="w-full h-11 bg-slate-50 dark:bg-[#050508] border border-slate-300 dark:border-[#333] text-slate-900 dark:text-white pl-10 pr-10 font-mono text-xs outline-none focus:border-[#FF5A00] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#666] hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-600 dark:text-[#888] uppercase block">
                    CONFIRMAR NOVA SENHA
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 dark:text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Digite a nova senha novamente"
                      className="w-full h-11 bg-slate-50 dark:bg-[#050508] border border-slate-300 dark:border-[#333] text-slate-900 dark:text-white pl-10 pr-10 font-mono text-xs outline-none focus:border-[#FF5A00] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#666] hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Real-time Password Requirements Meter */}
                <div className="p-3 bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-[#1C1C24] space-y-1.5 text-[10px] font-mono transition-colors">
                  <span className="text-slate-500 dark:text-[#666] uppercase block mb-1">REQUISITOS DE SEGURANÇA:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className={cn('flex items-center gap-1.5', newPassword.length >= 8 ? 'text-[#16A34A] dark:text-[#22C55E]' : 'text-slate-400 dark:text-[#666]')}>
                      <Check className="w-3 h-3" />
                      <span>Mínimo 8 caracteres</span>
                    </div>
                    <div className={cn('flex items-center gap-1.5', /[A-Z]/.test(newPassword) ? 'text-[#16A34A] dark:text-[#22C55E]' : 'text-slate-400 dark:text-[#666]')}>
                      <Check className="w-3 h-3" />
                      <span>Letra maiúscula (A-Z)</span>
                    </div>
                    <div className={cn('flex items-center gap-1.5', /[a-z]/.test(newPassword) ? 'text-[#16A34A] dark:text-[#22C55E]' : 'text-slate-400 dark:text-[#666]')}>
                      <Check className="w-3 h-3" />
                      <span>Letra minúscula (a-z)</span>
                    </div>
                    <div className={cn('flex items-center gap-1.5', /[0-9]/.test(newPassword) ? 'text-[#16A34A] dark:text-[#22C55E]' : 'text-slate-400 dark:text-[#666]')}>
                      <Check className="w-3 h-3" />
                      <span>Número (0-9)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPwdStep('request')
                      setPwdCode('')
                      setNewPassword('')
                      setConfirmPassword('')
                    }}
                    className="px-4 py-2.5 border border-slate-300 dark:border-[#333] text-slate-600 dark:text-[#888] hover:text-slate-900 dark:hover:text-white font-mono text-[10px] uppercase cursor-pointer"
                  >
                    CANCELAR
                  </button>

                  <button
                    type="submit"
                    disabled={changingPassword || pwdCode.length !== 6 || newPassword.length < 8}
                    className="px-6 py-2.5 bg-[#FF5A00] hover:bg-slate-900 dark:hover:bg-white text-white dark:text-black font-mono font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,90,0,0.35)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {changingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>ATUALIZANDO SENHA...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>CONFIRMAR NOVA SENHA</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
