'use client'

import { useState, useCallback } from 'react'
import { Send, Smile } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSend = useCallback(() => {
    if (message.trim()) {
      onSend(message.trim())
      setMessage('')
    }
  }, [message, onSend])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  return (
    <div className="p-3 border-t border-room-border">
      <div className="flex items-center gap-2 bg-room-surface-3 border border-room-border-light rounded-[14px] px-3 py-2">
        <button
          type="button"
          className="text-room-text-secondary/50 hover:text-room-text-secondary transition-colors"
          aria-label="Emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        <input
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
              ? "bg-room-accent hover:bg-room-accent/90 active:scale-95"
              : "bg-room-accent/70"
          )}
          aria-label="Enviar mensagem"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  )
}
