'use client'

import { useState } from 'react'
import { Music, ChevronDown, ListVideo, Edit2, Check } from 'lucide-react'

interface VideoInfoProps {
  videoTitle?: string
  currentTime?: string
  duration?: string
  queueCount?: number
  canControl?: boolean
  onUpdateTitle?: (newTitle: string) => void
  onToggleQueue?: () => void
}

export function VideoInfo({
  videoTitle = 'Sessão de Vídeo',
  currentTime = '00:00',
  duration = '00:00',
  queueCount = 1,
  canControl = false,
  onUpdateTitle,
  onToggleQueue,
}: VideoInfoProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(videoTitle)

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      onUpdateTitle?.(editTitle.trim())
    }
    setIsEditing(false)
  }

  return (
    <div className="bg-room-surface/40 backdrop-blur-xl border border-white/5 rounded-[28px] p-5 flex flex-wrap items-center justify-between gap-4 mt-3 shadow-sm">
      {/* Left: Music/Video Icon & Editable Title */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="w-[42px] h-[42px] rounded-2xl bg-room-surface/50 border border-white/10 flex items-center justify-center text-room-accent shrink-0 shadow-sm">
          <Music className="w-5 h-5 animate-pulse drop-shadow-md" />
        </div>
        
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                className="bg-room-surface/50 border border-room-accent/50 text-white text-[13px] font-extrabold px-3 py-1.5 rounded-full outline-none w-full shadow-sm"
                autoFocus
              />
              <button
                onClick={handleSaveTitle}
                className="p-1.5 rounded-full brand-gradient text-white shadow-md hover:scale-105 active:scale-95 transition-transform"
                title="Salvar título"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h3 className="text-[13px] font-extrabold text-white truncate tracking-wide">{videoTitle}</h3>
              {canControl && (
                <button
                  onClick={() => { setEditTitle(videoTitle); setIsEditing(true) }}
                  className="opacity-0 group-hover:opacity-100 text-room-text-secondary hover:text-room-accent transition-all"
                  title="Editar título"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          <p className="text-[11px] text-room-text-secondary mt-0.5 truncate font-semibold">
            {currentTime} / {duration}
          </p>
        </div>
      </div>

      {/* Right: Playback Queue button */}
      <button
        onClick={onToggleQueue}
        className="flex items-center gap-2 text-[12px] font-extrabold text-room-text-secondary hover:text-white bg-room-surface/50 hover:bg-room-surface/80 px-4 py-2.5 rounded-full border border-white/10 hover:border-room-accent/30 transition-all shrink-0 hover:shadow-[0_0_15px_rgba(255,90,0,0.15)] active:scale-95"
      >
        <ListVideo className="w-4 h-4 text-room-accent" />
        <span>Fila de reprodução</span>
        <span className="text-[10px] text-room-text-secondary font-bold">({queueCount})</span>
        <ChevronDown className="w-4 h-4 opacity-70" />
      </button>
    </div>
  )
}
