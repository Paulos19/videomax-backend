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

import { ThemeToggle } from '@/components/theme-toggle'

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
    <header className="h-16 flex items-center justify-between px-3 sm:px-5 bg-white dark:bg-[#08080C] border-b border-slate-200 dark:border-[#1F1F28] shrink-0 z-30 select-none transition-colors">
      {/* ── Left section: Brand & Room Info ────────────────────────── */}
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
        
        {/* Back button */}
        <button
          onClick={onBack}
          className="p-2 border border-slate-300 dark:border-[#222] hover:border-[#FF5A00] bg-slate-100 dark:bg-[#0E0E14] text-slate-700 dark:text-[#8A8A8A] hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
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
              <Play className="w-3.5 h-3.5 text-white dark:text-black fill-current ml-0.5" />
            </div>
          )}

          <span
            className={cn(
              'font-mono font-black text-base tracking-tighter uppercase hidden md:inline',
              isHostPro
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 dark:from-[#FFE600] dark:to-[#FF8A00]'
                : 'text-slate-900 dark:text-white'
            )}
          >
            VIDEOMAX
          </span>
        </div>

        {/* Room Code Badge with Click-to-Copy */}
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-[#0E0E14] border border-slate-300 dark:border-[#222] hover:border-[#FF5A00] text-slate-900 dark:text-white font-mono text-xs font-black tracking-wider uppercase transition-colors cursor-pointer"
          title="Clique para copiar código da sala"
        >
          <span>#{roomName}</span>
          {copied ? (
            <Check className="w-3 h-3 text-[#16A34A] dark:text-[#22C55E]" />
          ) : (
            <Copy className="w-3 h-3 text-slate-400 dark:text-[#777] group-hover:text-slate-900 dark:group-hover:text-white" />
          )}
        </button>

        {/* Host Plan Status Badge */}
        <div
          className={cn(
            'hidden sm:flex items-center gap-1.5 px-2.5 py-1 border font-mono text-[10px] font-black uppercase tracking-wider transition-colors',
            isHostPro
              ? 'bg-amber-50 dark:bg-[#1E1408] border-amber-300 dark:border-[#FFE600]/60 text-amber-800 dark:text-[#FFE600] shadow-sm'
              : 'bg-orange-50 dark:bg-[#150F08] border-orange-200 dark:border-[#FF5A00]/50 text-orange-600 dark:text-[#FF5A00]'
          )}
        >
          {isHostPro ? (
            <>
              <Crown className="w-3 h-3 fill-current" />
              <span>HOST MAXPRO VIP</span>
            </>
          ) : (
            <span>HOST FREE</span>
          )}
        </div>

        {/* Capacity telemetry */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-[#0E0E14] border border-slate-200 dark:border-[#1F1F28] font-mono text-[10px] text-slate-600 dark:text-[#888] transition-colors">
          <Users className="w-3 h-3 text-[#FF5A00]" />
          <span>
            {viewerCount}/{maxViewers} NOS {isHostPro ? '(VIP)' : '(FREE)'}
          </span>
        </div>
      </div>

      {/* ── Right section: Actions & Live State ─────────────────────── */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        
        {/* Node Active indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-[#09090D] border border-slate-200 dark:border-[#1F1F28] font-mono text-[9px] text-slate-800 dark:text-white transition-colors">
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              isConnected ? 'bg-[#16A34A] dark:bg-[#22C55E] animate-ping' : 'bg-[#EF2020]'
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
                  : 'bg-red-50 dark:bg-[#1F1010] text-[#EF2020] border-red-200 dark:border-[#EF2020]/40'
                : isHostPro
                ? 'bg-amber-500 hover:bg-slate-900 dark:bg-[#FFE600] dark:hover:bg-white text-white dark:text-black border-amber-300 dark:border-[#FFE600]'
                : 'bg-[#FF5A00] hover:bg-slate-900 dark:hover:bg-white text-white dark:text-black border-[#FF5A00]'
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
            className="px-3 py-1.5 bg-slate-100 dark:bg-[#121218] hover:bg-slate-200 dark:hover:bg-[#1C1C24] border border-slate-300 dark:border-[#333] hover:border-[#FF5A00] text-slate-800 dark:text-white font-mono text-[10px] font-bold uppercase tracking-wider transition-colors hidden sm:flex items-center gap-1.5 cursor-pointer"
          >
            <Film className="w-3.5 h-3.5 text-[#FF5A00]" />
            <span>MUDAR VÍDEO</span>
          </button>
        )}

        {/* Share Button */}
        {onShare && (
          <button
            onClick={onShare}
            className="p-2 bg-slate-100 dark:bg-[#0E0E14] border border-slate-300 dark:border-[#222] hover:border-[#FF5A00] text-slate-600 dark:text-[#888] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Convidar amigos / Compartilhar link"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}

        {/* Theme Toggle in Room Header */}
        <ThemeToggle variant="compact" />

        {/* Toggle Chat Button */}
        {onToggleChat && (
          <button
            onClick={onToggleChat}
            className={cn(
              'p-2 border transition-colors cursor-pointer flex items-center justify-center',
              showChat
                ? isHostPro
                  ? 'bg-amber-50 dark:bg-[#FFE600]/10 border-amber-400 dark:border-[#FFE600] text-amber-600 dark:text-[#FFE600]'
                  : 'bg-orange-50 dark:bg-[#FF5A00]/10 border-orange-400 dark:border-[#FF5A00] text-orange-600 dark:text-[#FF5A00]'
                : 'bg-slate-100 dark:bg-[#0E0E14] border-slate-300 dark:border-[#222] text-slate-600 dark:text-[#888] hover:text-slate-900 dark:hover:text-white hover:border-[#FF5A00]'
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
