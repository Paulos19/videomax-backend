'use client'

import { useState, useEffect, useMemo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChatMessage as ChatMessageType, ChatReplyInfo } from '@/types'
import { cn } from '@/lib/utils'
import { Sparkles, Shield, User, Crown, Reply, Flame, Heart, Smile } from 'lucide-react'
import { ProChatAura } from './pro-chat-aura'
import { renderFormattedChatMessage, isOnlyEmojis } from './premium-emojis'

interface ChatMessageProps {
  message: ChatMessageType & { isSystem?: boolean; role?: 'host' | 'cohost' | 'viewer' }
  currentUserId?: string | null
  isOwn?: boolean
  onReact?: (messageId: string, emoji: string) => void
  onReply?: (message: ChatMessageType) => void
}

const QUICK_EMOJIS = ['🔥', '❤️', '😂', '😮', '👑', '👍', '⚡']

function parseChatMessageContent(rawMessage: string, msgColor?: string, msgImage?: string) {
  let text = rawMessage
  let color = msgColor
  let image = msgImage
  let type = 'text'
  let stickerUrl = ''
  let replyTo: ChatReplyInfo | null = null
  let isPro = false

  if (typeof rawMessage === 'string' && rawMessage.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(rawMessage)
      if (parsed && typeof parsed === 'object') {
        text = parsed.text || text
        color = parsed.color || color
        image = parsed.image || image
        type = parsed.type || type
        stickerUrl = parsed.stickerUrl || stickerUrl
        replyTo = parsed.replyTo || null
        isPro = !!parsed.isPro
      }
    } catch {
      // Not JSON
    }
  }

  return { text, color, image, type, stickerUrl, replyTo, isPro }
}

function SystemTelemetryTag({ text, timestamp }: { text: string; timestamp?: string }) {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const creationTime = timestamp ? new Date(timestamp).getTime() : Date.now()
    const elapsed = Date.now() - creationTime

    const remainingToFade = Math.max(0, 8500 - elapsed)
    const remainingToHide = Math.max(0, 10000 - elapsed)

    if (elapsed >= 10000) {
      setVisible(false)
      return
    }

    const fadeTimer = setTimeout(() => {
      setFading(true)
    }, remainingToFade)

    const hideTimer = setTimeout(() => {
      setVisible(false)
    }, remainingToHide)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [timestamp])

  if (!visible) return null

  return (
    <div
      className={cn(
        'my-1.5 text-center flex items-center justify-center font-mono transition-all duration-1000',
        fading ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      )}
    >
      <span className="inline-flex items-center gap-1.5 text-[9px] text-[#AAA] bg-[#0E0E14] border border-[#222] px-2.5 py-0.5 font-bold uppercase tracking-wider shadow-sm">
        <Sparkles className="w-3 h-3 text-[#FF5A00]" />
        {text}
      </span>
    </div>
  )
}

