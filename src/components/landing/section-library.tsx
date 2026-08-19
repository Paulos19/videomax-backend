'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Check, Search, Radio, VolumeX, Sparkles, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface MediaCard {
  id: number
  title: string
  duration: string
  category: string
  color: string
  youtubeId?: string
  mp4Url?: string
}

const SAMPLE_MEDIA: MediaCard[] = [
  {
    id: 1,
    title: 'TRAILER OFICIAL HD — SCI-FI 2026',
    duration: '02:45',
    category: 'YOUTUBE',
    color: '#FF5A00',
    youtubeId: 'L_LUpnjgPso',
  },
  {
    id: 2,
    title: 'BLENDER OPEN MOVIE — SINTEL 4K',
    duration: '14:48',
    category: 'NUVEM',
    color: '#3B82F6',
    youtubeId: 'eRsGyueVLvQ',
  },
  {
    id: 3,
    title: 'CYBERPUNK CITY FLYTHROUGH 60FPS',
    duration: '03:12',
    category: 'YOUTUBE',
    color: '#A855F7',
    youtubeId: 'dQw4w9WgXcQ',
  },
  {
    id: 4,
    title: 'BIG BUCK BUNNY ANIMATION HD',
    duration: '09:56',
    category: 'MP4 LINK',
    color: '#10B981',
    mp4Url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  },
]

function extractYouTubeId(url: string): string | null {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/
  const match = url.trim().match(regExp)
  if (match && match[2].length === 11) {
    return match[2]
  }
  return null
}

function isMp4Url(url: string): boolean {
  return /\.(mp4|webm|ogg)($|\?)/i.test(url.trim())
}

