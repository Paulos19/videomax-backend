'use client'

import { Activity, Play, Pause, FastForward, Rewind, Crown, Lock, ChevronDown, Radio, RotateCcw } from 'lucide-react'
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
  onSyncAll?: () => void
}

export function PlayerControlBar({
  isPlaying,
  userRole = 'viewer',
  hostName = 'Host',
  syncStatus = 'SINCRONIA ATIVA',
  onTogglePlay,
  onSeekBack,
  onSeekForward,
  onNextVideo,
  onSyncAll,
}: PlayerControlBarProps) {
  const canControl = userRole === 'host' || userRole === 'cohost'

  return (
    <div className="bg-[#08080C] border border-[#1F1F28] p-2 font-mono select-none">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        
        {/* 1. Play / Pause */}
        <button
          onClick={canControl ? onTogglePlay : undefined}
          disabled={!canControl}
          className={cn(
            'p-2.5 border flex items-center gap-2.5 transition-all text-left',
            canControl
              ? 'bg-[#0E0E14] border-[#262633] hover:border-[#FF5A00] hover:bg-[#151520] cursor-pointer'
              : 'bg-[#0A0A0E] border-[#181820] opacity-50 cursor-not-allowed'
          )}
        >
          <div className="w-7 h-7 bg-[#FF5A00] flex items-center justify-center text-black shrink-0">
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-black ml-0.5" />}
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-black text-white uppercase block truncate">
              {isPlaying ? 'PAUSAR' : 'REPRODUZIR'}
            </span>
            <span className="text-[8px] text-[#777] uppercase block">
              {canControl ? '[ESPAÇO]' : 'HOST CONTROL'}
            </span>
          </div>
        </button>

        {/* 2. Sincronia / Sync All */}
        <button
          onClick={onSyncAll}
          className="p-2.5 bg-[#0E0E14] border border-[#262633] hover:border-[#22C55E] hover:bg-[#151520] flex items-center gap-2.5 transition-all text-left cursor-pointer"
          title="Forçar sincronia de todos os participantes com o tempo do Host"
        >
          <div className="w-7 h-7 bg-[#22C55E] flex items-center justify-center text-black shrink-0">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-black text-white uppercase block truncate">
              SINCRONIZAR
            </span>
            <span className="text-[8px] text-[#22C55E] font-bold uppercase block truncate">
              {syncStatus}
            </span>
          </div>
        </button>

        {/* 3. Próximo Vídeo */}
        <button
          onClick={canControl ? onNextVideo : undefined}
          disabled={!canControl}
          className={cn(
            'p-2.5 border flex items-center gap-2.5 transition-all text-left',
            canControl
              ? 'bg-[#0E0E14] border-[#262633] hover:border-[#FF5A00] hover:bg-[#151520] cursor-pointer'
              : 'bg-[#0A0A0E] border-[#181820] opacity-50 cursor-not-allowed'
          )}
        >
          <div className="w-7 h-7 bg-[#1A1A26] border border-[#333] flex items-center justify-center text-[#FF5A00] shrink-0">
            <FastForward className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-black text-white uppercase block truncate">
              MUDAR VÍDEO
            </span>
            <span className="text-[8px] text-[#777] uppercase block truncate">
              {hostName}
            </span>
          </div>
        </button>

        {/* 4. -10s */}
        <button
          onClick={canControl ? onSeekBack : undefined}
          disabled={!canControl}
          className={cn(
            'p-2.5 border flex items-center gap-2.5 transition-all text-left',
            canControl
              ? 'bg-[#0E0E14] border-[#262633] hover:border-[#FF5A00] hover:bg-[#151520] cursor-pointer'
              : 'bg-[#0A0A0E] border-[#181820] opacity-50 cursor-not-allowed'
          )}
        >
          <div className="w-7 h-7 bg-[#1A1A26] border border-[#333] flex items-center justify-center text-[#AAA] shrink-0">
            <Rewind className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-black text-white uppercase block truncate">
              -10 SEG
            </span>
            <span className="text-[8px] text-[#777] uppercase block">VOLTAR</span>
          </div>
        </button>

        {/* 5. +10s */}
        <button
          onClick={canControl ? onSeekForward : undefined}
          disabled={!canControl}
          className={cn(
            'p-2.5 border flex items-center gap-2.5 transition-all text-left',
            canControl
              ? 'bg-[#0E0E14] border-[#262633] hover:border-[#FF5A00] hover:bg-[#151520] cursor-pointer'
              : 'bg-[#0A0A0E] border-[#181820] opacity-50 cursor-not-allowed'
          )}
        >
          <div className="w-7 h-7 bg-[#1A1A26] border border-[#333] flex items-center justify-center text-[#AAA] shrink-0">
            <FastForward className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-black text-white uppercase block truncate">
              +10 SEG
            </span>
            <span className="text-[8px] text-[#777] uppercase block">AVANÇAR</span>
          </div>
        </button>

        {/* 6. Modo de Controle Indicator */}
        <div className="p-2.5 bg-[#09090D] border border-[#1F1F28] flex items-center gap-2.5">
          <div
            className={cn(
              'w-7 h-7 flex items-center justify-center shrink-0 font-black text-xs',
              canControl ? 'bg-[#FFE600] text-black' : 'bg-[#222] text-[#888]'
            )}
          >
            {canControl ? <Crown className="w-3.5 h-3.5 fill-black" /> : <Lock className="w-3.5 h-3.5" />}
          </div>
          <div className="min-w-0">
            <span
              className={cn(
                'text-[10px] font-black uppercase block truncate',
                canControl ? 'text-[#FFE600]' : 'text-[#888]'
              )}
            >
              {canControl ? 'CONTROLE LIBERADO' : 'ESPECTADOR'}
            </span>
            <span className="text-[8px] text-[#666] uppercase block truncate">
              {userRole === 'host' ? 'HOST SALA' : userRole === 'cohost' ? 'CO-HOST' : 'VIEWER'}
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}
