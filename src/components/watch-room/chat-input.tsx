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
    <div className="p-3 border-t border-[#242424] bg-[#090909] relative shrink-0">
      {/* Popovers */}
      {showEmojiPicker && (
        <EmojiPickerPopover
          onSelectEmoji={handleSelectEmoji}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}
      
      {showStickerPicker && (
        <div className="absolute bottom-[70px] left-3 z-50">
          <StickerPicker
            onSelectSticker={handleSelectSticker}
            onClose={() => setShowStickerPicker(false)}
          />
        </div>
      )}

      <div className="flex items-center gap-2 bg-[#151515] border border-[#292929] focus-within:border-[#FF5A00] rounded-2xl px-3 py-2 h-[52px] transition-all">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => { setShowEmojiPicker((prev) => !prev); setShowStickerPicker(false) }}
            className={cn(
              "p-1.5 rounded-xl transition-colors hover:bg-[#242424]",
              showEmojiPicker ? "text-[#FF5A00]" : "text-[#8A8A8A] hover:text-[#F5F5F5]"
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
              "p-1.5 rounded-xl transition-colors hover:bg-[#242424]",
              showStickerPicker ? "text-[#FF5A00]" : "text-[#8A8A8A] hover:text-[#F5F5F5]"
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
          className="flex-1 bg-transparent text-[#F5F5F5] text-xs sm:text-sm placeholder:text-[#5F5F5F] outline-none disabled:opacity-50"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0",
            message.trim()
              ? "brand-gradient text-white brand-glow-strong hover:brightness-110 active:scale-95 shadow-md shadow-[#FF5A00]/20"
              : "bg-[#242424] text-[#5F5F5F] cursor-not-allowed"
          )}
          aria-label="Enviar mensagem"
        >
          <Send className="w-4 h-4 text-white fill-white" />
        </button>
      </div>
    </div>
  )
}
