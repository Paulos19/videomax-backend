'use client'

import { Crown, ArrowLeft, Users, Clapperboard, Share2, MoreVertical, MessageCircle, Link2, Monitor, Square } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RoomHeaderProps {
  roomName: string
  viewerCount: number
  isConnected: boolean
  userRole?: 'host' | 'cohost' | 'viewer'
  showChat?: boolean
  hostName?: string
  hostPlan?: 'FREE' | 'PRO' | string
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
  onToggleChat
}: RoomHeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 bg-[#050505] border-b border-[#1A1A1A] shrink-0 z-30">
      {/* Left section: Logo / Back & Room Info */}
      <div className="flex items-center gap-4 min-w-0">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
          <div className="w-8 h-8 rounded-xl brand-gradient flex items-center justify-center text-white brand-glow-strong">
            <span className="font-black text-xs">▶</span>
          </div>
          <span className="font-extrabold tracking-wider text-base text-[#F5F5F5] hidden sm:inline">
            VIDEOMAX
          </span>
        </div>

        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-[#0B0B0B] border border-[#242424] hover:border-[#FF5A00] flex items-center justify-center text-[#8A8A8A] hover:text-[#F5F5F5] transition-all"
          title="Voltar para a lista"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="text-[#F5F5F5] font-extrabold text-xs sm:text-base tracking-wider uppercase bg-[#0B0B0B] px-2.5 sm:px-3 py-1 rounded-xl border border-[#242424] truncate max-w-[90px] sm:max-w-none">
            {roomName}
          </span>

          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#FFB800] bg-[#FFB800]/10 border border-[#FFB800]/30 px-2.5 py-1 rounded-full shrink-0">
            <Crown className="w-3.5 h-3.5 fill-[#FFB800]" />
            Host {hostPlan === 'PRO' && 'PRO ⭐'}
          </span>

          <div className="flex items-center gap-1.5 text-[#8A8A8A] text-xs font-semibold hidden md:flex shrink-0 bg-[#0B0B0B] px-2.5 py-1 rounded-xl border border-[#242424]">
            <Users className="w-4 h-4 text-[#FF5A00]" />
            <span>{viewerCount}/{maxViewers} <span className="text-[10px] text-[#A0A0A0]">({hostPlan === 'PRO' ? 'Plano Pro' : 'Plano Free'})</span></span>
          </div>
        </div>
      </div>

      {/* Right section: Action Buttons & Status */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {(userRole === 'host' || userRole === 'cohost') && (
          <button
            onClick={onToggleScreenShare}
            className={cn(
              "px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border shadow-md",
              isStreamingScreen
                ? isLocalStreamer
                  ? "bg-red-600 hover:bg-red-700 text-white border-red-500 animate-pulse"
                  : "bg-red-950/80 text-red-400 border-red-800/60 cursor-not-allowed"
                : "bg-[#0B0B0B] hover:bg-[#151515] border-[#242424] hover:border-[#FF5A00] text-[#F5F5F5]"
            )}
            title={isStreamingScreen ? "Parar Transmissão de Tela" : "Compartilhar Tela ao Vivo"}
          >
            <Monitor className={cn("w-4 h-4", isStreamingScreen ? "text-white" : "text-[#FF5A00]")} />
            <span className="hidden sm:inline">
              {isStreamingScreen ? (isLocalStreamer ? 'Parar Tela' : 'Ao Vivo') : 'Compartilhar Tela'}
            </span>
          </button>
        )}

        <button
          onClick={onChangeVideo}
          className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#0B0B0B] hover:bg-[#151515] border border-[#242424] hover:border-[#FF5A00] text-[#F5F5F5] text-xs font-bold transition-all hidden sm:flex items-center gap-2"
        >
          <Clapperboard className="w-4 h-4 text-[#FF5A00]" />
          <span>Mudar vídeo</span>
        </button>

        <button
          onClick={onShare}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0B0B0B] border border-[#242424] hover:border-[#FF5A00] hidden sm:flex items-center justify-center text-[#8A8A8A] hover:text-[#F5F5F5] transition-all"
          title="Compartilhar"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleChat}
          className={cn(
            "w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center transition-all",
            showChat
              ? "bg-[#FF5A00]/10 text-[#FF5A00] border-[#FF5A00]/40"
              : "bg-[#0B0B0B] text-[#8A8A8A] border-[#242424] hover:text-[#F5F5F5]"
          )}
          title={showChat ? "Fechar chat" : "Abrir chat"}
        >
          <MessageCircle className="w-4 h-4" />
        </button>

        <button
          onClick={onMore}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0B0B0B] border border-[#242424] hover:border-[#FF5A00] flex sm:hidden items-center justify-center text-[#8A8A8A] hover:text-[#F5F5F5] transition-all"
          title="Mais opções"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {/* Connection status badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#0B0B0B] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-[#242424]">
          <div className={cn(
            "w-2 h-2 rounded-full shrink-0",
            isConnected ? "bg-emerald-500 animate-pulse" : "bg-[#EF2020]"
          )} />
          <span className="text-[#F5F5F5] text-[11px] sm:text-xs font-bold hidden xs:inline">
            {isConnected ? 'Online' : 'Conectando...'}
          </span>
        </div>
      </div>
    </header>
  )
}
