'use client'

import { useState, useCallback, useRef } from 'react'
import { Send, Smile, Sticker } from 'lucide-react'
import { EmojiPickerPopover } from './emoji-picker-popover'
import { StickerPicker } from './sticker-picker'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (message: string, type?: 'text' | 'sticker', stickerUrl?: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showStickerPicker, setShowStickerPicker] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSend = useCallback(() => {
    if (message.trim()) {
      onSend(message.trim(), 'text')
      setMessage('')
      setShowEmojiPicker(false)
      setShowStickerPicker(false)
    }
  }, [message, onSend])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const handleSelectEmoji = useCallback((emoji: string) => {
    setMessage((prev) => prev + emoji)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleSelectSticker = useCallback((url: string) => {
    onSend('', 'sticker', url)
    setShowStickerPicker(false)
  }, [onSend])

  return (
    <div className="p-4 bg-transparent relative shrink-0">
      {/* Popovers */}
      {showEmojiPicker && (
        <EmojiPickerPopover
          onSelectEmoji={handleSelectEmoji}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}
      
      {showStickerPicker && (
        <div className="absolute bottom-[80px] left-4 z-50">
          <StickerPicker
            onSelectSticker={handleSelectSticker}
            onClose={() => setShowStickerPicker(false)}
          />
        </div>
      )}

      <div className="flex items-center gap-2 bg-room-surface/80 backdrop-blur-md border border-white/10 focus-within:border-room-accent focus-within:shadow-[0_0_20px_rgba(255,90,0,0.15)] rounded-full px-4 py-2 h-[52px] transition-all duration-300 shadow-lg">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => { setShowEmojiPicker((prev) => !prev); setShowStickerPicker(false) }}
            className={cn(
              "p-1.5 rounded-full transition-colors hover:bg-white/10",
              showEmojiPicker ? "text-room-accent" : "text-room-text-secondary hover:text-white"
            )}
            aria-label="Selecionar Emoji"
            title="Escolher emoji"
          >
            <Smile className="w-5 h-5" />
          </button>
          
          <button
            type="button"
            onClick={() => { setShowStickerPicker((prev) => !prev); setShowEmojiPicker(false) }}
            className={cn(
              "p-1.5 rounded-full transition-colors hover:bg-white/10",
              showStickerPicker ? "text-room-accent" : "text-room-text-secondary hover:text-white"
            )}
            aria-label="Selecionar Figurinha"
            title="Enviar figurinha"
          >
            <Sticker className="w-5 h-5" />
          </button>
        </div>

        <input
          ref={inputRef}
          type="text"
          maxLength={4096}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Envie uma mensagem..."
          disabled={disabled}
          className="flex-1 bg-transparent text-white text-xs sm:text-sm placeholder:text-room-text-secondary outline-none disabled:opacity-50 px-1"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0",
            message.trim()
              ? "brand-gradient text-white brand-glow-strong hover:scale-105 active:scale-95 shadow-md shadow-[#FF5A00]/20"
              : "bg-white/5 text-room-text-secondary cursor-not-allowed"
          )}
          aria-label="Enviar mensagem"
        >
          <Send className="w-4 h-4 text-white fill-white" />
        </button>
      </div>
    </div>
  )
}
