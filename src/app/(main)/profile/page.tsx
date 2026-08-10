'use client'

import { useState, useEffect } from 'react'
import { User, Palette, Save, Check, Camera, Mail, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { UploadDropzone } from '@/lib/uploadthing'
import { updateProfile } from '../actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import '@uploadthing/react/styles.css'

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

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#7C4DFF')
  const [imageUrl, setImageUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load current profile
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/mobile/profile')
        if (res.ok) {
          const data = await res.json()
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
      } catch {
        // Profile load failed
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

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

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-room-accent/10 border border-room-accent/20">
              <User className="w-4 h-4 text-room-accent" />
              <span className="text-room-accent text-xs font-semibold tracking-wide uppercase">Meu Perfil</span>
            </div>
          </div>

          <h1 className="text-room-text text-2xl lg:text-3xl font-bold mb-2">
            Personalize seu <span className="brand-gradient-text">perfil</span>
          </h1>
          <p className="text-room-text-secondary text-sm max-w-md">
            Gerencie suas informações e aparência nas salas de assistir.
          </p>
        </div>
      </div>

      {/* ═══ TWO-COLUMN LAYOUT ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* ── Left: Identity Card ── */}
        <div className="bg-room-surface border border-room-border rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] brand-gradient opacity-40" />

          <div className="flex flex-col items-center pt-4">
            {/* Avatar */}
            <div className="relative mb-4 group">
              <Avatar className="w-28 h-28 border-4 border-room-surface-2 shadow-lg shadow-room-accent/10">
                <AvatarImage src={imageUrl || undefined} className="object-cover" />
                <AvatarFallback className="bg-room-surface-3 text-room-text-secondary text-3xl font-bold">
                  {name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Upload dropzone — compact */}
            <div className="w-full mb-5">
              <UploadDropzone
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  if (res?.[0]) {
                    setImageUrl(res[0].url)
                    toast.success('Foto atualizada!')
                  }
                }}
                appearance={{
                  container: "border-dashed border-room-border-light bg-room-surface-2/50 rounded-xl p-3 h-16",
                  allowedContent: "hidden",
                  uploadIcon: "text-room-text-secondary/30 w-4 h-4",
                  label: "text-room-text-secondary/50 text-[11px] hover:text-room-accent",
                  button: "bg-room-accent text-[11px] px-3 py-1 rounded-lg after:bg-room-accent/80"
                }}
              />
            </div>

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
