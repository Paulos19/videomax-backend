'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Film, Plus, ArrowRight, Upload, Users, Zap, Check } from 'lucide-react'
import { YoutubeIcon as Youtube } from '@/components/icons/youtube'
import { UploadDropzone } from '@/lib/uploadthing'
import { saveVideo } from '../actions'
import { isYouTubeUrl } from '@/lib/youtube'
import { cn } from '@/lib/utils'
import '@uploadthing/react/styles.css'

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export default function DashboardPage() {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState('')
  const [activeAddTab, setActiveAddTab] = useState<'youtube' | 'upload'>('youtube')
  
  // YouTube state
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [youtubeTitle, setYoutubeTitle] = useState('')
  const [isSavingYoutube, setIsSavingYoutube] = useState(false)
  const [youtubeError, setYoutubeError] = useState('')

  // Upload state
  const [uploadTitle, setUploadTitle] = useState('')
  const [addSuccess, setAddSuccess] = useState(false)

  const handleJoinRoom = useCallback(() => {
    const code = roomCode.trim().toUpperCase()
    if (code) {
      router.push(`/room/${code}`)
    }
  }, [roomCode, router])

  const handleCreateRoom = useCallback(() => {
    const code = generateRoomCode()
    router.push(`/room/${code}`)
  }, [router])

  const handleSaveYoutube = useCallback(async () => {
    setYoutubeError('')
    const url = youtubeUrl.trim()
    const title = youtubeTitle.trim()

    if (!url) {
      setYoutubeError('Por favor, insira a URL do vídeo.')
      return
    }

    if (!isYouTubeUrl(url)) {
      setYoutubeError('URL do YouTube inválida. Ex: https://www.youtube.com/watch?v=...')
      return
    }

    if (!title) {
      setYoutubeError('Por favor, defina um título para o vídeo.')
      return
    }

    try {
      setIsSavingYoutube(true)
      await saveVideo(title, url, null)
      setAddSuccess(true)
      setYoutubeUrl('')
      setYoutubeTitle('')
    } catch (e: unknown) {
      setYoutubeError(e instanceof Error ? e.message : 'Erro ao salvar vídeo.')
    } finally {
      setIsSavingYoutube(false)
    }
  }, [youtubeUrl, youtubeTitle])

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-6 py-8 space-y-8">
      {/* ═══ HERO: Join or Create Room ═══ */}
      <div className="relative overflow-hidden rounded-2xl border border-room-border p-6 lg:p-8">
        {/* Background decorations */}
        <div className="absolute inset-0 brand-gradient-subtle" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-room-accent/8 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-room-red/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-room-yellow/5 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-room-accent/10 border border-room-accent/20">
              <Users className="w-4 h-4 text-room-accent" />
              <span className="text-room-accent text-xs font-semibold tracking-wide uppercase">Assistir com amigos</span>
            </div>
          </div>

          <h1 className="text-room-text text-2xl lg:text-3xl font-bold mb-2">
            Entre ou <span className="brand-gradient-text">crie</span> uma sala
          </h1>
          <p className="text-room-text-secondary text-sm mb-6 max-w-md">
            Insira um código para entrar numa sala existente ou crie uma nova para assistir com amigos.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Join room */}
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                  placeholder="CÓDIGO DA SALA"
                  maxLength={6}
                  className="w-full bg-room-surface/80 backdrop-blur-sm border border-room-border-light text-room-text px-5 py-3.5 rounded-xl text-sm placeholder:text-room-text-secondary/40 outline-none focus:border-room-accent/50 focus:ring-1 focus:ring-room-accent/20 transition-all tracking-[0.25em] font-mono text-center uppercase"
                />
              </div>
              <button
                onClick={handleJoinRoom}
                disabled={!roomCode.trim()}
                className={cn(
                  "px-6 py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2",
                  roomCode.trim()
                    ? "bg-room-accent hover:bg-room-accent/90 text-white active:scale-[0.98] shadow-lg shadow-room-accent/20"
                    : "bg-room-surface-3 text-room-text-secondary/40 cursor-not-allowed"
                )}
              >
                Entrar
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Create room */}
            <button
              onClick={handleCreateRoom}
              className="px-6 py-3.5 rounded-xl font-semibold text-sm brand-gradient text-white transition-all flex items-center justify-center gap-2 active:scale-[0.98] brand-glow-strong hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              Criar sala
            </button>
          </div>
        </div>
      </div>

      {/* ═══ Two Column Layout ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Add / Upload Video ── */}
        <div className="bg-room-surface border border-room-border rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] brand-gradient opacity-40" />

          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-room-accent/10 flex items-center justify-center">
                {activeAddTab === 'youtube' ? (
                  <Youtube className="w-5 h-5 text-room-red" />
                ) : (
                  <Upload className="w-5 h-5 text-room-accent" />
                )}
              </div>
              <h2 className="text-room-text font-bold text-lg">Adicionar vídeo</h2>
            </div>

            {/* Tabs toggle */}
            <div className="flex bg-room-surface-2 p-1 rounded-xl border border-room-border-light">
              <button
                onClick={() => { setActiveAddTab('youtube'); setAddSuccess(false) }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  activeAddTab === 'youtube'
                    ? "bg-room-accent text-white shadow-sm"
                    : "text-room-text-secondary hover:text-room-text"
                )}
              >
                <Youtube className="w-3.5 h-3.5" />
                YouTube
              </button>
              <button
                onClick={() => { setActiveAddTab('upload'); setAddSuccess(false) }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  activeAddTab === 'upload'
                    ? "bg-room-accent text-white shadow-sm"
                    : "text-room-text-secondary hover:text-room-text"
                )}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload
              </button>
            </div>
          </div>

          {addSuccess ? (
            <div className="bg-room-online/10 border border-room-online/20 rounded-xl p-6 text-center animate-fade-in">
              <Check className="w-10 h-10 text-room-online mx-auto mb-3" />
              <p className="text-room-text font-medium mb-1">Vídeo adicionado com sucesso!</p>
              <p className="text-room-text-secondary text-sm mb-4">
                Seu vídeo já está disponível na sua biblioteca e pronto para assistir.
              </p>
              <button
                onClick={() => { setAddSuccess(false); setYoutubeUrl(''); setYoutubeTitle(''); setUploadTitle('') }}
                className="text-room-accent text-sm font-semibold hover:underline"
              >
                Adicionar outro vídeo
              </button>
            </div>
          ) : activeAddTab === 'youtube' ? (
            <div className="space-y-4">
              <div>
                <label className="text-room-text-secondary text-xs font-semibold mb-1.5 block uppercase tracking-wider">
                  Link do YouTube *
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-room-surface-2 border border-room-border-light text-room-text px-4 py-2.5 rounded-xl text-sm placeholder:text-room-text-secondary/40 outline-none focus:border-room-accent/50 focus:ring-1 focus:ring-room-accent/20 transition-all"
                />
              </div>

              <div>
                <label className="text-room-text-secondary text-xs font-semibold mb-1.5 block uppercase tracking-wider">
                  Título do Vídeo *
                </label>
                <input
                  type="text"
                  value={youtubeTitle}
                  onChange={(e) => setYoutubeTitle(e.target.value)}
                  placeholder="Ex: Trailer Oficial - O Senhor dos Anéis"
                  className="w-full bg-room-surface-2 border border-room-border-light text-room-text px-4 py-2.5 rounded-xl text-sm placeholder:text-room-text-secondary/40 outline-none focus:border-room-accent/50 focus:ring-1 focus:ring-room-accent/20 transition-all"
                />
              </div>

              {youtubeError && (
                <p className="text-room-red text-xs font-medium">{youtubeError}</p>
              )}

              <button
                onClick={handleSaveYoutube}
                disabled={isSavingYoutube || !youtubeUrl.trim() || !youtubeTitle.trim()}
                className={cn(
                  "w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2",
                  !isSavingYoutube && youtubeUrl.trim() && youtubeTitle.trim()
                    ? "brand-gradient text-white brand-glow-strong hover:opacity-90 active:scale-[0.98]"
                    : "bg-room-surface-3 text-room-text-secondary/40 cursor-not-allowed"
                )}
              >
                {isSavingYoutube ? 'Salvando...' : 'Adicionar vídeo do YouTube'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-room-text-secondary text-xs font-semibold mb-1.5 block uppercase tracking-wider">
                  Título (opcional)
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Ex: O Senhor dos Anéis (Arquivo Local)"
                  className="w-full bg-room-surface-2 border border-room-border-light text-room-text px-4 py-2.5 rounded-xl text-sm placeholder:text-room-text-secondary/40 outline-none focus:border-room-accent/50 focus:ring-1 focus:ring-room-accent/20 transition-all"
                />
              </div>
              <UploadDropzone
                endpoint="videoUploader"
                onClientUploadComplete={async (res) => {
                  if (res?.[0]) {
                    const url = res[0].url
                    const title = uploadTitle.trim() || res[0].name
                    await saveVideo(title, url, null)
                    setAddSuccess(true)
                  }
                }}
                onUploadError={(error: Error) => {
                  alert(`Erro no upload: ${error.message}`)
                }}
                appearance={{
                  container: "border-dashed border-room-border bg-room-surface-2/50 rounded-xl p-6 hover:border-room-accent/30 transition-colors",
                  uploadIcon: "text-room-accent/40",
                  label: "text-room-text-secondary hover:text-room-accent text-sm font-medium",
                  allowedContent: "text-room-text-secondary/40 text-xs",
                  button: "brand-gradient px-5 py-2 rounded-lg text-white text-sm font-semibold mt-3"
                }}
              />
            </div>
          )}
        </div>

        {/* ── How it Works ── */}
        <div className="bg-room-surface border border-room-border rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] brand-gradient opacity-40" />

          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-room-accent/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-room-accent" />
            </div>
            <h2 className="text-room-text font-bold text-lg">Como funciona</h2>
          </div>

          <div className="space-y-5">
            {[
              {
                step: '1',
                title: 'Crie ou entre em uma sala',
                desc: 'Gere um código ou use o de um amigo para entrar.',
                color: 'text-room-red bg-room-red/10'
              },
              {
                step: '2',
                title: 'Escolha um vídeo',
                desc: 'Use os seus vídeos salvos ou cole qualquer link do YouTube.',
                color: 'text-room-accent bg-room-accent/10'
              },
              {
                step: '3',
                title: 'Assista junto',
                desc: 'O vídeo sincroniza automaticamente para todos na sala.',
                color: 'text-room-yellow bg-room-yellow/10'
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 items-start group">
                <div className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-sm transition-transform group-hover:scale-110",
                  item.color
                )}>
                  {item.step}
                </div>
                <div className="pt-1">
                  <p className="text-room-text text-sm font-semibold">{item.title}</p>
                  <p className="text-room-text-secondary text-xs mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tip card */}
          <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-room-accent/5 border border-room-accent/10">
            <Zap className="w-5 h-5 text-room-yellow shrink-0 mt-0.5" />
            <p className="text-sm text-room-text-secondary leading-relaxed">
              <span className="text-room-accent font-semibold">Dica:</span>{' '}
              agora você pode salvar links do YouTube e organizá-los em pastas!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
