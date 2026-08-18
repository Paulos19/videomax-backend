'use client'

import { AuthScene } from '@/components/auth/auth-scene'
import { AuthCard } from '@/components/auth/auth-card'

export default function RegisterPage() {
  return (
    <AuthScene>
      <AuthCard defaultTab="register" />
    </AuthScene>
  )
}
