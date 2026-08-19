'use client'

import { useEffect, useRef, useState } from 'react'
import { Smile, Search, X, Crown, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PREMIUM_EMOJIS, PremiumAnimatedEmoji } from './premium-emojis'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

const EMOJI_CATEGORIES = [
  {
    id: 'maxpro',
    name: '👑 MAXPRO VIP',
    isProOnly: true,
  },
  {
    id: 'popular',
    name: 'FREQUENTES',
    emojis: ['🔥', '❤️', '😂', '😱', '👍', '👏', '🍿', '🚀', '🎉', '😍', '🥳', '💯', '💩', '🤡', '👑', '⚡', '🎬', '📽️', '🎧', '🎮', '✨', '😭', '🤯', '💀'],
  },
  {
    id: 'faces',
    name: 'EXPRESSÕES',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕'],
  },
  {
    id: 'cinema',
    name: 'CINEMA',
    emojis: ['🍿', '🎬', '📽️', '📺', '📻', '🎙️', '🎛️', '🎧', '🎮', '🕹️', '🎯', '🎲', '🎨', '🎸', '🎺', '🎹', '🎟️', '🎫', '🎭', '📷', '📹', '📼', '📱', '💻'],
  },
  {
    id: 'symbols',
    name: 'SÍMBOLOS',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '🔥', '⚡', '✨', '⭐', '🌟', '💥', '💢', '💨', '💦', '💬', '🗨️', '🗯️', '💭', '💯', '🔔', '🔕', '🟢', '🔴', '🟡', '🟠', '🔵', '🟣', '⚫', '⚪', '🟩', '🟥'],
  },
]

interface EmojiPickerPopoverProps {
  onSelectEmoji: (emoji: string) => void
  onClose: () => void
  isPro?: boolean
}

export function EmojiPickerPopover({ onSelectEmoji, onClose, isPro = false }: EmojiPickerPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()

  const userPlan = (session?.user as any)?.plan || 'FREE'
  const hasVipAccess = Boolean(isPro || userPlan === 'MAXPRO' || userPlan === 'PRO')
  const [activeTab, setActiveTab] = useState(hasVipAccess ? 'maxpro' : 'popular')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const handleSelectPremium = (code: string) => {
    if (!hasVipAccess) {
      toast.error('Emojis animados são exclusivos para membros MAXPRO VIP! Faça upgrade para liberar.')
      return
    }
    onSelectEmoji(` ${code} `)
  }

  const currentCategory = EMOJI_CATEGORIES.find((c) => c.id === activeTab) || EMOJI_CATEGORIES[0]

  const filteredStandardEmojis = search.trim()
    ? EMOJI_CATEGORIES.filter((c) => !c.isProOnly).flatMap((c) => c.emojis || []).filter((e) => e.includes(search.trim()))
    : currentCategory.emojis || []

  const filteredPremiumEmojis = search.trim()
    ? PREMIUM_EMOJIS.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()) || e.code.includes(search.toLowerCase()))
    : PREMIUM_EMOJIS

  return (
    <div
      ref={popoverRef}
      className="absolute bottom-full left-0 mb-2 z-50 w-[calc(100vw-32px)] max-w-[340px] sm:w-[340px] bg-[#0A0A0F] border-2 border-[#FF5A00] shadow-[0_0_35px_rgba(255,90,0,0.35)] overflow-hidden font-mono select-none animate-in fade-in zoom-in-95 origin-bottom-left p-3 space-y-2.5"
    >
      {/* Header & Search */}
      <div className="space-y-2 border-b border-[#1F1F28] pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-black text-white uppercase tracking-wider">
            <Smile className="w-3.5 h-3.5 text-[#FF5A00]" />
            <span>[ EMOJIS ]</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-0.5 border border-[#333] hover:border-white text-[#888] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#555] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="BUSCAR EMOJI OU VIP..."
            className="w-full bg-[#121218] border border-[#262633] focus:border-[#FF5A00] text-white text-[10px] pl-7 pr-2 py-1 font-mono placeholder:text-[#555] outline-none"
          />
        </div>
      </div>

      {/* Category Tabs */}
      {!search.trim() && (
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {EMOJI_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={cn(
                'px-2 py-1 text-[9px] font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer flex items-center gap-1',
                activeTab === cat.id
                  ? cat.isProOnly
                    ? 'bg-[#FFE600] text-black shadow-[0_0_10px_rgba(255,230,0,0.5)]'
                    : 'bg-[#FF5A00] text-black shadow-sm'
                  : cat.isProOnly
                  ? 'bg-[#1F1A08] text-[#FFE600] border border-[#FFE600]/40 hover:bg-[#FFE600]/20'
                  : 'bg-[#121218] text-[#888] hover:text-white hover:bg-[#1A1A24]'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* ── MAXPRO VIP ANIMATED EMOJIS GRID ─────────────────────── */}
      {(activeTab === 'maxpro' || search.trim()) && filteredPremiumEmojis.length > 0 && (
        <div className="space-y-2">
          {!hasVipAccess && (
            <div className="p-2 bg-[#1A1408] border border-[#FFE600] text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-[#FFE600] text-[9px] font-black uppercase">
                <Crown className="w-3 h-3 fill-[#FFE600]" />
                <span>EXCLUSIVO MAXPRO VIP</span>
              </div>
              <p className="text-[8px] text-[#AAA] leading-tight">
                Assine o plano MAXPRO para usar os 15 emojis animados no chat.
              </p>
            </div>
          )}

          <div className="max-h-48 overflow-y-auto grid grid-cols-5 gap-2 p-1 bg-[#07070B] border border-[#1F1F28]">
            {filteredPremiumEmojis.map((emoji) => (
              <button
                key={emoji.id}
                type="button"
                onClick={() => handleSelectPremium(emoji.code)}
                title={`${emoji.name} (${emoji.code})`}
                className={cn(
                  'p-2 rounded-none transition-all flex flex-col items-center justify-center gap-1 group relative cursor-pointer',
                  hasVipAccess
                    ? 'hover:bg-[#1C1808] hover:scale-110 border border-transparent hover:border-[#FFE600]'
                    : 'opacity-70 hover:opacity-100 hover:bg-[#181208]'
                )}
              >
                <PremiumAnimatedEmoji id={emoji.id} size={28} />
                <span className="text-[7px] text-[#888] group-hover:text-white truncate max-w-full font-mono uppercase">
                  {emoji.name.split(' ')[0]}
                </span>

                {!hasVipAccess && (
                  <div className="absolute top-1 right-1 bg-black/80 text-[#FFE600] p-0.5 rounded-none">
                    <Lock className="w-2.5 h-2.5" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STANDARD UNICODE EMOJIS GRID ───────────────────────── */}
      {activeTab !== 'maxpro' && (
        <div className="max-h-48 overflow-y-auto grid grid-cols-7 gap-1 p-1">
          {filteredStandardEmojis.map((emoji, idx) => (
            <button
              key={`${emoji}-${idx}`}
              type="button"
              onClick={() => onSelectEmoji(emoji)}
              className="p-1.5 text-base hover:bg-[#1C1C24] hover:scale-125 transition-transform flex items-center justify-center rounded-none cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
