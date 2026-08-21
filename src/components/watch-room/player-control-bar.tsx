import { Activity, Play, Pause, FastForward, Rewind, Crown, Lock, Scissors } from 'lucide-react'
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
  onOpenClipMaker?: () => void
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
  onOpenClipMaker,
}: PlayerControlBarProps) {

  const canControl = userRole === 'host' || userRole === 'cohost'

  return (
    <div className="bg-white dark:bg-[#08080C] border border-slate-200 dark:border-[#1F1F28] p-2 font-mono select-none shadow-xs dark:shadow-sm transition-colors">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        
        {/* 1. Play / Pause */}
        <button
          onClick={canControl ? onTogglePlay : undefined}
          disabled={!canControl}
          className={cn(
            'p-2.5 border flex items-center gap-2.5 transition-all text-left',
            canControl
              ? 'bg-slate-50 dark:bg-[#0E0E14] border-slate-200 dark:border-[#262633] hover:border-[#FF5A00] hover:bg-slate-100 dark:hover:bg-[#151520] cursor-pointer'
              : 'bg-slate-100 dark:bg-[#0A0A0E] border-slate-200 dark:border-[#181820] opacity-50 cursor-not-allowed'
          )}
        >
          <div className="w-7 h-7 bg-[#FF5A00] flex items-center justify-center text-white dark:text-black shrink-0">
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase block truncate">
              {isPlaying ? 'PAUSAR' : 'REPRODUZIR'}
            </span>
            <span className="text-[8px] text-slate-500 dark:text-[#777] uppercase block">
              {canControl ? '[ESPAÇO]' : 'HOST CONTROL'}
            </span>
          </div>
        </button>

        {/* 2. Sincronia / Sync All */}
        <button
          onClick={onSyncAll}
          className="p-2.5 bg-slate-50 dark:bg-[#0E0E14] border border-slate-200 dark:border-[#262633] hover:border-[#22C55E] hover:bg-slate-100 dark:hover:bg-[#151520] flex items-center gap-2.5 transition-all text-left cursor-pointer"
          title="Forçar sincronia de todos os participantes com o tempo do Host"
        >
          <div className="w-7 h-7 bg-[#16A34A] dark:bg-[#22C55E] flex items-center justify-center text-white dark:text-black shrink-0">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase block truncate">
              SINCRONIZAR
            </span>
            <span className="text-[8px] text-[#16A34A] dark:text-[#22C55E] font-bold uppercase block truncate">
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
              ? 'bg-slate-50 dark:bg-[#0E0E14] border-slate-200 dark:border-[#262633] hover:border-[#FF5A00] hover:bg-slate-100 dark:hover:bg-[#151520] cursor-pointer'
              : 'bg-slate-100 dark:bg-[#0A0A0E] border-slate-200 dark:border-[#181820] opacity-50 cursor-not-allowed'
          )}
        >
          <div className="w-7 h-7 bg-orange-50 dark:bg-[#1A1A26] border border-orange-200 dark:border-[#333] flex items-center justify-center text-[#FF5A00] shrink-0">
            <FastForward className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase block truncate">
              MUDAR VÍDEO
            </span>
            <span className="text-[8px] text-slate-500 dark:text-[#777] uppercase block truncate">
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
              ? 'bg-slate-50 dark:bg-[#0E0E14] border-slate-200 dark:border-[#262633] hover:border-[#FF5A00] hover:bg-slate-100 dark:hover:bg-[#151520] cursor-pointer'
              : 'bg-slate-100 dark:bg-[#0A0A0E] border-slate-200 dark:border-[#181820] opacity-50 cursor-not-allowed'
          )}
        >
          <div className="w-7 h-7 bg-slate-100 dark:bg-[#1A1A26] border border-slate-300 dark:border-[#333] flex items-center justify-center text-slate-700 dark:text-[#AAA] shrink-0">
            <Rewind className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase block truncate">
              -10 SEG
            </span>
            <span className="text-[8px] text-slate-500 dark:text-[#777] uppercase block">VOLTAR</span>
          </div>
        </button>

        {/* 5. +10s */}
        <button
          onClick={canControl ? onSeekForward : undefined}
          disabled={!canControl}
          className={cn(
            'p-2.5 border flex items-center gap-2.5 transition-all text-left',
            canControl
              ? 'bg-slate-50 dark:bg-[#0E0E14] border-slate-200 dark:border-[#262633] hover:border-[#FF5A00] hover:bg-slate-100 dark:hover:bg-[#151520] cursor-pointer'
              : 'bg-slate-100 dark:bg-[#0A0A0E] border-slate-200 dark:border-[#181820] opacity-50 cursor-not-allowed'
          )}
        >
          <div className="w-7 h-7 bg-slate-100 dark:bg-[#1A1A26] border border-slate-300 dark:border-[#333] flex items-center justify-center text-slate-700 dark:text-[#AAA] shrink-0">
            <FastForward className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase block truncate">
              +10 SEG
            </span>
            <span className="text-[8px] text-slate-500 dark:text-[#777] uppercase block">AVANÇAR</span>
          </div>
        </button>

        {/* 6. Criar Clipe */}
        <button
          onClick={onOpenClipMaker}
          className="p-2.5 bg-slate-50 dark:bg-[#0E0E14] border border-slate-200 dark:border-[#262633] hover:border-[#FF5A00] hover:bg-slate-100 dark:hover:bg-[#151520] flex items-center gap-2.5 transition-all text-left cursor-pointer"
          title="Criar e compartilhar clipe do momento com carimbo de tempo"
        >
          <div className="w-7 h-7 bg-orange-50 dark:bg-[#FF5A00]/20 border border-orange-200 dark:border-[#FF5A00]/40 flex items-center justify-center text-[#FF5A00] shrink-0">
            <Scissors className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase block truncate">
              CRIAR CLIPE
            </span>
            <span className="text-[8px] text-[#FF5A00] font-bold uppercase block truncate">
              MOMENTO
            </span>
          </div>
        </button>

        {/* 7. Modo de Controle Indicator */}
        <div className="p-2.5 bg-slate-50 dark:bg-[#09090D] border border-slate-200 dark:border-[#1F1F28] flex items-center gap-2.5">
          <div
            className={cn(
              'w-7 h-7 flex items-center justify-center shrink-0 font-black text-xs',
              canControl ? 'bg-amber-500 text-white dark:bg-[#FFE600] dark:text-black' : 'bg-slate-200 dark:bg-[#222] text-slate-600 dark:text-[#888]'
            )}
          >
            {canControl ? <Crown className="w-3.5 h-3.5 fill-current" /> : <Lock className="w-3.5 h-3.5" />}
          </div>
          <div className="min-w-0">
            <span
              className={cn(
                'text-[10px] font-black uppercase block truncate',
                canControl ? 'text-amber-600 dark:text-[#FFE600]' : 'text-slate-600 dark:text-[#888]'
              )}
            >
              {canControl ? 'CONTROLE LIBERADO' : 'ESPECTADOR'}
            </span>
            <span className="text-[8px] text-slate-400 dark:text-[#666] uppercase block truncate">
              {userRole === 'host' ? 'HOST SALA' : userRole === 'cohost' ? 'CO-HOST' : 'VIEWER'}
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}

