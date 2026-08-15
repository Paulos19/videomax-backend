'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { X, Play, Upload, Check, Loader2, Sparkles, Plus } from 'lucide-react'
import { YoutubeIcon as Youtube } from '@/components/icons/youtube'
import { UploadDropzone } from '@/lib/uploadthing'
import { saveVideo } from '@/app/(main)/actions'
import { cn } from '@/lib/utils'
import { isYouTubeUrl, getYouTubeThumbnail, fetchYouTubeMetadata } from '@/lib/youtube'

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

interface CreateRoomDialogProps {
  onClose: () => void
}

export function CreateRoomDialog({ onClose }: CreateRoomDialogProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'youtube' | 'upload' | 'empty'>('youtube')

  // YouTube state
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [youtubeTitle, setYoutubeTitle] = useState('')
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [isLoadingMeta, setIsLoadingMeta] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Upload state
  const [uploadTitle, setUploadTitle] = useState('')

  const handleUrlChange = async (url: string) => {
    setYoutubeUrl(url)
    setErrorMsg('')
    if (isYouTubeUrl(url)) {
      const thumb = getYouTubeThumbnail(url)
      if (thumb) setCoverPreview(thumb)

      setIsLoadingMeta(true)
      const meta = await fetchYouTubeMetadata(url)
      setIsLoadingMeta(false)

      if (meta?.thumbnail) setCoverPreview(meta.thumbnail)
      if (meta?.title && !youtubeTitle) {
        setYoutubeTitle(meta.title)
      }
    } else {
      setCoverPreview(null)
    }
  }

  const handleCreateYoutubeRoom = useCallback(async () => {
    setErrorMsg('')
    const url = youtubeUrl.trim()
    const title = youtubeTitle.trim()

    if (!url) {
      setErrorMsg('Por favor, insira a URL do vídeo.')
      return
    }

    if (!isYouTubeUrl(url)) {
      setErrorMsg('URL do YouTube inválida. Ex: https://www.youtube.com/watch?v=...')
      return
    }

    if (!title) {
      setErrorMsg('Por favor, defina um título para a sala/vídeo.')
      return
    }

    try {
      setIsSaving(true)
      await saveVideo(title, url, null)
      const roomCode = generateRoomCode()
      onClose()
      router.push(`/room/${roomCode}`)
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Erro ao criar sala.')
    } finally {
      setIsSaving(false)
    }
  }, [youtubeUrl, youtubeTitle, onClose, router])

  const handleCreateEmptyRoom = useCallback(() => {
    const roomCode = generateRoomCode()
    onClose()
    router.push(`/room/${roomCode}`)
  }, [onClose, router])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-[#0B0B0B] border border-[#242424] rounded-2xl w-full max-w-lg mx-4 animate-scale-in relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-[2px] brand-gradient" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#242424]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF5A00]" />
            <h2 className="text-[#F5F5F5] font-bold text-lg">Criar nova sala</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#151515] hover:bg-[#242424] flex items-center justify-center text-[#8A8A8A] hover:text-[#F5F5F5] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Tabs */}
          <div className="flex bg-[#151515] p-1 rounded-xl border border-[#242424]">
            <button
              onClick={() => { setActiveTab('empty'); setErrorMsg('') }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
                activeTab === 'empty'
                  ? "brand-gradient text-white shadow-md"
                  : "text-[#8A8A8A] hover:text-[#F5F5F5]"
              )}
            >
              <Plus className="w-4 h-4" />
              Em Branco
            </button>
            <button
              onClick={() => { setActiveTab('youtube'); setErrorMsg('') }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
                activeTab === 'youtube'
                  ? "brand-gradient text-white shadow-md"
                  : "text-[#8A8A8A] hover:text-[#F5F5F5]"
              )}
            >
              <Youtube className="w-4 h-4" />
              YouTube
            </button>
            <button
              onClick={() => { setActiveTab('upload'); setErrorMsg('') }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
                activeTab === 'upload'
                  ? "brand-gradient text-white shadow-md"
                  : "text-[#8A8A8A] hover:text-[#F5F5F5]"
              )}
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
          </div>

          {activeTab === 'empty' ? (
            <div className="space-y-4 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[#151515] border border-[#242424] flex items-center justify-center mx-auto mb-4">
                <Play className="w-6 h-6 text-[#FF5A00] ml-1" />
              </div>
              <h3 className="text-[#F5F5F5] font-bold text-lg">Comece uma sala em branco</h3>
              <p className="text-[#8A8A8A] text-sm max-w-sm mx-auto">
                Crie a sala agora, convide seus amigos e escolha o vídeo depois, diretamente de dentro da sala.
              </p>

              <div className="pt-2">
                <button
                  onClick={handleCreateEmptyRoom}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white brand-gradient brand-glow-strong hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Criar sala em branco
                </button>
              </div>
            </div>
          ) : activeTab === 'youtube' ? (
            <div className="space-y-4">
              <div>
                <label className="text-[#8A8A8A] text-xs font-semibold mb-1.5 block uppercase tracking-wider">
                  Link do Vídeo (YouTube) *
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-[#151515] border border-[#242424] text-[#F5F5F5] px-4 py-3 rounded-xl text-sm placeholder:text-[#5F5F5F] outline-none focus:border-[#FF5A00] transition-all"
                />
              </div>

              {/* Cover Preview Card */}
              {coverPreview && (
                <div className="bg-[#151515] border border-[#242424] rounded-xl p-3 flex items-center gap-3 animate-fade-in">
                  <img src={coverPreview} alt="Capa do vídeo" className="w-24 h-14 object-cover rounded-lg border border-[#242424]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Capa Carregada</p>
                    <p className="text-xs text-[#F5F5F5] font-semibold truncate mt-0.5">
                      {youtubeTitle || 'Título detectado automaticamente'}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[#8A8A8A] text-xs font-semibold mb-1.5 block uppercase tracking-wider">
                  Título da Sala *
                </label>
                <input
                  type="text"
                  value={youtubeTitle}
                  onChange={(e) => setYoutubeTitle(e.target.value)}
                  placeholder="Ex: Filmes da Noite — Arcane Ep 3"
                  className="w-full bg-[#151515] border border-[#242424] text-[#F5F5F5] px-4 py-3 rounded-xl text-sm placeholder:text-[#5F5F5F] outline-none focus:border-[#FF5A00] transition-all"
                />
              </div>

              {errorMsg && (
                <p className="text-[#EF2020] text-xs font-medium">{errorMsg}</p>
              )}

              <button
                onClick={handleCreateYoutubeRoom}
                disabled={isSaving || !youtubeUrl.trim() || !youtubeTitle.trim()}
                className={cn(
                  "w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                  !isSaving && youtubeUrl.trim() && youtubeTitle.trim()
                    ? "brand-gradient text-white brand-glow-strong hover:brightness-110 active:scale-[0.98]"
                    : "bg-[#151515] text-[#5F5F5F] cursor-not-allowed"
                )}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 fill-white" />
                )}
                {isSaving ? 'Criando sala...' : 'Criar sala e transmitir'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-[#8A8A8A] text-xs font-semibold mb-1.5 block uppercase tracking-wider">
                  Título da Sala (opcional)
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Ex: Vídeo de Férias 2026"
                  className="w-full bg-[#151515] border border-[#242424] text-[#F5F5F5] px-4 py-3 rounded-xl text-sm placeholder:text-[#5F5F5F] outline-none focus:border-[#FF5A00] transition-all"
                />
              </div>

              <UploadDropzone
                endpoint="videoUploader"
                onClientUploadComplete={async (res) => {
                  if (res?.[0]) {
                    const url = res[0].url
                    const title = uploadTitle.trim() || res[0].name
                    await saveVideo(title, url, null)
                    const roomCode = generateRoomCode()
                    onClose()
                    router.push(`/room/${roomCode}`)
                  }
                }}
                onUploadError={(error: Error) => {
                  alert(`Erro no upload: ${error.message}`)
                }}
                appearance={{
                  container: "border-dashed border-[#242424] bg-[#151515] rounded-xl p-6 hover:border-[#FF5A00]/40 transition-colors",
                  uploadIcon: "text-[#FF5A00]/40",
                  label: "text-[#8A8A8A] hover:text-[#FF5A00] text-sm font-medium",
                  allowedContent: "text-[#5F5F5F] text-xs",
                  button: "brand-gradient px-5 py-2 rounded-lg text-white text-sm font-bold mt-3"
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
