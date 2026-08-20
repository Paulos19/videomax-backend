'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Mail,
  Smartphone,
  Monitor,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  ArrowLeft,
  Sparkles,
  Shield,
  KeyRound,
  Radio,
  Crown,
} from 'lucide-react'
import { renderEmailTemplatePreview } from '@/lib/email'
import { toast } from 'sonner'

type TemplateKey = 'verification' | 'welcome' | 'reset' | 'invite' | 'pro' | 'password_changed'

const TEMPLATES: Array<{
  id: TemplateKey
  title: string
  subtitle: string
  icon: any
  badge: string
  color: string
}> = [
  {
    id: 'verification',
    title: 'Verificar E-mail',
    subtitle: 'Link de ativação 24 horas',
    icon: Sparkles,
    badge: 'VERIFICAÇÃO',
    color: '#FF5A00',
  },
  {
    id: 'welcome',
    title: 'Boas-Vindas',
    subtitle: 'Conta criada & ativação',
    icon: Sparkles,
    badge: 'ONBOARDING',
    color: '#FF5A00',
  },
  {
    id: 'reset',
    title: 'Redefinir Senha',
    subtitle: 'Token de segurança 6 dígitos',
    icon: KeyRound,
    badge: 'AUTH',
    color: '#EF2020',
  },
  {
    id: 'invite',
    title: 'Convite de Sala',
    subtitle: 'Transmissão ao vivo 0ms',
    icon: Radio,
    badge: 'ROOMS',
    color: '#FF5A00',
  },
  {
    id: 'pro',
    title: 'MAXPRO VIP',
    subtitle: 'Upgrade de plano & recursos',
    icon: Crown,
    badge: 'VIP PRO',
    color: '#FFE600',
  },
  {
    id: 'password_changed',
    title: 'Senha Alterada',
    subtitle: 'Alerta de segurança',
    icon: Shield,
    badge: 'SECURITY',
    color: '#22C55E',
  },
]

