'use client'

import { Crown, Shield, UserPlus } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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
    <div className="bg-room-surface/40 backdrop-blur-xl border border-white/5 rounded-[28px] p-5 flex-1 space-y-4 shadow-sm h-full">
      <div className="flex items-center justify-between">
        <h4 className="text-[13px] font-extrabold text-white tracking-wide">
          Assistindo agora ({viewers.length})
        </h4>
      </div>

      <div className="flex items-center gap-5 overflow-x-auto pb-2 scrollbar-none">
        {viewers.map((viewer, idx) => {
          const isHost = viewer.role === 'host'
          const isCoHost = viewer.role === 'cohost'

          return (
            <Popover key={`${viewer.id}-${idx}`}>
              <PopoverTrigger className="flex flex-col items-center gap-2 group outline-none shrink-0">
                <div className="relative">
                  <Avatar
                    className={cn(
                      "w-[60px] h-[60px] border-[3px] transition-all group-hover:scale-[1.05] drop-shadow-lg",
                      isHost
                        ? "border-room-yellow shadow-[0_0_20px_rgba(255,184,0,0.2)]"
                        : isCoHost
                        ? "border-sky-400"
                        : "border-white/10"
                    )}
                  >
                    <AvatarImage src={viewer.image} />
                    <AvatarFallback className="bg-room-surface/80 text-room-accent font-bold text-base">
                      {viewer.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Status Dot */}
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-[3px] border-[#0B0B0B] shadow-sm shadow-emerald-500/50" />

                  {/* Host Crown */}
                  {isHost && (
                    <div className="absolute -top-1.5 -right-1.5 w-[22px] h-[22px] rounded-full bg-room-yellow text-[#0B0B0B] flex items-center justify-center border-2 border-[#0B0B0B] shadow-md shadow-room-yellow/30">
                      <Crown className="w-3.5 h-3.5 fill-[#0B0B0B]" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 max-w-[75px] bg-room-surface/50 backdrop-blur-md border border-white/5 px-2.5 py-0.5 rounded-full shadow-sm">
                  <span className="text-[11px] font-bold text-white truncate group-hover:text-room-accent transition-colors">
                    {viewer.name?.split(' ')[0]}
                  </span>
                  {isHost && <Crown className="w-3 h-3 text-room-yellow fill-room-yellow shrink-0 drop-shadow-sm" />}
                </div>
              </PopoverTrigger>

              <PopoverContent align="center" className="w-60 bg-room-surface/90 backdrop-blur-xl border border-white/10 text-white p-4 shadow-2xl rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border border-white/10 shadow-sm">
                    <AvatarImage src={viewer.image} />
                    <AvatarFallback className="bg-room-surface/80 text-room-accent font-bold text-sm">
                      {viewer.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-[13px] font-extrabold text-white truncate">{viewer.name}</p>
                    <span className="text-[11px] text-emerald-400 font-bold inline-flex items-center gap-1.5 opacity-90 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      Assistindo agora
                    </span>
                  </div>
                </div>

                {currentUserRole === 'host' && !viewer.isCurrentUser && onChangeUserRole && (
                  <div className="pt-3 border-t border-white/5 space-y-2">
                    {!isCoHost && (
                      <button
                        onClick={() => onChangeUserRole(viewer.id, 'cohost')}
                        className="w-full py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 hover:text-sky-300 text-[11px] font-extrabold transition-all text-left px-3 shadow-sm hover:shadow-sky-500/10"
                      >
                        Promover Co-host
                      </button>
                    )}
                    {isCoHost && (
                      <button
                        onClick={() => onChangeUserRole(viewer.id, 'viewer')}
                        className="w-full py-2 rounded-xl bg-room-surface/50 hover:bg-room-surface/80 border border-white/5 text-room-text-secondary hover:text-white text-[11px] font-extrabold transition-all text-left px-3 shadow-sm"
                      >
                        Remover Co-host
                      </button>
                    )}
                    <button
                      onClick={() => onChangeUserRole(viewer.id, 'host')}
                      className="w-full py-2 rounded-xl bg-room-yellow/10 hover:bg-room-yellow/20 text-room-yellow hover:text-yellow-400 text-[11px] font-extrabold transition-all text-left px-3 shadow-sm hover:shadow-room-yellow/10"
                    >
                      Passar Host
                    </button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          )
        })}

        {/* Plus / Invite button */}
        <button
          onClick={onInvite}
          className="flex flex-col items-center gap-2 group shrink-0"
          title="Convidar mais pessoas"
        >
          <div className="w-[60px] h-[60px] rounded-full border-2 border-dashed border-white/20 group-hover:border-room-accent flex items-center justify-center transition-all bg-room-surface/30 group-hover:bg-room-accent/10 shadow-sm group-hover:shadow-[0_0_20px_rgba(255,90,0,0.1)] group-hover:scale-[1.05]">
            <UserPlus className="w-[22px] h-[22px] text-room-text-secondary group-hover:text-room-accent transition-colors" />
          </div>
          <div className="bg-room-surface/50 backdrop-blur-md border border-white/5 px-3 py-0.5 rounded-full shadow-sm">
            <span className="text-[11px] font-bold text-room-text-secondary group-hover:text-room-accent transition-colors">
              Convidar
            </span>
          </div>
        </button>
      </div>
    </div>
  )
}
