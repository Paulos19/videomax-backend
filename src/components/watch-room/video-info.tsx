'use client'

import { Music, ChevronDown, ListVideo } from 'lucide-react'

interface VideoInfoProps {
  videoTitle?: string
  subtitle?: string
  duration?: string
  queueCount?: number
  onToggleQueue?: () => void
}

export function VideoInfo({
  videoTitle = 'Attack on Titan — Temporada 4',
  subtitle = 'Episódio 21',
  duration = '23:54',
  queueCount = 3,
  onToggleQueue,
}: VideoInfoProps) {
  return (
    <div className="bg-[#0B0B0B] border border-[#242424] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 mt-3">
      {/* Left: Music/Video Icon & Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-[#151515] border border-[#242424] flex items-center justify-center text-[#FF5A00] shrink-0">
          <Music className="w-4 h-4 animate-pulse" />
        </div>
        <div className="min-w-0">
          <h3 className="text-xs font-bold text-[#F5F5F5] truncate">{videoTitle}</h3>
          <p className="text-[11px] text-[#8A8A8A] mt-0.5 truncate">
            {subtitle} • {duration}
          </p>
        </div>
      </div>

      {/* Right: Playback Queue button */}
      <button
        onClick={onToggleQueue}
        className="flex items-center gap-2 text-xs font-semibold text-[#8A8A8A] hover:text-[#F5F5F5] bg-[#151515] hover:bg-[#1C1C24] px-3.5 py-2 rounded-xl border border-[#242424] transition-all"
      >
        <ListVideo className="w-4 h-4 text-[#FF5A00]" />
        <span>Fila de reprodução</span>
        <span className="text-[10px] text-[#8A8A8A] font-bold">({queueCount})</span>
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
