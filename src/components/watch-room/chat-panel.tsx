'use client'

import { useRef, useEffect, useState } from 'react'
import { ChatHeader } from './chat-header'
import { ChatMessage } from './chat-message'
import { ChatInput } from './chat-input'
import { EmptyChat } from './empty-chat'
import { ChatMessage as ChatMessageType, ChatReplyInfo } from '@/types'
import { Viewer } from '@/lib/useSocket'
import { useSession } from 'next-auth/react'

interface ChatPanelProps {
  messages: ChatMessageType[]
  currentUserId: string | null
  viewerCount: number
  viewers: Viewer[]
  selectedColor?: string
  isPro?: boolean
  onSelectColor?: (color: string) => void
  onSend: (
    message: string,
    type?: 'text' | 'sticker',
    stickerUrl?: string,
    replyTo?: ChatReplyInfo | null
  ) => void
  onReact?: (messageId: string, emoji: string) => void
  onClose?: () => void
}

function parseSnippetText(rawMessage: string): string {
  if (typeof rawMessage === 'string' && rawMessage.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(rawMessage)
      if (parsed.type === 'sticker' || parsed.stickerUrl) {
        return '[Figurinha]'
      }
      if (typeof parsed.text === 'string' && parsed.text.trim()) {
        return parsed.text.trim()
      }
    } catch {}
  }
  return typeof rawMessage === 'string' ? rawMessage : ''
}

export function ChatPanel({
  messages,
  currentUserId,
  viewerCount,
  viewers,
  selectedColor,
  isPro = false,
  onSelectColor,
  onSend,
  onReact,
  onClose,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [replyingTo, setReplyingTo] = useState<ChatReplyInfo | null>(null)
  const { data: session } = useSession()

  const currentUserPlan = (session?.user as any)?.plan || 'FREE'
  const isCurrentUserPro = isPro || currentUserPlan === 'MAXPRO' || currentUserPlan === 'PRO'

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const headerViewers = viewers.map((v) => ({ name: v.name, image: v.image }))

  const handleReplyToMessage = (msg: ChatMessageType) => {
    const textSnippet = parseSnippetText(msg.message)
    setReplyingTo({
      messageId: msg.id,
      userName: msg.userName,
      text: textSnippet.slice(0, 80),
      color: msg.color,
      isPro: msg.isPro,
    })
  }

  const handleSendMessage = (
    text: string,
    type?: 'text' | 'sticker',
    stickerUrl?: string,
    replyTo?: ChatReplyInfo | null
  ) => {
    onSend(text, type, stickerUrl, replyTo)
    setReplyingTo(null)
  }

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-[#08080C] border border-slate-200 dark:border-[#1F1F28] overflow-hidden shrink-0 shadow-sm dark:shadow-2xl transition-colors">
      {/* Header */}
      <ChatHeader
        viewerCount={viewerCount}
        viewers={headerViewers}
        selectedColor={selectedColor}
        onSelectColor={onSelectColor}
        onClose={onClose}
      />

      {/* Messages Feed */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-[#262633] scrollbar-track-transparent select-text"
      >
        {messages.length === 0 ? (
          <EmptyChat />
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              currentUserId={currentUserId}
              isOwn={msg.userId === currentUserId}
              onReact={onReact}
              onReply={handleReplyToMessage}
            />
          ))
        )}
      </div>

      {/* Message Input Footer */}
      <ChatInput
        onSend={handleSendMessage}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        isPro={isCurrentUserPro}
      />
    </div>
  )
}
