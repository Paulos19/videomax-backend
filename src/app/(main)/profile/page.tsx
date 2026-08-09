'use client'

import { useState, useEffect } from 'react'
import { User, Palette, Save, Check, Camera } from 'lucide-react'
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

export default function ProfilePage() {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#7C4DFF')
  const [imageUrl, setImageUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  // Load current profile
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/mobile/profile', {
          headers: {
            Authorization: `Bearer ${document.cookie.match(/authjs.session-token=([^;]+)/)?.[1] || ''}`
          }
        })
        if (res.ok) {
          const data = await res.json()
          if (data?.user) {
            setName(data.user.name || '')
            setColor(data.user.chatColor || '#7C4DFF')
            setImageUrl(data.user.image || '')
          }
        }
      } catch {
        // Profile load failed
      }
    }
    loadProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile({ name, chatColor: color, image: imageUrl || undefined })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    } catch {
      alert('Erro ao salvar perfil')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 lg:px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-room-text text-2xl font-bold">Meu perfil</h1>
        <p className="text-room-text-secondary text-sm mt-1">
          Personalize sua aparência nas salas
        </p>
      </div>

      {/* Profile card */}
      <div className="bg-room-surface border border-room-border rounded-2xl overflow-hidden">
        {/* Avatar section */}
        <div className="relative px-6 pt-8 pb-6 flex flex-col items-center">
          <div className="relative mb-4">
            <Avatar className="w-24 h-24 border-4 border-room-surface-2">
              <AvatarImage src={imageUrl || undefined} className="object-cover" />
              <AvatarFallback className="bg-room-surface-3 text-room-text-secondary text-2xl font-semibold">
                {name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-room-surface-2 border-2 border-room-surface flex items-center justify-center">
              <Camera className="w-3.5 h-3.5 text-room-text-secondary" />
            </div>
          </div>

          <div className="w-full max-w-sm">
            <UploadDropzone
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                if (res?.[0]) setImageUrl(res[0].url)
              }}
              appearance={{
                container: "border-dashed border-room-border bg-room-surface-2/50 rounded-xl p-4 h-24",
                allowedContent: "hidden",
                uploadIcon: "text-room-text-secondary/30 w-5 h-5",
                label: "text-room-text-secondary/50 text-xs hover:text-room-accent",
                button: "bg-room-accent text-xs px-4 py-1 rounded-lg after:bg-room-accent/80"
              }}
            />
          </div>
        </div>

        {/* Fields */}
        <div className="px-6 pb-6 space-y-5 border-t border-room-border pt-5">
          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-room-text-secondary text-xs font-medium mb-2">
              <User className="w-3.5 h-3.5" />
              Nome de exibição
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome no chat"
              className="w-full bg-room-surface-3 border border-room-border-light text-room-text px-4 py-2.5 rounded-xl text-sm placeholder:text-room-text-secondary/40 outline-none focus:border-room-accent/50 transition-colors"
            />
          </div>

          {/* Chat color */}
          <div>
            <label className="flex items-center gap-2 text-room-text-secondary text-xs font-medium mb-2">
              <Palette className="w-3.5 h-3.5" />
              Cor do chat
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-9 h-9 rounded-full transition-all flex items-center justify-center",
                    color === c
                      ? "scale-110"
                      : "hover:scale-105"
                  )}
                  style={{
                    backgroundColor: c,
                    boxShadow: color === c ? `0 0 0 2px #101116, 0 0 0 4px ${c}` : undefined,
                  }}
                  aria-label={`Cor ${c}`}
                >
                  {color === c && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
              <div className="relative">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-9 h-9 rounded-full cursor-pointer bg-transparent border-2 border-room-border-light hover:border-room-accent/50 transition-colors"
                  aria-label="Cor personalizada"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-room-text-secondary text-xs">Preview:</span>
              <div className="flex items-center gap-2 bg-room-surface-3 rounded-xl px-3 py-2 border border-room-border-light">
                <div className="w-6 h-6 rounded-full bg-room-surface-3 flex items-center justify-center text-[10px] font-medium text-room-text-secondary border border-room-border">
                  {name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <span className="text-xs font-semibold" style={{ color }}>{name || 'Seu nome'}</span>
                  <p className="text-room-text text-xs">Mensagem de exemplo</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="px-6 pb-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "w-full py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2",
              saving
                ? "bg-room-surface-3 text-room-text-secondary/40 cursor-not-allowed"
                : "bg-room-accent hover:bg-room-accent/90 text-white active:scale-[0.98]"
            )}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : success ? 'Salvo!' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </div>
  )
}
