'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export function RegisterForm() {
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const cleanNick = nickname.trim()
    const cleanEmail = email.trim()
    const cleanConfirmEmail = confirmEmail.trim()

    if (!cleanNick) { setError('Informe seu nickname.'); return }
    if (cleanNick.length < 3) { setError('Nickname: mínimo 3 caracteres.'); return }
    if (!cleanEmail) { setError('Informe seu e-mail.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) { setError('E-mail inválido.'); return }
    if (cleanConfirmEmail && cleanEmail.toLowerCase() !== cleanConfirmEmail.toLowerCase()) { setError('Os e-mails não coincidem.'); return }
    if (!password) { setError('Crie uma senha.'); return }
    if (password.length < 8) { setError('Senha: mínimo 8 caracteres.'); return }
    if (!/[A-Z]/.test(password)) { setError('Senha: inclua uma letra maiúscula.'); return }
    if (!/[a-z]/.test(password)) { setError('Senha: inclua uma letra minúscula.'); return }
    if (!/[0-9]/.test(password)) { setError('Senha: inclua um número.'); return }
    if (password !== confirmPassword) { setError('As senhas não coincidem.'); return }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanNick, email: cleanEmail, password }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Conta criada com sucesso!')
        router.push('/login?registered=true')
      } else {
        setError(data.error || 'Erro ao criar a conta.')
        toast.error(data.error || 'Não foi possível cadastrar.')
      }
    } catch {
      setError('Falha na conexão com o servidor.')
      toast.error('Erro de conexão.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-[#111111] border border-white/[0.07] text-[#F5F5F5] text-[12.5px] pl-10 pr-4 py-0 rounded-[9px] placeholder:text-[#666666] outline-none focus:border-[#FF5A00] focus:shadow-[0_0_0_3px_rgba(255,90,0,0.10)] transition-all h-[40px]"
  const inputClassPassword = "w-full bg-[#111111] border border-white/[0.07] text-[#F5F5F5] text-[12.5px] pl-10 pr-10 py-0 rounded-[9px] placeholder:text-[#666666] outline-none focus:border-[#FF5A00] focus:shadow-[0_0_0_3px_rgba(255,90,0,0.10)] transition-all h-[40px]"

  return (
    <div className="space-y-2.5">
      {error && (
        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[10.5px] font-semibold flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-2">
        {/* Nickname */}
        <div className="space-y-0.5">
          <label htmlFor="reg-nickname" className="block text-[11px] font-semibold text-[#A3A3A3]">Nickname</label>
          <div className="relative">
            <User className="w-3.5 h-3.5 text-[#5F5F5F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input id="reg-nickname" type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Seu nickname" className={inputClass} />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-0.5">
          <label htmlFor="reg-email" className="block text-[11px] font-semibold text-[#A3A3A3]">Email</label>
          <div className="relative">
            <Mail className="w-3.5 h-3.5 text-[#5F5F5F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input id="reg-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className={inputClass} />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-0.5">
          <label htmlFor="reg-password" className="block text-[11px] font-semibold text-[#A3A3A3]">Senha</label>
          <div className="relative">
            <Lock className="w-3.5 h-3.5 text-[#5F5F5F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input id="reg-password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Crie uma senha" className={inputClassPassword} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5F5F5F] hover:text-white transition-colors cursor-pointer">
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-0.5">
          <label htmlFor="reg-confirm-password" className="block text-[11px] font-semibold text-[#A3A3A3]">Confirmar Senha</label>
          <div className="relative">
            <Lock className="w-3.5 h-3.5 text-[#5F5F5F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input id="reg-confirm-password" type={showConfirmPassword ? 'text' : 'password'} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirme sua senha" className={inputClassPassword} />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5F5F5F] hover:text-white transition-colors cursor-pointer">
              {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* CTA */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-[42px] rounded-[9px] brand-gradient text-white text-[13px] font-bold shadow-[0_0_20px_rgba(255,90,0,0.18)] hover:brightness-110 hover:-translate-y-[1px] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Criando conta...
            </>
          ) : (
            'CRIAR CONTA'
          )}
        </button>
      </form>
    </div>
  )
}
