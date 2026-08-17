'use client'

import { useState, useEffect, useMemo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChatMessage as ChatMessageType } from '@/types'
import { cn } from '@/lib/utils'
import { Sparkles, Shield, User } from 'lucide-react'

interface ChatMessageProps {
  message: ChatMessageType & { isSystem?: boolean; role?: 'host' | 'cohost' | 'viewer' }
  currentUserId?: string | null
  isOwn?: boolean
  onReact?: (messageId: string, emoji: string) => void
}

const QUICK_EMOJIS = ['🔥', '❤️', '😂', '😮', '😢', '👍', '🎉']

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

export function ChatMessage({ message, currentUserId, isOwn, onReact }: ChatMessageProps) {
  // Store userId -> emoji map for strictly 1 emoji reaction per user per message
  const [userReactions, setUserReactions] = useState<Record<string, string>>(
    message.userReactions || {}
  )

  // Keep state in sync with incoming props
  useEffect(() => {
    if (message.userReactions) {
      setUserReactions(message.userReactions)
    }
  }, [message.userReactions])

  const parsedContent = parseChatMessageContent(message.message, message.color, message.image)
  const effectiveUserId = currentUserId || 'me'

  // User's own currently selected reaction on this message
  const myActiveEmoji = userReactions[effectiveUserId] || null

  // Calculate aggregated emoji counts
  const aggregatedReactions = useMemo(() => {
    const counts: Record<string, number> = {}
    Object.values(userReactions).forEach((emoji) => {
      if (emoji) {
        counts[emoji] = (counts[emoji] || 0) + 1
      }
    })
    return counts
  }, [userReactions])

  const handleReact = (emoji: string) => {
    setUserReactions((prev) => {
      const next = { ...prev }
      if (next[effectiveUserId] === emoji) {
        // Toggle OFF if clicking the same emoji
        delete next[effectiveUserId]
      } else {
        // REPLACE previous reaction with new emoji
        next[effectiveUserId] = emoji
      }
      return next
    })

    // Notify parent / socket
    onReact?.(message.id, emoji)
  }

  // System Messages
  if (message.isSystem || message.userId === 'system') {
    return (
      <div className="my-3 text-center flex items-center justify-center">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-[#A0A0A0] bg-[#12121A]/80 backdrop-blur-md border border-white/10 px-3.5 py-1 rounded-full shadow-md font-medium">
          <Sparkles className="w-3 h-3 text-[#FF5A00]" />
          {parsedContent.text}
        </span>
      </div>
    )
  }

  const isHost = message.role === 'host' || message.userName?.toLowerCase().includes('host')
  const isCoHost = message.role === 'cohost'

  const userAvatarUrl = message.userImage || (typeof parsedContent.image === 'string' && parsedContent.image.length > 5 ? parsedContent.image : undefined)

  return (
    <div className={cn("group relative flex items-start gap-2.5 my-3.5 transition-all", isOwn && "flex-row-reverse")}>
      {/* Avatar */}
      <Avatar className={cn(
        "w-9 h-9 border shrink-0 shadow-md transition-transform group-hover:scale-105",
        isHost ? "border-[#FFB800] ring-2 ring-[#FFB800]/20" : isCoHost ? "border-[#00E5FF] ring-2 ring-[#00E5FF]/20" : "border-[#282838]"
      )}>
        <AvatarImage src={userAvatarUrl} />
        <AvatarFallback className="bg-[#14141E] text-[#FF5A00] font-black text-xs">
          {message.userName?.charAt(0)?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className={cn("space-y-1.5 max-w-[82%]", isOwn && "items-end text-right flex flex-col")}>
        {/* Header: Name + Badge + Timestamp */}
        <div className={cn("flex items-center gap-1.5 text-xs select-none", isOwn && "justify-end")}>
          <span className="font-bold text-[#F5F5F5] truncate max-w-[130px]">
            {message.userName}
          </span>

          {isHost && (
            <span className="text-[9px] font-black text-[#FFB800] bg-[#FFB800]/15 border border-[#FFB800]/40 px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-[0_0_8px_rgba(255,184,0,0.2)] flex items-center gap-0.5">
              <Shield className="w-2.5 h-2.5 fill-[#FFB800]" />
              HOST
            </span>
          )}

          {isCoHost && (
            <span className="text-[9px] font-black text-[#00E5FF] bg-[#00E5FF]/15 border border-[#00E5FF]/40 px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-[0_0_8px_rgba(0,229,255,0.2)] flex items-center gap-0.5">
              <User className="w-2.5 h-2.5 text-[#00E5FF]" />
              CO-HOST
            </span>
          )}

          <span className="text-[10px] text-[#71717A] font-medium">
            {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        </div>

        {/* Message Bubble Container with Quick Hover Reaction Bar */}
        <div className="relative group/bubble inline-block max-w-full">
          {/* Floating Hover Reaction Bar */}
          <div className={cn(
            "absolute -top-9 z-30 opacity-0 group-hover/bubble:opacity-100 scale-95 group-hover/bubble:scale-100 transition-all duration-200 ease-out pointer-events-none group-hover/bubble:pointer-events-auto flex items-center gap-1 bg-[#0D0D14]/95 backdrop-blur-xl border border-white/15 px-2 py-1 rounded-full shadow-2xl",
            isOwn ? "right-0" : "left-0"
          )}>
            {QUICK_EMOJIS.map((emoji) => {
              const isSelected = myActiveEmoji === emoji
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleReact(emoji)}
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all duration-150 hover:scale-135 active:scale-95",
                    isSelected ? "bg-[#FF5A00]/30 border border-[#FF5A00] shadow-[0_0_8px_rgba(255,90,0,0.5)] scale-110" : "hover:bg-white/10"
                  )}
                  title={isSelected ? `Remover reação ${emoji}` : `Reagir com ${emoji}`}
                >
                  <span>{emoji}</span>
                </button>
              )
            })}
          </div>

          {/* Bubble Render */}
          {(() => {
            if (parsedContent.type === 'sticker' && parsedContent.stickerUrl) {
              return (
                <div className={cn("mt-1 animate-message-in", isOwn ? "origin-bottom-right" : "origin-bottom-left")}>
                  <img 
                    src={parsedContent.stickerUrl} 
                    alt="Sticker" 
                    className="w-32 h-32 object-contain drop-shadow-xl hover:scale-105 transition-transform cursor-pointer"
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
                      "p-3 rounded-2xl text-xs leading-relaxed break-words rounded-tr-xs font-semibold shadow-lg transition-all animate-message-in origin-bottom-right border border-white/10",
                      isLightColor ? "text-[#090909]" : "text-white"
                    )}
                    style={{
                      backgroundColor: color,
                      boxShadow: `0 4px 16px 0 ${color}45`
                    }}
                  >
                    {parsedContent.text}
                  </div>
                )
              }
              return (
                <div className="p-3 rounded-2xl text-xs leading-relaxed break-words brand-gradient text-white font-medium rounded-tr-xs shadow-lg shadow-[#FF5A00]/25 border border-white/15 animate-message-in origin-bottom-right">
                  {parsedContent.text}
                </div>
              )
            } else {
              return (
                <div
                  className="p-3 rounded-2xl text-xs leading-relaxed break-words bg-[#161622]/90 backdrop-blur-md border border-white/10 rounded-tl-xs font-medium transition-all animate-message-in origin-bottom-left shadow-md"
                  style={{
                    borderColor: color ? `${color}50` : 'rgba(255,255,255,0.08)',
                    color: color ? (isLightColor ? '#F5F5F5' : color) : '#F5F5F5'
                  }}
                >
                  {parsedContent.text}
                </div>
              )
            }
          })()}
        </div>

        {/* Reaction Badges (Aggregated with active state indicator) */}
        {Object.keys(aggregatedReactions).length > 0 && (
          <div className={cn("flex flex-wrap items-center gap-1.5 pt-1", isOwn && "justify-end")}>
            {Object.entries(aggregatedReactions).map(([emoji, count]) => {
              const isMyReaction = myActiveEmoji === emoji
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleReact(emoji)}
                  className={cn(
                    "text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1.5 transition-all duration-150 active:scale-95 select-none",
                    isMyReaction
                      ? "bg-[#FF5A00]/20 border border-[#FF5A00]/70 text-white font-bold shadow-[0_0_10px_rgba(255,90,0,0.3)] ring-1 ring-[#FF5A00]/30"
                      : "bg-[#14141E]/80 hover:bg-[#20202E] border border-white/10 text-white/80 hover:text-white font-medium"
                  )}
                  title={isMyReaction ? `Sua reação (${emoji}). Clique para remover.` : `Reagir com ${emoji}`}
                >
                  <span className="text-xs">{emoji}</span>
                  <span className={cn("font-bold text-[10px]", isMyReaction ? "text-[#FF5A00]" : "text-[#9A9A9A]")}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
