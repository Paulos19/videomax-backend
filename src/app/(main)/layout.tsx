import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/app-shell'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return <AppShell user={session.user}>{children}</AppShell>
}
