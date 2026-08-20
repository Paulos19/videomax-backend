import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { auth } from '@/auth'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import { writeFile, readFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { randomUUID } from 'crypto'
import { checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit'

ffmpeg.setFfmpegPath(ffmpegInstaller.path)

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB max

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id || session.user.email || 'unknown'
    const rateResult = checkRateLimit(`process-sticker:${userId}`, 5, 60_000)
    if (!rateResult.allowed) {
      return NextResponse.json(
        { error: 'Muitas solicitações de processamento. Aguarde um momento.' },
        { status: 429, headers: rateLimitHeaders(rateResult) }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'O arquivo excede o limite máximo permitido de 10MB.' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const mimeType = file.type

    let processedBuffer: Buffer

    if (mimeType.startsWith('image/') && mimeType !== 'image/gif') {
      // Processamento de Imagens Estáticas via Sharp
      processedBuffer = await sharp(buffer)
        .resize({
          width: 512,
          height: 512,
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 } // transparente
        })
        .webp({ quality: 80 })
        .toBuffer()

    } else if (mimeType === 'image/gif' || mimeType.startsWith('video/')) {
      // Processamento de GIFs e Vídeos via FFmpeg
      const inputId = randomUUID()
      const ext = mimeType === 'image/gif' ? '.gif' : '.mp4'
      const inputPath = join(tmpdir(), `${inputId}${ext}`)
      const outputPath = join(tmpdir(), `${inputId}.webp`)

      await writeFile(inputPath, buffer)

      try {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Tempo limite excedido ao converter figurinha.'))
          }, 15_000)

          ffmpeg(inputPath)
            .setStartTime(0)
            .setDuration(5) // limite de 5 segundos
            .outputOptions([
              '-vcodec libwebp',
              '-vf scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black@0',
              '-lossless 0',
              '-qscale 75',
              '-loop 0',
              '-preset default',
              '-an', // remove audio
              '-vsync 0',
              '-r 15', // max 15 fps
            ])
            .toFormat('webp')
            .on('end', () => {
              clearTimeout(timeout)
              resolve()
            })
            .on('error', (err) => {
              clearTimeout(timeout)
              reject(err)
            })
            .save(outputPath)
        })

        processedBuffer = await readFile(outputPath)
      } finally {
        // Cleanup temp files
        await unlink(inputPath).catch(() => {})
        await unlink(outputPath).catch(() => {})
      }
    } else {
      return NextResponse.json({ error: 'Tipo de arquivo não suportado.' }, { status: 400 })
    }

    // Retornamos o buffer WebP diretamente
    return new NextResponse(processedBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'image/webp',
        'Content-Disposition': 'inline; filename="sticker.webp"'
      }
    })

  } catch (error) {
    console.error('Error processing sticker:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
