import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { getGoogleDriveFileId } from '@/lib/google-drive'

// Cache resolved direct stream endpoints in-memory for 15 minutes to avoid redundant initial warning lookups
interface CachedStreamInfo {
  downloadUrl: string
  cookieHeader: string
  contentLength?: number
  expiresAt: number
}

const streamUrlCache = new Map<string, CachedStreamInfo>()

async function resolveGoogleDriveStreamUrl(fileId: string): Promise<{ downloadUrl: string; cookieHeader: string; contentLength?: number }> {
  const cached = streamUrlCache.get(fileId)
  if (cached && cached.expiresAt > Date.now()) {
    return {
      downloadUrl: cached.downloadUrl,
      cookieHeader: cached.cookieHeader,
      contentLength: cached.contentLength,
    }
  }

  const initialUrl = `https://drive.google.com/uc?export=download&id=${fileId}`
  const res1 = await fetch(initialUrl, { redirect: 'manual' })
  const loc = res1.headers.get('location') || initialUrl

  const res2 = await fetch(loc, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } })
  const contentType = res2.headers.get('content-type') || ''
  const rawCookies = res2.headers.get('set-cookie') || ''

  // If already returning binary stream directly
  if (!contentType.includes('text/html')) {
    const info = {
      downloadUrl: loc,
      cookieHeader: rawCookies,
      contentLength: Number(res2.headers.get('content-length')) || undefined,
      expiresAt: Date.now() + 15 * 60 * 1000,
    }
    streamUrlCache.set(fileId, info)
    return info
  }

  // Parse Google Drive large-file virus warning HTML
  const text = await res2.text()

  if (text.includes('Quota exceeded') || text.includes('Too many users have viewed') || text.includes('visualizaram ou fizeram o download')) {
    throw new Error('GOOGLE_DRIVE_QUOTA_EXCEEDED')
  }

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const rawUrlOrId = searchParams.get('fileId') || searchParams.get('url') || ''
    const fileId = getGoogleDriveFileId(rawUrlOrId) || (rawUrlOrId.length >= 20 && !rawUrlOrId.includes('/') ? rawUrlOrId : null)

    if (!fileId) {
      return NextResponse.json({ error: 'ID ou Link do Google Drive inválido' }, { status: 400 })
    }

    const { downloadUrl, cookieHeader } = await resolveGoogleDriveStreamUrl(fileId)

    const audioTrackParam = searchParams.get('audioTrack')
    const requestedAudioTrack = audioTrackParam !== null && audioTrackParam !== '' ? parseInt(audioTrackParam, 10) : null
    const startTimeParam = searchParams.get('t') || searchParams.get('startTime') || '0'
    const startTime = parseFloat(startTimeParam) || 0

    // If a specific audio track was explicitly requested (e.g. Portuguese Dubbed Track 1 on an MKV file)
    if (requestedAudioTrack !== null && !isNaN(requestedAudioTrack) && requestedAudioTrack >= 0) {
      const ffmpegArgs = [
        ...(startTime > 0 ? ['-ss', String(startTime)] : []),
        '-i', downloadUrl,
        '-map', '0:v:0',
        '-map', `0:a:${requestedAudioTrack}`,
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-movflags', 'frag_keyframe+empty_moov+default_base_moof',
        '-f', 'mp4',
        'pipe:1'
      ]

      const ffmpegProc = spawn('ffmpeg', ffmpegArgs)

      const stream = new ReadableStream({
        start(controller) {
          ffmpegProc.stdout.on('data', (chunk) => {
            controller.enqueue(chunk)
          })
          ffmpegProc.stdout.on('end', () => {
            controller.close()
          })
          ffmpegProc.stderr.on('data', () => {})
          ffmpegProc.on('error', (err) => {
            controller.error(err)
          })
        },
        cancel() {
          try { ffmpegProc.kill() } catch {}
        }
      })

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'video/mp4',
          'Accept-Ranges': 'none',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    // Default fast direct streaming proxy with full byte-range support
    const rangeHeader = req.headers.get('range')
    const fetchHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    }
    if (cookieHeader) {
      fetchHeaders['Cookie'] = cookieHeader
    }
    if (rangeHeader) {
      fetchHeaders['Range'] = rangeHeader
    }

    const driveRes = await fetch(downloadUrl, {
      headers: fetchHeaders,
    })

    const resContentType = driveRes.headers.get('content-type') || ''

    if (resContentType.includes('text/html')) {
      streamUrlCache.delete(fileId)
      const htmlText = await driveRes.text()
      if (htmlText.includes('Quota exceeded') || htmlText.includes('Too many users')) {
        return NextResponse.json({
          error: 'quota_exceeded',
          message: 'Cota de download do Google Drive excedida temporariamente pelo Google.'
        }, { status: 429 })
      }
      return NextResponse.json({ error: 'Resposta inválida do Google Drive' }, { status: 502 })
    }

    if (!driveRes.ok && driveRes.status !== 206) {
      streamUrlCache.delete(fileId)
      return NextResponse.json({ error: 'Falha ao buscar vídeo no Google Drive' }, { status: driveRes.status })
    }

    const responseHeaders = new Headers()
    responseHeaders.set('Content-Type', 'video/mp4')
    responseHeaders.set('Accept-Ranges', 'bytes')
    responseHeaders.set('Access-Control-Allow-Origin', '*')

    const contentLength = driveRes.headers.get('content-length')
    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength)
    }

    const contentRange = driveRes.headers.get('content-range')
    if (contentRange) {
      responseHeaders.set('Content-Range', contentRange)
    }

    return new NextResponse(driveRes.body, {
      status: driveRes.status,
      headers: responseHeaders,
    })

  } catch (err: any) {
    if (err?.message === 'GOOGLE_DRIVE_QUOTA_EXCEEDED') {
      return NextResponse.json({
        error: 'quota_exceeded',
        message: 'A cota de download deste arquivo no Google Drive foi excedida temporariamente pelo Google.'
      }, { status: 429 })
    }
    console.error('[DriveStream] Erro no streaming:', err)
    return NextResponse.json({ error: 'Erro interno ao processar stream do Google Drive' }, { status: 500 })
  }
}

