'use client'

import Image from 'next/image'
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
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 bg-room-bg/60 backdrop-blur-xl border-b border-white/5 shrink-0 z-30">
      {/* Left section: Logo / Back & Room Info */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95" onClick={onBack}>
          <div className="w-9 h-9 relative flex items-center justify-center brand-glow rounded-full overflow-hidden">
            <Image 
              src="/simplelogo.png" 
              alt="VideoMax" 
              fill
              className="object-contain p-1"
            />
          </div>
          <span className="font-extrabold tracking-wider text-lg hidden sm:inline brand-gradient-text drop-shadow-md">
            VIDEOMAX
          </span>
        </div>

        <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block"></div>

        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-room-surface/50 border border-white/10 hover:border-room-accent/50 flex items-center justify-center text-room-text-secondary hover:text-white transition-all hover:scale-105 active:scale-95 hover:shadow-[0_0_15px_rgba(255,90,0,0.15)]"
          title="Voltar para a lista"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="text-white font-extrabold text-xs sm:text-[13px] tracking-wide uppercase bg-room-surface/50 px-3 sm:px-4 py-1.5 rounded-full border border-white/5 truncate max-w-[90px] sm:max-w-none shadow-sm backdrop-blur-sm">
            {roomName}
          </span>

          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-room-yellow bg-[#FFB800]/10 border border-[#FFB800]/20 px-3 py-1.5 rounded-full shrink-0 shadow-[0_0_10px_rgba(255,184,0,0.1)]">
            <Crown className="w-3.5 h-3.5 fill-room-yellow" />
            Host {hostPlan === 'PRO' && 'PRO ⭐'}
          </span>

          <div className="flex items-center gap-1.5 text-room-text-secondary text-xs font-semibold hidden md:flex shrink-0 bg-room-surface/50 px-3 py-1.5 rounded-full border border-white/5 shadow-sm backdrop-blur-sm">
            <Users className="w-4 h-4 text-room-accent" />
            <span>{viewerCount}/{maxViewers} <span className="text-[10px] opacity-70">({hostPlan === 'PRO' ? 'Pro' : 'Free'})</span></span>
          </div>
        </div>
      </div>

      {/* Right section: Action Buttons & Status */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Connection status badge */}
        <div className="flex items-center gap-2 bg-room-surface/30 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-sm hidden xs:flex">
          <div className={cn(
            "w-2 h-2 rounded-full shrink-0 shadow-sm",
            isConnected ? "bg-emerald-500 animate-pulse shadow-emerald-500/50" : "bg-room-red shadow-room-red/50"
          )} />
          <span className="text-white text-[11px] sm:text-xs font-bold opacity-90">
            {isConnected ? 'Online' : 'Conectando'}
          </span>
        </div>

        {(userRole === 'host' || userRole === 'cohost') && (
          <button
            onClick={onToggleScreenShare}
            className={cn(
              "px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 border shadow-md hover:scale-105 active:scale-95",
              isStreamingScreen
                ? isLocalStreamer
                  ? "bg-red-600/90 hover:bg-red-600 text-white border-red-500/50 animate-pulse shadow-red-600/30"
                  : "bg-red-950/80 text-red-400 border-red-800/60 cursor-not-allowed"
                : "bg-room-surface/50 hover:bg-room-surface/80 border-white/10 hover:border-room-accent/50 text-white hover:shadow-[0_0_15px_rgba(255,90,0,0.15)]"
            )}
            title={isStreamingScreen ? "Parar Transmissão de Tela" : "Compartilhar Tela ao Vivo"}
          >
            <Monitor className={cn("w-4 h-4", isStreamingScreen ? "text-white" : "text-room-accent")} />
            <span className="hidden sm:inline">
              {isStreamingScreen ? (isLocalStreamer ? 'Parar Tela' : 'Ao Vivo') : 'Compartilhar Tela'}
            </span>
          </button>
        )}

        <button
          onClick={onChangeVideo}
          className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-room-surface/50 hover:bg-room-surface/80 border border-white/10 hover:border-room-accent/50 text-white text-xs font-bold transition-all hidden sm:flex items-center gap-2 hover:scale-105 active:scale-95 hover:shadow-[0_0_15px_rgba(255,90,0,0.15)] shadow-sm"
        >
          <Clapperboard className="w-4 h-4 text-room-accent" />
          <span>Mudar vídeo</span>
        </button>

        <button
          onClick={onShare}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-room-surface/50 border border-white/10 hover:border-room-accent/50 hidden sm:flex items-center justify-center text-room-text-secondary hover:text-white transition-all hover:scale-105 active:scale-95 hover:shadow-[0_0_15px_rgba(255,90,0,0.15)] shadow-sm"
          title="Compartilhar"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleChat}
          className={cn(
            "w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm",
            showChat
              ? "bg-room-accent/20 text-room-accent border-room-accent/40 shadow-[0_0_15px_rgba(255,90,0,0.2)]"
              : "bg-room-surface/50 text-room-text-secondary border-white/10 hover:text-white hover:border-room-accent/50 hover:shadow-[0_0_15px_rgba(255,90,0,0.15)]"
          )}
          title={showChat ? "Fechar chat" : "Abrir chat"}
        >
          <MessageCircle className="w-4 h-4" />
        </button>

        <button
          onClick={onMore}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-room-surface/50 border border-white/10 hover:border-room-accent/50 flex sm:hidden items-center justify-center text-room-text-secondary hover:text-white transition-all hover:scale-105 active:scale-95 shadow-sm"
          title="Mais opções"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
