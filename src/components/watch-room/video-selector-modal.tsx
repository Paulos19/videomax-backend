'use client'

import { useState, useCallback } from 'react'
import { X, Play, Check, Film, Link as LinkIcon } from 'lucide-react'
import { YoutubeIcon as Youtube } from '@/components/icons/youtube'
import { Video } from '@/types'
import { isYouTubeUrl, getYouTubeThumbnail } from '@/lib/youtube'
import { cn } from '@/lib/utils'

interface VideoSelectorModalProps {
  videos: Video[]
  currentUrl: string
  onSelect: (url: string) => void
  onClose: () => void
}

export function VideoSelectorModal({ videos, currentUrl, onSelect, onClose }: VideoSelectorModalProps) {
  const [selectedUrl, setSelectedUrl] = useState(currentUrl)
  const [customUrl, setCustomUrl] = useState('')
  const [customUrlError, setCustomUrlError] = useState('')

  const handleSelect = useCallback((url: string) => {
    setSelectedUrl(url)
  }, [])

  const handleConfirm = useCallback(() => {
    if (selectedUrl && selectedUrl !== currentUrl) {
      onSelect(selectedUrl)
    }
    onClose()
  }, [selectedUrl, currentUrl, onSelect, onClose])

  const handleConfirmCustomUrl = useCallback(() => {
    const trimmed = customUrl.trim()
    if (!trimmed) return

    // Validate URL format — must be HTTP/HTTPS and a valid URL
    let isValid = false
    if (isYouTubeUrl(trimmed)) {
      isValid = true
    } else {
      try {
        const parsed = new URL(trimmed)
        isValid = ['http:', 'https:'].includes(parsed.protocol)
      } catch {
        isValid = false
      }
    }

    if (!isValid) {
      setCustomUrlError('URL inválida. Cole uma URL do YouTube ou vídeo direto (HTTP/HTTPS).')
      return
    }
    onSelect(trimmed)
    onClose()
  }, [customUrl, onSelect, onClose])

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-room-surface border border-room-border rounded-2xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-room-border">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-room-accent" />
            <h2 className="text-room-text font-semibold text-base">Mudar vídeo</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-room-surface-2 hover:bg-room-surface-3 flex items-center justify-center transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4 text-room-text-secondary" />
          </button>
        </div>

        {/* Quick Custom Link Input */}
        <div className="p-4 border-b border-room-border bg-room-surface-2/40 space-y-2">
          <label className="text-room-text-secondary text-xs font-semibold uppercase tracking-wider block">
            Cole um link direto do YouTube
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => { setCustomUrl(e.target.value); setCustomUrlError('') }}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-room-surface border border-room-border-light text-room-text px-3 py-2 rounded-xl text-xs placeholder:text-room-text-secondary/40 outline-none focus:border-room-accent/50 transition-colors"
              />
            </div>
            <button
              onClick={handleConfirmCustomUrl}
              disabled={!customUrl.trim()}
              className={cn(
                "px-4 py-2 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 shrink-0",
                customUrl.trim()
                  ? "bg-room-accent hover:bg-room-accent/90 text-white shadow-sm"
                  : "bg-room-surface-3 text-room-text-secondary/40 cursor-not-allowed"
              )}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              Tocar
            </button>
          </div>

          {/* Dynamic YouTube Cover Thumbnail Preview */}
          {isYouTubeUrl(customUrl) && getYouTubeThumbnail(customUrl) && (
            <div className="flex items-center gap-3 p-2 bg-[#151515] border border-[#242424] rounded-xl animate-fade-in">
              <img
                src={getYouTubeThumbnail(customUrl)!}
                alt="Capa do vídeo"
                className="w-20 h-12 object-cover rounded-lg border border-[#242424]"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Capa do YouTube Carregada</span>
                <p className="text-xs text-[#F5F5F5] font-semibold truncate mt-0.5">Pronto para transmitir na sala</p>
              </div>
            </div>
          )}

          {customUrlError && (
            <p className="text-room-red text-xs">{customUrlError}</p>
          )}
        </div>

        {/* Saved Video list */}
        <div className="px-5 pt-3 pb-1">
          <p className="text-room-text-secondary text-xs font-semibold uppercase tracking-wider">
            Ou escolha da sua biblioteca
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-2 chat-scroll">
          {videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-room-text-secondary/50">
              <Film className="w-8 h-8 mb-2" />
              <p className="text-xs">Nenhum vídeo salvo na biblioteca</p>
            </div>
          ) : (
            videos.map((video) => {
              const isSelected = selectedUrl === video.url
              const isPlaying = currentUrl === video.url
              const isYt = isYouTubeUrl(video.url)
              const ytThumb = isYt ? getYouTubeThumbnail(video.url) : null

              return (
                <button
                  key={video.id}
                  onClick={() => handleSelect(video.url)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                    isSelected
                      ? "bg-room-accent/10 border-room-accent/40"
                      : "bg-room-surface-2 border-room-border hover:bg-room-surface-3 hover:border-room-border-light"
                  )}
                >
                  {/* Thumbnail container */}
                  <div className={cn(
                    "w-16 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden relative",
                    isSelected ? "bg-room-accent/20" : "bg-room-surface-3"
                  )}>
                    {ytThumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ytThumb} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <Play className={cn(
                        "w-5 h-5",
                        isSelected ? "text-room-accent" : "text-room-text-secondary/40"
                      )} />
                    )}
                    {isYt && (
                      <div className="absolute top-0.5 left-0.5 bg-room-red/90 text-white p-0.5 rounded-sm">
                        <Youtube className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate",
                      isSelected ? "text-room-accent" : "text-room-text"
                    )}>
                      {video.title}
                    </p>
                    {isPlaying && (
                      <span className="text-[11px] text-room-online font-semibold">Tocando agora</span>
                    )}
                  </div>

                  {/* Check */}
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-room-accent flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </button>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-room-border">
          <button
            onClick={handleConfirm}
            disabled={!selectedUrl || selectedUrl === currentUrl}
            className={cn(
              "w-full py-2.5 rounded-xl font-medium text-sm transition-all",
              selectedUrl && selectedUrl !== currentUrl
                ? "bg-room-accent hover:bg-room-accent/90 text-white active:scale-[0.98]"
                : "bg-room-surface-3 text-room-text-secondary/40 cursor-not-allowed"
            )}
          >
            Confirmar mudança
          </button>
        </div>
      </div>
    </div>
  )
}
