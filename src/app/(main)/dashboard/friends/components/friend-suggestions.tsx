'use client'

import { useState, useEffect } from 'react'
import { UserPlus, Loader2, Check, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
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
      setAddedIds((prev) => new Set(prev).add(user.id))
      onRequestSent?.()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao enviar pedido')
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="bg-white dark:bg-[#09090D] border border-slate-200 dark:border-[#222] p-4 space-y-3.5 shadow-sm dark:shadow-xl transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#222] pb-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#FF5A00]" />
          <h3 className="text-slate-900 dark:text-white font-mono font-bold text-[10px] uppercase tracking-wider">
            [ SUGESTÕES DA REDE ]
          </h3>
        </div>
        <span className="text-[9px] font-mono text-slate-500 dark:text-[#777]">
          {suggestions.length} NÓS
        </span>
      </div>

      {loading ? (
        <div className="py-6 text-center font-mono text-[10px] text-slate-500 dark:text-[#777]">
          BUSCANDO SUGESTÕES...
        </div>
      ) : suggestions.length === 0 ? (
        <div className="py-4 text-center font-mono text-[10px] text-slate-500 dark:text-[#777]">
          NENHUMA SUGESTÃO NO MOMENTO.
        </div>
      ) : (
        <div className="space-y-2">
          {suggestions.map((user) => {
            const isAdded = addedIds.has(user.id)
            const isAdding = addingId === user.id

            return (
              <div
                key={user.id}
                className="flex items-center justify-between gap-3 p-2 bg-slate-50 dark:bg-[#050508] border border-slate-200 dark:border-[#1C1C24] hover:border-slate-300 dark:hover:border-[#333] transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-8 h-8 rounded border border-slate-300 dark:border-[#333] object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-slate-100 dark:bg-[#151520] border border-slate-300 dark:border-[#333] flex items-center justify-center font-mono font-bold text-[10px] text-[#FF5A00] shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-[11px] font-mono font-bold text-slate-900 dark:text-white uppercase truncate">
                      {user.name}
                    </p>
                    <p className="text-[9px] font-mono text-slate-500 dark:text-[#777] truncate">
                      {user.username}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleAdd(user)}
                  disabled={isAdded || isAdding}
                  className={cn(
                    'px-3 py-1 text-[9px] font-mono font-bold uppercase transition-all shrink-0 flex items-center gap-1 cursor-pointer disabled:opacity-60',
                    isAdded
                      ? 'bg-emerald-50 dark:bg-[#151520] text-[#16A34A] dark:text-[#22C55E] border border-emerald-200 dark:border-[#22C55E]/40'
                      : 'bg-slate-100 hover:bg-[#FF5A00] dark:bg-[#151520] dark:hover:bg-[#FF5A00] text-slate-800 hover:text-white dark:text-white dark:hover:text-black border border-slate-300 dark:border-[#333] hover:border-[#FF5A00]'
                  )}
                >
                  {isAdding ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : isAdded ? (
                    <>
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>ENVIADO</span>
                    </>
                  ) : (
                    <span>[ + ADICIONAR ]</span>
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
