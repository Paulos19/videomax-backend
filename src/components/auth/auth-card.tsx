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
      {/* ─── Tabs ─── */}
      <div className="flex items-center gap-7 mb-5">
        <button
          onClick={() => setActiveTab('login')}
          className={`relative text-[12.5px] font-bold tracking-wide pb-1.5 transition-colors cursor-pointer ${
            activeTab === 'login'
              ? 'text-[#FF5A00]'
              : 'text-[#5F5F5F] hover:text-[#A3A3A3]'
          }`}
        >
          ENTRAR
          {activeTab === 'login' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF5A00] rounded-full shadow-[0_0_8px_rgba(255,90,0,0.4)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('register')}
          className={`relative text-[12.5px] font-bold tracking-wide pb-1.5 transition-colors cursor-pointer ${
            activeTab === 'register'
              ? 'text-[#FF5A00]'
              : 'text-[#5F5F5F] hover:text-[#A3A3A3]'
          }`}
        >
          CRIAR CONTA
          {activeTab === 'register' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF5A00] rounded-full shadow-[0_0_8px_rgba(255,90,0,0.4)]" />
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
      <div className="relative flex items-center justify-center mt-6 mb-4">
        <div className="border-t border-white/[0.04] w-full" />
        <span className="bg-[#0B0B0B] px-3 text-[10px] text-[#5F5F5F] font-medium absolute">
          ou
        </span>
      </div>

      {/* ─── Alternate prompt ─── */}
      <p className="text-center text-[12px] text-[#5F5F5F]">
        {activeTab === 'login' ? (
          <>
            Não possui uma conta?{' '}
            <Link
              href="/register"
              onClick={(e) => { e.preventDefault(); setActiveTab('register') }}
              className="text-[#FF5A00] hover:text-[#FFB800] font-bold transition-colors ml-1"
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
              className="text-[#FF5A00] hover:text-[#FFB800] font-bold transition-colors ml-1"
            >
              Entrar →
            </Link>
          </>
        )}
      </p>
    </div>
  )
}
