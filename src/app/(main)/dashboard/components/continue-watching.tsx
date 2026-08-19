'use client'

import { Film } from 'lucide-react'
import { ContinueWatchingCard, ContinueWatchingData } from './continue-watching-card'

interface ContinueWatchingProps {
  items: ContinueWatchingData[]
}

export function ContinueWatching({ items }: ContinueWatchingProps) {
  if (items.length === 0) return null

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 border-b border-[#222] pb-2">
        <Film className="w-4 h-4 text-[#FF5A00]" />
        <span className="text-[10px] font-mono text-[#FF5A00] tracking-widest uppercase bg-[#111] px-2 py-0.5 border border-[#222]">
          [03 — CONTINUE ASSISTINDO]
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.slice(0, 2).map((item) => (
          <ContinueWatchingCard key={item.videoId} item={item} />
        ))}
      </div>
    </section>
  )
}
