'use client'

export interface SuggestedUser {
  id: string
  name: string
  username: string
  image?: string
  mutualCount: number
}

import { useState, useEffect } from 'react'
import { UserPlus, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { getFriendSuggestions, sendFriendRequest } from '@/app/(main)/actions'

export interface SuggestedUser {
  id: string
  name: string
  username: string
  email: string
  image?: string
  mutualCount: number
}

interface FriendSuggestionsProps {
  onRequestSent?: () => void
}

export function FriendSuggestions({ onRequestSent }: FriendSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [addingId, setAddingId] = useState<string | null>(null)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function loadSuggestions() {
      try {
        const res = await getFriendSuggestions()
        setSuggestions(res)
      } catch {
        // Failed to load suggestions
      } finally {
        setLoading(false)
      }
    }
    loadSuggestions()
  }, [])

  const handleAdd = async (user: SuggestedUser) => {
    setAddingId(user.id)
    try {
      await sendFriendRequest(user.email)
      toast.success(`Pedido enviado para ${user.name}!`)
      setAddedIds(prev => new Set(prev).add(user.id))
      onRequestSent?.()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao enviar pedido')
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="bg-[#0B0B0B] border border-[#242424] rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[#F5F5F5] font-bold text-sm">Sugestões para você</h3>
      </div>

      {loading ? (
        <div className="py-6 text-center text-xs text-[#8A8A8A]">Carregando sugestões...</div>
      ) : suggestions.length === 0 ? (
        <div className="py-4 text-center text-xs text-[#8A8A8A]">Nenhuma sugestão no momento.</div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((user) => {
            const isAdded = addedIds.has(user.id)
            const isAdding = addingId === user.id

            return (
              <div key={user.id} className="flex items-center justify-between gap-3 p-1">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="w-9 h-9 border border-[#242424] shrink-0">
                    <AvatarImage src={user.image} />
                    <AvatarFallback className="bg-[#151515] text-[#FF5A00] text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#F5F5F5] truncate">{user.name}</p>
                    <p className="text-[11px] text-[#8A8A8A] truncate">{user.username}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleAdd(user)}
                  disabled={isAdded || isAdding}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1",
                    isAdded
                      ? "bg-[#151515] text-emerald-400 border border-emerald-500/30"
                      : "border border-[#FF5A00]/40 text-[#FF5A00] hover:bg-[#FF5A00] hover:text-white"
                  )}
                >
                  {isAdding ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Enviado
                    </>
                  ) : (
                    'Adicionar'
                  )}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