export function ChatMessage({ message, currentUserId, isOwn, onReact, onReply }: ChatMessageProps) {
  const [userReactions, setUserReactions] = useState<Record<string, string>>(
    message.userReactions || {}
  )
  const [showMobileActions, setShowMobileActions] = useState(false)

  useEffect(() => {
    if (message.userReactions) {
      setUserReactions(message.userReactions)
    }
  }, [message.userReactions])

  const parsedContent = parseChatMessageContent(message.message, message.color, message.image)
  const effectiveUserId = currentUserId || 'me'
  const myActiveEmoji = userReactions[effectiveUserId] || null

  const effectiveReplyTo = message.replyTo || parsedContent.replyTo
  const isMessagePro = message.isPro || parsedContent.isPro
  const isSticker = parsedContent.type === 'sticker' && !!parsedContent.stickerUrl
  const isStandaloneEmoji = !isSticker && isOnlyEmojis(parsedContent.text)

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
        delete next[effectiveUserId]
      } else {
        next[effectiveUserId] = emoji
      }
      return next
    })
    onReact?.(message.id, emoji)
  }

  // System telemetry notifications with 10s lifetime and smooth fade
  if (message.isSystem || message.userId === 'system') {
    return (
      <SystemTelemetryTag
        text={parsedContent.text}
        timestamp={message.timestamp}
      />
    )
  }

  const isHost = message.role === 'host' || message.userName?.toLowerCase().includes('host')
  const isCoHost = message.role === 'cohost'
  const userAvatarUrl =
    message.userImage ||
    (typeof parsedContent.image === 'string' && parsedContent.image.length > 5
      ? parsedContent.image
      : undefined)

  const handleColor =
    parsedContent.color ||
    (isMessagePro ? '#FFE600' : isHost ? '#FFE600' : isOwn ? '#FF5A00' : '#FFFFFF')

  return (
    <div
      className={cn(
        'group relative flex items-start gap-2.5 my-2.5 font-mono transition-all',
        isOwn && 'flex-row-reverse'
      )}
    >
      {/* Backdrop for closing mobile actions on click outside */}
      {showMobileActions && (
        <div
          className="fixed inset-0 z-20 bg-transparent"
          onClick={() => setShowMobileActions(false)}
        />
      )}

      {/* Avatar with optional PRO Glow */}
      <div className="relative shrink-0">
        <Avatar
          className={cn(
            'w-8 h-8 rounded-none border-2 shrink-0 transition-transform group-hover:scale-105',
            isMessagePro
              ? 'border-[#FFE600] shadow-[0_0_15px_rgba(255,230,0,0.5)]'
              : isHost
              ? 'border-[#FFE600]'
              : isCoHost
              ? 'border-[#00F0FF]'
              : 'border-[#333]'
          )}
        >
          <AvatarImage src={userAvatarUrl} />
          <AvatarFallback className="bg-[#121218] text-[#FF5A00] font-black text-xs rounded-none">
            {message.userName?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>

        {isMessagePro && (
          <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-[#FFE600] text-black flex items-center justify-center shadow-md">
            <Crown className="w-2.5 h-2.5 fill-black" />
          </div>
        )}
      </div>

      {/* Message Content Container */}
      <div className={cn('flex flex-col max-w-[82%]', isOwn ? 'items-end' : 'items-start')}>
        
        {/* Author Header */}
        <div className="flex items-center gap-1.5 mb-1 text-[10px]">
          <span
            style={{ color: handleColor }}
            className="font-black uppercase tracking-wider truncate max-w-[120px]"
          >
            {message.userName}
          </span>

          {isMessagePro ? (
            <span className="text-[8px] font-black bg-[#FFE600] text-black px-1 uppercase flex items-center gap-0.5 shadow-sm">
              <Crown className="w-2.5 h-2.5 fill-black" />
              MAXPRO VIP
            </span>
          ) : isHost ? (
            <span className="text-[8px] font-bold bg-[#FFE600]/20 text-[#FFE600] border border-[#FFE600]/40 px-1 uppercase">
              HOST
            </span>
          ) : isCoHost ? (
            <span className="text-[8px] font-bold bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40 px-1 uppercase">
              CO-HOST
            </span>
          ) : null}

          {message.timestamp && (
            <span className="text-[#666] text-[8px] font-mono">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}

          {/* Quick Mobile Action Trigger (Visible on touch/mobile) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setShowMobileActions((prev) => !prev)
            }}
            className="md:hidden p-0.5 text-[#777] hover:text-white transition-colors cursor-pointer"
            title="Reagir / Responder"
          >
            <Reply className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* Action Bar (Reactions + Reply button) - Accessible on Hover & Mobile Tap */}
        <div className="relative group/bubble w-full">
          <div
            className={cn(
              'transition-all duration-200 absolute -top-8 z-30 flex items-center gap-1 bg-[#0A0A0F] border border-[#FF5A00] px-1.5 py-0.5 shadow-[0_4px_20px_rgba(0,0,0,0.85)]',
              isOwn ? 'right-0' : 'left-0',
              showMobileActions
                ? 'opacity-100 scale-100 pointer-events-auto'
                : 'opacity-0 scale-95 pointer-events-none md:group-hover/bubble:opacity-100 md:group-hover/bubble:scale-100 md:group-hover/bubble:pointer-events-auto'
            )}
          >
            {/* Quick Reactions */}
            {QUICK_EMOJIS.map((emoji) => {
              const isSelected = myActiveEmoji === emoji
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleReact(emoji)
                    setShowMobileActions(false)
                  }}
                  className={cn(
                    'p-0.5 text-xs hover:scale-130 transition-transform cursor-pointer',
                    isSelected && 'bg-[#FF5A00]/20 border border-[#FF5A00]'
                  )}
                >
                  {emoji}
                </button>
              )
            })}

            <div className="w-px h-3 bg-slate-300 dark:bg-[#333] mx-0.5" />

            {/* Reply Button */}
            {onReply && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onReply(message)
                  setShowMobileActions(false)
                }}
                className="flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-[#181824] hover:bg-[#FF5A00] hover:text-white dark:hover:text-black transition-colors cursor-pointer"
                title="Responder mensagem"
              >
                <Reply className="w-3 h-3" />
                <span>RESPONDER</span>
              </button>
            )}
          </div>

          {/* ── Message Bubble Structure ─────────────────────────── */}
          <div
            onClick={() => setShowMobileActions((prev) => !prev)}
            className={cn(
              'relative select-text text-xs leading-relaxed transition-all cursor-pointer',
              isSticker
                ? 'p-0 bg-transparent border-0 shadow-none'
                : isMessagePro
                ? 'overflow-hidden p-3 bg-amber-50/80 dark:bg-[#0E0C06] border-2 border-amber-400 dark:border-[#FFE600] text-slate-900 dark:text-white shadow-sm dark:shadow-[0_0_25px_rgba(255,230,0,0.25)] animate-in fade-in zoom-in-98 duration-200'
                : isStandaloneEmoji
                ? 'p-0 bg-transparent border-0 shadow-none text-slate-900 dark:text-white'
                : isOwn
                ? 'overflow-hidden p-2.5 bg-[#FF5A00] text-white dark:text-black font-bold shadow-xs'
                : 'overflow-hidden p-2.5 bg-slate-100 dark:bg-[#121218] border border-slate-200 dark:border-[#262633] text-slate-900 dark:text-white shadow-xs'
            )}
          >
            {/* Three.js Aura Background for PRO Messages */}
            {isMessagePro && !isSticker && <ProChatAura />}

            {/* Quoted Message (Reply Preview Box) */}
            {effectiveReplyTo && (
              <div
                className={cn(
                  'mb-2 p-1.5 border-l-2 bg-black/10 dark:bg-black/40 text-[10px] space-y-0.5 relative z-10',
                  effectiveReplyTo.isPro
                    ? 'border-amber-500 dark:border-[#FFE600] text-amber-700 dark:text-[#FFE600]'
                    : 'border-[#FF5A00] text-orange-700 dark:text-[#FF5A00]'
                )}
              >
                <div className="flex items-center gap-1 font-black uppercase text-[9px]">
                  <Reply className="w-2.5 h-2.5" />
                  <span>@{effectiveReplyTo.userName}</span>
                  {effectiveReplyTo.isPro && (
                    <span className="text-[7px] bg-[#FFE600] text-black px-1 font-black">
                      VIP PRO
                    </span>
                  )}
                </div>
                <p className="text-slate-600 dark:text-[#AAA] truncate text-[9px] pl-3.5">
                  {renderFormattedChatMessage(effectiveReplyTo.text, 18, effectiveReplyTo.isPro)}
                </p>
              </div>
            )}

            {/* Main Message Text / Sticker Content */}
            <div className="relative z-10">
              {isSticker ? (
                <div className="my-1">
                  <img
                    src={parsedContent.stickerUrl}
                    alt="Sticker"
                    className="w-28 h-28 object-contain hover:scale-105 transition-transform cursor-pointer"
                  />
                </div>
              ) : isMessagePro ? (
                <div className="text-slate-900 dark:text-white font-mono font-bold leading-relaxed break-words">
                  {renderFormattedChatMessage(parsedContent.text, 34, true)}
                </div>
              ) : (
                <div className="break-words">
                  {renderFormattedChatMessage(parsedContent.text, 30, false)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Aggregated Reaction Badges */}
        {Object.keys(aggregatedReactions).length > 0 && (
          <div className={cn('flex flex-wrap items-center gap-1 pt-1.5', isOwn && 'justify-end')}>
            {Object.entries(aggregatedReactions).map(([emoji, count]) => {
              const isMyReaction = myActiveEmoji === emoji
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleReact(emoji)}
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 border flex items-center gap-1 font-mono transition-colors cursor-pointer shadow-xs',
                    isMyReaction
                      ? 'bg-orange-50 dark:bg-[#FF5A00]/20 border-[#FF5A00] text-[#FF5A00] font-black ring-1 ring-[#FF5A00]'
                      : 'bg-white dark:bg-[#121218] border-slate-300 dark:border-[#333] text-slate-700 dark:text-[#AAA] hover:border-slate-400 dark:hover:border-white'
                  )}
                >
                  <span>{emoji}</span>
                  <span className="font-bold">{count}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
