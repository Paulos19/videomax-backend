'use client'

import { toast } from 'sonner'
import { Crown, Zap, Play, Radio, AlertOctagon, CheckCircle2 } from 'lucide-react'

/**
 * Cyberpunk Brutalist Notification Helper with VIP Telemetry
 */
export const notify = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
    })
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
    })
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
    })
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
    })
  },

  /**
   * Special VIP MAXPRO Toast with Golden Telemetry
   */
  vip: (message: string, description?: string) => {
    toast.custom(() => (
      <div className="w-full max-w-sm p-4 bg-[#0A0A0F] border-2 border-[#FFE600] shadow-[0_0_30px_rgba(255,230,0,0.45)] font-mono text-[11px] text-white flex items-start gap-3 relative overflow-hidden backdrop-blur-md">
        <div className="w-8 h-8 bg-gradient-to-br from-[#FFE600] to-[#FF5A00] flex items-center justify-center shrink-0">
          <Crown className="w-4 h-4 text-black fill-black" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] font-black bg-[#FFE600] text-black px-1.5 py-0.2 uppercase">
              MAXPRO VIP
            </span>
            <span className="font-black text-white text-[11px] uppercase tracking-wider truncate">
              {message}
            </span>
          </div>
          {description && (
            <p className="text-[10px] text-[#CCC] leading-relaxed font-mono">
              {description}
            </p>
          )}
        </div>
      </div>
    ))
  },

  /**
   * Instant Watch Party Room Invitation Toast
   */
  roomInvite: (senderName: string, roomCode: string, onJoin?: () => void) => {
    toast.custom((t) => (
      <div className="w-full max-w-sm p-4 bg-[#0D0D14] border-2 border-[#FF5A00] shadow-[0_0_35px_rgba(255,90,0,0.4)] font-mono text-[11px] text-white flex items-start gap-3 relative overflow-hidden backdrop-blur-md animate-in slide-in-from-top duration-200">
        <div className="w-8 h-8 bg-[#FF5A00] flex items-center justify-center shrink-0">
          <Radio className="w-4 h-4 text-black animate-pulse" />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <span className="text-[8px] font-bold text-[#FF5A00] uppercase block">
              [ TRANSMISSÃO AO VIVO ]
            </span>
            <strong className="text-white text-[12px] uppercase block font-black">
              {senderName} convocou você!
            </strong>
            <p className="text-[10px] text-[#888] truncate font-mono">
              Sala #{roomCode} aberta agora.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                toast.dismiss(t)
                if (onJoin) onJoin()
                else window.location.href = `/room/${roomCode}`
              }}
              className="px-3.5 py-1.5 bg-[#FF5A00] hover:bg-white text-black font-black text-[9px] uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Play className="w-3 h-3 fill-black" />
              <span>ENTRAR NA SALA</span>
            </button>
            <button
              onClick={() => toast.dismiss(t)}
              className="px-2.5 py-1.5 border border-[#333] hover:border-white text-[#888] hover:text-white text-[9px] uppercase cursor-pointer"
            >
              DISPENSAR
            </button>
          </div>
        </div>
      </div>
    ))
  },
}
