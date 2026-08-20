'use client'

import { useState } from 'react'
import { Film, ListVideo, Edit2, Check } from 'lucide-react'

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
    <div className="bg-white dark:bg-[#08080C] border border-slate-200 dark:border-[#1F1F28] p-4 flex flex-wrap items-center justify-between gap-3 font-mono select-none shadow-xs dark:shadow-sm transition-colors">
      {/* Left: Video Icon & Editable Title */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-9 h-9 bg-[#FF5A00] text-white dark:text-black flex items-center justify-center shrink-0">
          <Film className="w-4 h-4" />
        </div>

        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                className="bg-slate-100 dark:bg-[#121218] border border-[#FF5A00] text-slate-900 dark:text-white text-xs font-mono font-bold px-2 py-1 outline-none w-full"
                autoFocus
              />
              <button
                onClick={handleSaveTitle}
                className="p-1.5 bg-[#FF5A00] text-white dark:text-black hover:bg-slate-900 dark:hover:bg-white transition-colors cursor-pointer"
                title="Salvar título"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase truncate tracking-wider">
                {videoTitle}
              </h3>
              {canControl && (
                <button
                  onClick={() => {
                    setEditTitle(videoTitle)
                    setIsEditing(true)
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 dark:text-[#777] hover:text-[#FF5A00] transition-opacity cursor-pointer"
                  title="Editar título"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          <p className="text-[10px] text-slate-500 dark:text-[#777] mt-0.5 font-mono">
            {currentTime} / {duration}
          </p>
        </div>
      </div>

      {/* Right: Playback Queue button */}
      {onToggleQueue && (
        <button
          onClick={onToggleQueue}
          className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-800 dark:text-white bg-slate-100 dark:bg-[#121218] hover:bg-slate-200 dark:hover:bg-[#1A1A24] border border-slate-300 dark:border-[#333] hover:border-[#FF5A00] px-3 py-2 transition-colors shrink-0 cursor-pointer"
        >
          <ListVideo className="w-3.5 h-3.5 text-[#FF5A00]" />
          <span>SELETOR DE VÍDEO</span>
        </button>
      )}
    </div>
  )
}
