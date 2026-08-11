'use client'

import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FriendActivityData {
  id: string
  name: string
  email: string
  image?: string
  status: 'watching' | 'in_room' | 'online' | 'offline'
  videoTitle?: string
  roomId?: string
}

export function FriendActivityItem({ friend }: { friend: FriendActivityData }) {
  const router = useRouter()

  const handleJoin = () => {
    if (friend.roomId) {
      router.push(`/room/${friend.roomId}`)
    } else {
      router.push('/dashboard/friends')
    }
  }

  const isWatching = friend.status === 'watching' && friend.videoTitle
  const isInRoom = friend.status === 'in_room'

  return (
    <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-[#111111] transition-all group border border-transparent hover:border-[#242424]">
      {/* Left: Avatar & Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="relative shrink-0">
          <Avatar className="w-10 h-10 border border-[#242424]">
            <AvatarImage src={friend.image} />
            <AvatarFallback className="bg-[#151515] text-[#FF5A00] font-bold text-xs">
              {friend.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div
            className={cn(
              "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0B0B0B]",
              isWatching
                ? "bg-[#EF2020] animate-pulse"
                : isInRoom
                ? "bg-[#FFB800]"
                : friend.status === 'online'
                ? "bg-emerald-500"
                : "bg-zinc-600"
            )}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[#F5F5F5] truncate group-hover:text-[#FF5A00] transition-colors">
            {friend.name}
          </p>

          <p className="text-[11px] text-[#8A8A8A] truncate font-medium">
            {isWatching
              ? 'Assistindo agora'
              : isInRoom
              ? 'Em uma sala'
              : friend.status === 'online'
              ? 'Online'
              : 'Offline'}
          </p>

          {(isWatching || (isInRoom && friend.videoTitle)) && (
            <p className="text-[11px] text-[#FF5A00] font-semibold truncate mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF2020] animate-ping" />
              {friend.videoTitle}
            </p>
          )}
        </div>
      </div>

      {/* Action Button */}
      {(isWatching || isInRoom) && friend.roomId && (
        <button
          onClick={handleJoin}
          className="p-2 rounded-lg bg-[#FF5A00]/10 text-[#FF5A00] hover:bg-[#FF5A00] hover:text-white transition-all shrink-0"
          title="Entrar na sala"
          aria-label="Entrar na sala"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
        </button>
      )}
    </div>
  )
}
