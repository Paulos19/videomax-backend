import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/app-shell'

import { NotificationProvider } from '@/contexts/notification-context'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session || !session.user || !session.user.id) {
    redirect('/login')
  }

  return (
    <NotificationProvider userId={session.user.id}>
      <AppShell user={session.user}>{children}</AppShell>
    </NotificationProvider>
  )
}
