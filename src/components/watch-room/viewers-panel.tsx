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
    <div className="bg-[#0B0B0B] border border-[#242424] rounded-2xl p-4 flex-1 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-[#F5F5F5]">
          Assistindo agora ({viewers.length})
        </h4>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto pb-1 scrollbar-none">
        {viewers.map((viewer) => {
          const isHost = viewer.role === 'host'
          const isCoHost = viewer.role === 'cohost'

          return (
            <Popover key={viewer.id}>
              <PopoverTrigger className="flex flex-col items-center gap-1.5 group outline-none shrink-0">
                <div className="relative">
                  <Avatar
                    className={cn(
                      "w-14 h-14 border-2 transition-transform group-hover:scale-105",
                      isHost
                        ? "border-[#FFB800] ring-2 ring-[#FFB800]/30 shadow-lg shadow-[#FFB800]/10"
                        : isCoHost
                        ? "border-sky-400"
                        : "border-[#242424]"
                    )}
                  >
                    <AvatarImage src={viewer.image} />
                    <AvatarFallback className="bg-[#151515] text-[#FF5A00] font-bold text-sm">
                      {viewer.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Status Dot */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0B0B0B]" />

                  {/* Host Crown */}
                  {isHost && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FFB800] text-[#0B0B0B] flex items-center justify-center border border-[#0B0B0B] shadow-md">
                      <Crown className="w-3 h-3 fill-[#0B0B0B]" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 max-w-[70px]">
                  <span className="text-[11px] font-semibold text-[#F5F5F5] truncate group-hover:text-[#FF5A00] transition-colors">
                    {viewer.name?.split(' ')[0]}
                  </span>
                  {isHost && <Crown className="w-3 h-3 text-[#FFB800] fill-[#FFB800] shrink-0" />}
                </div>
              </PopoverTrigger>

              <PopoverContent align="center" className="w-56 bg-[#0B0B0B] border-[#242424] text-[#F5F5F5] p-3 shadow-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border border-[#242424]">
                    <AvatarImage src={viewer.image} />
                    <AvatarFallback className="bg-[#151515] text-[#FF5A00] font-bold text-xs">
                      {viewer.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#F5F5F5] truncate">{viewer.name}</p>
                    <span className="text-[10px] text-emerald-400 font-semibold inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Assistindo agora
                    </span>
                  </div>
                </div>

                {currentUserRole === 'host' && !viewer.isCurrentUser && onChangeUserRole && (
                  <div className="pt-2 border-t border-[#242424] space-y-1.5">
                    {!isCoHost && (
                      <button
                        onClick={() => onChangeUserRole(viewer.id, 'cohost')}
                        className="w-full py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-bold transition-all text-left px-2.5"
                      >
                        Promover Co-host
                      </button>
                    )}
                    {isCoHost && (
                      <button
                        onClick={() => onChangeUserRole(viewer.id, 'viewer')}
                        className="w-full py-1.5 rounded-lg bg-[#151515] hover:bg-[#242424] text-[#8A8A8A] text-xs font-bold transition-all text-left px-2.5"
                      >
                        Remover Co-host
                      </button>
                    )}
                    <button
                      onClick={() => onChangeUserRole(viewer.id, 'host')}
                      className="w-full py-1.5 rounded-lg bg-[#FFB800]/10 hover:bg-[#FFB800]/20 text-[#FFB800] text-xs font-bold transition-all text-left px-2.5"
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
          className="flex flex-col items-center gap-1.5 group shrink-0"
          title="Convidar mais pessoas"
        >
          <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#242424] group-hover:border-[#FF5A00] flex items-center justify-center transition-colors bg-[#151515]">
            <UserPlus className="w-5 h-5 text-[#8A8A8A] group-hover:text-[#FF5A00] transition-colors" />
          </div>
          <span className="text-[11px] font-semibold text-[#8A8A8A] group-hover:text-[#FF5A00]">
            Convidar
          </span>
        </button>
      </div>
    </div>
  )
}
