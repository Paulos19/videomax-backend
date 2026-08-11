'use client'

import { useRouter } from 'next/navigation'
import { Play } from 'lucide-react'

export interface ContinueWatchingData {
  videoId: string
  title: string
  subtitle?: string
  thumbnailUrl?: string
  progress: number // percentage 0-100
  duration?: string
  url?: string
}

export function ContinueWatchingCard({ item }: { item: ContinueWatchingData }) {
  const router = useRouter()

  const handlePlay = () => {
    // Generate a room or navigate to play
    router.push(`/dashboard/videos`)
  }

  return (
    <div
      onClick={handlePlay}
      className="group cursor-pointer bg-[#0B0B0B] border border-[#242424] hover:border-[#FF5A00]/40 rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between"
    >
      {/* Thumbnail Header */}
      <div className="relative aspect-video w-full bg-[#151515] overflow-hidden">
        {item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full brand-gradient-subtle flex items-center justify-center">
            <Play className="w-8 h-8 text-[#FF5A00]/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 rounded-full brand-gradient flex items-center justify-center text-white brand-glow-strong">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info & Progress */}
      <div className="p-3 space-y-2">
        <div>
          <h4 className="text-xs font-bold text-[#F5F5F5] group-hover:text-[#FF5A00] transition-colors truncate">
            {item.title}
          </h4>
          {item.subtitle && (
            <p className="text-[11px] text-[#8A8A8A] truncate">{item.subtitle}</p>
          )}
        </div>

        {/* Progress bar in brand gradient */}
        <div className="w-full h-1.5 bg-[#151515] rounded-full overflow-hidden">
          <div
            className="h-full brand-gradient rounded-full transition-all"
            style={{ width: `${Math.min(100, Math.max(0, item.progress))}%` }}
          />
        </div>
      </div>
    </div>
  )
}
