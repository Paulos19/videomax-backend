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
    <div className="p-3 bg-[#08080C] border-t border-[#1F1F28] relative shrink-0 font-mono select-none">
      
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
            'mb-2 p-2 bg-[#0E0E14] border-l-4 flex items-center justify-between gap-2 text-xs font-mono animate-in slide-in-from-bottom duration-150',
            isPro
              ? 'border-[#FFE600] bg-[#1A1408] text-white shadow-[0_0_15px_rgba(255,230,0,0.2)]'
              : 'border-[#FF5A00] bg-[#120F0C] text-white'
          )}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Reply className="w-3.5 h-3.5 text-[#FF5A00] shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-[#FF5A00] truncate">
                  RESPONDENDO A @{replyingTo.userName}
                </span>
                {replyingTo.isPro && (
                  <span className="text-[8px] bg-[#FFE600] text-black px-1 font-black">
                    VIP PRO
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#888] truncate">{replyingTo.text}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancelReply}
            className="p-1 border border-[#333] hover:border-white text-[#888] hover:text-white transition-colors cursor-pointer shrink-0"
            title="Cancelar resposta"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Input Dock */}
      <div
        className={cn(
          'flex items-center gap-2 bg-[#0C0C12] border p-1.5 transition-all',
          isPro
            ? 'border-[#333] focus-within:border-[#FFE600] focus-within:shadow-[0_0_20px_rgba(255,230,0,0.25)]'
            : 'border-[#262633] focus-within:border-[#FF5A00] focus-within:shadow-[0_0_15px_rgba(255,90,0,0.2)]'
        )}
      >
        {/* Buttons for Emoji and Stickers */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setShowEmojiPicker((prev) => !prev)
              setShowStickerPicker(false)
            }}
            className={cn(
              'p-1.5 border border-transparent hover:border-[#333] hover:text-white transition-colors cursor-pointer',
              showEmojiPicker ? 'text-[#FF5A00] border-[#FF5A00]' : 'text-[#777]'
            )}
            title="Inserir Emoji"
          >
            <Smile className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setShowStickerPicker((prev) => !prev)
              setShowEmojiPicker(false)
            }}
            className={cn(
              'p-1.5 border border-transparent hover:border-[#333] hover:text-white transition-colors cursor-pointer',
              showStickerPicker ? 'text-[#FF5A00] border-[#FF5A00]' : 'text-[#777]'
            )}
            title="Inserir Figurinha (Sticker)"
          >
            <Sticker className="w-4 h-4" />
          </button>
        </div>

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={replyingTo ? `Responder a @${replyingTo.userName}...` : 'Transmitir mensagem...'}
          disabled={disabled}
          className="flex-1 bg-transparent border-none text-white text-xs font-mono placeholder:text-[#555] outline-none select-text"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className={cn(
            'px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 select-none',
            message.trim()
              ? isPro
                ? 'bg-[#FFE600] text-black hover:bg-white cursor-pointer shadow-[0_0_15px_rgba(255,230,0,0.4)]'
                : 'bg-[#FF5A00] text-black hover:bg-white cursor-pointer shadow-[0_0_10px_rgba(255,90,0,0.3)]'
              : 'bg-[#151520] text-[#555] cursor-not-allowed border border-[#222]'
          )}
        >
          <Send className="w-3 h-3" />
          <span>ENVIAR</span>
        </button>
      </div>
    </div>
  )
}
