/**
 * Utility functions for YouTube URLs, thumbnails, and metadata fetching
 */

/**
 * Check if a given URL is a valid YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  if (!url) return false
  const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i
  return regex.test(url.trim())
}

/**
 * Extract the 11-character YouTube video ID from various URL formats
 */
export function getYouTubeVideoId(url: string): string | null {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/i
  const match = url.trim().match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

/**
 * Get high-quality thumbnail image URL for a YouTube video URL
 */
export function getYouTubeThumbnail(url: string): string | null {
  const videoId = getYouTubeVideoId(url)
  if (!videoId) return null
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

/**
 * Get video cover image with fallbacks
 */
export function getVideoCover(url: string, fallbackPoster?: string): string {
  if (isYouTubeUrl(url)) {
    const thumb = getYouTubeThumbnail(url)
    if (thumb) return thumb
  }
  if (fallbackPoster) return fallbackPoster
  return 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=600&auto=format&fit=crop'
}

/**
 * Fetch YouTube video title & thumbnail via oEmbed
 */
export async function fetchYouTubeMetadata(url: string): Promise<{ title?: string; thumbnail?: string } | null> {
  if (!isYouTubeUrl(url)) return null
  const videoId = getYouTubeVideoId(url)
  const defaultThumb = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : undefined

  try {
    const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`)
    if (res.ok) {
      const data = await res.json()
      return {
        title: data.title || undefined,
        thumbnail: data.thumbnail_url || defaultThumb,
      }
    }
  } catch {
    // Ignore fetch error, use fallback
  }

  return { thumbnail: defaultThumb }
}
