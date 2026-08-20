'use client'

import { useRouter } from 'next/navigation'
import { Play, Film } from 'lucide-react'

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
    router.push(`/dashboard/videos`)
  }

  return (
    <div
      onClick={handlePlay}
      className="group cursor-pointer bg-white dark:bg-[#09090D] border border-slate-200 dark:border-[#222] hover:border-[#FF5A00] transition-all flex flex-col justify-between overflow-hidden shadow-xs dark:shadow-none"
    >
      {/* Thumbnail Header */}
      <div className="relative aspect-video w-full bg-slate-950 dark:bg-[#050508] overflow-hidden border-b border-slate-200 dark:border-[#222]">
        {item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900 dark:bg-[#121218]">
            <Film className="w-6 h-6 text-[#FF5A00]/50" />
          </div>
        )}

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 bg-[#FF5A00] flex items-center justify-center text-white dark:text-black shadow-[0_0_15px_rgba(255,90,0,0.5)]">
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </div>
        </div>

        {/* Bottom progress line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200 dark:bg-[#222]">
          <div
            className="h-full bg-[#FF5A00] shadow-[0_0_6px_#FF5A00]"
            style={{ width: `${item.progress}%` }}
          />
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h4 className="text-[11px] font-mono font-bold text-slate-900 dark:text-white uppercase group-hover:text-[#FF5A00] transition-colors truncate">
          {item.title}
        </h4>
        <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 dark:text-[#777] mt-1">
          <span>{item.subtitle || 'REPRODUÇÃO'}</span>
          <span className="text-[#FF5A00] font-bold">{item.progress}%</span>
        </div>
      </div>
    </div>
  )
}
