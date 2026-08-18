'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react'
import { AuthScene } from '@/components/auth/auth-scene'
import { toast } from 'sonner'

type Step = 'email' | 'code'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const router = useRouter()

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const cleanEmail = email.trim()
    if (!cleanEmail) { setError('Informe seu e-mail.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) { setError('E-mail inválido.'); return }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccessMessage('Código enviado! Verifique seu e-mail.')
        setStep('code')
        toast.success('Código enviado para ' + cleanEmail)
      } else {
        setError(data.error || 'Erro ao enviar o código.')
      }
    } catch {
      setError('Falha na conexão com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    if (!code || code.length !== 6) { setError('Informe o código de 6 dígitos.'); return }
    if (!newPassword) { setError('Informe a nova senha.'); return }
    if (newPassword.length < 8) { setError('Senha: mínimo 8 caracteres.'); return }
    if (!/[A-Z]/.test(newPassword)) { setError('Senha: inclua uma maiúscula.'); return }
    if (!/[a-z]/.test(newPassword)) { setError('Senha: inclua uma minúscula.'); return }
    if (!/[0-9]/.test(newPassword)) { setError('Senha: inclua um número.'); return }
    if (newPassword !== confirmPassword) { setError('As senhas não coincidem.'); return }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          code,
          newPassword,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Senha redefinida com sucesso!')
        router.push('/login?reset=true')
      } else {
        setError(data.error || 'Erro ao redefinir a senha.')
      }
    } catch {
      setError('Falha na conexão com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-[#111111] border border-white/[0.07] text-[#F5F5F5] text-[13px] pl-10 pr-4 py-0 rounded-[10px] placeholder:text-[#666666] outline-none focus:border-[#FF5A00] focus:shadow-[0_0_0_3px_rgba(255,90,0,0.10)] transition-all h-[46px]"
  const inputClassPassword = "w-full bg-[#111111] border border-white/[0.07] text-[#F5F5F5] text-[13px] pl-10 pr-10 py-0 rounded-[10px] placeholder:text-[#666666] outline-none focus:border-[#FF5A00] focus:shadow-[0_0_0_3px_rgba(255,90,0,0.10)] transition-all h-[46px]"

  return (
    <AuthScene>
      <div className="w-full h-full p-6 sm:p-8 lg:p-10 overflow-y-auto scrollbar-none flex flex-col justify-center">
        {/* Back link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#737373] hover:text-[#FF5A00] transition-colors mb-4 w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar ao login
        </Link>

        {/* Header */}
        <div className="mb-5">
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight leading-tight">
            {step === 'email' ? 'Esqueceu sua senha?' : 'Redefinir senha'}
          </h1>
          <p className="text-[12px] text-[#8A8A8A] mt-1 leading-relaxed">
            {step === 'email'
              ? 'Informe seu e-mail para receber um código de recuperação.'
              : `Código enviado para ${email}. Digite-o abaixo com a nova senha.`
            }
          </p>
        </div>

        {/* Banners */}
        {successMessage && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
        {error && (
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-semibold flex items-center gap-2 mb-3">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 'email' ? (
          /* ─── Step 1: Email ─── */
          <form onSubmit={handleSendCode} className="space-y-3.5">
            <div className="space-y-1">
              <label htmlFor="forgot-email" className="block text-[11.5px] font-semibold text-[#A3A3A3]">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#5F5F5F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="forgot-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[46px] rounded-[10px] brand-gradient text-white text-[13.5px] font-bold shadow-[0_0_25px_rgba(255,90,0,0.18)] hover:brightness-110 hover:-translate-y-[1px] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando código...
                </>
              ) : (
                'ENVIAR CÓDIGO'
              )}
            </button>
          </form>
        ) : (
          /* ─── Step 2: Code + New Password ─── */
          <form onSubmit={handleResetPassword} className="space-y-2.5">
            {/* Code */}
            <div className="space-y-0.5">
              <label htmlFor="reset-code" className="block text-[11px] font-semibold text-[#A3A3A3]">Código de 6 dígitos</label>
              <div className="relative">
                <KeyRound className="w-3.5 h-3.5 text-[#5F5F5F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reset-code"
                  type="text"
                  required
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full bg-[#111111] border border-white/[0.07] text-[#FF5A00] text-center font-mono text-[18px] font-bold tracking-[5px] pl-10 pr-4 py-0 rounded-[9px] placeholder:text-[#666666] placeholder:tracking-[5px] placeholder:text-[18px] outline-none focus:border-[#FF5A00] focus:shadow-[0_0_0_3px_rgba(255,90,0,0.10)] transition-all h-[42px]"
                />
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-0.5">
              <label htmlFor="reset-password" className="block text-[11px] font-semibold text-[#A3A3A3]">Nova senha</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-[#5F5F5F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reset-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nova senha"
                  className="w-full bg-[#111111] border border-white/[0.07] text-[#F5F5F5] text-[12.5px] pl-10 pr-10 py-0 rounded-[9px] placeholder:text-[#666666] outline-none focus:border-[#FF5A00] focus:shadow-[0_0_0_3px_rgba(255,90,0,0.10)] transition-all h-[40px]"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar' : 'Mostrar'} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5F5F5F] hover:text-white transition-colors cursor-pointer">
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-0.5">
              <label htmlFor="reset-confirm-password" className="block text-[11px] font-semibold text-[#A3A3A3]">Confirmar nova senha</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-[#5F5F5F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme a nova senha"
                  className="w-full bg-[#111111] border border-white/[0.07] text-[#F5F5F5] text-[12.5px] pl-10 pr-10 py-0 rounded-[9px] placeholder:text-[#666666] outline-none focus:border-[#FF5A00] focus:shadow-[0_0_0_3px_rgba(255,90,0,0.10)] transition-all h-[40px]"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? 'Ocultar' : 'Mostrar'} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5F5F5F] hover:text-white transition-colors cursor-pointer">
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[42px] rounded-[9px] brand-gradient text-white text-[13px] font-bold shadow-[0_0_20px_rgba(255,90,0,0.18)] hover:brightness-110 hover:-translate-y-[1px] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Redefinindo...
                </>
              ) : (
                'REDEFINIR SENHA'
              )}
            </button>

            {/* Resend */}
            <button
              type="button"
              onClick={() => { setStep('email'); setError(''); setSuccessMessage('') }}
              className="w-full text-center text-[11px] text-[#737373] hover:text-[#FF5A00] transition-colors cursor-pointer pt-1"
            >
              Não recebeu o código? Enviar novamente
            </button>
          </form>
        )}
      </div>
    </AuthScene>
  )
}
