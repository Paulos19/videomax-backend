/**
  * Utility functions for YouTube URLs and thumbnails
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
  * Supported formats:
  * - https://www.youtube.com/watch?v=VIDEO_ID
  * - https://youtu.be/VIDEO_ID
  * - https://www.youtube.com/embed/VIDEO_ID
  * - https://www.youtube.com/v/VIDEO_ID
  * - https://www.youtube.com/shorts/VIDEO_ID
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
