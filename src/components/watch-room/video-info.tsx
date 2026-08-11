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
    <div className="bg-[#0B0B0B] border border-[#242424] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 mt-3">
      {/* Left: Music/Video Icon & Editable Title */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-9 h-9 rounded-xl bg-[#151515] border border-[#242424] flex items-center justify-center text-[#FF5A00] shrink-0">
          <Music className="w-4 h-4 animate-pulse" />
        </div>
        
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                className="bg-[#151515] border border-[#FF5A00] text-[#F5F5F5] text-xs font-bold px-2 py-1 rounded-lg outline-none w-full"
                autoFocus
              />
              <button
                onClick={handleSaveTitle}
                className="p-1 rounded-lg brand-gradient text-white"
                title="Salvar título"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h3 className="text-xs font-bold text-[#F5F5F5] truncate">{videoTitle}</h3>
              {canControl && (
                <button
                  onClick={() => { setEditTitle(videoTitle); setIsEditing(true) }}
                  className="opacity-0 group-hover:opacity-100 text-[#8A8A8A] hover:text-[#FF5A00] transition-all"
                  title="Editar título"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          <p className="text-[11px] text-[#8A8A8A] mt-0.5 truncate">
            {currentTime} / {duration}
          </p>
        </div>
      </div>

      {/* Right: Playback Queue button */}
      <button
        onClick={onToggleQueue}
        className="flex items-center gap-2 text-xs font-semibold text-[#8A8A8A] hover:text-[#F5F5F5] bg-[#151515] hover:bg-[#1C1C24] px-3.5 py-2 rounded-xl border border-[#242424] transition-all shrink-0"
      >
        <ListVideo className="w-4 h-4 text-[#FF5A00]" />
        <span>Fila de reprodução</span>
        <span className="text-[10px] text-[#8A8A8A] font-bold">({queueCount})</span>
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
