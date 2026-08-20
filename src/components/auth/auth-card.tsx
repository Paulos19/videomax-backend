'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LoginForm } from './login-form'
import { RegisterForm } from './register-form'

interface AuthCardProps {
  defaultTab?: 'login' | 'register'
  registered?: boolean
  passwordReset?: boolean
}

export function AuthCard({ defaultTab = 'login', registered, passwordReset }: AuthCardProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab)

  return (
    <div className="w-full h-full p-6 sm:p-8 lg:p-10 overflow-y-auto scrollbar-none flex flex-col justify-center">
      {/* ─── Cyberpunk Tabs ─── */}
      <div className="flex items-center gap-6 mb-6 font-mono border-b border-[#1F1F28] pb-2">
        <button
          onClick={() => setActiveTab('login')}
          className={`relative text-[12px] font-black uppercase tracking-wider pb-1.5 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'login'
              ? 'text-[#FF5A00]'
              : 'text-[#666] hover:text-white'
          }`}
        >
          <span>[ ENTRAR ]</span>
          {activeTab === 'login' && (
            <span className="absolute -bottom-[9px] left-0 right-0 h-[2px] bg-[#FF5A00] shadow-[0_0_10px_rgba(255,90,0,0.8)]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('register')}
          className={`relative text-[12px] font-black uppercase tracking-wider pb-1.5 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'register'
              ? 'text-[#FF5A00]'
              : 'text-[#666] hover:text-white'
          }`}
        >
          <span>[ CRIAR CONTA ]</span>
          {activeTab === 'register' && (
            <span className="absolute -bottom-[9px] left-0 right-0 h-[2px] bg-[#FF5A00] shadow-[0_0_10px_rgba(255,90,0,0.8)]" />
          )}
        </button>
      </div>

      {/* ─── Form ─── */}
      {activeTab === 'login' ? (
        <LoginForm registered={registered} passwordReset={passwordReset} />
      ) : (
        <RegisterForm />
      )}

      {/* ─── Divider ─── */}
      <div className="relative flex items-center justify-center mt-6 mb-3">
        <div className="border-t border-[#1F1F28] w-full" />
        <span className="bg-[#08080C] px-3 text-[10px] font-mono text-[#555] uppercase absolute">
          ou
        </span>
      </div>

      {/* ─── Alternate prompt ─── */}
      <p className="text-center text-[11px] font-mono text-[#777]">
        {activeTab === 'login' ? (
          <>
            Não possui uma conta?{' '}
            <Link
              href="/register"
              onClick={(e) => { e.preventDefault(); setActiveTab('register') }}
              className="text-[#FF5A00] hover:text-white font-bold transition-colors ml-1 uppercase"
            >
              Criar conta →
            </Link>
          </>
        ) : (
          <>
            Já tem uma conta?{' '}
            <Link
              href="/login"
              onClick={(e) => { e.preventDefault(); setActiveTab('login') }}
              className="text-[#FF5A00] hover:text-white font-bold transition-colors ml-1 uppercase"
            >
              Entrar →
            </Link>
          </>
        )}
      </p>
    </div>
  )
}
