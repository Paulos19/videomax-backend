'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Settings } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface ChatHeaderProps {
  viewerCount: number
  viewers?: Array<{ name: string; image?: string }>
  selectedColor?: string
  onSelectColor?: (color: string) => void
  onClose?: () => void
}

const CHAT_COLORS = [
  '#F5F5F5', // White
  '#FFB800', // Yellow
  '#EF2020', // Red
  '#A855F7', // Purple
  '#3B82F6', // Blue
  '#06B6D4', // Cyan
  '#22C55E', // Green
]

export function ChatHeader({
  viewerCount,
  viewers = [],
  selectedColor = '#F5F5F5',
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
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="border-b border-white/5 bg-room-surface/30 backdrop-blur-md p-3 space-y-3 shrink-0">
      {/* Top Title & Viewers Badges */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#FF5A00]" />
          <h3 className="text-sm font-bold text-white drop-shadow-md">Chat ao vivo</h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-room-surface/50 backdrop-blur-sm border border-white/5 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-room-online animate-pulse-online" />
            <span className="text-[11px] font-semibold text-room-text-secondary">
              {viewerCount} online
            </span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-room-text-secondary hover:text-white hover:bg-white/10 transition-colors"
              title="Fechar chat"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Subtext & Overlapping Avatars + Settings */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5 relative">
        {/* Avatars */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 overflow-hidden">
            {viewers.slice(0, 3).map((v, i) => (
              <Avatar key={i} className="w-5 h-5 border-2 border-[#090909]">
                <AvatarImage src={v.image || undefined} />
                <AvatarFallback className="bg-[#151515] text-[#FF5A00] text-[8px] font-bold">
                  {v.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="text-[11px] text-room-text-secondary">{viewerCount} pessoas aqui</span>
        </div>

        {/* Settings Gear */}
        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              showSettings ? "bg-white/10 text-white" : "text-room-text-secondary hover:text-white hover:bg-white/5"
            )}
            title="Configurações do Chat"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Settings Popover */}
          {showSettings && (
            <div className="absolute top-8 right-0 w-48 bg-room-surface/90 backdrop-blur-2xl border border-white/10 p-3 rounded-xl shadow-2xl z-50 animate-scale-in origin-top-right">
              <span className="text-xs font-semibold text-room-text-secondary mb-2 block">Cor da Mensagem</span>
              <div className="flex flex-wrap gap-2">
                {CHAT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      onSelectColor?.(color)
                      setShowSettings(false)
                    }}
                    className={cn(
                      "w-5 h-5 rounded-full transition-transform hover:scale-125 shadow-sm",
                      selectedColor === color ? "ring-2 ring-white scale-110" : "opacity-80 hover:opacity-100"
                    )}
                    style={{ backgroundColor: color }}
                    title={`Cor (${color})`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
