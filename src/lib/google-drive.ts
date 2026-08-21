/**
 * Utility functions for Google Drive shared video URLs, streaming conversion, and thumbnail generation
 */

/**
 * Check if a given URL is a valid Google Drive file or share link
 */
export function isGoogleDriveUrl(url: string): boolean {
  if (!url) return false
  const trimmed = url.trim()
  const regex = /^(https?:\/\/)?(drive|docs)\.google\.com\/(file\/d\/|open\?|uc\?|preview|thumbnail)([a-zA-Z0-9_\-\/\?&=%]+)/i
  return regex.test(trimmed)
}

/**
 * Extract Google Drive file ID from various link formats:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=drive_link
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/file/d/FILE_ID/edit
 * - https://drive.google.com/file/d/FILE_ID/preview
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID&export=download
 */
export function getGoogleDriveFileId(url: string): string | null {
  if (!url) return null
  const trimmed = url.trim()

  // Match /file/d/FILE_ID
  const matchFileD = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{20,})/i)
  if (matchFileD && matchFileD[1]) return matchFileD[1]

  // Match id=FILE_ID or fileId=FILE_ID
  const matchIdParam = trimmed.match(/[?&](?:id|fileId)=([a-zA-Z0-9_-]{20,})/i)
  if (matchIdParam && matchIdParam[1]) return matchIdParam[1]

  return null
}

/**
 * Get direct streamable URL for Google Drive video (routed via our internal Next.js stream proxy)
 */
export function getGoogleDriveStreamUrl(
  url: string,
  audioTrack?: number | null,
  startTime?: number | null
): string | null {
  const fileId = getGoogleDriveFileId(url)
  if (!fileId) return null
  const trackParam = audioTrack !== null && audioTrack !== undefined ? `&audioTrack=${audioTrack}` : ''
  const timeParam = startTime !== null && startTime !== undefined && startTime > 0 ? `&t=${Math.floor(startTime)}` : ''
  return `/api/drive-stream?fileId=${fileId}${trackParam}${timeParam}`
}


/**
 * Get embed preview URL for Google Drive video (native Google Drive player iframe)
 */
export function getGoogleDriveEmbedUrl(url: string): string | null {
  const fileId = getGoogleDriveFileId(url)
  if (!fileId) return null
  return `https://drive.google.com/file/d/${fileId}/preview`
}

/**
 * Get thumbnail image URL for Google Drive file
 */
export function getGoogleDriveThumbnail(url: string): string | null {
  const fileId = getGoogleDriveFileId(url)
  if (!fileId) return null
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`
}

/**
 * Format Google Drive video metadata for display
 */
export async function fetchGoogleDriveMetadata(
  url: string,
  customTitle?: string
): Promise<{ title?: string; thumbnail?: string } | null> {
  if (!isGoogleDriveUrl(url)) return null
  const fileId = getGoogleDriveFileId(url)
  if (!fileId) return null

  const thumbnail = getGoogleDriveThumbnail(url) || undefined
  const defaultTitle = customTitle && customTitle.trim() ? customTitle.trim() : `Google Drive Video (${fileId.slice(0, 8)}...)`

  return {
    title: defaultTitle,
    thumbnail,
  }
}
