'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Copy, Check, Link, Users, Send, Loader2, UserCheck, Radio } from 'lucide-react'
import { toast } from 'sonner'
import { Socket } from 'socket.io-client'
import { getFriendsAndRequests, createRoomInviteNotification } from '@/app/(main)/actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Viewer } from '@/lib/useSocket'
import { cn } from '@/lib/utils'

interface FriendUser {
  id: string
  name: string | null
  email: string
  image: string | null
  chatColor?: string | null
}

interface InviteFriendsModalProps {
  roomId: string
  viewerCount: number
  viewers: Viewer[]
  socket: Socket | null
  senderName: string
  onClose: () => void
}

export function InviteFriendsModal({
  roomId,
  viewerCount,
  viewers,
  socket,
  senderName,
  onClose,
}: InviteFriendsModalProps) {
  const [friends, setFriends] = useState<FriendUser[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState(false)
  const [roomUrl, setRoomUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRoomUrl(`${window.location.origin}/room/${roomId}`)
    }
  }, [roomId])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await getFriendsAndRequests()
        if (!cancelled) {
          setFriends(data.friends as FriendUser[])
        }
      } catch {
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const viewerIds = new Set(viewers.map((v) => v.id))
  const availableFriends = friends.filter((f) => !viewerIds.has(f.id))
  const friendsInRoom = friends.filter((f) => viewerIds.has(f.id))

  const allSelected = availableFriends.length > 0 && selectedIds.size === availableFriends.length

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(availableFriends.map((f) => f.id)))
    }
  }, [allSelected, availableFriends])

  const toggleFriend = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const handleCopy = useCallback(async () => {
    if (!roomUrl) return
    try {
      await navigator.clipboard.writeText(roomUrl)
      setCopied(true)
      toast.success('Link da sala copiado!')
    } catch {
      const input = document.createElement('input')
      input.value = roomUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      toast.success('Link da sala copiado!')
    }
  }, [roomUrl])

  useEffect(() => {
    if (copied) {
      const t = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(t)
    }
  }, [copied])

  const handleInviteSelected = useCallback(async () => {
    if (selectedIds.size === 0) return
    setSending(true)

    const selected = availableFriends.filter((f) => selectedIds.has(f.id))
    for (const friend of selected) {
      await createRoomInviteNotification(friend.id, roomId, senderName).catch(console.error)

      if (socket) {
        socket.emit('invite-to-room', {
          targetUserId: friend.id,
          roomCode: roomId,
          senderName,
        })
      }
    }

    toast.success(`Convites transmitidos para ${selected.length} amigo(s)!`)
    setSending(false)
    onClose()
  }, [selectedIds, availableFriends, socket, roomId, senderName, onClose])

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose]
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none font-mono animate-in fade-in duration-150"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#0A0A0F] border-2 border-[#FF5A00] w-full max-w-md shadow-[0_0_40px_rgba(255,90,0,0.3)] flex flex-col max-h-[85vh] relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1F1F28] bg-[#0E0E14] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#FF5A00] flex items-center justify-center text-black">
              <Users className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs font-black text-white uppercase tracking-wider">
              [ CONVOCAR AMIGOS PARA A SALA ]
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 border border-[#333] hover:border-white text-[#888] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4">
          {/* Quick link copy bar */}
          <div className="space-y-1.5 bg-[#121218] p-3 border border-[#222]">
            <span className="text-[9px] font-bold text-[#888] uppercase block">
              LINK DIRETO DA SALA #{roomId}
            </span>
            <div className="flex items-center gap-1.5">
              <input
                readOnly
                value={roomUrl}
                className="flex-1 bg-[#09090D] border border-[#333] text-white px-2.5 py-1.5 text-[10px] font-mono outline-none select-all"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-[#FF5A00] hover:bg-white text-black font-black text-[10px] uppercase transition-colors shrink-0 cursor-pointer shadow-sm flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'COPIADO' : 'COPIAR'}</span>
              </button>
            </div>
          </div>

          {/* Friends List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-white uppercase tracking-wider">
                SELECIONAR AMIGOS ({availableFriends.length})
              </span>
              {availableFriends.length > 0 && (
                <button
                  onClick={toggleSelectAll}
                  className="text-[9px] font-bold text-[#FF5A00] hover:text-white uppercase cursor-pointer"
                >
                  {allSelected ? '[ DESMARCAR TODOS ]' : '[ SELECIONAR TODOS ]'}
                </button>
              )}
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-[#888]">
                <Loader2 className="w-5 h-5 text-[#FF5A00] animate-spin mx-auto mb-2" />
                <span>CONSULTANDO REDE DE AMIGOS...</span>
              </div>
            ) : availableFriends.length === 0 && friendsInRoom.length === 0 ? (
              <div className="py-8 text-center text-[#777] border border-dashed border-[#222] p-4">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#FF5A00]" />
                <p className="text-xs font-bold text-white uppercase">Nenhum amigo na sua rede</p>
                <p className="text-[9px] mt-1 text-[#666]">
                  Adicione amigos pela aba "AMIGOS" no menu principal.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto">
                {availableFriends.map((friend) => {
                  const isSelected = selectedIds.has(friend.id)
                  return (
                    <div
                      key={friend.id}
                      onClick={() => toggleFriend(friend.id)}
                      className={cn(
                        'p-2 border flex items-center justify-between gap-2.5 transition-colors cursor-pointer',
                        isSelected
                          ? 'bg-[#18120B] border-[#FF5A00] text-white shadow-sm'
                          : 'bg-[#121218] border-[#222] hover:border-[#333] text-[#AAA]'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={cn(
                            'w-4 h-4 border flex items-center justify-center shrink-0',
                            isSelected ? 'bg-[#FF5A00] border-[#FF5A00]' : 'border-[#444] bg-[#0E0E14]'
                          )}
                        >
                          {isSelected && <Check className="w-3 h-3 text-black stroke-[3]" />}
                        </div>

                        <Avatar className="w-7 h-7 rounded-none border border-[#333]">
                          <AvatarImage src={friend.image || undefined} />
                          <AvatarFallback className="bg-[#151520] text-[#FF5A00] text-[10px] font-black rounded-none">
                            {(friend.name || friend.email).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-white uppercase truncate">
                            {friend.name || friend.email.split('@')[0]}
                          </p>
                          <p className="text-[9px] text-[#666] truncate">{friend.email}</p>
                        </div>
                      </div>

                      <span
                        className={cn(
                          'text-[8px] font-bold uppercase px-1 py-0.2',
                          isSelected ? 'bg-[#FF5A00] text-black' : 'text-[#666]'
                        )}
                      >
                        {isSelected ? 'SELECIONADO' : 'OFFLINE/DISP'}
                      </span>
                    </div>
                  )
                })}

                {/* Already in room */}
                {friendsInRoom.map((friend) => (
                  <div
                    key={friend.id}
                    className="p-2 bg-[#0E0E14] border border-[#1A1A22] flex items-center justify-between gap-2.5 opacity-50 select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="w-7 h-7 rounded-none border border-[#222]">
                        <AvatarImage src={friend.image || undefined} />
                        <AvatarFallback className="bg-[#151520] text-[#888] text-[10px] font-bold rounded-none">
                          {(friend.name || friend.email).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-white uppercase truncate">
                          {friend.name || friend.email.split('@')[0]}
                        </p>
                      </div>
                    </div>
                    <span className="text-[8px] font-bold text-[#22C55E] uppercase">JÁ NA SALA</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-[#1F1F28] bg-[#0E0E14] flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-3 py-2 border border-[#333] hover:border-white text-[#888] hover:text-white font-bold text-[10px] uppercase transition-colors cursor-pointer"
          >
            FECHAR
          </button>

          <button
            onClick={handleInviteSelected}
            disabled={selectedIds.size === 0 || sending}
            className={cn(
              'flex-1 py-2 font-black text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md',
              selectedIds.size > 0
                ? 'bg-[#FF5A00] hover:bg-white text-black'
                : 'bg-[#151520] text-[#555] cursor-not-allowed border border-[#222]'
            )}
          >
            {sending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>TRANSMITIR CONVITES ({selectedIds.size})</span>
          </button>
        </div>
      </div>
    </div>
  )
}
