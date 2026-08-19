'use client'

import { useRouter } from 'next/navigation'
import { Play, UserPlus, Radio } from 'lucide-react'
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
  const isOnline = friend.status === 'online' || isWatching || isInRoom

  return (
    <div className="flex items-center justify-between gap-3 p-2.5 bg-[#09090D] border border-[#1C1C24] hover:border-[#FF5A00] transition-all duration-150 group">
      {/* Left: Avatar & Info */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="relative shrink-0">
          {friend.image ? (
            <img
              src={friend.image}
              alt={friend.name}
              className="w-8 h-8 rounded border border-[#333] object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded bg-[#151520] border border-[#333] flex items-center justify-center font-mono font-bold text-[10px] text-[#FF5A00]">
              {friend.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div
            className={cn(
              'absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#050505]',
              isWatching
                ? 'bg-[#EF2020] animate-ping'
                : isInRoom
                ? 'bg-[#FF5A00]'
                : isOnline
                ? 'bg-[#22C55E]'
                : 'bg-[#555]'
            )}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-mono font-bold text-white uppercase truncate group-hover:text-[#FF5A00] transition-colors">
            {friend.name}
          </p>

          <p className="text-[9px] font-mono text-[#777] truncate">
            {isWatching
              ? 'EM TRANSMISSÃO'
              : isInRoom
              ? 'EM UMA SALA'
              : isOnline
              ? 'ONLINE'
              : 'OFFLINE'}
          </p>

          {(isWatching || (isInRoom && friend.videoTitle)) && (
            <p className="text-[9px] font-mono text-[#FF5A00] font-semibold truncate mt-0.5">
              ► {friend.videoTitle}
            </p>
          )}
        </div>
      </div>

      {/* Action Button */}
      {(isWatching || isInRoom) && friend.roomId ? (
        <button
          onClick={handleJoin}
          className="p-1.5 bg-[#FF5A00] text-black hover:bg-white transition-colors shrink-0 font-mono text-[9px] font-bold flex items-center gap-1 cursor-pointer"
          title="Entrar na sala"
        >
          <Play className="w-2.5 h-2.5 fill-black" />
          <span>ENTRAR</span>
        </button>
      ) : (
        <span className="text-[8px] font-mono text-[#555] uppercase">
          {isOnline ? 'DISPONÍVEL' : 'AUSENTE'}
        </span>
      )}
    </div>
  )
}
