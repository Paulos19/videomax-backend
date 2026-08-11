'use client'

import { UserPlus, Link2, Crown, Shield } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Viewer } from '@/lib/useSocket'
import { cn } from '@/lib/utils'

interface ViewersPanelProps {
  viewers: Viewer[]
  currentUserRole?: 'host' | 'cohost' | 'viewer'
  onInvite?: () => void
  onChangeUserRole?: (targetUserId: string, newRole: 'host' | 'cohost' | 'viewer') => void
}

export function ViewersPanel({ viewers, currentUserRole, onInvite, onChangeUserRole }: ViewersPanelProps) {
  return (
    <div className="bg-room-surface border border-room-border rounded-2xl p-4 lg:p-5 mt-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Label + Avatars with role badges */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-room-text-secondary text-sm font-medium whitespace-nowrap">
            Assistindo agora ({viewers.length})
          </span>

          <div className="flex items-center gap-2 flex-wrap">
            {viewers.map((viewer) => {
              const isHost = viewer.role === 'host'
              const isCoHost = viewer.role === 'cohost'

              return (
                <div
                  key={viewer.id}
                  className="group relative flex items-center gap-2 bg-room-surface-2/60 border border-room-border-light rounded-full pl-1.5 pr-3 py-1"
                >
                  <div className="relative">
                    <Avatar
                      className={cn(
                        "w-8 h-8 border-2 transition-all",
                        viewer.isCurrentUser
                          ? "border-room-accent"
                          : "border-room-surface"
                      )}
                    >
                      <AvatarImage src={viewer.image} />
                      <AvatarFallback className="bg-room-surface-3 text-room-text-secondary text-xs font-medium">
                        {viewer.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-room-online rounded-full border-2 border-room-surface" />
                  </div>

                  <span className="text-xs font-semibold text-room-text max-w-[100px] truncate">
                    {viewer.name}
                  </span>

                  {isHost && (
                    <span title="Host">
                      <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                    </span>
                  )}
                  {isCoHost && (
                    <span title="Co-host">
                      <Shield className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    </span>
                  )}

                  {/* Host controls to promote/demote */}
                  {currentUserRole === 'host' && !viewer.isCurrentUser && onChangeUserRole && (
                    <div className="hidden group-hover:flex items-center gap-1 ml-1 bg-room-surface p-1 rounded-lg border border-room-border shadow-lg absolute -top-8 left-1/2 -translate-x-1/2 z-20">
                      {!isCoHost && (
                        <button
                          onClick={() => onChangeUserRole(viewer.id, 'cohost')}
                          className="text-[10px] bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded font-bold hover:bg-sky-500/30"
                        >
                          Promover Co-host
                        </button>
                      )}
                      {isCoHost && (
                        <button
                          onClick={() => onChangeUserRole(viewer.id, 'viewer')}
                          className="text-[10px] bg-room-surface-3 text-room-text-secondary px-2 py-0.5 rounded font-bold hover:bg-room-surface-2"
                        >
                          Remover Co-host
                        </button>
                      )}
                      <button
                        onClick={() => onChangeUserRole(viewer.id, 'host')}
                        className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-bold hover:bg-amber-500/30"
                      >
                        Passar Host
                      </button>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Add button */}
            <button
              onClick={onInvite}
              className="w-8 h-8 rounded-full border-2 border-dashed border-room-border hover:border-room-accent/50 flex items-center justify-center transition-colors"
              aria-label="Convidar pessoa"
            >
              <UserPlus className="w-3.5 h-3.5 text-room-text-secondary/50" />
            </button>
          </div>
        </div>

        {/* Right: Invite button */}
        <button
          onClick={onInvite}
          className="flex items-center gap-2 px-4 py-2 text-room-text-secondary hover:text-room-text border border-room-border hover:border-room-accent/30 rounded-xl transition-all text-sm shrink-0"
        >
          <Link2 className="w-4 h-4" />
          <span className="hidden sm:inline">Convidar amigos</span>
        </button>
      </div>
    </div>
  )
}
