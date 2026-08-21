import { Crown, Shield, UserPlus, Radio, UserMinus, Sparkles, Mic } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Viewer } from '@/lib/useSocket'
import { cn } from '@/lib/utils'

interface ViewersPanelProps {
  viewers: Viewer[]
  currentUserRole?: 'host' | 'cohost' | 'viewer'
  isHostPro?: boolean
  hostPlan?: string
  activeSpeakers?: Set<string>
  onInvite?: () => void
  onSyncAll?: () => void
  onChangeUserRole?: (targetUserId: string, newRole: 'host' | 'cohost' | 'viewer') => void
  onKickUser?: (targetUserId: string) => void
}

export function ViewersPanel({
  viewers,
  currentUserRole,
  isHostPro = true,
  hostPlan = 'MAXPRO',
  activeSpeakers = new Set(),
  onInvite,
  onSyncAll,
  onChangeUserRole,
  onKickUser,
}: ViewersPanelProps) {

  return (
    <div className="bg-white dark:bg-[#08080C] border border-slate-200 dark:border-[#1F1F28] p-4 flex-1 space-y-3 shadow-xs dark:shadow-sm h-full font-mono select-none transition-colors">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#181822] pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] dark:bg-[#22C55E] animate-ping" />
          <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider">
            [ NÓS NA SALA ({viewers.length}) ]
          </h4>
        </div>

        {onSyncAll && (
          <button
            type="button"
            onClick={onSyncAll}
            className="px-2.5 py-1 bg-green-50 dark:bg-[#22C55E]/15 hover:bg-[#16A34A] dark:hover:bg-[#22C55E] text-[#16A34A] dark:text-[#22C55E] hover:text-white dark:hover:text-black border border-green-200 dark:border-[#22C55E]/40 hover:border-[#16A34A] dark:hover:border-[#22C55E] text-[10px] font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Forçar sincronia do tempo do vídeo de todos com o Host"
          >
            <Radio className="w-3 h-3 animate-pulse" />
            <span>SINCRONIZAR</span>
          </button>
        )}
      </div>

      {/* Viewers row with generous padding to prevent badge clipping */}
      <div className="flex items-center gap-4 overflow-x-auto pt-3.5 pb-2 px-1.5 scrollbar-none">
        {viewers.map((viewer, idx) => {
          const isHost = viewer.role === 'host'
          const isCoHost = viewer.role === 'cohost'
          const isSpeaking = activeSpeakers.has(viewer.id)

          return (
            <Popover key={`${viewer.id}-${idx}`}>
              <PopoverTrigger className="flex flex-col items-center gap-1.5 group outline-none shrink-0 cursor-pointer">
                <div className="relative">
                  
                  {/* ── Outer Moldura Container ─────────────────────── */}
                  <div
                    className={cn(
                      'w-13 h-13 transition-all duration-300 relative group-hover:scale-105',
                      isSpeaking && 'ring-2 ring-[#22C55E] shadow-[0_0_25px_rgba(34,197,94,0.8)] animate-pulse',
                      isHost
                        ? isHostPro
                          ? 'p-[2px] bg-gradient-to-tr from-[#FF9900] via-[#FFE600] to-[#FFF5A0] shadow-[0_0_20px_rgba(255,230,0,0.5),0_0_35px_rgba(255,153,0,0.25)]'
                          : 'border-2 border-[#FFE600] shadow-[0_0_15px_rgba(255,230,0,0.35)]'
                        : isCoHost
                        ? 'p-[2px] bg-gradient-to-tr from-[#0099FF] via-[#00F0FF] to-[#A0F5FF] shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                        : 'border-2 border-[#262633] group-hover:border-[#FF5A00] transition-colors'
                    )}
                  >
                    {/* Cyber HUD Corner Accents for MAXPRO Host */}
                    {isHost && isHostPro && (
                      <>
                        <span className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-[#FFE600] z-20 pointer-events-none" />
                        <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-[#FFE600] z-20 pointer-events-none" />
                      </>
                    )}

                    <div className="w-full h-full bg-[#08080C] overflow-hidden relative">
                      <Avatar className="w-full h-full rounded-none">
                        <AvatarImage src={viewer.image} className="object-cover w-full h-full" />
                        <AvatarFallback className="bg-[#121218] text-[#FF5A00] font-black text-xs rounded-none">
                          {viewer.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  {/* Online Status LED & Speaking indicator */}
                  {isSpeaking ? (
                    <span className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-[#22C55E] ring-2 ring-[#08080C] shadow-[0_0_10px_#22C55E] z-20 flex items-center justify-center text-black">
                      <Mic className="w-2.5 h-2.5 fill-black animate-bounce" />
                    </span>
                  ) : (
                    <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#22C55E] ring-2 ring-[#08080C] shadow-[0_0_8px_#22C55E] z-20" />
                  )}

                  {/* MAXPRO VIP Crown Badge */}
                  {isHost && (
                    <div
                      className={cn(
                        'absolute -top-3 -right-3 z-30 flex items-center justify-center transition-transform group-hover:scale-110',
                        isHostPro
                          ? 'w-6 h-6 bg-gradient-to-tr from-[#D48800] via-[#FFE600] to-[#FFF5A0] text-black shadow-[0_0_15px_rgba(255,230,0,0.7)] border border-black/50'
                          : 'w-5 h-5 bg-[#FFE600] text-black shadow-md border border-black/40'
                      )}
                    >
                      <Crown className={cn('fill-black', isHostPro ? 'w-3.5 h-3.5' : 'w-3 h-3')} />
                    </div>
                  )}

                  {/* Co-Host Shield Badge */}
                  {isCoHost && (
                    <div className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-[#00F0FF] text-black flex items-center justify-center z-30 shadow-md border border-black/40">
                      <Shield className="w-3 h-3 fill-black" />
                    </div>
                  )}
                </div>

                {/* ── Nameplate Badge ───────────────────────────────── */}
                <div
                  className={cn(
                    'flex items-center justify-center gap-1 max-w-[95px] px-2 py-0.5 mt-0.5 transition-all text-center',
                    isHost
                      ? isHostPro
                        ? 'bg-[#141005] border border-[#FFE600] shadow-[0_0_10px_rgba(255,230,0,0.25)]'
                        : 'bg-[#0E0E14] border border-[#FFE600]/60'
                      : isCoHost
                      ? 'bg-[#051014] border border-[#00F0FF]/60'
                      : 'bg-[#0E0E14] border border-[#222] group-hover:border-white/40'
                  )}
                >
                  <span
                    className={cn(
                      'text-[9px] font-black truncate uppercase tracking-wider',
                      isHost
                        ? 'text-[#FFE600]'
                        : isCoHost
                        ? 'text-[#00F0FF]'
                        : 'text-white group-hover:text-[#FF5A00]'
                    )}
                  >
                    {viewer.name?.split(' ')[0]}
                  </span>
                  {isHost && (
                    <Crown className="w-2.5 h-2.5 text-[#FFE600] fill-[#FFE600] shrink-0" />
                  )}
                </div>
              </PopoverTrigger>

              <PopoverContent
                align="center"
                className="w-60 bg-[#0A0A0F] border-2 border-[#FF5A00] text-white p-3 font-mono text-xs rounded-none shadow-2xl space-y-3"
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <Avatar className="w-10 h-10 border border-[#333] rounded-none">
                      <AvatarImage src={viewer.image} />
                      <AvatarFallback className="bg-[#121218] text-[#FF5A00] font-bold text-xs rounded-none">
                        {viewer.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {isHost && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FFE600] text-black flex items-center justify-center text-[9px] font-black">
                        👑
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-white uppercase truncate">{viewer.name}</p>
                    <span className="text-[9px] text-[#22C55E] font-bold uppercase block mt-0.5">
                      ● CONEXÃO MESH ATIVA
                    </span>
                  </div>
                </div>

                {currentUserRole === 'host' && !viewer.isCurrentUser && (
                  <div className="pt-2 border-t border-[#222] space-y-1.5">
                    {onChangeUserRole && !isCoHost && (
                      <button
                        onClick={() => onChangeUserRole(viewer.id, 'cohost')}
                        className="w-full py-1.5 bg-[#00F0FF]/10 hover:bg-[#00F0FF] text-[#00F0FF] hover:text-black font-black text-[9px] uppercase transition-colors text-left px-2 border border-[#00F0FF]/30 cursor-pointer flex items-center justify-between"
                      >
                        <span>PROMOVER A CO-HOST</span>
                        <Shield className="w-3 h-3" />
                      </button>
                    )}
                    {onChangeUserRole && isCoHost && (
                      <button
                        onClick={() => onChangeUserRole(viewer.id, 'viewer')}
                        className="w-full py-1.5 bg-[#121218] hover:bg-[#222] text-[#888] hover:text-white font-bold text-[9px] uppercase transition-colors text-left px-2 border border-[#333] cursor-pointer flex items-center justify-between"
                      >
                        <span>REBAIXAR PARA ESPECTADOR</span>
                        <Shield className="w-3 h-3 text-[#555]" />
                      </button>
                    )}
                    {onKickUser && (
                      <button
                        onClick={() => onKickUser(viewer.id)}
                        className="w-full py-1.5 bg-[#EF2020]/15 hover:bg-[#EF2020] text-[#EF2020] hover:text-white font-black text-[9px] uppercase transition-colors text-left px-2 border border-[#EF2020]/40 cursor-pointer flex items-center justify-between shadow-sm"
                        title="Remover participante e bloquear acesso desta sala"
                      >
                        <span>REMOVER & BLOQUEAR</span>
                        <UserMinus className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </PopoverContent>
            </Popover>
          )
        })}
      </div>

      {/* Sync All Viewers Button */}
      {onSyncAll && (
        <div className="pt-2 border-t border-[#181822]">
          <button
            type="button"
            onClick={onSyncAll}
            className="w-full py-2.5 px-3 bg-[#22C55E]/10 hover:bg-[#22C55E] text-[#22C55E] hover:text-black border border-[#22C55E]/40 hover:border-[#22C55E] text-[11px] font-mono font-black uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>SINCRONIZAR TODOS COM O HOST</span>
          </button>
        </div>
      )}
    </div>
  )
}
