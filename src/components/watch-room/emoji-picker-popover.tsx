'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Theme, EmojiClickData } from 'emoji-picker-react'
import { Loader2 } from 'lucide-react'

// Dynamic import for emoji picker to ensure fast initial bundle load
const EmojiPicker = dynamic(() => import('emoji-picker-react'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[350px] bg-[#121217] rounded-2xl border border-white/10 flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-room-accent animate-spin" />
    </div>
  )
})

interface EmojiPickerPopoverProps {
  onSelectEmoji: (emoji: string) => void
  onClose: () => void
}

export function EmojiPickerPopover({ onSelectEmoji, onClose }: EmojiPickerPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)

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
      className="absolute bottom-full left-0 mb-2.5 z-50 w-[320px] sm:w-[350px] rounded-2xl border border-room-border bg-[#121217]/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-scale-in origin-bottom-left"
    >
      <style jsx global>{`
        .epr-main {
          --epr-[#121217]--bg-color: #121217 !important;
          --epr-bg-color: #121217 !important;
          --epr-category-label-bg-color: #121217 !important;
          --epr-text-color: #f4f4f5 !important;
          --epr-[#121217]--text-color: #f4f4f5 !important;
          --epr-picker-border-color: rgba(255, 255, 255, 0.08) !important;
          --epr-category-icon-active-color: #e8590c !important;
          --epr-search-input-bg-color: #1c1c24 !important;
          --epr-hover-bg-color: rgba(232, 89, 12, 0.15) !important;
          --epr-focus-bg-color: rgba(232, 89, 12, 0.2) !important;
          border: none !important;
          background-color: transparent !important;
          font-family: inherit !important;
        }
        .epr-emoji-category-label {
          font-size: 0.75rem !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          color: #a1a1aa !important;
        }
        .epr-search-container input {
          border-radius: 12px !important;
          font-size: 0.85rem !important;
        }
        .epr-emoji-img {
          transition: transform 0.15s ease !important;
        }
        .epr-emoji-img:hover {
          transform: scale(1.25) !important;
        }
      `}</style>
      <EmojiPicker
        onEmojiClick={handleEmojiClick}
        theme={Theme.DARK}
        searchPlaceHolder="Buscar emoji..."
        width="100%"
        height={340}
        lazyLoadEmojis
        previewConfig={{
          showPreview: false
        }}
      />
    </div>
  )
}
