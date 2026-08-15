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
  onSyncAll,
}: PlayerControlBarProps & { onSyncAll?: () => void }) {
  const canControl = userRole === 'host' || userRole === 'cohost'

  return (
    <div className="bg-room-surface/40 backdrop-blur-xl border border-white/5 rounded-[28px] p-2 sm:p-3 my-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-2.5">
        {/* 1. Play / Pause */}
        <button
          onClick={canControl ? onTogglePlay : undefined}
          disabled={!canControl}
          className={cn(
            "bg-room-surface/30 border border-white/5 rounded-2xl p-3 flex items-center justify-between transition-all group",
            canControl
              ? "hover:bg-room-surface/50 hover:border-room-accent/30 hover:shadow-[0_0_15px_rgba(255,90,0,0.1)] cursor-pointer hover:scale-[1.02] active:scale-95"
              : "opacity-60 cursor-not-allowed"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-room-surface/50 border border-white/10 flex items-center justify-center text-room-accent group-hover:bg-room-accent/10 transition-colors shadow-sm">
              {isPlaying ? <Pause className="w-4 h-4 fill-room-accent" /> : <Play className="w-4 h-4 fill-room-accent ml-0.5" />}
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs font-bold text-white truncate">{isPlaying ? 'Pausar' : 'Reproduzir'}</p>
              <p className="text-[10px] text-room-text-secondary truncate">{canControl ? '(Espaço)' : 'Somente Host'}</p>
            </div>
          </div>
        </button>

        {/* 2. Sincronizado / Sincronizar todos */}
        <button
          onClick={onSyncAll}
          className="bg-room-surface/30 hover:bg-room-surface/50 border border-white/5 hover:border-emerald-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] rounded-2xl p-3 flex items-center gap-3 transition-all text-left group cursor-pointer hover:scale-[1.02] active:scale-95"
          title="Sincronizar com o player do Host"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 transition-colors shadow-sm">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div className="text-left min-w-0">
            <p className="text-xs font-bold text-white truncate">Sincronizar</p>
            <p className="text-[10px] text-emerald-400 font-semibold truncate">{syncStatus}</p>
          </div>
        </button>

        {/* 3. Próximo */}
        <button
          onClick={canControl ? onNextVideo : undefined}
          disabled={!canControl}
          className={cn(
            "bg-room-surface/30 border border-white/5 rounded-2xl p-3 flex items-center gap-3 transition-all group",
            canControl
              ? "hover:bg-room-surface/50 hover:border-room-accent/30 hover:shadow-[0_0_15px_rgba(255,90,0,0.1)] cursor-pointer hover:scale-[1.02] active:scale-95"
              : "opacity-60 cursor-not-allowed"
          )}
        >
          <div className="w-8 h-8 rounded-xl bg-room-surface/50 border border-white/10 flex items-center justify-center text-room-text-secondary group-hover:text-room-accent group-hover:bg-room-accent/10 transition-colors shadow-sm">
            <FastForward className="w-4 h-4" />
          </div>
          <div className="text-left min-w-0">
            <p className="text-xs font-bold text-white truncate">Próximo</p>
            <p className="text-[10px] text-room-text-secondary truncate">{hostName}</p>
          </div>
        </button>

        {/* 4. -10s */}
        <button
          onClick={canControl ? onSeekBack : undefined}
          disabled={!canControl}
          className={cn(
            "bg-room-surface/30 border border-white/5 rounded-2xl p-3 flex items-center gap-3 transition-all group",
            canControl
              ? "hover:bg-room-surface/50 hover:border-room-accent/30 hover:shadow-[0_0_15px_rgba(255,90,0,0.1)] cursor-pointer hover:scale-[1.02] active:scale-95"
              : "opacity-60 cursor-not-allowed"
          )}
        >
          <div className="w-8 h-8 rounded-xl bg-room-surface/50 border border-white/10 flex items-center justify-center text-room-text-secondary group-hover:text-room-accent group-hover:bg-room-accent/10 transition-colors shadow-sm">
            <Rewind className="w-4 h-4" />
          </div>
          <div className="text-left min-w-0">
            <p className="text-xs font-bold text-white truncate">- 10s</p>
            <p className="text-[10px] text-room-text-secondary truncate">Voltar</p>
          </div>
        </button>

        {/* 5. +10s */}
        <button
          onClick={canControl ? onSeekForward : undefined}
          disabled={!canControl}
          className={cn(
            "bg-room-surface/30 border border-white/5 rounded-2xl p-3 flex items-center gap-3 transition-all group",
            canControl
              ? "hover:bg-room-surface/50 hover:border-room-accent/30 hover:shadow-[0_0_15px_rgba(255,90,0,0.1)] cursor-pointer hover:scale-[1.02] active:scale-95"
              : "opacity-60 cursor-not-allowed"
          )}
        >
          <div className="w-8 h-8 rounded-xl bg-room-surface/50 border border-white/10 flex items-center justify-center text-room-text-secondary group-hover:text-room-accent group-hover:bg-room-accent/10 transition-colors shadow-sm">
            <FastForward className="w-4 h-4" />
          </div>
          <div className="text-left min-w-0">
            <p className="text-xs font-bold text-white truncate">+ 10s</p>
            <p className="text-[10px] text-room-text-secondary truncate">Avançar</p>
          </div>
        </button>

        {/* 6. Controle de Permissão */}
        <div className={cn(
          "border rounded-2xl p-3 flex items-center justify-between gap-2 shadow-sm transition-all",
          canControl
            ? "bg-room-yellow/10 border-room-yellow/20"
            : "bg-room-surface/30 border-white/5"
        )}>
          <div className="flex items-center gap-2.5 min-w-0">
            {canControl ? (
              <Crown className="w-4 h-4 text-room-yellow shrink-0 drop-shadow-md" />
            ) : (
              <Lock className="w-4 h-4 text-room-text-secondary shrink-0" />
            )}
            <div className="text-left min-w-0">
              <p className={cn("text-xs font-bold truncate", canControl ? "text-room-yellow" : "text-white")}>
                {canControl ? 'Controle total' : 'Restrito'}
              </p>
              <p className="text-[10px] text-room-text-secondary truncate">
                {userRole === 'host' ? 'Você é o host' : userRole === 'cohost' ? 'Você é co-host' : `Apenas ${hostName}`}
              </p>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-room-text-secondary shrink-0" />
        </div>
      </div>
    </div>
  )
}
