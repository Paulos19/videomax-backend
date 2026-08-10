'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Copy, Check, Link, Users, Send, Loader2, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Socket } from 'socket.io-client'
import { getFriendsAndRequests } from '@/app/(main)/actions'
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
  onClose
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

  // Fetch friends list
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await getFriendsAndRequests()
        if (!cancelled) {
          setFriends(data.friends as FriendUser[])
        }
      } catch {
        // Failed to load friends
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Friends not already in the room
  const viewerIds = new Set(viewers.map(v => v.id))
  const availableFriends = friends.filter(f => !viewerIds.has(f.id))
  const friendsInRoom = friends.filter(f => viewerIds.has(f.id))

  const allSelected = availableFriends.length > 0 && selectedIds.size === availableFriends.length

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(availableFriends.map(f => f.id)))
    }
  }, [allSelected, availableFriends])

  const toggleFriend = useCallback((id: string) => {
    setSelectedIds(prev => {
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
    } catch {
      const input = document.createElement('input')
      input.value = roomUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
    }
  }, [roomUrl])

  useEffect(() => {
    if (copied) {
      const t = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(t)
    }
  }, [copied])

  const handleInviteSelected = useCallback(async () => {
    if (selectedIds.size === 0 || !socket) return
    setSending(true)

    const selected = availableFriends.filter(f => selectedIds.has(f.id))
    for (const friend of selected) {
      socket.emit('invite-to-room', {
        targetUserId: friend.id,
        roomCode: roomId,
        senderName
      })
    }

    toast.success(`Convites enviados para ${selected.length} amigo(s)!`)
    setSending(false)
    onClose()
  }, [selectedIds, availableFriends, socket, roomId, senderName, onClose])

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-room-surface border border-room-border rounded-2xl w-full max-w-md mx-4 animate-scale-in relative overflow-hidden max-h-[85vh] flex flex-col">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] brand-gradient" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-room-border shrink-0">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-room-accent" />
            <h2 className="text-room-text font-semibold text-base">Convidar amigos</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-room-surface-2 hover:bg-room-surface-3 flex items-center justify-center transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4 text-room-text-secondary" />
          </button>
        </div>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Room link section */}
          <div className="px-5 pt-4 pb-3 space-y-3">
            {/* Room info */}
            <div className="flex items-center gap-3 p-3 bg-room-surface-2 rounded-xl border border-room-border">
              <div className="w-10 h-10 rounded-xl bg-room-accent/10 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-room-accent" />
              </div>
              <div>
                <p className="text-room-text text-sm font-medium">{roomId}</p>
                <p className="text-room-text-secondary text-xs">
                  {viewerCount} {viewerCount === 1 ? 'pessoa' : 'pessoas'} assistindo
                </p>
              </div>
            </div>

            {/* Link + copy */}
            <div>
              <label className="text-room-text-secondary text-xs font-medium mb-1.5 block">Link da sala</label>
              <div className="flex items-center gap-2 bg-room-surface-2 border border-room-border rounded-xl px-3 py-2.5">
                <Link className="w-4 h-4 text-room-text-secondary/50 shrink-0" />
                <input
                  readOnly
                  value={roomUrl}
                  className="flex-1 bg-transparent text-room-text text-sm outline-none truncate"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={handleCopy}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0",
                    copied
                      ? "bg-room-online/20 text-room-online"
                      : "bg-room-accent/10 text-room-accent hover:bg-room-accent/20"
                  )}
                  aria-label="Copiar link"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-5 border-t border-room-border" />

          {/* Friends list */}
          <div className="px-5 py-3">
            {loading ? (
              <div className="flex items-center justify-center py-8 gap-2">
                <Loader2 className="w-4 h-4 text-room-accent animate-spin" />
                <span className="text-room-text-secondary text-sm">Carregando amigos...</span>
              </div>
            ) : availableFriends.length === 0 && friendsInRoom.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-10 h-10 text-room-text-secondary/20 mx-auto mb-2" />
                <p className="text-room-text-secondary text-sm">Você ainda não tem amigos adicionados</p>
                <p className="text-room-text-secondary/60 text-xs mt-1">
                  Adicione amigos na página de Rede Social
                </p>
              </div>
            ) : (
              <>
                {/* Select all toggle — only show if there are available friends */}
                {availableFriends.length > 0 && (
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center gap-2.5 w-full p-2 rounded-xl hover:bg-room-surface-2 transition-colors mb-2"
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                      allSelected
                        ? "bg-room-accent border-room-accent"
                        : "border-room-border-light bg-room-surface-2"
                    )}>
                      {allSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-room-text text-sm font-medium">Selecionar todos</span>
                    <span className="text-room-text-secondary text-xs">({availableFriends.length})</span>
                  </button>
                )}

                {/* Available friends */}
                <div className="space-y-1.5">
                  {availableFriends.map(friend => (
                    <button
                      key={friend.id}
                      onClick={() => toggleFriend(friend.id)}
                      className={cn(
                        "flex items-center gap-3 w-full p-2.5 rounded-xl transition-all text-left",
                        selectedIds.has(friend.id)
                          ? "bg-room-accent/10 border border-room-accent/30"
                          : "bg-room-surface-2 border border-transparent hover:border-room-border-light"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0",
                        selectedIds.has(friend.id)
                          ? "bg-room-accent border-room-accent"
                          : "border-room-border-light bg-room-surface"
                      )}>
                        {selectedIds.has(friend.id) && <Check className="w-3 h-3 text-white" />}
                      </div>

                      <Avatar className="w-9 h-9 shrink-0 border border-room-border">
                        <AvatarImage src={friend.image || undefined} />
                        <AvatarFallback className="bg-room-surface-3 text-room-accent text-xs font-bold">
                          {(friend.name || friend.email).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <p className="text-room-text text-sm font-medium truncate">
                          {friend.name || friend.email.split('@')[0]}
                        </p>
                        <p className="text-room-text-secondary text-xs truncate">
                          {friend.email}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Friends already in room */}
                {friendsInRoom.length > 0 && (
                  <div className="mt-3">
                    <p className="text-room-text-secondary text-xs font-medium mb-2 px-1">Já na sala</p>
                    <div className="space-y-1.5">
                      {friendsInRoom.map(friend => (
                        <div
                          key={friend.id}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-room-surface-2/50 opacity-60"
                        >
                          <div className="w-5 h-5 rounded-md bg-room-online/20 flex items-center justify-center shrink-0">
                            <UserCheck className="w-3 h-3 text-room-online" />
                          </div>
                          <Avatar className="w-9 h-9 shrink-0 border border-room-border">
                            <AvatarImage src={friend.image || undefined} />
                            <AvatarFallback className="bg-room-surface-3 text-room-accent text-xs font-bold">
                              {(friend.name || friend.email).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-room-text text-sm font-medium truncate">
                              {friend.name || friend.email.split('@')[0]}
                            </p>
                            <p className="text-room-text-secondary text-xs">Na sala</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer — invite button */}
        {availableFriends.length > 0 && (
          <div className="px-5 py-4 border-t border-room-border shrink-0">
            <button
              onClick={handleInviteSelected}
              disabled={selectedIds.size === 0 || sending || !socket}
              className={cn(
                "w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2",
                selectedIds.size > 0 && !sending && socket
                  ? "brand-gradient text-white brand-glow-strong hover:opacity-90 active:scale-[0.98]"
                  : "bg-room-surface-3 text-room-text-secondary/40 cursor-not-allowed"
              )}
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Convidar selecionados{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
