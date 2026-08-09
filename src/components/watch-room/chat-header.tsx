'use client'

import { MessageCircle, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface ChatHeaderProps {
  viewerCount: number
  viewers: Array<{ name: string; image?: string }>
  onClose?: () => void
}

export function ChatHeader({ viewerCount, viewers, onClose }: ChatHeaderProps) {
  const displayViewers = viewers.slice(0, 3)
  const remaining = viewerCount - displayViewers.length

  return (
    <div className="px-4 pt-4 pb-0">
      {/* Title row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-room-accent" />
          <h3 className="text-room-text font-semibold text-sm">Chat ao vivo</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-room-text-secondary/50 hover:text-room-text-secondary transition-colors"
            aria-label="Fechar chat"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Viewers avatars + count */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex -space-x-2">
          {displayViewers.map((viewer, i) => (
            <Avatar key={i} className="w-7 h-7 border-2 border-room-surface">
              <AvatarImage src={viewer.image} />
              <AvatarFallback className="bg-room-surface-3 text-room-text-secondary text-[10px]">
                {viewer.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-room-online animate-pulse-online" />
          <span className="text-room-text-secondary text-xs">
            {viewerCount} {viewerCount === 1 ? 'pessoa' : 'pessoas'} aqui
          </span>
        </div>
      </div>

      {/* Today divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-room-border" />
        <span className="text-room-text-secondary/40 text-[11px] font-medium">Hoje</span>
        <div className="flex-1 h-px bg-room-border" />
      </div>
    </div>
  )
}
