'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Send, Smile, Sticker, Reply, X, Crown } from 'lucide-react'
import { EmojiPickerPopover } from './emoji-picker-popover'
import { StickerPicker } from './sticker-picker'
import { ChatReplyInfo } from '@/types'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (message: string, type?: 'text' | 'sticker', stickerUrl?: string, replyTo?: ChatReplyInfo | null) => void
  disabled?: boolean
  replyingTo?: ChatReplyInfo | null
  onCancelReply?: () => void
  isPro?: boolean
}

export function ChatInput({
  onSend,
  disabled,
  replyingTo,
  onCancelReply,
  isPro = false,
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showStickerPicker, setShowStickerPicker] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (replyingTo && inputRef.current) {
      inputRef.current.focus()
    }
  }, [replyingTo])

  const handleSend = useCallback(() => {
    if (message.trim()) {
      onSend(message.trim(), 'text', undefined, replyingTo)
      setMessage('')
      setShowEmojiPicker(false)
      setShowStickerPicker(false)
    }
  }, [message, onSend, replyingTo])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      } else if (e.key === 'Escape' && replyingTo) {
        onCancelReply?.()
      }
    },
    [handleSend, replyingTo, onCancelReply]
  )

  const handleSelectEmoji = useCallback((emoji: string) => {
    setMessage((prev) => prev + emoji)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleSelectSticker = useCallback(
    (url: string) => {
      onSend('', 'sticker', url, replyingTo)
      setShowStickerPicker(false)
    },
    [onSend, replyingTo]
  )

  return (
    <div className="p-3 bg-slate-50 dark:bg-[#08080C] border-t border-slate-200 dark:border-[#1F1F28] relative shrink-0 font-mono select-none transition-colors">
      
      {/* Popovers */}
      {showEmojiPicker && (
        <EmojiPickerPopover
          onSelectEmoji={handleSelectEmoji}
          onClose={() => setShowEmojiPicker(false)}
          isPro={isPro}
        />
      )}

      {showStickerPicker && (
        <div className="absolute bottom-[75px] left-2 right-2 sm:left-3 sm:right-auto z-50">
          <StickerPicker
            onSelectSticker={handleSelectSticker}
            onClose={() => setShowStickerPicker(false)}
          />
        </div>
      )}

      {/* Replying Preview Banner */}
      {replyingTo && (
        <div
          className={cn(
            'mb-2 p-2 border-l-4 flex items-center justify-between gap-2 text-xs font-mono animate-in slide-in-from-bottom duration-150',
            isPro
              ? 'border-amber-400 dark:border-[#FFE600] bg-amber-50 dark:bg-[#1A1408] text-slate-900 dark:text-white shadow-sm'
              : 'border-[#FF5A00] bg-orange-50 dark:bg-[#120F0C] text-slate-900 dark:text-white'
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Reply className="w-3.5 h-3.5 text-[#FF5A00] shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-[10px] text-[#FF5A00] block truncate">
                Respondendo a @{replyingTo.userName}
              </span>
              <span className="text-[10px] text-slate-600 dark:text-[#AAA] truncate block">
                {replyingTo.text}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="p-1 text-slate-400 dark:text-[#777] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Cancelar resposta"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-center gap-1.5 bg-white dark:bg-[#050508] border border-slate-300 dark:border-[#222] focus-within:border-[#FF5A00] transition-colors p-1 shadow-xs">
        {/* Emoji Button */}
        <button
          type="button"
          onClick={() => {
            setShowEmojiPicker(!showEmojiPicker)
            setShowStickerPicker(false)
          }}
          disabled={disabled}
          className={cn(
            'p-1.5 transition-colors cursor-pointer',
            showEmojiPicker ? 'text-[#FF5A00]' : 'text-slate-400 dark:text-[#777] hover:text-slate-900 dark:hover:text-white'
          )}
          title="Emojis"
        >
          <Smile className="w-4 h-4" />
        </button>

        {/* Stickers Button */}
        <button
          type="button"
          onClick={() => {
            setShowStickerPicker(!showStickerPicker)
            setShowEmojiPicker(false)
          }}
          disabled={disabled}
          className={cn(
            'p-1.5 transition-colors cursor-pointer',
            showStickerPicker ? 'text-[#FF5A00]' : 'text-slate-400 dark:text-[#777] hover:text-slate-900 dark:hover:text-white'
          )}
          title="Figurinhas"
        >
          <Sticker className="w-4 h-4" />
        </button>

        {/* Input element */}
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Transmitir mensagem..."
          disabled={disabled}
          className="flex-1 bg-transparent border-0 text-slate-900 dark:text-white text-xs outline-none placeholder:text-slate-400 dark:placeholder:text-[#555] px-1.5 disabled:opacity-50"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className={cn(
            'px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed',
            isPro
              ? 'bg-amber-500 hover:bg-slate-900 dark:bg-[#FFE600] dark:hover:bg-white text-white dark:text-black shadow-sm'
              : 'bg-[#FF5A00] hover:bg-slate-900 dark:hover:bg-white text-white dark:text-black shadow-sm'
          )}
        >
          <Send className="w-3 h-3" />
          <span className="hidden sm:inline">ENVIAR</span>
        </button>
      </div>
    </div>
  )
}
