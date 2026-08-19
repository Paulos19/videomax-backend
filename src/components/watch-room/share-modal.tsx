'use client'

import { useState, useCallback, useEffect } from 'react'
import { X, Copy, Check, Link, Users, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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
      toast.success('Link da sala copiado!')
    } catch {
      const input = document.createElement('input')
      input.value = roomUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      toast.success('Link da sala copiado!')
    }
  }, [roomUrl])

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timeout)
    }
  }, [copied])

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose]
  )

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'VideoMax - Sala de Transmissão',
          text: `Assista vídeos comigo em sincronia na sala #${roomId}!`,
          url: roomUrl,
        })
      } catch {}
    }
  }, [roomUrl, roomId])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none font-mono animate-in fade-in duration-150"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#0A0A0F] border-2 border-[#FF5A00] w-full max-w-sm shadow-[0_0_35px_rgba(255,90,0,0.3)] flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1F1F28] bg-[#0E0E14]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#FF5A00] flex items-center justify-center text-black">
              <Share2 className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs font-black text-white uppercase tracking-wider">
              [ COMPARTILHAR SALA ]
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 border border-[#333] hover:border-white text-[#888] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Room info banner */}
          <div className="flex items-center gap-3 p-3 bg-[#121218] border border-[#222]">
            <div className="w-8 h-8 bg-[#FF5A00]/20 border border-[#FF5A00]/40 flex items-center justify-center shrink-0 text-[#FF5A00]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-white text-xs font-black uppercase">SALA #{roomId}</p>
              <p className="text-[#888] text-[9px] uppercase">
                {viewerCount} {viewerCount === 1 ? 'NÓ CONECTADO' : 'NÓS CONECTADOS'}
              </p>
            </div>
          </div>

          {/* Copy link dock */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-[#888] uppercase block">
              LINK DE ACESSO DIRETO
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                readOnly
                value={roomUrl}
                className="flex-1 bg-[#121218] border border-[#333] text-white px-2.5 py-1.5 text-[10px] font-mono outline-none select-all"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-[#FF5A00] hover:bg-white text-black font-black text-[10px] uppercase transition-colors shrink-0 cursor-pointer shadow-md flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'COPIADO' : 'COPIAR'}</span>
              </button>
            </div>
          </div>

          {/* Web Share API fallback */}
          {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
            <button
              onClick={handleNativeShare}
              className="w-full py-2 bg-[#121218] hover:bg-[#1A1A24] border border-[#333] hover:border-white text-white text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <Share2 className="w-3.5 h-3.5 text-[#FF5A00]" />
              <span>COMPARTILHAR NO DISPOSITIVO</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
