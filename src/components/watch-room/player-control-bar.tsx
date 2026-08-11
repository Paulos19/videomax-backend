'use client'

import { Activity, Play, Pause, FastForward, Rewind, Crown, Lock, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlayerControlBarProps {
  isPlaying: boolean
  userRole?: 'host' | 'cohost' | 'viewer'
  hostName?: string
  syncStatus?: string
  onTogglePlay?: () => void
  onSeekBack?: () => void
  onSeekForward?: () => void
  onNextVideo?: () => void
}

export function PlayerControlBar({
  isPlaying,
  userRole = 'viewer',
  hostName = 'Host',
  syncStatus = 'Todos em sincronia',
  onTogglePlay,
  onSeekBack,
  onSeekForward,
  onNextVideo,
}: PlayerControlBarProps) {
  const canControl = userRole === 'host' || userRole === 'cohost'

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 my-3">
      {/* 1. Play / Pause */}
      <button
        onClick={onTogglePlay}
        className="bg-[#0B0B0B] hover:bg-[#111111] border border-[#242424] hover:border-[#FF5A00]/40 rounded-2xl p-3 flex items-center justify-between transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#151515] flex items-center justify-center text-[#FF5A00] group-hover:scale-105 transition-transform">
            {isPlaying ? <Pause className="w-4 h-4 fill-[#FF5A00]" /> : <Play className="w-4 h-4 fill-[#FF5A00]" />}
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-[#F5F5F5]">{isPlaying ? 'Pausar' : 'Reproduzir'}</p>
            <p className="text-[10px] text-[#8A8A8A]">(Espaço)</p>
          </div>
        </div>
      </button>

      {/* 2. Sincronizado */}
      <div className="bg-[#0B0B0B] border border-[#242424] rounded-2xl p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Activity className="w-4 h-4 animate-pulse" />
        </div>
        <div className="text-left min-w-0">
          <p className="text-xs font-bold text-[#F5F5F5] truncate">Sincronizado</p>
          <p className="text-[10px] text-emerald-400 font-semibold truncate">{syncStatus}</p>
        </div>
      </div>

      {/* 3. Próximo */}
      <button
        onClick={onNextVideo}
        className="bg-[#0B0B0B] hover:bg-[#111111] border border-[#242424] hover:border-[#FF5A00]/40 rounded-2xl p-3 flex items-center gap-3 transition-all group"
      >
        <div className="w-8 h-8 rounded-xl bg-[#151515] flex items-center justify-center text-[#8A8A8A] group-hover:text-[#FF5A00] transition-colors">
          <FastForward className="w-4 h-4" />
        </div>
        <div className="text-left min-w-0">
          <p className="text-xs font-bold text-[#F5F5F5] truncate">Próximo</p>
          <p className="text-[10px] text-[#8A8A8A] truncate">{hostName}</p>
        </div>
      </button>

      {/* 4. -10s */}
      <button
        onClick={onSeekBack}
        className="bg-[#0B0B0B] hover:bg-[#111111] border border-[#242424] hover:border-[#FF5A00]/40 rounded-2xl p-3 flex items-center gap-3 transition-all group"
      >
        <div className="w-8 h-8 rounded-xl bg-[#151515] flex items-center justify-center text-[#8A8A8A] group-hover:text-[#FF5A00] transition-colors">
          <Rewind className="w-4 h-4" />
        </div>
        <div className="text-left">
          <p className="text-xs font-bold text-[#F5F5F5]">- 10s</p>
          <p className="text-[10px] text-[#8A8A8A]">Voltar</p>
        </div>
      </button>

      {/* 5. +10s */}
      <button
        onClick={onSeekForward}
        className="bg-[#0B0B0B] hover:bg-[#111111] border border-[#242424] hover:border-[#FF5A00]/40 rounded-2xl p-3 flex items-center gap-3 transition-all group"
      >
        <div className="w-8 h-8 rounded-xl bg-[#151515] flex items-center justify-center text-[#8A8A8A] group-hover:text-[#FF5A00] transition-colors">
          <FastForward className="w-4 h-4" />
        </div>
        <div className="text-left">
          <p className="text-xs font-bold text-[#F5F5F5]">+ 10s</p>
          <p className="text-[10px] text-[#8A8A8A]">Avançar</p>
        </div>
      </button>

      {/* 6. Controle de Permissão */}
      <div className={cn(
        "border rounded-2xl p-3 flex items-center justify-between gap-2",
        canControl
          ? "bg-[#FFB800]/5 border-[#FFB800]/30"
          : "bg-[#0B0B0B] border-[#242424]"
      )}>
        <div className="flex items-center gap-2.5 min-w-0">
          {canControl ? (
            <Crown className="w-4 h-4 text-[#FFB800] shrink-0" />
          ) : (
            <Lock className="w-4 h-4 text-[#8A8A8A] shrink-0" />
          )}
          <div className="text-left min-w-0">
            <p className={cn("text-xs font-bold truncate", canControl ? "text-[#FFB800]" : "text-[#F5F5F5]")}>
              {canControl ? 'Você pode controlar' : 'Controle restrito'}
            </p>
            <p className="text-[10px] text-[#8A8A8A] truncate">
              {userRole === 'host' ? 'Você é o host' : userRole === 'cohost' ? 'Você é co-host' : `Somente ${hostName} controla`}
            </p>
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-[#8A8A8A] shrink-0" />
      </div>
    </div>
  )
}
