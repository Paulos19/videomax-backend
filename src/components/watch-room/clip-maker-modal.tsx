'use client'

import { useState, useRef, useCallback } from 'react'
import {
  X,
  Scissors,
  Share2,
  Copy,
  Check,
  Download,
  Clock,
  Sparkles,
  MessageSquare,
  Flame,
} from 'lucide-react'
import { ChatMessage } from '@/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ClipMakerModalProps {
  isOpen: boolean
  onClose: () => void
  roomId: string
  videoTitle?: string
  currentTime: number
  recentMessages?: ChatMessage[]
  videoCoverUrl?: string
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function ClipMakerModal({
  isOpen,
  onClose,
  roomId,
  videoTitle = 'Sessão de Vídeo',
  currentTime,
  recentMessages = [],
  videoCoverUrl,
}: ClipMakerModalProps) {
  const [clipTitle, setClipTitle] = useState('')
  const [selectedQuote, setSelectedQuote] = useState<string>('')
  const [copiedLink, setCopiedLink] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const previewCardRef = useRef<HTMLDivElement>(null)

  if (!isOpen) return null

  const formattedTime = formatTime(currentTime)
  const roundedSeconds = Math.floor(currentTime)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const shareableUrl = `${baseUrl}/room/${roomId}?t=${roundedSeconds}`

  const defaultClipTitle = clipTitle.trim() || `Momento em ${formattedTime} - ${videoTitle}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl)
    setCopiedLink(true)
    toast.success('Link do momento copiado com carimbo de tempo!')
    setTimeout(() => setCopiedLink(false), 2500)
  }

  const handleShareWhatsApp = () => {
    const text = `🔥 Olha esse momento em ${formattedTime} que rolou no VideoMax!\n\n🎬 "${defaultClipTitle}"\n\nAssista agora sincronizado comigo:\n${shareableUrl}`
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')
  }

  const handleShareTwitter = () => {
    const text = `🔥 Clipe gravado no @VideoMax: "${defaultClipTitle}" (${formattedTime})\n\nVenha assistir comigo:`
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(
        shareableUrl
      )}`,
      '_blank'
    )
  }

  const handleDownloadCard = async () => {
    setIsGeneratingImage(true)
    try {
      // Draw stylized card to canvas
      const canvas = document.createElement('canvas')
      canvas.width = 1200
      canvas.height = 630
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Dark background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 630)
      bgGrad.addColorStop(0, '#07070B')
      bgGrad.addColorStop(0.5, '#0E0E14')
      bgGrad.addColorStop(1, '#1A0B05')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, 1200, 630)

      // Cyberpunk border
      ctx.strokeStyle = '#FF5A00'
      ctx.lineWidth = 8
      ctx.strokeRect(16, 16, 1168, 598)

      // Orange header bar
      ctx.fillStyle = '#FF5A00'
      ctx.fillRect(16, 16, 1168, 60)

      // Brand text
      ctx.fillStyle = '#000000'
      ctx.font = '900 24px monospace'
      ctx.fillText('VIDEOMAX // MOMENTO DESTACADO', 40, 54)

      // Time badge
      ctx.fillStyle = '#FFE600'
      ctx.font = '900 22px monospace'
      ctx.fillText(`⏱ TEMPO: ${formattedTime}`, 920, 54)

      // Video Title
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '900 36px sans-serif'
      ctx.fillText(defaultClipTitle.slice(0, 48), 60, 160)

      // Subtitle
      ctx.fillStyle = '#FF5A00'
      ctx.font = '700 20px monospace'
      ctx.fillText(`SALA: /room/${roomId}`, 60, 205)

      // Quote / Reaction Box
      if (selectedQuote) {
        ctx.fillStyle = '#161622'
        ctx.fillRect(60, 250, 1080, 110)
        ctx.strokeStyle = '#333'
        ctx.lineWidth = 2
        ctx.strokeRect(60, 250, 1080, 110)

        ctx.fillStyle = '#FFE600'
        ctx.font = 'italic 700 22px sans-serif'
        ctx.fillText(`"${selectedQuote.slice(0, 90)}"`, 90, 315)
      }

      // Footer callout
      ctx.fillStyle = '#888888'
      ctx.font = '600 18px monospace'
      ctx.fillText('Assista vídeos sincronizados em tempo real com seus amigos no VideoMax.', 60, 560)

      // URL
      ctx.fillStyle = '#FF5A00'
      ctx.font = '900 18px monospace'
      ctx.fillText(shareableUrl, 60, 590)

      const imgUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `videomax-clipe-${roundedSeconds}s.png`
      link.href = imgUrl
      link.click()

      toast.success('Card de clipe baixado com sucesso!')
    } catch (err) {
      toast.error('Erro ao gerar imagem do clipe.')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none font-mono animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-[#0A0A0F] border-2 border-[#FF5A00] w-full max-w-lg shadow-[0_0_40px_rgba(255,90,0,0.35)] flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1F1F28] bg-[#0E0E14]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#FF5A00] flex items-center justify-center text-black font-bold">
              <Scissors className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs font-black text-white uppercase tracking-wider">
              [ GERADOR DE CLIPE & MOMENTO ]
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
        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Visual Preview Card */}
          <div
            ref={previewCardRef}
            className="p-4 bg-gradient-to-br from-[#121218] via-[#0E0E14] to-[#1A0B05] border border-[#FF5A00]/60 relative overflow-hidden shadow-lg"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-black text-[#FF5A00] uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                <span>VIDEOMAX MOMENTO</span>
              </span>

              <div className="px-2 py-0.5 bg-[#FF5A00] text-black text-[9px] font-black uppercase flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                <span>{formattedTime}</span>
              </div>
            </div>

            <h3 className="text-xs font-bold text-white uppercase tracking-wide line-clamp-2 mb-1.5">
              {defaultClipTitle}
            </h3>

            {selectedQuote && (
              <div className="p-2 bg-black/60 border-l-2 border-[#FFE600] my-2 text-[10px] text-[#E5E5E5] italic">
                "{selectedQuote}"
              </div>
            )}

            <div className="mt-3 pt-2 border-t border-[#222] flex items-center justify-between text-[8px] text-[#777]">
              <span>SALA: {roomId}</span>
              <span className="text-[#FF5A00] font-bold">ASSISTA SINCRONIZADO</span>
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-[#888] uppercase block">
              TÍTULO DO CLIPE (OPCIONAL)
            </label>
            <input
              type="text"
              value={clipTitle}
              onChange={(e) => setClipTitle(e.target.value)}
              placeholder={`Ex: Reação épica aos ${formattedTime}`}
              className="w-full bg-[#121218] border border-[#333] focus:border-[#FF5A00] text-white px-3 py-2 text-xs font-mono outline-none"
              maxLength={100}
            />
          </div>

          {/* Recent Chat Quotes / Reactions */}
          {recentMessages.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-[#888] uppercase flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-[#FF5A00]" />
                <span>DESTACAR MENSAGEM DO CHAT (OPCIONAL)</span>
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {recentMessages
                  .filter((m) => m.type !== 'system' && m.message && !m.message.startsWith('{'))
                  .slice(-6)
                  .map((msg) => {
                    const isSelected = selectedQuote === `${msg.userName}: ${msg.message}`
                    return (
                      <button
                        key={msg.id}
                        type="button"
                        onClick={() =>
                          setSelectedQuote(
                            isSelected ? '' : `${msg.userName}: ${msg.message}`
                          )
                        }
                        className={cn(
                          'px-2 py-1 text-[9px] border transition-colors cursor-pointer text-left truncate max-w-full',
                          isSelected
                            ? 'bg-[#FFE600] text-black border-[#FFE600] font-bold'
                            : 'bg-[#121218] text-[#888] border-[#222] hover:border-[#444] hover:text-white'
                        )}
                      >
                        <strong>{msg.userName}:</strong> {msg.message}
                      </button>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleCopyLink}
              className="w-full py-2.5 bg-[#FF5A00] hover:bg-white text-black font-black text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,90,0,0.3)]"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'LINK COPIADO!' : 'COPIAR LINK DO MOMENTO'}</span>
            </button>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleShareWhatsApp}
                className="py-2 bg-[#22C55E] hover:bg-white text-black font-black text-[10px] uppercase transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <Share2 className="w-3 h-3" />
                <span>WHATSAPP</span>
              </button>

              <button
                onClick={handleShareTwitter}
                className="py-2 bg-[#1DA1F2] hover:bg-white text-black font-black text-[10px] uppercase transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <Share2 className="w-3 h-3" />
                <span>X / TWITTER</span>
              </button>

              <button
                onClick={handleDownloadCard}
                disabled={isGeneratingImage}
                className="py-2 bg-[#1F1F28] hover:bg-white hover:text-black text-white border border-[#333] font-black text-[10px] uppercase transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span>BAIXAR CARD</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
