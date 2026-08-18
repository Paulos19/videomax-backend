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
          <label htmlFor="login-email" className="block text-[12px] font-semibold text-[#A3A3A3]">
            Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#5F5F5F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-[#111111] border border-white/[0.07] text-[#F5F5F5] text-[13px] pl-11 pr-4 py-0 rounded-[11px] placeholder:text-[#666666] outline-none focus:border-[#FF5A00] focus:shadow-[0_0_0_3px_rgba(255,90,0,0.10)] transition-all h-[54px]"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="login-password" className="block text-[12px] font-semibold text-[#A3A3A3]">
            Senha
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#5F5F5F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#111111] border border-white/[0.07] text-[#F5F5F5] text-[13px] pl-11 pr-11 py-0 rounded-[11px] placeholder:text-[#666666] outline-none focus:border-[#FF5A00] focus:shadow-[0_0_0_3px_rgba(255,90,0,0.10)] transition-all h-[54px]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5F5F5F] hover:text-white transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Forgot password */}
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-[12px] font-semibold text-[#FF5A00] hover:text-[#FFB800] transition-colors"
          >
            Esqueceu sua senha?
          </Link>
        </div>

        {/* CTA */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-[54px] rounded-[11px] brand-gradient text-white text-[14px] font-bold shadow-[0_0_30px_rgba(255,90,0,0.18)] hover:brightness-110 hover:-translate-y-[1px] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Entrando...
            </>
          ) : (
            <>
              ENTRAR NA SALA
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
