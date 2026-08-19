'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail } from 'lucide-react'
import io, { Socket } from 'socket.io-client'
import { PendingInviteItem, PendingInviteData } from './pending-invite-item'

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'https://services-videomax-websocket.khdya3.easypanel.host/'

interface PendingInvitesProps {
  initialInvites?: PendingInviteData[]
  user?: { id?: string }
}

export function PendingInvites({ initialInvites = [], user }: PendingInvitesProps) {
  const router = useRouter()
  const [invites, setInvites] = useState<PendingInviteData[]>(initialInvites)

  useEffect(() => {
    let socket: Socket | null = null
    let cancelled = false

    const init = async () => {
      let wsToken: string | undefined
      try {
        const tokenRes = await fetch('/api/auth/token')
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json()
          wsToken = tokenData.token
        }
      } catch {}

      if (cancelled) return

      socket = io(SOCKET_SERVER_URL, {
        auth: wsToken ? { token: wsToken } : undefined,
        transports: ['websocket', 'polling'],
      })

      socket.on('room-invite-received', (data: { senderName: string; roomCode: string }) => {
        if (cancelled) return
        const newInvite: PendingInviteData = {
          id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          senderId: '',
          senderName: data.senderName,
          roomCode: data.roomCode,
          videoTitle: `Sala ${data.roomCode}`
        }
        setInvites((prev) => [newInvite, ...prev])
      })
    }

    init()

    return () => {
      cancelled = true
      if (socket) socket.disconnect()
    }
  }, [])

  const handleAccept = (invite: PendingInviteData) => {
    setInvites((prev) => prev.filter((i) => i.id !== invite.id))
    window.location.href = `/room/${invite.roomCode}`
  }

  const handleReject = (inviteId: string) => {
    setInvites((prev) => prev.filter((i) => i.id !== inviteId))
  }

  return (
    <div className="bg-[#09090D] border border-[#222] p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#222] pb-2.5">
        <div className="flex items-center gap-2">
          <Mail className="w-3.5 h-3.5 text-[#FF5A00]" />
          <span className="text-[10px] font-mono text-[#FF5A00] font-bold uppercase tracking-wider">
            [ CONVITES PENDENTES ]
          </span>
        </div>

        {invites.length > 0 && (
          <span className="bg-[#EF2020] text-white text-[9px] font-mono font-bold px-1.5 py-0.2 shadow-[0_0_8px_rgba(239,32,32,0.6)]">
            {invites.length}
          </span>
        )}
      </div>

      {/* Invites List */}
      <div className="space-y-2">
        {invites.length === 0 ? (
          <div className="py-6 text-center text-[10px] font-mono text-[#777]">
            VOCÊ NÃO POSSUI CONVITES PENDENTES.
          </div>
        ) : (
          invites.map((invite) => (
            <PendingInviteItem
              key={invite.id}
              invite={invite}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ))
        )}
      </div>
    </div>
  )
}
