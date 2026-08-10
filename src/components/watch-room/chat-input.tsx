'use client'

import { useState, useCallback, useRef } from 'react'
import { Send, Smile } from 'lucide-react'
import { EmojiPickerPopover } from './emoji-picker-popover'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSend = useCallback(() => {
    if (message.trim()) {
      onSend(message.trim())
      setMessage('')
      setShowEmojiPicker(false)
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

  return (
    <div className="p-3 border-t border-room-border relative">
      {/* Animated WhatsApp-style Emoji Picker Popover */}
      {showEmojiPicker && (
        <EmojiPickerPopover
          onSelectEmoji={handleSelectEmoji}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      <div className="flex items-center gap-2 bg-room-surface-3 border border-room-border-light rounded-[14px] px-3 py-2">
        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className={cn(
            "transition-colors p-1 rounded-lg hover:bg-room-surface-2",
            showEmojiPicker
              ? "text-room-accent"
              : "text-room-text-secondary/50 hover:text-room-text-secondary"
          )}
          aria-label="Selecionar Emoji"
          title="Escolher emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Envie uma mensagem..."
          disabled={disabled}
          className="flex-1 bg-transparent text-room-text text-sm placeholder:text-room-text-secondary/40 outline-none disabled:opacity-50"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
            message.trim()
              ? "bg-room-accent hover:bg-room-accent/90 active:scale-95 shadow-md shadow-room-accent/20"
              : "bg-room-accent/50 cursor-not-allowed"
          )}
          aria-label="Enviar mensagem"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  )
}
