'use client'

import { UserPlus, Link2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Viewer } from '@/lib/useSocket'
import { cn } from '@/lib/utils'

interface ViewersPanelProps {
  viewers: Viewer[]
  onInvite?: () => void
}

export function ViewersPanel({ viewers, onInvite }: ViewersPanelProps) {
  return (
    <div className="bg-room-surface border border-room-border rounded-2xl p-5 mt-4">
      <div className="flex items-center justify-between">
        {/* Left: Label + Avatars */}
        <div className="flex items-center gap-4">
          <span className="text-room-text-secondary text-sm font-medium whitespace-nowrap">
            Assistindo agora
          </span>

          <div className="flex items-center gap-1">
            {viewers.map((viewer) => (
              <div key={viewer.id} className="relative">
                <Avatar
                  className={cn(
                    "w-10 h-10 border-2 transition-all hover:scale-110",
                    viewer.isCurrentUser
                      ? "border-room-accent"
                      : "border-room-surface-2"
                  )}
                >
                  <AvatarImage src={viewer.image} />
                  <AvatarFallback className="bg-room-surface-3 text-room-text-secondary text-xs font-medium">
                    {viewer.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-room-online rounded-full border-2 border-room-surface" />
              </div>
            ))}

            {/* Add button */}
            <button
              onClick={onInvite}
              className="w-10 h-10 rounded-full border-2 border-dashed border-room-border hover:border-room-accent/50 flex items-center justify-center transition-colors ml-1"
              aria-label="Convidar pessoa"
            >
              <UserPlus className="w-4 h-4 text-room-text-secondary/50" />
            </button>
          </div>
        </div>

        {/* Right: Invite button */}
        <button
          onClick={onInvite}
          className="flex items-center gap-2 px-4 py-2 text-room-text-secondary hover:text-room-text border border-room-border hover:border-room-accent/30 rounded-xl transition-all text-sm"
        >
          <Link2 className="w-4 h-4" />
          <span className="hidden sm:inline">Convidar amigos</span>
        </button>
      </div>
    </div>
  )
}