export default function EmailPreviewPage() {
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey>('welcome')
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [testEmail, setTestEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState(false)

  const currentHtml = renderEmailTemplatePreview(activeTemplate)

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
      toast.error('Informe um e-mail válido para o teste.')
      return
    }

    setSending(true)
    try {
      const res = await fetch('/api/dev/send-test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, type: activeTemplate }),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success(`E-mail de teste (${activeTemplate}) enviado com sucesso!`)
      } else {
        toast.error(data.error || 'Erro ao enviar e-mail de teste.')
      }
    } catch {
      toast.error('Falha de conexão com o servidor.')
    } finally {
      setSending(false)
    }
  }

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(currentHtml)
    setCopied(true)
    toast.success('Código HTML do e-mail copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans">
      {/* Top Cyberpunk Navigation */}
      <header className="h-16 border-b border-[#1F1F28] bg-[#09090D] px-4 lg:px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#888] hover:text-[#FF5A00] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>[ VOLTAR AO DASHBOARD ]</span>
          </Link>
          <div className="h-4 w-px bg-[#222]" />
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#FF5A00]" />
            <span className="font-mono font-black text-[13px] uppercase tracking-wider text-white">
              VIDEOMAX EMAIL ENGINE // PREVIEW
            </span>
          </div>
        </div>

        {/* Viewport device switcher */}
        <div className="flex items-center gap-2 bg-[#0D0D14] border border-[#262635] p-1">
          <button
            onClick={() => setViewMode('desktop')}
            className={`px-3 py-1 text-[11px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              viewMode === 'desktop'
                ? 'bg-[#FF5A00] text-black shadow-[0_0_10px_rgba(255,90,0,0.5)]'
                : 'text-[#888] hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>DESKTOP (580px)</span>
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={`px-3 py-1 text-[11px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              viewMode === 'mobile'
                ? 'bg-[#FF5A00] text-black shadow-[0_0_10px_rgba(255,90,0,0.5)]'
                : 'text-[#888] hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>MOBILE (360px)</span>
          </button>
        </div>
      </header>

      {/* Main Container: Sidebar + Preview Viewport */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar: Template Selection & Test Sender */}
        <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-[#1F1F28] bg-[#08080C] p-4 lg:p-6 flex flex-col gap-6 overflow-y-auto shrink-0">
          <div>
            <span className="text-[9px] font-mono font-bold text-[#666] uppercase tracking-widest block mb-3">
              TEMPLATES DISPONÍVEIS ({TEMPLATES.length})
            </span>
            <div className="space-y-2">
              {TEMPLATES.map((tmpl) => {
                const Icon = tmpl.icon
                const isActive = activeTemplate === tmpl.id
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => setActiveTemplate(tmpl.id)}
                    className={`w-full text-left p-3 border transition-all cursor-pointer flex items-center justify-between group ${
                      isActive
                        ? 'bg-[#121218] border-[#FF5A00] shadow-[0_0_15px_rgba(255,90,0,0.15)]'
                        : 'bg-[#09090D] border-[#1F1F28] hover:border-[#333]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 flex items-center justify-center border"
                        style={{
                          backgroundColor: isActive ? `${tmpl.color}15` : '#0D0D14',
                          borderColor: isActive ? tmpl.color : '#262635',
                          color: tmpl.color,
                        }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-mono font-bold text-[12px] text-white block uppercase">
                          {tmpl.title}
                        </span>
                        <span className="text-[10px] text-[#777] block">
                          {tmpl.subtitle}
                        </span>
                      </div>
                    </div>
                    <span
                      className="text-[8px] font-mono font-bold px-1.5 py-0.5 border uppercase"
                      style={{
                        color: tmpl.color,
                        borderColor: `${tmpl.color}40`,
                        backgroundColor: `${tmpl.color}10`,
                      }}
                    >
                      {tmpl.badge}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Send Live Test Email */}
          <div className="border-t border-[#1F1F28] pt-5">
            <span className="text-[9px] font-mono font-bold text-[#666] uppercase tracking-widest block mb-2.5">
              DISPARAR TESTE REAL
            </span>
            <form onSubmit={handleSendTest} className="space-y-2.5">
              <input
                type="email"
                required
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full bg-[#121218] border border-[#262635] text-white text-[11px] font-mono p-2.5 outline-none focus:border-[#FF5A00]"
              />
              <button
                type="submit"
                disabled={sending}
                className="w-full h-9 bg-gradient-to-r from-[#EF2020] to-[#FF5A00] text-black font-mono font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>ENVIANDO...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>ENVIAR TESTE</span>
                  </>
                )}
              </button>
            </form>

            <button
              onClick={handleCopyHtml}
              className="w-full mt-2 h-8 bg-[#0D0D14] border border-[#262635] hover:border-[#FF5A00] text-[#A3A3A3] hover:text-white font-mono text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'HTML COPIADO!' : 'COPIAR CÓDIGO HTML'}</span>
            </button>
          </div>
        </aside>

        {/* Right Area: Interactive Email Preview Frame */}
        <main className="flex-1 bg-[#050505] p-4 lg:p-8 flex flex-col items-center justify-center overflow-auto">
          <div
            className="transition-all duration-300 shadow-[0_40px_100px_rgba(0,0,0,0.95)] border border-[#262635] rounded-xl overflow-hidden bg-[#09090D]"
            style={{
              width: viewMode === 'desktop' ? '580px' : '360px',
              maxWidth: '100%',
              height: '82vh',
            }}
          >
            {/* Window bar */}
            <div className="h-7 bg-[#0E0E14] border-b border-[#1F1F28] px-3 flex items-center justify-between text-[9px] font-mono text-[#666]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#EF2020]/60" />
                <span className="w-2 h-2 rounded-full bg-[#FFB800]/60" />
                <span className="w-2 h-2 rounded-full bg-[#22C55E]/60" />
              </div>
              <span className="uppercase text-[#888]">
                CLIENT_PREVIEW: {activeTemplate.toUpperCase()}
              </span>
              <span>{viewMode === 'desktop' ? '580px' : '360px'}</span>
            </div>

            {/* IFrame Render */}
            <iframe
              srcDoc={currentHtml}
              title="Email Template Preview"
              className="w-full h-[calc(100%-28px)] border-0 bg-[#050505]"
              sandbox="allow-same-origin"
            />
          </div>
        </main>
      </div>
    </div>
  )
}
