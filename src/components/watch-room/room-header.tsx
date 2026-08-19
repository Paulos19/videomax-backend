'use client'

import { useState } from 'react'
import {
  Crown,
  ArrowLeft,
  Users,
  Film,
  Share2,
  MessageSquare,
  Monitor,
  Copy,
  Check,
  Radio,
  Sparkles,
  Play,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface RoomHeaderProps {
  roomName: string
  viewerCount: number
  isConnected: boolean
  userRole?: 'host' | 'cohost' | 'viewer'
  showChat?: boolean
  hostName?: string
  hostPlan?: 'FREE' | 'PRO' | 'MAXPRO' | string
  maxViewers?: number
  isStreamingScreen?: boolean
  isLocalStreamer?: boolean
  onBack?: () => void
  onChangeVideo?: () => void
  onToggleScreenShare?: () => void
  onShare?: () => void
  onMore?: () => void
  onToggleChat?: () => void
}

export function RoomHeader({
  roomName,
  viewerCount,
  isConnected,
  userRole = 'viewer',
  showChat,
  hostName = 'Host',
  hostPlan = 'FREE',
  maxViewers = 2,
  isStreamingScreen = false,
  isLocalStreamer = false,
  onBack,
  onChangeVideo,
  onToggleScreenShare,
  onShare,
  onMore,
  onToggleChat,
}: RoomHeaderProps) {
  const [copied, setCopied] = useState(false)
  const isHostPro = hostPlan === 'PRO' || hostPlan === 'MAXPRO'

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomName)
      setCopied(true)
      toast.success(`Código da sala #${roomName} copiado!`)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <header className="h-16 flex items-center justify-between px-3 sm:px-5 bg-[#08080C] border-b border-[#1F1F28] shrink-0 z-30 select-none">
      {/* ── Left section: Brand & Room Info ────────────────────────── */}
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
        
        {/* Back button */}
        <button
          onClick={onBack}
          className="p-2 border border-[#222] hover:border-[#FF5A00] bg-[#0E0E14] text-[#8A8A8A] hover:text-white transition-all cursor-pointer"
          title="Sair para o Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Brand Logo (MAXPRO vs FREE) */}
        <div
          onClick={onBack}
          className="flex items-center gap-2 cursor-pointer group transition-transform duration-200 shrink-0"
        >
          {isHostPro ? (
            <div className="w-7 h-7 bg-gradient-to-br from-[#FFE600] to-[#FF5A00] border border-[#FFE600]/80 flex items-center justify-center shadow-[0_0_15px_rgba(255,230,0,0.45)]">
              <Crown className="w-3.5 h-3.5 text-black fill-black" />
            </div>
          ) : (
            <div className="w-7 h-7 bg-[#FF5A00] flex items-center justify-center shadow-[0_0_15px_rgba(255,90,0,0.4)]">
              <Play className="w-3.5 h-3.5 text-black fill-black ml-0.5" />
            </div>
          )}

          <span
            className={cn(
              'font-mono font-black text-base tracking-tighter uppercase hidden md:inline',
              isHostPro
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#FFE600] to-[#FF8A00]'
                : 'text-white'
            )}
          >
            VIDEOMAX
          </span>
        </div>

        {/* Room Code Badge with Click-to-Copy */}
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0E0E14] border border-[#222] hover:border-[#FF5A00] text-white font-mono text-xs font-black tracking-wider uppercase transition-colors cursor-pointer"
          title="Clique para copiar código da sala"
        >
          <span>#{roomName}</span>
          {copied ? (
            <Check className="w-3 h-3 text-[#22C55E]" />
          ) : (
            <Copy className="w-3 h-3 text-[#777] group-hover:text-white" />
          )}
        </button>

        {/* Host Plan Status Badge */}
        <div
          className={cn(
            'hidden sm:flex items-center gap-1.5 px-2.5 py-1 border font-mono text-[10px] font-black uppercase tracking-wider',
            isHostPro
              ? 'bg-[#1E1408] border-[#FFE600]/60 text-[#FFE600] shadow-[0_0_12px_rgba(255,230,0,0.2)]'
              : 'bg-[#150F08] border-[#FF5A00]/50 text-[#FF5A00]'
          )}
        >
          {isHostPro ? (
            <>
              <Crown className="w-3 h-3 fill-[#FFE600]" />
              <span>HOST MAXPRO VIP</span>
            </>
          ) : (
            <span>HOST FREE</span>
          )}
        </div>

        {/* Capacity telemetry */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-[#0E0E14] border border-[#1F1F28] font-mono text-[10px] text-[#888]">
          <Users className="w-3 h-3 text-[#FF5A00]" />
          <span>
            {viewerCount}/{maxViewers} NOS {isHostPro ? '(VIP)' : '(FREE)'}
          </span>
        </div>
      </div>

      {/* ── Right section: Actions & Live State ─────────────────────── */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        
        {/* Node Active indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#09090D] border border-[#1F1F28] font-mono text-[9px] text-white">
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              isConnected ? 'bg-[#22C55E] animate-ping' : 'bg-[#EF2020]'
            )}
          />
          <span className="font-bold uppercase tracking-wider">
            {isConnected ? 'NODE 0MS' : 'OFFLINE'}
          </span>
        </div>

        {/* Screen Share Button (Host/Cohost) */}
        {(userRole === 'host' || userRole === 'cohost') && (
          <button
            onClick={onToggleScreenShare}
            className={cn(
              'px-3 py-1.5 border font-mono text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer',
              isStreamingScreen
                ? isLocalStreamer
                  ? 'bg-[#EF2020] text-white border-[#EF2020] animate-pulse shadow-[0_0_15px_rgba(239,32,32,0.4)]'
                  : 'bg-[#1F1010] text-[#EF2020] border-[#EF2020]/40'
                : isHostPro
                ? 'bg-[#FFE600] hover:bg-white text-black border-[#FFE600]'
                : 'bg-[#FF5A00] hover:bg-white text-black border-[#FF5A00]'
            )}
            title={isStreamingScreen ? 'Parar transmissão de tela' : 'Transmitir tela com áudio'}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isStreamingScreen ? (isLocalStreamer ? 'PARAR TELA' : 'AO VIVO') : 'TRANSMITIR TELA'}
            </span>
          </button>
        )}

        {/* Change Video Button (Host/Cohost) */}
        {(userRole === 'host' || userRole === 'cohost') && onChangeVideo && (
          <button
            onClick={onChangeVideo}
            className="px-3 py-1.5 bg-[#121218] hover:bg-[#1C1C24] border border-[#333] hover:border-[#FF5A00] text-white font-mono text-[10px] font-bold uppercase tracking-wider transition-colors hidden sm:flex items-center gap-1.5 cursor-pointer"
          >
            <Film className="w-3.5 h-3.5 text-[#FF5A00]" />
            <span>MUDAR VÍDEO</span>
          </button>
        )}

        {/* Share Button */}
        {onShare && (
          <button
            onClick={onShare}
            className="p-2 bg-[#0E0E14] border border-[#222] hover:border-[#FF5A00] text-[#888] hover:text-white transition-colors cursor-pointer"
            title="Convidar amigos / Compartilhar link"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}

        {/* Toggle Chat Button */}
        {onToggleChat && (
          <button
            onClick={onToggleChat}
            className={cn(
              'p-2 border transition-colors cursor-pointer flex items-center justify-center',
              showChat
                ? isHostPro
                  ? 'bg-[#FFE600]/10 border-[#FFE600] text-[#FFE600]'
                  : 'bg-[#FF5A00]/10 border-[#FF5A00] text-[#FF5A00]'
                : 'bg-[#0E0E14] border-[#222] text-[#888] hover:text-white hover:border-[#FF5A00]'
            )}
            title={showChat ? 'Ocultar chat' : 'Exibir chat'}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  )
}
