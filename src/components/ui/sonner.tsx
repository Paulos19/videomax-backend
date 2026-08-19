'use client'

import { useState, useEffect } from 'react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'
import {
  CheckCircle2,
  Info,
  AlertTriangle,
  AlertOctagon,
  Loader2,
  Crown,
  Zap,
  Radio,
} from 'lucide-react'

export const Toaster = ({ ...props }: ToasterProps) => {
  const [isPro, setIsPro] = useState(false)

  useEffect(() => {
    let isMounted = true
    fetch('/api/user/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.user) {
          const plan = (data.user.plan || '').toUpperCase()
          setIsPro(plan === 'PRO' || plan === 'MAXPRO')
        }
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <Sonner
      theme="dark"
      className={isPro ? 'toaster-pro group' : 'toaster-free group'}
      richColors={false}
      closeButton
      position="top-right"
      icons={{
        success: isPro ? (
          <Crown className="w-4 h-4 text-[#FFE600] fill-[#FFE600] shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
        ),
        info: isPro ? (
          <Zap className="w-4 h-4 text-[#FFE600] fill-[#FFE600] shrink-0" />
        ) : (
          <Radio className="w-4 h-4 text-[#FF5A00] animate-pulse shrink-0" />
        ),
        warning: <AlertTriangle className="w-4 h-4 text-[#FFE600] shrink-0" />,
        error: <AlertOctagon className="w-4 h-4 text-[#EF2020] shrink-0" />,
        loading: <Loader2 className="w-4 h-4 animate-spin text-[#FF5A00] shrink-0" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: isPro
            ? 'w-full max-w-sm flex items-start gap-3 p-4 bg-[#0A0A0F] border-2 border-[#FFE600] shadow-[0_0_25px_rgba(255,230,0,0.35)] font-mono text-[11px] text-white rounded-none select-none relative overflow-hidden backdrop-blur-md'
            : 'w-full max-w-sm flex items-start gap-3 p-4 bg-[#09090D] border-2 border-[#FF5A00] shadow-[0_0_20px_rgba(255,90,0,0.3)] font-mono text-[11px] text-white rounded-none select-none relative overflow-hidden backdrop-blur-md',
          title: 'font-bold uppercase tracking-wider text-white text-[12px] block',
          description: 'text-[#BBB] text-[10px] leading-relaxed mt-1 block font-mono',
          actionButton: isPro
            ? 'px-3 py-1.5 bg-[#FFE600] hover:bg-white text-black font-black text-[9px] uppercase tracking-wider transition-colors cursor-pointer'
            : 'px-3 py-1.5 bg-[#FF5A00] hover:bg-white text-black font-black text-[9px] uppercase tracking-wider transition-colors cursor-pointer',
          cancelButton:
            'px-3 py-1.5 border border-[#333] hover:border-white text-[#888] hover:text-white font-bold text-[9px] uppercase transition-colors cursor-pointer',
          closeButton:
            'bg-[#121218] border border-[#333] hover:border-white text-[#888] hover:text-white p-1 transition-colors cursor-pointer rounded-none',
        },
      }}
      {...props}
    />
  )
}