export function SectionLibrary() {
  const [urlInput, setUrlInput] = useState('')
  const [imported, setImported] = useState(false)
  const [activePreview, setActivePreview] = useState<{
    cardId: number
    youtubeId?: string
    mp4Url?: string
    title: string
  } | null>(null)

  const [countdown, setCountdown] = useState<number>(10)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Countdown and 10s auto-revert logic
  useEffect(() => {
    if (!activePreview) return

    setCountdown(10)

    // Tick every 1 second
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1))
    }, 1000)

    // Revert after 10 seconds
    timerRef.current = setTimeout(() => {
      setActivePreview(null)
      toast.info('Preview finalizado (10s)', {
        description: 'Card restaurado ao estado original.',
      })
    }, 10000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [activePreview])

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault()
    if (!urlInput.trim()) return

    const trimmed = urlInput.trim()
    const ytId = extractYouTubeId(trimmed)
    const isMp4 = isMp4Url(trimmed)

    if (!ytId && !isMp4) {
      toast.error('URL não reconhecida', {
        description: 'Insira um link válido do YouTube (ex: youtube.com/watch?v=...) ou arquivo MP4.',
      })
      return
    }

    setImported(true)
    setTimeout(() => setImported(false), 2000)

    // Trigger 10-second silent ad-free preview on Card 1 (or target card)
    setActivePreview({
      cardId: 1,
      youtubeId: ytId || undefined,
      mp4Url: isMp4 ? trimmed : undefined,
      title: ytId ? 'VÍDEO YOUTUBE CARREGADO' : 'STREAM MP4 CARREGADO',
    })

    toast.success('Vídeo carregado com sucesso!', {
      description: 'Reproduzindo preview silencioso sem anúncios por 10 segundos.',
    })
  }

  const samplePaste = (url: string) => {
    setUrlInput(url)
    const ytId = extractYouTubeId(url)
    const isMp4 = isMp4Url(url)

    setActivePreview({
      cardId: 1,
      youtubeId: ytId || undefined,
      mp4Url: isMp4 ? url : undefined,
      title: ytId ? 'YOUTUBE PREVIEW ATIVO' : 'MP4 DIRECT STREAM',
    })

    toast.success('Preset aplicado!', {
      description: 'Reproduzindo preview por 10 segundos.',
    })
  }

  const playCardDirect = (item: MediaCard) => {
    setActivePreview({
      cardId: item.id,
      youtubeId: item.youtubeId,
      mp4Url: item.mp4Url,
      title: item.title,
    })

    toast.success(`Iniciando preview de "${item.title}"`, {
      description: '10 segundos sem áudio e sem anúncios.',
    })
  }

  return (
    <section
      id="biblioteca"
      className="relative min-h-screen w-full bg-[#050505] flex flex-col justify-center py-32 overflow-hidden border-t border-[#222]"
    >
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12 w-full flex flex-col">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-20">
          <span className="text-[10px] font-mono text-[#FF5A00] tracking-widest uppercase mb-4">
            [SYS_LIBRARY: ACTIVE]
          </span>
          <h2 className="text-[50px] sm:text-[90px] lg:text-[110px] font-black leading-[0.85] tracking-tight text-white uppercase mb-8">
            Cinema<br />
            <span className="text-transparent" style={{ WebkitTextStroke: '2px #FF5A00' }}>
              Na Nuvem.
            </span>
          </h2>
          <p className="text-[14px] font-mono text-[#A3A3A3] max-w-[620px]">
            Cole links de vídeos diretos ou organize sua galeria por pastas com histórico automático de reprodução.
          </p>
        </div>

        {/* Interactive URL Importer Bar */}
        <form
          onSubmit={handleImport}
          className="w-full max-w-[840px] mx-auto bg-[#080808] border border-[#333] hover:border-[#FF5A00] transition-colors flex flex-col sm:flex-row items-center p-2 mb-6 shadow-2xl"
        >
          <div className="flex-1 flex items-center gap-3 px-4 w-full h-12">
            <span className="text-[12px] font-mono text-[#FF5A00] animate-pulse">_</span>
            <input
              type="text"
              placeholder="INSERIR LINK DO YOUTUBE OU MP4 (EX: https://youtube.com/watch?v=...)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full bg-transparent text-[11px] font-mono text-white focus:outline-none placeholder:text-[#5F5F5F]"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto h-12 bg-[#F5F5F5] hover:bg-[#FF5A00] hover:text-black text-[#050505] text-[11px] font-mono font-black px-8 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer uppercase shrink-0 shadow-[0_0_20px_rgba(255,90,0,0.2)]"
          >
            {imported ? (
              <>
                <Check className="w-4 h-4 text-black" />
                <span>CARREGADO!</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>BUSCAR VÍDEO</span>
              </>
            )}
          </button>
        </form>

        {/* Preset Quick Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-20">
          <button
            onClick={() => samplePaste('https://www.youtube.com/watch?v=L_LUpnjgPso')}
            className="text-[10px] font-mono border border-[#333] hover:border-[#FF5A00] px-4 py-2 text-[#A3A3A3] hover:text-white transition-colors cursor-pointer uppercase flex items-center gap-2 bg-[#0A0A0E]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A00]" />
            <span>[ YOUTUBE TRAILER PRESET ]</span>
          </button>
          <button
            onClick={() => samplePaste('https://www.youtube.com/watch?v=eRsGyueVLvQ')}
            className="text-[10px] font-mono border border-[#333] hover:border-[#3B82F6] px-4 py-2 text-[#A3A3A3] hover:text-white transition-colors cursor-pointer uppercase flex items-center gap-2 bg-[#0A0A0E]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
            <span>[ YOUTUBE 4K PRESET ]</span>
          </button>
          <button
            onClick={() =>
              samplePaste(
                'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
              )
            }
            className="text-[10px] font-mono border border-[#333] hover:border-[#10B981] px-4 py-2 text-[#A3A3A3] hover:text-white transition-colors cursor-pointer uppercase flex items-center gap-2 bg-[#0A0A0E]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span>[ MP4 DIRECT PRESET ]</span>
          </button>
        </div>

        {/* Brutalist Media Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-[#222]">
          {SAMPLE_MEDIA.map((item) => {
            const isPlaying = activePreview?.cardId === item.id
            const currentYtId = isPlaying ? activePreview.youtubeId || item.youtubeId : item.youtubeId
            const currentMp4Url = isPlaying ? activePreview.mp4Url || item.mp4Url : item.mp4Url

            return (
              <div
                key={item.id}
                className={`group relative bg-[#050505] border-r border-b border-[#222] transition-all duration-300 flex flex-col justify-between aspect-square overflow-hidden ${
                  isPlaying
                    ? 'border-[#FF5A00] ring-2 ring-[#FF5A00]/50 shadow-[0_0_40px_rgba(255,90,0,0.3)] z-20'
                    : 'hover:bg-[#080808]'
                }`}
              >
                {/* When preview is active: 10s muted ad-free player */}
                {isPlaying ? (
                  <div className="absolute inset-0 bg-black z-30 flex flex-col justify-between overflow-hidden">
                    
                    {/* Embedded Video Player */}
                    {currentYtId ? (
                      <div className="absolute inset-0 pointer-events-none w-full h-full">
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${currentYtId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1&enablejsapi=1`}
                          title="YouTube Preview"
                          className="w-full h-full scale-[1.35] object-cover pointer-events-none"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      </div>
                    ) : currentMp4Url ? (
                      <video
                        src={currentMp4Url}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                      />
                    ) : null}

                    {/* Cyberpunk Scanlines & Vignette Overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-25 z-10"
                      style={{
                        backgroundImage:
                          'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                        backgroundSize: '100% 3px, 6px 100%',
                      }}
                    />

                    {/* Top Telemetry Overlay */}
                    <div className="relative z-20 p-4 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#FF5A00] animate-ping" />
                        <span className="text-[10px] font-mono text-[#FF5A00] font-bold tracking-widest uppercase">
                          PREVIEW SEM ANÚNCIOS
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-black/80 px-2 py-0.5 border border-[#333] text-[9px] font-mono text-[#A3A3A3]">
                        <VolumeX className="w-3 h-3 text-[#FF5A00]" />
                        <span>MUDO</span>
                      </div>
                    </div>

                    {/* Bottom Progress & Countdown Bar */}
                    <div className="relative z-20 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-white font-bold truncate max-w-[150px]">
                          {activePreview.title}
                        </span>
                        <span className="text-[#FF5A00] font-black bg-black px-2 py-0.5 border border-[#FF5A00]/40">
                          {String(countdown).padStart(2, '0')}s
                        </span>
                      </div>

                      {/* 10s Shrinking Progress Bar */}
                      <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden border border-[#333]">
                        <motion.div
                          initial={{ width: '100%' }}
                          animate={{ width: '0%' }}
                          transition={{ duration: 10, ease: 'linear' }}
                          className="h-full bg-gradient-to-r from-[#FF5A00] to-[#FFA040]"
                        />
                      </div>
                    </div>

                  </div>
                ) : (
                  // Default Normal Card State
                  <>
                    {/* Background fill on hover */}
                    <div className="absolute inset-0 bg-[#FF5A00] scale-y-0 origin-bottom group-hover:scale-y-100 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0 opacity-10" />

                    <div className="relative z-10 flex flex-col h-full justify-between p-6">
                      <div>
                        <span
                          className="text-[10px] font-mono font-bold uppercase tracking-wider mb-4 block"
                          style={{ color: item.color }}
                        >
                          {item.category}
                        </span>
                        <h3 className="text-[18px] font-black leading-tight text-[#F5F5F5] group-hover:text-[#FF5A00] transition-colors">
                          {item.title}
                        </h3>
                      </div>

                      <div className="flex items-end justify-between">
                        <span className="text-[24px] font-mono font-black text-[#333] group-hover:text-white transition-colors">
                          {item.duration}
                        </span>

                        <button
                          onClick={() => playCardDirect(item)}
                          className="w-10 h-10 border border-[#333] group-hover:border-[#FF5A00] group-hover:bg-[#FF5A00] flex items-center justify-center transition-all cursor-pointer text-[#5F5F5F] group-hover:text-white"
                          title="Reproduzir preview de 10 segundos"
                        >
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
