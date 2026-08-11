'use client'

import { Bookmark } from 'lucide-react'
import { ContinueWatchingCard, ContinueWatchingData } from './continue-watching-card'

interface ContinueWatchingProps {
  items: ContinueWatchingData[]
}

export function ContinueWatching({ items }: ContinueWatchingProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Bookmark className="w-5 h-5 text-[#FF5A00]" />
        <h2 className="text-[#F5F5F5] font-bold text-xl">Continue assistindo</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.slice(0, 3).map((item) => (
          <ContinueWatchingCard key={item.videoId} item={item} />
        ))}
      </div>
    </section>
  )
}
