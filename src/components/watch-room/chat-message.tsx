'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChatMessage as ChatMessageType } from '@/types'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: ChatMessageType & { isSystem?: boolean; role?: 'host' | 'cohost' | 'viewer' }
  isOwn?: boolean
}

export function ChatMessage({ message, isOwn }: ChatMessageProps) {
  const [reactions, setReactions] = useState<Record<string, number>>({})

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
          {message.message}
        </span>
      </div>
    )
  }

  const isHost = message.role === 'host' || message.userName?.toLowerCase().includes('host')

  return (
    <div className={cn("group flex items-start gap-2.5 my-2.5", isOwn && "flex-row-reverse")}>
      {/* Avatar */}
      <Avatar className="w-9 h-9 border border-[#242424] shrink-0">
        <AvatarImage src={message.userImage} />
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
        <div
          className={cn(
            "p-3 rounded-2xl text-xs leading-relaxed break-words",
            isOwn
              ? "bg-gradient-to-r from-[#EF2020] via-[#FF5A00] to-[#FFB800] text-white font-medium rounded-tr-none shadow-md shadow-[#FF5A00]/10"
              : "bg-[#151515] border border-[#242424] text-[#F5F5F5] rounded-tl-none"
          )}
          style={{ color: !isOwn && message.color ? message.color : undefined }}
        >
          {message.message}
        </div>

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
