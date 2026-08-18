'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AuthScene } from '@/components/auth/auth-scene'
import { AuthCard } from '@/components/auth/auth-card'

function LoginPageContent() {
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered') === 'true'
  const passwordReset = searchParams.get('reset') === 'true'

  return (
    <AuthScene>
      <AuthCard
        defaultTab="login"
        registered={registered}
        passwordReset={passwordReset}
      />
    </AuthScene>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-[#050505]" />}>
      <LoginPageContent />
    </Suspense>
  )
}
