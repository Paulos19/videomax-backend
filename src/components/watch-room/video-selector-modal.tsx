'use client'

import { useState, useCallback } from 'react'
import { X, Play, Check, Film } from 'lucide-react'
import { Video } from '@/types'
import { cn } from '@/lib/utils'

interface VideoSelectorModalProps {
  videos: Video[]
  currentUrl: string
  onSelect: (url: string) => void
  onClose: () => void
}

export function VideoSelectorModal({ videos, currentUrl, onSelect, onClose }: VideoSelectorModalProps) {
  const [selectedUrl, setSelectedUrl] = useState(currentUrl)

  const handleSelect = useCallback((url: string) => {
    setSelectedUrl(url)
  }, [])

  const handleConfirm = useCallback(() => {
    if (selectedUrl && selectedUrl !== currentUrl) {
      onSelect(selectedUrl)
    }
    onClose()
  }, [selectedUrl, currentUrl, onSelect, onClose])

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-room-surface border border-room-border rounded-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-room-border">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-room-accent" />
            <h2 className="text-room-text font-semibold text-base">Mudar filme</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-room-surface-2 hover:bg-room-surface-3 flex items-center justify-center transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4 text-room-text-secondary" />
          </button>
        </div>

        {/* Video list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 chat-scroll">
          {videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-room-text-secondary/50">
              <Film className="w-10 h-10 mb-3" />
              <p className="text-sm">Nenhum vídeo disponível</p>
            </div>
          ) : (
            videos.map((video) => {
              const isSelected = selectedUrl === video.url
              const isPlaying = currentUrl === video.url

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
                  {/* Thumbnail placeholder */}
                  <div className={cn(
                    "w-16 h-10 rounded-lg flex items-center justify-center shrink-0",
                    isSelected ? "bg-room-accent/20" : "bg-room-surface-3"
                  )}>
                    <Play className={cn(
                      "w-5 h-5",
                      isSelected ? "text-room-accent" : "text-room-text-secondary/40"
                    )} />
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
                      <span className="text-[11px] text-room-online">Tocando agora</span>
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
