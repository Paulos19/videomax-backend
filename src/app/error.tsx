'use client'

import { useEffect, useState } from 'react'
import { Loader2, RefreshCw, AlertTriangle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [retrying, setRetrying] = useState(true)

  useEffect(() => {
    console.warn('[GlobalError] Erro interceptado:', error)

    if (typeof window === 'undefined') return

    const attempts = parseInt(sessionStorage.getItem('global_retry_attempts') || '0', 10)

    if (attempts < 2) {
      sessionStorage.setItem('global_retry_attempts', String(attempts + 1))
      const timer = setTimeout(() => {
        window.location.reload()
      }, 600)
      return () => clearTimeout(timer)
    } else {
      sessionStorage.removeItem('global_retry_attempts')
      setRetrying(false)
    }
  }, [error, reset])

  const handleManualReload = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('global_retry_attempts')
      window.location.reload()
    } else {
      reset()
    }
  }

  return (
    <div className="h-screen w-screen bg-[#050508] flex flex-col items-center justify-center p-4 font-mono select-none">
      <div className="max-w-md w-full bg-[#0A0A0F] border-2 border-[#FF5A00]/60 p-6 text-center space-y-5 shadow-[0_0_40px_rgba(255,90,0,0.25)]">
        <div className="w-12 h-12 bg-[#FF5A00] text-black flex items-center justify-center mx-auto shadow-lg">
          {retrying ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <AlertTriangle className="w-6 h-6" />
          )}
        </div>

        <div className="space-y-1.5">
          <h2 className="text-sm font-black text-white uppercase tracking-widest">
            {retrying ? 'RECONECTANDO SISTEMA...' : 'FALHA DE INICIALIZAÇÃO'}
          </h2>
          <p className="text-xs text-[#888] leading-relaxed">
            {retrying
              ? 'Sincronizando estado da aplicação em segundo plano...'
              : 'Ocorreu uma instabilidade temporária. Clique para recarregar.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            onClick={handleManualReload}
            className="flex-1 py-3 bg-[#FF5A00] hover:bg-white text-black font-black text-xs uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>RECARREGAR</span>
          </button>

          <Link
            href="/dashboard"
            className="py-3 px-4 bg-[#121218] hover:bg-[#1C1C24] text-[#888] hover:text-white font-bold text-xs uppercase transition-colors border border-[#333] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>DASHBOARD</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
