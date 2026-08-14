'use client'

import { useNotifications, Notification } from '@/contexts/notification-context'
import { Bell, Check, Trash2, Mail, Users, Tv, RefreshCcw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function InvitesPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, refresh } = useNotifications()
  const router = useRouter()

  const handleAction = async (notif: Notification) => {
    if (!notif.read) {
      await markAsRead(notif.id)
    }

    if (notif.type === 'ROOM_INVITE' && notif.data) {
      try {
        const parsed = JSON.parse(notif.data)
        if (parsed.roomId) {
          router.push(`/room/${parsed.roomId}`)
        }
      } catch { }
    } else if (notif.type === 'FRIEND_REQUEST') {
      router.push('/dashboard/friends')
    }
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'ROOM_INVITE': return <Tv className="w-5 h-5 text-[#FF5A00]" />
      case 'FRIEND_REQUEST': return <Users className="w-5 h-5 text-emerald-500" />
      default: return <Bell className="w-5 h-5 text-blue-500" />
    }
  }

  const getActionText = (type: Notification['type']) => {
    switch (type) {
      case 'ROOM_INVITE': return 'Entrar na Sala'
      case 'FRIEND_REQUEST': return 'Ver Pedidos'
      default: return 'Visualizar'
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#050505] border border-[#242424] p-6 sm:p-8 shrink-0">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#FF5A00]/5 blur-[120px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#FF5A00]/5 blur-[100px] rounded-full pointer-events-none -translate-x-1/2 translate-y-1/2" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F5] flex items-center gap-3">
              <Mail className="w-8 h-8 text-[#FF5A00]" />
              Convites e Notificações
            </h1>
            <p className="text-[#8A8A8A] text-sm max-w-lg">
              Veja todos os convites para salas, pedidos de amizade e avisos do sistema em tempo real.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refresh()}
              className="px-4 py-2 bg-[#151515] hover:bg-[#242424] border border-[#242424] text-[#F5F5F5] rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Atualizar
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-[#FF5A00]/10 hover:bg-[#FF5A00]/20 text-[#FF5A00] rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Marcar todas lidas
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-[#050505] border border-[#242424] rounded-2xl overflow-hidden min-h-[400px]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <div className="w-16 h-16 bg-[#151515] rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-[#8A8A8A]/50" />
            </div>
            <h3 className="text-lg font-medium text-[#F5F5F5] mb-1">Nenhuma notificação</h3>
            <p className="text-[#8A8A8A] text-sm">Você está em dia! Todos os convites e avisos aparecerão aqui.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#242424]">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  "flex flex-col sm:flex-row gap-4 p-5 sm:p-6 transition-all hover:bg-[#111111]",
                  !notif.read && "bg-[#151515]"
                )}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border",
                    !notif.read
                      ? "bg-[#1A1A1A] border-[#FF5A00]/30 shadow-[0_0_15px_rgba(255,90,0,0.1)]"
                      : "bg-[#0B0B0B] border-[#242424]"
                  )}>
                    {getIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-[#FF5A00] shrink-0" />
                      )}
                      <h4 className={cn(
                        "text-base font-semibold truncate",
                        !notif.read ? "text-[#F5F5F5]" : "text-[#8A8A8A]"
                      )}>
                        {notif.title}
                      </h4>
                    </div>
                    <p className={cn(
                      "text-sm line-clamp-2",
                      !notif.read ? "text-[#A1A1A1]" : "text-[#5F5F5F]"
                    )}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-[#4F4F4F] font-medium pt-1">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center sm:flex-col justify-end gap-2 shrink-0">
                  <button
                    onClick={() => handleAction(notif)}
                    className={cn(
                      "flex-1 sm:flex-none px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center",
                      !notif.read && notif.type === 'ROOM_INVITE'
                        ? "brand-gradient text-white brand-glow-strong hover:brightness-110 active:scale-[0.98]"
                        : "bg-[#151515] border border-[#242424] text-[#8A8A8A] hover:text-[#F5F5F5] hover:bg-[#242424]"
                    )}
                  >
                    {getActionText(notif.type)}
                  </button>
                  <button
                    onClick={() => removeNotification(notif.id)}
                    className="p-2.5 rounded-xl bg-transparent border border-transparent text-[#5F5F5F] hover:text-[#EF2020] hover:bg-[#EF2020]/10 transition-colors"
                    title="Excluir notificação"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
