'use client'

import { useRef, useEffect } from 'react'
import { ChatHeader } from './chat-header'
import { ChatMessage } from './chat-message'
import { ChatInput } from './chat-input'
import { EmptyChat } from './empty-chat'
import { ChatMessage as ChatMessageType } from '@/types'
import { Viewer } from '@/lib/useSocket'

interface ChatPanelProps {
  messages: ChatMessageType[]
  currentUserId: string | null
  viewerCount: number
  viewers: Viewer[]
  selectedColor?: string
  onSelectColor?: (color: string) => void
  onSend: (message: string) => void
  onClose?: () => void
}

export function ChatPanel({
  messages,
  currentUserId,
  viewerCount,
  viewers,
  selectedColor,
  onSelectColor,
  onSend,
  onClose
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Convert viewers to format expected by ChatHeader
  const headerViewers = viewers.map(v => ({ name: v.name, image: v.image }))

  return (
    <div className="w-full h-full flex flex-col bg-room-surface/80 backdrop-blur-xl border border-room-border rounded-2xl overflow-hidden shrink-0">
      {/* Header */}
      <ChatHeader
        viewerCount={viewerCount}
        viewers={headerViewers}
        selectedColor={selectedColor}
        onSelectColor={onSelectColor}
        onClose={onClose}
      />

      {/* Messages */}
      <div className="flex-1 min-h-0">
        {messages.length === 0 ? (
          <EmptyChat />
        ) : (
          <div
            ref={scrollRef}
            className="h-full overflow-y-auto px-4 py-3 chat-scroll"
          >
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isOwn={msg.userId === currentUserId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={onSend} />
    </div>
  )
}
