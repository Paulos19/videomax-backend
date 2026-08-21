'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Settings, Users, Radio, Palette, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatHeaderProps {
  viewerCount: number
  viewers?: Array<{ name: string; image?: string }>
  selectedColor?: string
  canCreatePoll?: boolean
  onOpenCreatePoll?: () => void
  onSelectColor?: (color: string) => void
  onClose?: () => void
}

const CHAT_COLORS = [
  '#FF5A00', // Neon Orange
  '#FFE600', // Cyber Yellow
  '#22C55E', // Matrix Green
  '#00F0FF', // Cyber Cyan
  '#A855F7', // Neon Purple
  '#EF2020', // Laser Red
  '#FFFFFF', // Pure White
]

export function ChatHeader({
  viewerCount,
  viewers = [],
  selectedColor = '#FF5A00',
  canCreatePoll = false,
  onOpenCreatePoll,
  onSelectColor,
  onClose,
}: ChatHeaderProps) {

  const [showSettings, setShowSettings] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="border-b border-slate-200 dark:border-[#1F1F28] bg-slate-50 dark:bg-[#09090D] p-3 space-y-2.5 shrink-0 font-mono select-none transition-colors">
      {/* Top Title & Viewers Badges */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#FF5A00] flex items-center justify-center text-white dark:text-black">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
            CHAT AO VIVO
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white dark:bg-[#121218] border border-slate-200 dark:border-[#222] px-2 py-0.5 text-[9px] text-[#16A34A] dark:text-[#22C55E]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] dark:bg-[#22C55E] animate-ping" />
            <span className="font-bold">{viewerCount} ONLINE</span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 border border-slate-300 dark:border-[#222] hover:border-slate-900 dark:hover:border-white text-slate-500 dark:text-[#888] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Ocultar chat"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Subtext, Color picker trigger & settings */}
      <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 dark:border-[#181822]">
        <div className="flex items-center gap-2 text-[10px] text-slate-600 dark:text-[#777]">
          <span>COR NO TERMINAL:</span>
          <div
            className="w-3 h-3 border border-slate-300 dark:border-white/20 shadow-xs"
            style={{ backgroundColor: selectedColor }}
          />
        </div>

        {/* Action buttons (Enquete & Color) */}
        <div className="flex items-center gap-1.5">
          {canCreatePoll && onOpenCreatePoll && (
            <button
              onClick={onOpenCreatePoll}
              className="p-1 border border-slate-300 dark:border-[#222] hover:border-[#FFE600] text-[#FFE600] transition-colors cursor-pointer flex items-center gap-1 text-[9px] font-bold"
              title="Iniciar nova enquete"
            >
              <BarChart2 className="w-3 h-3" />
              <span>+ ENQUETE</span>
            </button>
          )}

          {/* Color Switcher Dropdown */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1 border border-slate-300 dark:border-[#222] hover:border-[#FF5A00] text-slate-600 dark:text-[#888] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[9px]"
              title="Mudar cor do nome"
            >
              <Palette className="w-3 h-3 text-[#FF5A00]" />
              <span>COR</span>
            </button>


            {showSettings && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#0C0C12] border-2 border-[#FF5A00] p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <span className="text-[9px] font-bold text-slate-600 dark:text-[#888] uppercase block mb-2">
                  [ ESCOLHA SUA COR ]
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {CHAT_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        onSelectColor?.(c)
                        setShowSettings(false)
                      }}
                      className={cn(
                        'w-7 h-7 border transition-transform hover:scale-110 cursor-pointer relative',
                        selectedColor === c ? 'border-slate-900 dark:border-white scale-110 shadow-md' : 'border-slate-300 dark:border-white/10'
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

