'use client'

import { useEffect, useRef, useState } from 'react'
import { Smile, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const EMOJI_CATEGORIES = [
  {
    id: 'popular',
    name: 'Frequentes',
    emojis: ['🔥', '❤️', '😂', '😱', '👍', '👏', '🍿', '🚀', '🎉', '😍', '🥳', '💯', '💩', '🤡', '👑', '⚡', '🎬', '📽️', '🎧', '🎮', '✨', '😭', '🤯', '💀']
  },
  {
    id: 'faces',
    name: 'Expressões',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕']
  },
  {
    id: 'cinema',
    name: 'Cinema & Midia',
    emojis: ['🍿', '🎬', '📽️', '📺', '📻', '🎙️', '🎛️', '🎧', '🎮', '🕹️', '🎯', '🎲', '🎨', '🎸', '🎺', '🎹', '🎟️', '🎫', '🎭', '📷', '📹', '📼', '📱', '💻']
  },
  {
    id: 'symbols',
    name: 'Símbolos',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '🔥', '⚡', '✨', '⭐', '🌟', '💥', '💢', '💨', '💦', '💬', '🗨️', '🗯️', '💭', '💯', '🔔', '🔕', '🟢', '🔴', '🟡', '🟠', '🔵', '🟣', '⚫', '⚪', '🟩', '🟥']
  }
]

interface EmojiPickerPopoverProps {
  onSelectEmoji: (emoji: string) => void
  onClose: () => void
}

export function EmojiPickerPopover({ onSelectEmoji, onClose }: EmojiPickerPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState('popular')
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

  const currentCategory = EMOJI_CATEGORIES.find(c => c.id === activeTab) || EMOJI_CATEGORIES[0]

  const filteredEmojis = search.trim()
    ? EMOJI_CATEGORIES.flatMap(c => c.emojis).filter(e => e.includes(search.trim()))
    : currentCategory.emojis

  return (
    <div
      ref={popoverRef}
      className="absolute bottom-full left-0 mb-3 z-50 w-[290px] sm:w-[320px] rounded-2xl border border-[#242424] bg-[#0B0B0B] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 origin-bottom-left p-3 space-y-3"
    >
      {/* Header & Search */}
      <div className="space-y-2 border-b border-[#242424] pb-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#F5F5F5] flex items-center gap-1.5">
            <Smile className="w-4 h-4 text-[#FF5A00]" />
            Seletor de Emojis
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] font-semibold text-[#8A8A8A] hover:text-[#F5F5F5]"
          >
            Fechar ✕
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#5F5F5F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar emoji..."
            className="w-full bg-[#151515] border border-[#242424] text-[#F5F5F5] text-xs pl-8 pr-3 py-1.5 rounded-xl placeholder:text-[#5F5F5F] outline-none focus:border-[#FF5A00]"
          />
        </div>
      </div>

      {/* Category Tabs */}
      {!search.trim() && (
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {EMOJI_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTab(cat.id)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0",
                activeTab === cat.id
                  ? "bg-[#FF5A00] text-white"
                  : "bg-[#151515] text-[#8A8A8A] hover:text-[#F5F5F5]"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Emoji Grid */}
      <div className="grid grid-cols-6 gap-1 max-h-[180px] overflow-y-auto pr-1 scrollbar-thin">
        {filteredEmojis.map((emoji, idx) => (
          <button
            key={`${emoji}-${idx}`}
            type="button"
            onClick={() => onSelectEmoji(emoji)}
            className="w-9 h-9 rounded-xl bg-[#151515] hover:bg-[#FF5A00]/20 hover:scale-115 active:scale-90 transition-all text-lg flex items-center justify-center"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
