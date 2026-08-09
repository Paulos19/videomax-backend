'use client'

import { useState, useCallback, useEffect } from 'react'
import { X, Copy, Check, Link, Users, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ShareModalProps {
  roomId: string
  viewerCount: number
  onClose: () => void
}

export function ShareModal({ roomId, viewerCount, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [roomUrl, setRoomUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRoomUrl(`${window.location.origin}/room/${roomId}`)
    }
  }, [roomId])

  const handleCopy = useCallback(async () => {
    if (!roomUrl) return
    try {
      await navigator.clipboard.writeText(roomUrl)
      setCopied(true)
    } catch {
      // Fallback: select text
      const input = document.createElement('input')
      input.value = roomUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
    }
  }, [roomUrl])

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timeout)
    }
  }, [copied])

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Video Max - Sala de assistência',
          text: `Entre na minha sala de assistir vídeos! (${viewerCount} pessoas assistindo)`,
          url: roomUrl,
        })
      } catch {
        // User cancelled or error
      }
    }
  }, [roomUrl, viewerCount])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-room-surface border border-room-border rounded-2xl w-full max-w-sm mx-4 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-room-border">
          <div className="flex items-center gap-2">
            <Link className="w-5 h-5 text-room-accent" />
            <h2 className="text-room-text font-semibold text-base">Compartilhar sala</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-room-surface-2 hover:bg-room-surface-3 flex items-center justify-center transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4 text-room-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-5 space-y-4">
          {/* Room info */}
          <div className="flex items-center gap-3 p-3 bg-room-surface-2 rounded-xl border border-room-border">
            <div className="w-10 h-10 rounded-xl bg-room-accent/10 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-room-accent" />
            </div>
            <div>
              <p className="text-room-text text-sm font-medium">{roomId}</p>
              <p className="text-room-text-secondary text-xs">
                {viewerCount} {viewerCount === 1 ? 'pessoa' : 'pessoas'} assistindo
              </p>
            </div>
          </div>

          {/* Link display + copy */}
          <div>
            <label className="text-room-text-secondary text-xs font-medium mb-1.5 block">Link da sala</label>
            <div className="flex items-center gap-2 bg-room-surface-2 border border-room-border rounded-xl px-3 py-2.5">
              <input
                readOnly
                value={roomUrl}
                className="flex-1 bg-transparent text-room-text text-sm outline-none truncate"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={handleCopy}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0",
                  copied
                    ? "bg-room-online/20 text-room-online"
                    : "bg-room-accent/10 text-room-accent hover:bg-room-accent/20"
                )}
                aria-label="Copiar link"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Native share button (mobile) */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-room-surface-2 hover:bg-room-surface-3 border border-room-border text-room-text text-sm font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Compartilhar via app
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
