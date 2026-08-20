'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useNotifications } from '@/contexts/notification-context'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import io from 'socket.io-client'

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'https://services-videomax-websocket.khdya3.easypanel.host/'

export function UnverifiedEmailBanner() {
  const { data: session, status } = useSession()
  const notifCtx = useNotifications()
  const [localVerified, setLocalVerified] = useState<boolean | null>(null)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetch('/api/user/me')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) {
            setLocalVerified(Boolean(data.user.emailVerified))
          }
        })
        .catch(() => {})
    }
  }, [status, session])

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) return

    let socket: any
    try {
      socket = io(SOCKET_SERVER_URL, {
        transports: ['websocket', 'polling'],
      })
      socket.on('email-verified', (data: any) => {
        const currentUserId = (session.user as any)?.id
        if (!data || !data.userId || data.userId === currentUserId) {
          setLocalVerified(true)
          notifCtx.setEmailVerified(true)
        }
      })
    } catch {}

    return () => {
      if (socket) socket.disconnect()
    }
  }, [status, session, notifCtx])

  // If unauthenticated, loading, or verified, hide banner
  const isVerified = (localVerified === true) || (notifCtx.emailVerified && localVerified === null)

  if (status !== 'authenticated' || !session?.user || isVerified) {
    return null
  }

  const handleResend = async () => {
    if (!session?.user?.email || cooldown > 0 || resending) return

    setResending(true)
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message || 'E-mail de ativação reenviado!')
        setCooldown(60)
        const timer = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        toast.error(data.error || 'Erro ao reenviar e-mail de ativação.')
      }
    } catch {
      toast.error('Erro de conexão ao solicitar reenvio.')
    } finally {
      setResending(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full bg-[#120C06] border-b border-[#FF5A00]/40 text-white font-mono select-none overflow-hidden relative z-[998]"
      >
        <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
          {/* Warning notice */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#FF5A00] animate-ping shrink-0" />
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-1.5 py-0.2 bg-[#FF5A00]/20 border border-[#FF5A00]/60 text-[#FF5A00] font-black text-[9px] uppercase tracking-wider">
                [ ATENÇÃO: E-MAIL NÃO VERIFICADO ]
              </span>
              <span className="text-[#D4D4D4] text-[11px] font-sans">
                Confirme seu endereço <strong className="text-white font-mono">{session.user.email}</strong> para liberar a criação de salas e convites de amizade.
              </span>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="shrink-0 px-3 py-1 bg-[#FF5A00] hover:bg-white text-black font-mono font-black text-[10px] uppercase tracking-wider transition-all duration-150 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer active:scale-95 shadow-[0_0_12px_rgba(255,90,0,0.3)]"
          >
            {resending ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>ENVIANDO...</span>
              </>
            ) : cooldown > 0 ? (
              <span>AGUARDE ({cooldown}s)</span>
            ) : (
              <>
                <Send className="w-3 h-3" />
                <span>REENVIAR E-MAIL</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
