'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChatMessage as ChatMessageType } from '@/types'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: ChatMessageType & { isSystem?: boolean; role?: 'host' | 'cohost' | 'viewer' }
  isOwn?: boolean
}

function parseChatMessageContent(rawMessage: string, msgColor?: string, msgImage?: string) {
  let text = rawMessage
  let color = msgColor
  let image = msgImage
  let type = 'text'
  let stickerUrl = ''

  if (typeof rawMessage === 'string' && rawMessage.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(rawMessage)
      if (parsed && typeof parsed === 'object') {
        text = parsed.text || text
        color = parsed.color || color
        image = parsed.image || image
        type = parsed.type || type
        stickerUrl = parsed.stickerUrl || stickerUrl
      }
    } catch {
      // Not JSON
    }
  }

  return { text, color, image, type, stickerUrl }
}

export function ChatMessage({ message, isOwn }: ChatMessageProps) {
  const [reactions, setReactions] = useState<Record<string, number>>({})

  const parsedContent = parseChatMessageContent(message.message, message.color, message.image)

  const handleReact = (emoji: string) => {
    setReactions((prev) => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1,
    }))
  }

  // System Messages
  if (message.isSystem || message.userId === 'system') {
    return (
      <div className="my-2.5 text-center">
        <span className="text-[11px] text-[#8A8A8A] italic bg-[#151515]/60 border border-[#242424]/40 px-3 py-1 rounded-full">
          {parsedContent.text}
        </span>
      </div>
    )
  }

  const isHost = message.role === 'host' || message.userName?.toLowerCase().includes('host')

  const userAvatarUrl = message.userImage || (typeof parsedContent.image === 'string' && parsedContent.image.length > 5 ? parsedContent.image : undefined)

  return (
    <div className={cn("group flex items-start gap-2.5 my-2.5", isOwn && "flex-row-reverse")}>
      {/* Avatar */}
      <Avatar className="w-9 h-9 border border-[#242424] shrink-0">
        <AvatarImage src={userAvatarUrl} />
        <AvatarFallback className="bg-[#151515] text-[#FF5A00] font-bold text-xs">
          {message.userName?.charAt(0)?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className={cn("space-y-1 max-w-[80%]", isOwn && "items-end text-right")}>
        {/* Header: Name + Badge + Timestamp */}
        <div className={cn("flex items-center gap-1.5 text-xs", isOwn && "justify-end")}>
          <span className="font-bold text-[#F5F5F5] truncate max-w-[120px]">
            {message.userName}
          </span>

          {isHost && (
            <span className="text-[9px] font-extrabold text-[#FFB800] bg-[#FFB800]/10 border border-[#FFB800]/30 px-1.5 py-0.2 rounded uppercase">
              HOST
            </span>
          )}

          <span className="text-[10px] text-[#5F5F5F]">
            {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '20:15'}
          </span>
        </div>

        {/* Bubble */}
        {(() => {
          if (parsedContent.type === 'sticker' && parsedContent.stickerUrl) {
            return (
              <div className={cn("mt-1 animate-message-in", isOwn ? "origin-bottom-right" : "origin-bottom-left")}>
                <img 
                  src={parsedContent.stickerUrl} 
                  alt="Sticker" 
                  className="w-32 h-32 object-contain drop-shadow-lg hover:scale-105 transition-transform cursor-pointer"
                />
              </div>
            )
          }

          const color = parsedContent.color
          const isLightColor = color ? ['#F5F5F5', '#FFB800', '#FFFFFF', '#FDE047'].includes(color.toUpperCase()) : false

          if (isOwn) {
            if (color) {
              return (
                <div
                  className={cn(
                    "p-3 rounded-2xl text-xs leading-relaxed break-words rounded-tr-none font-semibold shadow-md transition-all animate-message-in origin-bottom-right",
                    isLightColor ? "text-[#090909]" : "text-white"
                  )}
                  style={{
                    backgroundColor: color,
                    boxShadow: `0 4px 14px 0 ${color}40`
                  }}
                >
                  {parsedContent.text}
                </div>
              )
            }
            return (
              <div className="p-3 rounded-2xl text-xs leading-relaxed break-words brand-gradient text-white font-medium rounded-tr-none shadow-md shadow-[#FF5A00]/20 animate-message-in origin-bottom-right">
                {parsedContent.text}
              </div>
            )
          } else {
            return (
              <div
                className="p-3 rounded-2xl text-xs leading-relaxed break-words bg-room-surface/80 backdrop-blur-sm border rounded-tl-none font-medium transition-all animate-message-in origin-bottom-left shadow-sm"
                style={{
                  borderColor: color ? `${color}50` : 'rgba(255,255,255,0.05)',
                  color: color ? (isLightColor ? '#F5F5F5' : color) : '#F5F5F5'
                }}
              >
                {parsedContent.text}
              </div>
            )
          }
        })()}

        {/* Reaction Counters & Hover Picker */}
        <div className={cn("flex items-center gap-1 pt-0.5", isOwn && "justify-end")}>
          {Object.entries(reactions).map(([emoji, count]) => (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              className="text-[10px] bg-[#151515] hover:bg-[#242424] border border-[#242424] px-1.5 py-0.5 rounded-full flex items-center gap-1 text-[#F5F5F5] transition-all"
            >
              <span>{emoji}</span>
              <span className="font-bold text-[#8A8A8A]">{count}</span>
            </button>
          ))}

          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            {['🔥', '❤️', '😂', '😱'].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleReact(emoji)}
                className="hover:scale-125 transition-transform text-xs"
                title={`Reagir com ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
