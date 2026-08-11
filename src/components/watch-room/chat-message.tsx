'use client'

import { cn } from '@/lib/utils'
import { ChatMessage as ChatMessageType } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface ChatMessageProps {
  message: ChatMessageType
  isOwn: boolean
  showAvatar?: boolean
}

export function ChatMessage({ message, isOwn, showAvatar = true }: ChatMessageProps) {
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-4 animate-message-in">
        <span className="text-room-text-secondary/40 text-xs italic">{message.message}</span>
      </div>
    )
  }

  let payload = { text: message.message, color: '#7C4DFF', image: '' }
  try {
    const parsed = JSON.parse(message.message)
    if (parsed.text && typeof parsed.text === 'string') {
      payload = {
        text: parsed.text.slice(0, 4096),
        color: typeof parsed.color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(parsed.color)
          ? parsed.color : '#7C4DFF',
        image: typeof parsed.image === 'string' && /^https?:\/\//.test(parsed.image)
          ? parsed.image : ''
      }
    }
  } catch {
    // Plain text message
  }

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return ''
    try {
      const date = new Date(timestamp)
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return timestamp
    }
  }

  const timeStr = formatTime(message.timestamp)

  return (
    <div className={cn(
      "flex gap-2.5 mb-4 animate-message-in",
      isOwn ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      {showAvatar ? (
        <Avatar className="w-9 h-9 border border-room-border shrink-0 mt-5">
          <AvatarImage src={payload.image || undefined} />
          <AvatarFallback className="bg-room-surface-3 text-room-text-secondary text-xs font-medium">
            {message.userName?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-9 shrink-0" />
      )}

      {/* Content */}
      <div className={cn("flex flex-col max-w-[75%]", isOwn ? "items-end" : "items-start")}>
        {/* Name + Timestamp row */}
        <div className={cn(
          "flex items-center gap-2 mb-1 px-1",
          isOwn ? "flex-row-reverse" : "flex-row"
        )}>
          <span className={cn(
            "text-xs font-semibold",
            isOwn ? "text-room-text-secondary" : "text-room-accent-secondary"
          )}>
            {isOwn ? 'Você' : message.userName}
          </span>
          {timeStr && (
            <span className="text-room-text-secondary/40 text-[11px]">
              {timeStr}
            </span>
          )}
        </div>

        {/* Bubble */}
        <div
          style={{
            backgroundColor: isOwn ? '#7040FF' : '#1A1B21',
            borderColor: isOwn ? 'transparent' : 'rgba(255,255,255,0.05)',
          }}
          className={cn(
            "px-3.5 py-2 border",
            isOwn
              ? "rounded-2xl rounded-br-sm"
              : "rounded-2xl rounded-bl-sm"
          )}
        >
          <span className={cn(
            "text-sm leading-relaxed",
            isOwn ? "text-white" : "text-room-text"
          )}>
            {payload.text}
          </span>
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className={cn(
            "flex gap-1 mt-1",
            isOwn ? "justify-end" : "justify-start"
          )}>
            {message.reactions.map((reaction, i) => (
              <div
                key={i}
                className="flex items-center gap-1 bg-room-surface-3 border border-room-border rounded-full px-2 py-0.5"
              >
                <span className="text-xs">{reaction.emoji}</span>
                <span className="text-room-text-secondary text-[10px] font-medium">{reaction.count}</span>
              </div>
            ))}
          </div>
        )}

        {/* Read receipt for own messages */}
        {isOwn && (
          <span className="text-room-text-secondary/40 text-[10px] mt-1 px-1">
            ✓✓ Lida
          </span>
        )}
      </div>
    </div>
  )
}
