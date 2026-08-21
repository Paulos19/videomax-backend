import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { getGoogleDriveFileId } from '@/lib/google-drive'

// Cache resolved direct stream endpoints in-memory for 15 minutes
interface CachedStreamInfo {
  downloadUrl: string
  cookieHeader: string
  contentLength?: number
  expiresAt: number
}

const streamUrlCache = new Map<string, CachedStreamInfo>()

async function resolveGoogleDriveStreamUrl(fileId: string): Promise<{ downloadUrl: string; cookieHeader: string }> {
  const cached = streamUrlCache.get(fileId)
  if (cached && cached.expiresAt > Date.now()) {
    return {
      downloadUrl: cached.downloadUrl,
      cookieHeader: cached.cookieHeader,
    }
  }

  const initialUrl = `https://drive.google.com/uc?export=download&id=${fileId}`
  const res1 = await fetch(initialUrl, { redirect: 'manual' })
  const loc = res1.headers.get('location') || initialUrl

  const res2 = await fetch(loc, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } })
  const contentType = res2.headers.get('content-type') || ''
  const rawCookies = res2.headers.get('set-cookie') || ''

  if (!contentType.includes('text/html')) {
    const info = {
      downloadUrl: loc,
      cookieHeader: rawCookies,
      expiresAt: Date.now() + 15 * 60 * 1000,
    }
    streamUrlCache.set(fileId, info)
    return info
  }

  const text = await res2.text()
  const actionMatch = text.match(/action="([^"]+)"/)
  const confirmMatch = text.match(/name="confirm" value="([^"]+)"/)
  const uuidMatch = text.match(/name="uuid" value="([^"]+)"/)

  const baseUrl = actionMatch ? actionMatch[1] : 'https://drive.usercontent.google.com/download'
  const confirmToken = confirmMatch ? confirmMatch[1] : 't'
  const uuidParam = uuidMatch ? `&uuid=${uuidMatch[1]}` : ''

  const finalDownloadUrl = `${baseUrl}?id=${fileId}&export=download&confirm=${confirmToken}${uuidParam}`

  const info = {
    downloadUrl: finalDownloadUrl,
    cookieHeader: rawCookies,
    expiresAt: Date.now() + 15 * 60 * 1000,
  }
  streamUrlCache.set(fileId, info)
  return info
}

interface AudioTrackInfo {
  index: number
  streamIndex: number
  codec: string
  language?: string
  title?: string
  label: string
}

const audioTracksCache = new Map<string, { tracks: AudioTrackInfo[]; expiresAt: number }>()

function getLanguageLabel(code?: string, title?: string, index?: number): string {
  if (title && title.trim()) {
    const cleanTitle = title.trim()
    if (/portugu[eê]s|dublado|brazil|brasil|pt[-_]?br|por|pob/i.test(cleanTitle)) return '🇧🇷 ' + cleanTitle
    if (/japon[eê]s|japanese|jap|jpn|ja/i.test(cleanTitle)) return '🇯🇵 ' + cleanTitle
    if (/ingl[eê]s|english|eng|en/i.test(cleanTitle)) return '🇺🇸 ' + cleanTitle
    if (/espanhol|spanish|spa|es/i.test(cleanTitle)) return '🇪🇸 ' + cleanTitle
    return cleanTitle
  }

  const normalized = (code || '').toLowerCase().trim()
  switch (normalized) {
    case 'por':
    case 'pt':
    case 'pt-br':
    case 'pt_br':
    case 'pob':
      return '🇧🇷 Português (Brasil)'
    case 'jpn':
    case 'ja':
    case 'jap':
      return '🇯🇵 Japonês (Original)'
    case 'eng':
    case 'en':
      return '🇺🇸 Inglês'
    case 'spa':
    case 'es':
      return '🇪🇸 Espanhol'
    case 'fra':
    case 'fr':
      return '🇫🇷 Francês'
    case 'deu':
    case 'ger':
    case 'de':
      return '🇩🇪 Alemão'
    case 'ita':
    case 'it':
      return '🇮🇹 Italiano'
    case 'kor':
    case 'ko':
      return '🇰🇷 Coreano'
    default:
      return `🌐 Faixa ${((index ?? 0) + 1)}`
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const rawUrlOrId = searchParams.get('fileId') || searchParams.get('url') || ''
    const fileId = getGoogleDriveFileId(rawUrlOrId) || (rawUrlOrId.length >= 20 && !rawUrlOrId.includes('/') ? rawUrlOrId : null)

    if (!fileId) {
      return NextResponse.json({ error: 'Link ou ID inválido' }, { status: 400 })
    }

    const cached = audioTracksCache.get(fileId)
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json({ tracks: cached.tracks })
    }

    const { downloadUrl, cookieHeader } = await resolveGoogleDriveStreamUrl(fileId)

    const ffprobeArgs = [
      '-v', 'error',
      ...(cookieHeader ? ['-headers', `Cookie: ${cookieHeader}\r\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\r\n`] : []),
      '-print_format', 'json',
      '-show_streams',
      downloadUrl
    ]

    const tracks = await new Promise<AudioTrackInfo[]>((resolve) => {
      const proc = spawn('ffprobe', ffprobeArgs)

      let stdout = ''
      proc.stdout.on('data', (d) => { stdout += d })

      const timeout = setTimeout(() => {
        try { proc.kill() } catch {}
        resolve([])
      }, 10000)

      proc.on('close', (code) => {
        clearTimeout(timeout)
        try {
          const parsed = JSON.parse(stdout)
          const audioStreams = (parsed.streams || []).filter((s: any) => s.codec_type === 'audio')
          const result: AudioTrackInfo[] = audioStreams.map((s: any, idx: number) => {
            const langCode = s.tags?.language || s.tags?.LANGUAGE
            const title = s.tags?.title || s.tags?.TITLE || s.tags?.handler_name
            const label = `${getLanguageLabel(langCode, title, idx)} [${(s.codec_name || 'AAC').toUpperCase()}]`
            return {
              index: idx,
              streamIndex: s.index,
              codec: s.codec_name || 'aac',
              language: langCode,
              title: title,
              label,
            }
          })
          resolve(result)
        } catch {
          resolve([])
        }
      })

      proc.on('error', () => {
        clearTimeout(timeout)
        resolve([])
      })
    })

    if (tracks.length > 0) {
      audioTracksCache.set(fileId, {
        tracks,
        expiresAt: Date.now() + 60 * 60 * 1000,
      })
    }

    return NextResponse.json({ tracks })
  } catch (err: any) {
    console.error('[AudioTracks] Erro ao identificar faixas:', err)
    return NextResponse.json({ tracks: [] })
  }
}
