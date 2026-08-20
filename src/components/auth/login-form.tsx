'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

interface LoginFormProps {
  registered?: boolean
  passwordReset?: boolean
}

export function LoginForm({ registered, passwordReset }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: email.trim(),
        password,
      })

      if (res?.error) {
        setError('E-mail ou senha incorretos.')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch {
      setError('Falha ao conectar com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Success banners */}
      {registered && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>Cadastro realizado! Faça login para começar.</span>
        </div>
      )}
      {passwordReset && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>Senha redefinida com sucesso!</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-semibold flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="block text-[11px] font-mono font-bold uppercase text-[#A3A3A3] tracking-wider">
            [ EMAIL ]
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#666] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-[#121218] border border-[#262635] text-white text-[13px] font-mono pl-11 pr-4 rounded-none placeholder:text-[#555] outline-none focus:border-[#FF5A00] focus:shadow-[0_0_15px_rgba(255,90,0,0.2)] transition-all h-[48px]"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="login-password" className="block text-[11px] font-mono font-bold uppercase text-[#A3A3A3] tracking-wider">
            [ SENHA ]
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#666] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#121218] border border-[#262635] text-white text-[13px] font-mono pl-11 pr-11 rounded-none placeholder:text-[#555] outline-none focus:border-[#FF5A00] focus:shadow-[0_0_15px_rgba(255,90,0,0.2)] transition-all h-[48px]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#666] hover:text-white transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Forgot password */}
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-[11px] font-mono font-bold text-[#888] hover:text-[#FF5A00] transition-colors uppercase tracking-wider"
          >
            Esqueceu sua senha?
          </Link>
        </div>

        {/* CTA */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-[50px] bg-gradient-to-r from-[#EF2020] via-[#FF5A00] to-[#FFB800] text-black font-mono font-black text-[13px] uppercase tracking-wider shadow-[0_0_25px_rgba(255,90,0,0.35)] hover:shadow-[0_0_35px_rgba(255,90,0,0.6)] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer rounded-none"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <span>CONECTANDO...</span>
            </>
          ) : (
            <>
              <span>ENTRAR NA SALA</span>
              <ArrowRight className="w-4 h-4 text-black stroke-[3]" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
