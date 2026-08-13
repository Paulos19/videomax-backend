'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { User, Palette, Save, Check, Camera, Mail, Calendar, Loader2, Crown, Zap, CreditCard, ExternalLink, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { generateReactHelpers } from '@uploadthing/react'
import type { OurFileRouter } from '@/app/api/uploadthing/core'
import { updateProfile } from '../actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const { uploadFiles } = generateReactHelpers<OurFileRouter>()

const PRESET_COLORS = [
  '#7C4DFF', '#9B6CFF', '#E040FB', '#FF4081',
  '#FF6D00', '#FFAB00', '#00C853', '#00B0FF',
  '#448AFF', '#536DFE',
]

interface UserProfile {
  name: string
  email: string
  chatColor: string
  image: string
  createdAt: string
}

interface SubscriptionData {
  plan: 'FREE' | 'PRO'
  isPro: boolean
  isCanceled?: boolean
  stripeCurrentPeriodEnd?: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#7C4DFF')
  const [imageUrl, setImageUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [subData, setSubData] = useState<SubscriptionData>({ plan: 'FREE', isPro: false })
  const [loadingStripe, setLoadingStripe] = useState(false)

  // Load current profile & subscription
  useEffect(() => {
    async function loadData() {
      try {
        const [profRes, subRes] = await Promise.all([
          fetch('/api/mobile/profile'),
          fetch('/api/stripe/subscription')
        ])

        if (profRes.ok) {
          const data = await profRes.json()
          if (data?.user) {
            const u = data.user
            setProfile({
              name: u.name || '',
              email: u.email || '',
              chatColor: u.chatColor || '#7C4DFF',
              image: u.image || '',
              createdAt: u.createdAt || ''
            })
            setName(u.name || '')
            setColor(u.chatColor || '#7C4DFF')
            setImageUrl(u.image || '')
          }
        }

        if (subRes.ok) {
          const s = await subRes.json()
          setSubData(s)
        }
      } catch {
        // Load failed
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

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
      setProfile(prev => prev ? { ...prev, name, chatColor: color, image: imageUrl } : prev)
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
    if (!dateStr) return ''
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  const hasChanges = name !== (profile?.name || '') || color !== (profile?.chatColor || '#7C4DFF') || imageUrl !== (profile?.image || '')

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-room-surface-2 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            <div className="h-80 bg-room-surface rounded-2xl" />
            <div className="h-80 bg-room-surface rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-6 py-8 space-y-8">
      {/* ═══ HERO / HEADER ═══ */}
      <div className="relative overflow-hidden rounded-2xl border border-room-border p-6 lg:p-8">
        <div className="absolute inset-0 brand-gradient-subtle" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-room-accent/8 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-room-accent/10 border border-room-accent/20">
                <User className="w-4 h-4 text-room-accent" />
                <span className="text-room-accent text-xs font-semibold tracking-wide uppercase">Meu Perfil</span>
              </div>

              {subData.isPro ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs">
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Plano PRO (Até 6 pessoas/sala)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-room-text-secondary font-semibold text-xs">
                  <span>Plano FREE (Até 2 pessoas/sala)</span>
                </div>
              )}
            </div>

            <h1 className="text-room-text text-2xl lg:text-3xl font-bold mb-2">
              Personalize seu <span className="brand-gradient-text">perfil</span>
            </h1>
            <p className="text-room-text-secondary text-sm max-w-md">
              Gerencie suas informações, aparência e plano de assinatura.
            </p>
          </div>
        </div>
      </div>

      {/* ═══ STRIPE SUBSCRIPTION CARD ═══ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0e0e15] to-[#12121c] border border-amber-500/30 p-6 lg:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-10">
          <Crown className="w-48 h-48 text-amber-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full">
                {subData.isPro ? 'Sua Assinatura é PRO' : 'Upgrade de Plano'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              {subData.isPro ? 'Plano Pro Ativo ⭐' : 'Passe para o Plano Pro'}
            </h2>

            <p className="text-xs sm:text-sm text-[#A0A0B0] max-w-xl leading-relaxed">
              {subData.isPro
                ? 'Você possui acesso ilimitado a salas Pro com suporte a até 6 participantes simultâneos, compartilhamento de tela com áudio em HD e transmissões ao vivo.'
                : 'Salas gratuitas aceitam até 2 integrantes. Faça upgrade para o Plano Pro e crie salas para até 6 pessoas com compartilhamento de tela com áudio em alta definição!'}
            </p>

            <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-[#D0D0E0]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{subData.isPro ? 'Até 6 participantes por sala' : 'Grátis: até 2 pessoas por sala'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>Pagamento via Cartão de Crédito e Débito</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            {subData.isPro ? (
              <button
                onClick={handleManageSubscription}
                disabled={loadingStripe}
                className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                {loadingStripe ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span>Gerenciar ou Cancelar Assinatura</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleSubscribePro}
                disabled={loadingStripe}
                className="w-full md:w-auto px-7 py-4 rounded-xl brand-gradient text-white font-extrabold text-sm shadow-2xl brand-glow-strong hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 border border-amber-400/40"
              >
                {loadingStripe ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white text-white" />
                    <span>Assinar Plano PRO</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ═══ TWO-COLUMN LAYOUT ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* ── Left: Identity Card ── */}
        <div className="bg-room-surface border border-room-border rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] brand-gradient opacity-40" />

          <div className="flex flex-col items-center pt-4">
            {/* Avatar — clicável para trocar foto */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="relative mb-4 group cursor-pointer disabled:cursor-wait"
            >
              <Avatar className="w-28 h-28 border-4 border-room-surface-2 shadow-lg shadow-room-accent/10 transition-transform group-hover:scale-105">
                <AvatarImage src={imageUrl || undefined} className="object-cover" />
                <AvatarFallback className="bg-room-surface-3 text-room-text-secondary text-3xl font-bold">
                  {name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {/* Overlay */}
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {uploadingImage ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </div>
            </button>

            {/* Name */}
            <h2 className="text-room-text text-lg font-bold text-center">
              {name || 'Sem nome'}
            </h2>

            {/* Email */}
            <div className="flex items-center gap-1.5 mt-2">
              <Mail className="w-3.5 h-3.5 text-room-text-secondary/50" />
              <span className="text-room-text-secondary text-xs truncate max-w-[180px]">
                {profile?.email || '—'}
              </span>
            </div>

            {/* Join date */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <Calendar className="w-3.5 h-3.5 text-room-text-secondary/50" />
              <span className="text-room-text-secondary text-xs">
                Membro desde {formatDate(profile?.createdAt || '')}
              </span>
            </div>

            {/* Current color badge */}
            <div className="flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full border border-room-border-light bg-room-surface-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-room-text-secondary text-[11px] font-medium">Cor do chat</span>
            </div>
          </div>
        </div>

        {/* ── Right: Settings Card ── */}
        <div className="bg-room-surface border border-room-border rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] brand-gradient opacity-40" />

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-room-accent/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-room-accent" />
            </div>
            <div>
              <h2 className="text-room-text font-bold text-lg">Configurações</h2>
              <p className="text-room-text-secondary text-xs">Atualize suas informações de exibição</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* ── Display Name ── */}
            <div>
              <label className="flex items-center gap-2 text-room-text-secondary text-xs font-semibold mb-2 uppercase tracking-wider">
                <User className="w-3.5 h-3.5" />
                Nome de exibição
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome no chat"
                maxLength={40}
                className="w-full bg-room-surface-2 border border-room-border-light text-room-text px-4 py-3 rounded-xl text-sm placeholder:text-room-text-secondary/40 outline-none focus:border-room-accent/50 focus:ring-1 focus:ring-room-accent/20 transition-all"
              />
              {profile?.name && name !== profile.name && (
                <p className="text-room-text-secondary/60 text-[11px] mt-1.5 ml-1">
                  Salvo: <span className="text-room-text-secondary">{profile.name}</span>
                </p>
              )}
            </div>

            {/* ── Chat Color ── */}
            <div>
              <label className="flex items-center gap-2 text-room-text-secondary text-xs font-semibold mb-3 uppercase tracking-wider">
                <Palette className="w-3.5 h-3.5" />
                Cor do chat
              </label>

              <div className="flex flex-wrap gap-2.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      "w-10 h-10 rounded-full transition-all flex items-center justify-center",
                      color === c
                        ? "scale-110"
                        : "hover:scale-105 opacity-70 hover:opacity-100"
                    )}
                    style={{
                      backgroundColor: c,
                      boxShadow: color === c ? `0 0 0 2px #0C0C0C, 0 0 0 4px ${c}` : undefined,
                    }}
                    aria-label={`Cor ${c}`}
                  >
                    {color === c && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}

                {/* Custom color picker */}
                <div className="relative">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 rounded-full cursor-pointer bg-transparent border-2 border-room-border-light hover:border-room-accent/50 transition-colors"
                    aria-label="Cor personalizada"
                  />
                </div>
              </div>

              {/* Live chat preview */}
              <div className="mt-4 p-3 rounded-xl bg-room-surface-2 border border-room-border-light">
                <p className="text-room-text-secondary text-[10px] font-semibold uppercase tracking-wider mb-2">Preview</p>
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    {name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <span className="text-xs font-semibold" style={{ color }}>{name || 'Seu nome'}</span>
                    <p className="text-room-text text-xs mt-0.5">Mensagem de exemplo no chat</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Save Button ── */}
            <div className="pt-2">
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className={cn(
                  "w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2",
                  !saving && hasChanges
                    ? "brand-gradient text-white brand-glow-strong hover:opacity-90 active:scale-[0.98]"
                    : "bg-room-surface-3 text-room-text-secondary/40 cursor-not-allowed"
                )}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : success ? (
                  <>
                    <Check className="w-4 h-4" />
                    Salvo!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar alterações
                  </>
                )}
              </button>
              {!hasChanges && !saving && (
                <p className="text-room-text-secondary/40 text-[11px] text-center mt-2">
                  Faça uma alteração para salvar
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
