'use client'

import { useState, useEffect, useRef } from 'react'
import { BarChart2, Clock, Check, X, Trophy, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Poll } from '@/types'
import { cn } from '@/lib/utils'

interface PollOverlayProps {
  poll: Poll
  currentUserId: string | null
  canManage?: boolean
  onVote: (pollId: string, optionId: string) => void
  onClosePoll: (pollId: string) => void
  isInline?: boolean
}

export function PollOverlay({
  poll,
  currentUserId,
  canManage = false,
  onVote,
  onClosePoll,
  isInline = false,
}: PollOverlayProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Calculate user voted option
  const userVotedOption = poll.options.find((opt) =>
    currentUserId ? opt.votes.includes(currentUserId) : false
  )

  // Reset dismissed state when a brand new poll appears
  useEffect(() => {
    setIsDismissed(false)
  }, [poll.id])

  // Auto-hide floating overlay on video player after timeout (unless hovered)
  useEffect(() => {
    if (isInline || isDismissed) return

    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current)
      autoHideTimerRef.current = null
    }

    if (!isHovered) {
      // If user voted, hide in 3.5s. If poll closed, hide in 4.5s. If new poll, hide in 8s.
      const delayMs = userVotedOption ? 3500 : poll.isClosed ? 4500 : 8000
      autoHideTimerRef.current = setTimeout(() => {
        setIsDismissed(true)
      }, delayMs)
    }

    return () => {
      if (autoHideTimerRef.current) {
        clearTimeout(autoHideTimerRef.current)
      }
    }
  }, [isInline, isDismissed, isHovered, userVotedOption, poll.isClosed, poll.totalVotes])

  // Countdown timer effect
  useEffect(() => {
    if (!poll.expiresAt || poll.isClosed) {
      setTimeLeft(null)
      return
    }

    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((poll.expiresAt! - Date.now()) / 1000))
      setTimeLeft(remaining)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 500)
    return () => clearInterval(interval)
  }, [poll.expiresAt, poll.isClosed])

  // Determine highest vote count for winner highlight
  const highestVoteCount = Math.max(...poll.options.map((o) => o.voteCount), 0)

  // When dismissed on video player, do not render over video (it remains accessible in ChatPanel)
  if (isDismissed && !isInline) {
    return null
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'font-mono border-2 shadow-2xl transition-all duration-300',
        isInline
          ? 'w-full bg-[#0A0A0F] border-[#FFE600]/60 p-3.5 my-2'
          : 'absolute top-14 right-3 z-30 w-80 max-w-[calc(100%-24px)] bg-[#0A0A0F]/95 backdrop-blur-md border-[#FFE600] shadow-[0_0_30px_rgba(255,230,0,0.25)] p-3.5 animate-in fade-in zoom-in-95 duration-200'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-[#222] pb-2.5 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 bg-[#FFE600] text-black flex items-center justify-center shrink-0">
            <BarChart2 className="w-3 h-3" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-black text-[#FFE600] uppercase tracking-wider block">
              {poll.isClosed ? '[ ENQUETE ENCERRADA ]' : '[ ENQUETE AO VIVO ]'}
            </span>
            <span className="text-[8px] text-[#777] block truncate">
              Por {poll.createdBy.name} • {poll.totalVotes} {poll.totalVotes === 1 ? 'voto' : 'votos'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {timeLeft !== null && timeLeft > 0 && !poll.isClosed && (
            <div className="px-1.5 py-0.5 bg-[#1F1F28] border border-[#FFE600]/40 text-[#FFE600] text-[9px] font-bold flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              <span>{timeLeft}s</span>
            </div>
          )}

          {!isInline && (
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-[#888] hover:text-white hover:bg-[#1A1A24] border border-transparent hover:border-[#333] transition-colors cursor-pointer"
              title="Ocultar do player (continua visível no chat)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Question Title */}
      <h3 className="text-[11px] font-bold text-white uppercase tracking-wide mb-3 leading-snug">
        {poll.question}
      </h3>

      {/* Options List */}
      <div className="space-y-2">
        {poll.options.map((opt) => {
          const percent =
            poll.totalVotes > 0 ? Math.round((opt.voteCount / poll.totalVotes) * 100) : 0
          const isUserVote = userVotedOption?.id === opt.id
          const isWinner = poll.isClosed && opt.voteCount > 0 && opt.voteCount === highestVoteCount

          return (
            <button
              key={opt.id}
              type="button"
              disabled={poll.isClosed}
              onClick={() => onVote(poll.id, opt.id)}
              className={cn(
                'w-full text-left p-2.5 border relative overflow-hidden transition-all text-xs font-mono group',
                poll.isClosed
                  ? 'cursor-default'
                  : 'cursor-pointer hover:border-[#FFE600] active:scale-[0.99]',
                isUserVote
                  ? 'border-[#FFE600] bg-[#1A180E]'
                  : 'border-[#222] bg-[#121218] hover:bg-[#161622]',
                isWinner && 'border-[#22C55E] shadow-[0_0_15px_rgba(34,197,94,0.3)]'
              )}
            >
              {/* Animated Fill Bar */}
              <div
                className={cn(
                  'absolute inset-y-0 left-0 transition-all duration-500',
                  isWinner
                    ? 'bg-[#22C55E]/20'
                    : isUserVote
                    ? 'bg-[#FFE600]/25'
                    : 'bg-[#333]/30'
                )}
                style={{ width: `${percent}%` }}
              />

              {/* Option Content */}
              <div className="relative z-10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={cn(
                      'w-3.5 h-3.5 border rounded-full flex items-center justify-center shrink-0 transition-colors',
                      isUserVote
                        ? 'border-[#FFE600] bg-[#FFE600] text-black'
                        : 'border-[#555] group-hover:border-[#FFE600]'
                    )}
                  >
                    {isUserVote && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>

                  <span
                    className={cn(
                      'text-[10px] font-bold uppercase truncate block',
                      isUserVote ? 'text-[#FFE600]' : 'text-white'
                    )}
                  >
                    {opt.text}
                  </span>

                  {isWinner && (
                    <Trophy className="w-3 h-3 text-[#22C55E] shrink-0 fill-[#22C55E]" />
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[9px] text-[#888]">
                    {opt.voteCount} ({percent}%)
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Host Controls */}
      {canManage && !poll.isClosed && (
        <div className="mt-3 pt-2.5 border-t border-[#1F1F28] flex justify-end">
          <button
            onClick={() => onClosePoll(poll.id)}
            className="px-2.5 py-1 bg-[#1A1A24] hover:bg-[#EF2020] hover:text-white text-[#999] border border-[#333] hover:border-[#EF2020] text-[9px] font-black uppercase transition-colors cursor-pointer"
          >
            ENCERRAR ENQUETE
          </button>
        </div>
      )}
    </div>
  )
}
