'use client'

import { useState, useMemo, useEffect } from 'react'
import { useNotifications, Notification } from '@/contexts/notification-context'
import {
  Bell,
  Check,
  Trash2,
  Mail,
  Users,
  Tv,
  RefreshCcw,
  Play,
  CheckCheck,
  Shield,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { InvitesBeacon3DView } from '@/components/dashboard/invites-beacon-3d'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'

export default function InvitesPage() {
  const { data: session } = useSession()
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    refresh,
  } = useNotifications()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'all' | 'rooms' | 'friends' | 'system'>('all')
  const [liveUser, setLiveUser] = useState<any>(null)

  useEffect(() => {
    fetch('/api/user/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setLiveUser(data.user)
      })
      .catch(() => {})
  }, [])

  const user = liveUser || session?.user
  const userPlan = (user?.plan || 'FREE').toUpperCase()
  const isPro = userPlan === 'PRO' || userPlan === 'MAXPRO'

  const handleAction = async (notif: Notification) => {
    if (!notif.read) {
      await markAsRead(notif.id)
    }

    if (notif.type === 'ROOM_INVITE' && notif.data) {
      try {
        const parsed = JSON.parse(notif.data)
        const targetRoom = parsed.roomId || parsed.roomCode
        if (targetRoom) {
          router.push(`/room/${targetRoom}`)
        }
      } catch {}
    } else if (notif.type === 'FRIEND_REQUEST') {
      router.push('/dashboard/friends')
    }
  }

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'rooms') {
      return notifications.filter((n) => n.type === 'ROOM_INVITE')
    }
    if (activeTab === 'friends') {
      return notifications.filter((n) => n.type === 'FRIEND_REQUEST')
    }
    if (activeTab === 'system') {
      return notifications.filter((n) => n.type === 'SYSTEM')
    }
    return notifications
  }, [notifications, activeTab])

  const countsByTab = useMemo(() => {
    return {
      all: notifications.length,
      rooms: notifications.filter((n) => n.type === 'ROOM_INVITE').length,
      friends: notifications.filter((n) => n.type === 'FRIEND_REQUEST').length,
      system: notifications.filter((n) => n.type === 'SYSTEM').length,
    }
  }, [notifications])

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'ROOM_INVITE':
        return <Tv className="w-5 h-5 text-[#FF5A00]" />
      case 'FRIEND_REQUEST':
        return <Users className="w-5 h-5 text-[#22C55E]" />
      default:
        return <Bell className="w-5 h-5 text-[#3B82F6]" />
    }
  }

  const getActionText = (type: Notification['type']) => {
    switch (type) {
      case 'ROOM_INVITE':
        return 'ENTRAR NA SALA'
      case 'FRIEND_REQUEST':
        return 'VER AMIGOS'
      default:
        return 'VISUALIZAR'
    }
  }

  return (
    <div className="space-y-6">
      
      {/* ── HEADER COMMAND BANNER ─────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[#09090D] border border-[#222] p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div
          className={cn(
            'absolute top-0 right-0 w-80 h-full blur-3xl pointer-events-none opacity-20 transition-colors',
            isPro ? 'bg-[#FFE600]' : 'bg-[#FF5A00]'
          )}
        />

        {/* Left Info */}
        <div className="flex items-center gap-4 relative z-10 flex-1 min-w-0">
          <div
            className={cn(
              'w-12 h-12 flex items-center justify-center font-black shrink-0 shadow-[0_0_20px_rgba(255,90,0,0.3)]',
              isPro ? 'bg-[#FFE600] text-black' : 'bg-[#FF5A00] text-black'
            )}
          >
            <Mail className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-[#FF5A00] uppercase font-bold tracking-widest bg-[#14141E] px-2 py-0.5 border border-[#222]">
                [ TRANSPONDER // INBOX ]
              </span>
              {unreadCount > 0 ? (
                <span className="flex items-center gap-1 bg-[#250909] border border-[#EF2020]/40 px-2 py-0.2 text-[#EF2020] font-mono text-[9px] font-bold uppercase animate-pulse">
                  ● {unreadCount} NÃO LIDAS
                </span>
              ) : (
                <span className="text-[9px] font-mono text-[#22C55E] bg-[#061508] border border-[#16381C] px-2 py-0.2 uppercase">
                  ● SINCRONIZADO
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black font-mono text-white uppercase tracking-tight truncate">
              CONVITES & NOTIFICAÇÕES
            </h1>
            <p className="text-[11px] font-mono text-[#888] truncate">
              Convites para salas, pedidos de amizade e avisos do cluster em tempo real.
            </p>
          </div>
        </div>

        {/* Center: 3D Signal Transponder */}
        <div className="hidden lg:flex items-center justify-center relative z-10">
          <InvitesBeacon3DView isPro={isPro} className="w-24 h-24 relative" />
        </div>

        {/* Right Actions */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10 shrink-0">
          <button
            onClick={() => refresh()}
            className="py-2.5 px-4 bg-[#121218] hover:bg-[#1C1C24] text-white border border-[#333] hover:border-[#FF5A00] font-mono font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
            title="Atualizar Notificações"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>[ ATUALIZAR ]</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="py-2.5 px-4 bg-[#FF5A00] hover:bg-white text-black font-mono font-black text-[10px] uppercase tracking-widest transition-all duration-150 shadow-[0_0_15px_rgba(255,90,0,0.3)] flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5 stroke-[3]" />
              <span>[ MARCAR TODAS LIDAS ]</span>
            </button>
          )}
        </div>
      </div>

      {/* ── FILTER TABS BAR ────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-[#222]">
        <button
          onClick={() => setActiveTab('all')}
          className={cn(
            'px-3.5 py-1.5 text-[10px] font-mono uppercase font-bold border transition-all cursor-pointer flex items-center gap-1.5',
            activeTab === 'all'
              ? 'bg-[#FF5A00] text-black border-[#FF5A00] shadow-[0_0_12px_rgba(255,90,0,0.3)]'
              : 'bg-[#09090D] text-[#777] border-[#222] hover:text-white hover:border-[#333]'
          )}
        >
          <span>[ TODAS ]</span>
          <span className="text-[9px] px-1 py-0.2 bg-black/40 text-current font-bold">
            {countsByTab.all}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('rooms')}
          className={cn(
            'px-3.5 py-1.5 text-[10px] font-mono uppercase font-bold border transition-all cursor-pointer flex items-center gap-1.5',
            activeTab === 'rooms'
              ? 'bg-[#FF5A00] text-black border-[#FF5A00] shadow-[0_0_12px_rgba(255,90,0,0.3)]'
              : 'bg-[#09090D] text-[#777] border-[#222] hover:text-white hover:border-[#333]'
          )}
        >
          <Tv className="w-3 h-3 text-[#FF5A00]" />
          <span>[ CONVITES DE SALAS ]</span>
          <span className="text-[9px] px-1 py-0.2 bg-black/40 text-current font-bold">
            {countsByTab.rooms}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('friends')}
          className={cn(
            'px-3.5 py-1.5 text-[10px] font-mono uppercase font-bold border transition-all cursor-pointer flex items-center gap-1.5',
            activeTab === 'friends'
              ? 'bg-[#FF5A00] text-black border-[#FF5A00] shadow-[0_0_12px_rgba(255,90,0,0.3)]'
              : 'bg-[#09090D] text-[#777] border-[#222] hover:text-white hover:border-[#333]'
          )}
        >
          <Users className="w-3 h-3 text-[#22C55E]" />
          <span>[ PEDIDOS DE AMIZADE ]</span>
          <span className="text-[9px] px-1 py-0.2 bg-black/40 text-current font-bold">
            {countsByTab.friends}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={cn(
            'px-3.5 py-1.5 text-[10px] font-mono uppercase font-bold border transition-all cursor-pointer flex items-center gap-1.5',
            activeTab === 'system'
              ? 'bg-[#FF5A00] text-black border-[#FF5A00] shadow-[0_0_12px_rgba(255,90,0,0.3)]'
              : 'bg-[#09090D] text-[#777] border-[#222] hover:text-white hover:border-[#333]'
          )}
        >
          <Bell className="w-3 h-3 text-[#3B82F6]" />
          <span>[ AVISOS DO SISTEMA ]</span>
          <span className="text-[9px] px-1 py-0.2 bg-black/40 text-current font-bold">
            {countsByTab.system}
          </span>
        </button>
      </div>

      {/* ── NOTIFICATIONS LIST / EMPTY STATE ───────────────────────── */}
      {filteredNotifications.length === 0 ? (
        <div className="p-12 bg-[#09090D] border border-[#222] text-center space-y-4 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: 'linear-gradient(#FF5A00 1px, transparent 1px), linear-gradient(90deg, #FF5A00 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative z-10 max-w-[460px] mx-auto space-y-3">
            <div className="flex justify-center py-2">
              <InvitesBeacon3DView isPro={isPro} className="w-24 h-24 relative" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#121218] border border-[#333] text-[9px] font-mono text-[#888] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              <span>SYS_INBOX: NENHUMA NOTIFICAÇÃO PENDENTE</span>
            </div>

            <h3 className="text-lg font-mono font-bold text-white uppercase">
              Você está 100% em dia!
            </h3>

            <p className="text-[11px] font-mono text-[#888]">
              Novos convites para assistir vídeos, solicitações de amizade e avisos do cluster aparecerão instantaneamente aqui.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={cn(
                'p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-150',
                !notif.read
                  ? 'bg-[#150F08] border-[#FF5A00]/60 shadow-[0_0_15px_rgba(255,90,0,0.1)]'
                  : 'bg-[#09090D] border-[#1C1C24] hover:bg-[#0E0E14] hover:border-[#333]'
              )}
            >
              {/* Left: Icon, Indicator, Title & Content */}
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <div
                  className={cn(
                    'w-10 h-10 border flex items-center justify-center shrink-0',
                    !notif.read
                      ? 'bg-[#1F140A] border-[#FF5A00] shadow-[0_0_10px_rgba(255,90,0,0.2)]'
                      : 'bg-[#121218] border-[#222]'
                  )}
                >
                  {getIcon(notif.type)}
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-[#FF5A00] animate-ping shrink-0" />
                    )}
                    <h4
                      className={cn(
                        'text-[12px] font-mono font-bold uppercase truncate',
                        !notif.read ? 'text-white' : 'text-[#888]'
                      )}
                    >
                      {notif.title}
                    </h4>
                  </div>

                  <p
                    className={cn(
                      'text-[11px] font-mono leading-relaxed',
                      !notif.read ? 'text-[#CCC]' : 'text-[#666]'
                    )}
                  >
                    {notif.message}
                  </p>

                  <p className="text-[9px] font-mono text-[#555]">
                    {formatDistanceToNow(new Date(notif.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1C1C24]">
                <button
                  onClick={() => handleAction(notif)}
                  className={cn(
                    'px-4 py-2 font-mono font-bold text-[10px] uppercase transition-all flex items-center gap-1.5 cursor-pointer',
                    !notif.read && notif.type === 'ROOM_INVITE'
                      ? 'bg-[#FF5A00] hover:bg-white text-black shadow-[0_0_12px_rgba(255,90,0,0.3)]'
                      : 'bg-[#151520] hover:bg-[#FF5A00] text-white hover:text-black border border-[#333] hover:border-[#FF5A00]'
                  )}
                >
                  {notif.type === 'ROOM_INVITE' && <Play className="w-3 h-3 fill-current" />}
                  <span>{getActionText(notif.type)}</span>
                </button>

                <button
                  onClick={() => removeNotification(notif.id)}
                  className="p-2 border border-[#222] hover:border-[#EF2020] text-[#666] hover:text-[#EF2020] transition-colors cursor-pointer"
                  title="Excluir notificação"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
