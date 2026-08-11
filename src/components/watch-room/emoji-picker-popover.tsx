'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Theme, EmojiClickData } from 'emoji-picker-react'
import { Loader2, Smile } from 'lucide-react'

const EmojiPicker = dynamic(() => import('emoji-picker-react'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[280px] bg-[#0F0F12] flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-[#FF5A00] animate-spin" />
    </div>
  )
})

const QUICK_EMOJIS = [
  '🔥', '❤️', '😂', '😱', '👍', '👏', '🍿', '🚀',
  '🎉', '😍', '🥳', '💯', '💩', '🤡', '👑', '⚡',
  '🎬', '📽️', '🎧', '🎮', '✨', '😭', '🤯', '💀'
]

interface EmojiPickerPopoverProps {
  onSelectEmoji: (emoji: string) => void
  onClose: () => void
}

export function EmojiPickerPopover({ onSelectEmoji, onClose }: EmojiPickerPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const [showFullPicker, setShowFullPicker] = useState(false)

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

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onSelectEmoji(emojiData.emoji)
  }

  return (
    <div
      ref={popoverRef}
      className="absolute bottom-full left-0 mb-3 z-50 w-[300px] sm:w-[340px] rounded-2xl border border-[#242424] bg-[#0B0B0B]/95 backdrop-blur-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 origin-bottom-left p-3 space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#242424] pb-2">
        <span className="text-xs font-bold text-[#F5F5F5] flex items-center gap-1.5">
          <Smile className="w-4 h-4 text-[#FF5A00]" />
          Emojis rápidos
        </span>
        <button
          type="button"
          onClick={() => setShowFullPicker(!showFullPicker)}
          className="text-[11px] font-semibold text-[#8A8A8A] hover:text-[#FF5A00] transition-colors"
        >
          {showFullPicker ? 'Grade simples' : 'Mais emojis ›'}
        </button>
      </div>

      {showFullPicker ? (
        <div className="rounded-xl overflow-hidden border border-[#242424]">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme={Theme.DARK}
            searchPlaceHolder="Buscar emoji..."
            width="100%"
            height={300}
            lazyLoadEmojis
            previewConfig={{ showPreview: false }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-6 gap-1.5 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onSelectEmoji(emoji)}
              className="w-10 h-10 rounded-xl bg-[#151515] hover:bg-[#FF5A00]/20 hover:scale-110 active:scale-95 transition-all text-xl flex items-center justify-center"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
