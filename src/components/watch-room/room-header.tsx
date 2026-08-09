'use client'

import { ArrowLeft, Users, Clapperboard, Share2, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RoomHeaderProps {
  roomName: string
  viewerCount: number
  isConnected: boolean
  onBack?: () => void
  onChangeVideo?: () => void
  onShare?: () => void
  onMore?: () => void
}

export function RoomHeader({
  roomName,
  viewerCount,
  isConnected,
  onBack,
  onChangeVideo,
  onShare,
  onMore
}: RoomHeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 bg-room-bg/80 backdrop-blur-xl shrink-0">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-room-surface/50 hover:bg-room-surface flex items-center justify-center transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5 text-room-text-secondary" />
        </button>

        <div className="flex items-center gap-3">
          <h1 className="text-room-text font-semibold text-lg">{roomName}</h1>

          <div className="flex items-center gap-1.5 text-room-text-secondary">
            <Users className="w-4 h-4" />
            <span className="text-sm">{viewerCount} assistindo</span>
          </div>
        </div>
      </div>

      {/* Center/Right section */}
      <div className="flex items-center gap-2">
        <Button
          onClick={onChangeVideo}
          variant="secondary"
          className="bg-room-surface hover:bg-room-surface-2 border border-room-border text-room-text gap-2 h-9"
        >
          <Clapperboard className="w-4 h-4" />
          <span className="hidden sm:inline">Mudar filme</span>
        </Button>

        <button
          onClick={onShare}
          className="w-9 h-9 rounded-full bg-room-surface/50 hover:bg-room-surface flex items-center justify-center transition-colors"
          aria-label="Compartilhar"
        >
          <Share2 className="w-4 h-4 text-room-text-secondary" />
        </button>

        <button
          onClick={onMore}
          className="w-9 h-9 rounded-full bg-room-surface/50 hover:bg-room-surface flex items-center justify-center transition-colors"
          aria-label="Mais opções"
        >
          <MoreVertical className="w-4 h-4 text-room-text-secondary" />
        </button>

        {/* Connection status */}
        <div className="flex items-center gap-2 ml-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-room-online animate-pulse-online" : "bg-red-500"
          )} />
          <span className="text-room-text-secondary text-xs">
            {isConnected ? 'Online' : 'Conectando...'}
          </span>
        </div>
      </div>
    </header>
  )
}
