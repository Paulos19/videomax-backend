'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, RefreshCw, Mail, Play, Sparkles } from 'lucide-react'
import io from 'socket.io-client'
import { toast } from 'sonner'

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'https://services-videomax-websocket.khdya3.easypanel.host/'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const router = useRouter()

  const [status, setStatus] = useState<'loading' | 'success' | 'already' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [resendEmail, setResendEmail] = useState('')
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMessage('Token de verificação não encontrado no link.')
      return
    }

    let cancelled = false

    async function verify() {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = await res.json()

        if (cancelled) return

        if (res.ok) {
          if (data.alreadyVerified) {
            setStatus('already')
          } else {
            setStatus('success')
            toast.success('E-mail verificado com sucesso!')

            // Broadcast real-time event via WebSocket to sync all active user tabs/devices
            if (data.user?.id) {
              try {
                let wsToken: string | undefined
                try {
                  const tokenRes = await fetch('/api/auth/token')
                  if (tokenRes.ok) {
                    const tokenData = await tokenRes.json()
                    wsToken = tokenData.token
                  }
                } catch {}

                const socket = io(SOCKET_SERVER_URL, {
                  auth: wsToken ? { token: wsToken } : undefined,
                  transports: ['websocket', 'polling'],
                })

                socket.on('connect', () => {
                  socket.emit('email-verified', {
                    userId: data.user.id,
                    email: data.user.email,
                  })
                  setTimeout(() => socket.disconnect(), 3000)
                })
              } catch (wsErr) {
                console.warn('Socket broadcast warning:', wsErr)
              }
            }
          }
        } else {
          setStatus('error')
          setErrorMessage(data.error || 'Falha ao verificar o e-mail.')
        }
      } catch {
        if (!cancelled) {
          setStatus('error')
          setErrorMessage('Erro de conexão ao verificar o token.')
        }
      }
    }

    verify()

    return () => {
      cancelled = true
    }
  }, [token])

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resendEmail) {
      toast.error('Informe seu e-mail para reenviar o link.')
      return
    }

    setResending(true)
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || 'E-mail de ativação reenviado!')
        setResendEmail('')
      } else {
        toast.error(data.error || 'Erro ao reenviar.')
      }
    } catch {
      toast.error('Erro de conexão.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#050505] p-4 font-mono select-none">
      {/* Background radial glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255,90,0,0.08), #050505 85%)',
        }}
      />

      {/* Central Cyberpunk Verification Card */}
      <div className="relative z-10 w-full max-w-[540px] bg-[#09090D] border border-[#262635] shadow-[0_30px_90px_rgba(0,0,0,0.95),0_0_35px_rgba(255,90,0,0.12)] p-8 lg:p-10 rounded-xl text-center animate-auth-card-in">
        
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-8 h-8 bg-[#FF5A00] flex items-center justify-center shadow-[0_0_20px_rgba(255,90,0,0.5)]">
            <Play className="w-4 h-4 text-[#050505] fill-[#050505] ml-0.5" />
          </div>
          <div className="text-left">
            <span className="font-mono font-black text-lg tracking-tighter uppercase text-white leading-none">
              VIDEOMAX
            </span>
            <span className="text-[8.5px] font-mono font-bold tracking-[0.25em] text-[#FF5A00] uppercase leading-none block mt-1">
              [ PROTOCOLO DE ATIVAÇÃO ]
            </span>
          </div>
        </div>

        {/* State 1: Loading */}
        {status === 'loading' && (
          <div className="py-8 space-y-4">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-[#FF5A00] animate-spin" />
              <div className="absolute inset-0 rounded-full border border-[#FF5A00]/20 animate-ping" />
            </div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              VALIDANDO TOKEN DE ATIVAÇÃO...
            </h2>
            <p className="text-xs text-[#888] font-sans">
              Aguarde enquanto autenticamos seu e-mail no cluster VideoMax.
            </p>
          </div>
        )}

        {/* State 2: Success */}
        {(status === 'success' || status === 'already') && (
          <div className="py-4 space-y-5 animate-scale-in">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#22C55E]/10 border border-[#22C55E] flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.35)]">
              <CheckCircle2 className="w-8 h-8 text-[#22C55E]" />
            </div>

            <div>
              <span className="inline-block px-2.5 py-0.5 bg-[#0D0D14] border border-[#22C55E]/40 text-[#22C55E] text-[10px] font-bold uppercase tracking-widest mb-2">
                [ STATUS: E-MAIL VERIFICADO ]
              </span>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                {status === 'already' ? 'CONTA JÁ ESTAVA ATIVADA!' : 'E-MAIL CONFIRMADO COM SUCESSO!'}
              </h2>
              <p className="text-xs text-[#A3A3A3] mt-2 font-sans leading-relaxed">
                Todas as permissões de criação de salas de cinema sincronizadas e convites de amizade foram liberadas.
              </p>
            </div>

            <div className="pt-3">
              <Link
                href="/dashboard"
                className="w-full h-12 bg-gradient-to-r from-[#EF2020] via-[#FF5A00] to-[#FFB800] text-black font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(255,90,0,0.35)] hover:shadow-[0_0_35px_rgba(255,90,0,0.6)] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>ACESSAR O DASHBOARD</span>
                <ArrowRight className="w-4 h-4 text-black stroke-[3]" />
              </Link>
            </div>
          </div>
        )}

        {/* State 3: Error */}
        {status === 'error' && (
          <div className="py-4 space-y-5 animate-scale-in">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#EF2020]/10 border border-[#EF2020] flex items-center justify-center shadow-[0_0_30px_rgba(239,32,32,0.35)]">
              <AlertCircle className="w-8 h-8 text-[#EF2020]" />
            </div>

            <div>
              <span className="inline-block px-2.5 py-0.5 bg-[#0D0D14] border border-[#EF2020]/40 text-[#EF2020] text-[10px] font-bold uppercase tracking-widest mb-2">
                [ FALHA DE ATIVAÇÃO ]
              </span>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">
                NÃO FOI POSSÍVEL VERIFICAR
              </h2>
              <p className="text-xs text-[#EF2020] mt-1 font-sans">
                {errorMessage}
              </p>
            </div>

            {/* Resend Box */}
            <div className="border-t border-[#1F1F28] pt-4 text-left">
              <span className="text-[10px] font-bold text-[#888] uppercase block mb-2">
                Solicitar novo link de ativação:
              </span>
              <form onSubmit={handleResend} className="space-y-2">
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full bg-[#121218] border border-[#262635] text-white text-xs pl-9 pr-3 py-2.5 outline-none focus:border-[#FF5A00]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resending}
                  className="w-full h-10 bg-[#FF5A00] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {resending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  <span>REENVIAR E-MAIL DE ATIVAÇÃO</span>
                </button>
              </form>
            </div>

            <div className="pt-2">
              <Link
                href="/login"
                className="text-xs text-[#777] hover:text-[#FF5A00] transition-colors uppercase font-bold"
              >
                ← Voltar ao login
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#FF5A00] font-mono text-sm">
          CARREGANDO...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
