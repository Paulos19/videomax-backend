'use client'

import { MessageSquare, X } from 'lucide-react'
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
  return (
    <div className="border-b border-[#242424] bg-[#090909] p-3 space-y-3 shrink-0">
      {/* Top Title & Viewers Badges */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#FF5A00]" />
          <h3 className="text-sm font-bold text-[#F5F5F5]">Chat ao vivo</h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[#8A8A8A] bg-[#151515] border border-[#242424] px-2.5 py-0.5 rounded-full">
            {viewerCount} online
          </span>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#8A8A8A] hover:text-[#F5F5F5] hover:bg-[#151515] transition-colors"
              title="Fechar chat"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Subtext & Overlapping Avatars + Quick Color Toolbar */}
      <div className="flex items-center justify-between pt-1 border-t border-[#242424]/50">
        {/* Avatars */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 overflow-hidden">
            {viewers.slice(0, 3).map((v, i) => (
              <Avatar key={i} className="w-5 h-5 border-2 border-[#090909]">
                <AvatarImage src={v.image} />
                <AvatarFallback className="bg-[#151515] text-[#FF5A00] text-[8px] font-bold">
                  {v.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="text-[11px] text-[#8A8A8A]">{viewerCount} pessoas aqui</span>
        </div>

        {/* Color Toolbar Dots */}
        <div className="flex items-center gap-1.5">
          {CHAT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onSelectColor?.(color)}
              className={cn(
                "w-3.5 h-3.5 rounded-full transition-transform hover:scale-125",
                selectedColor === color ? "ring-2 ring-white scale-110" : "opacity-80 hover:opacity-100"
              )}
              style={{ backgroundColor: color }}
              title={`Cor da mensagem (${color})`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
