'use client'

import { useRef, useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Radio,
  Eye,
  EyeOff,
  Square,
  Crown,
  Monitor,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { isYouTubeUrl, getYouTubeVideoId } from '@/lib/youtube'
import YouTube from 'react-youtube'
import { RoomStandby3DView } from './room-standby-3d'

export interface VideoPlayerHandle {
  play: () => Promise<void>
  pause: () => void
  seek: (time: number) => void
  getCurrentTime: () => number
  getDuration: () => number
}

interface VideoPlayerProps {
  src?: string | null
  poster?: string
  canControl?: boolean
  isHostPro?: boolean
  onPlay?: () => void
  onPause?: () => void
  onSeek?: (time: number) => void
  onFullscreen?: () => void
  isRemoteUpdate?: boolean
  onRemoteUpdateDone?: () => void
  onCanPlay?: () => void
  isStreamingScreen?: boolean
  streamMedia?: MediaStream | null
  streamerName?: string
  isLocalStreamer?: boolean
  onStopStream?: () => void
  onSelectVideo?: () => void
  onShareScreen?: () => void
  onOpenLibrary?: () => void
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayer(
    {
      src,
      poster,
      canControl = true,
      isHostPro = false,
      onPlay,
      onPause,
      onSeek,
      onFullscreen,
      isRemoteUpdate = false,
      onRemoteUpdateDone,
      onCanPlay,
      isStreamingScreen = false,
      streamMedia = null,
      streamerName,
      isLocalStreamer = false,
      onStopStream,
      onSelectVideo,
      onShareScreen,
      onOpenLibrary,
    },
    ref
  ) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const streamVideoRef = useRef<HTMLVideoElement>(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reactPlayerRef = useRef<any>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null)
    const playPromiseRef = useRef<Promise<void> | null>(null)

    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [buffered, setBuffered] = useState(0)
    const [showControls, setShowControls] = useState(true)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [volume, setVolume] = useState(1)
    const [showLocalPreview, setShowLocalPreview] = useState(false)
    const [isHoveringProgress, setIsHoveringProgress] = useState(false)
    const [hoverTime, setHoverTime] = useState(0)

    const cleanSrc = (src || '').trim()
    const hasMedia = cleanSrc !== '' && cleanSrc !== 'EMPTY'
    const isYouTube = hasMedia && isYouTubeUrl(cleanSrc)

    // Active polling for YouTube playback time and duration
    useEffect(() => {
      if (!isYouTube) return

      const interval = setInterval(() => {
        if (reactPlayerRef.current) {
          try {
            const cur = reactPlayerRef.current.getCurrentTime?.()
            const dur = reactPlayerRef.current.getDuration?.()
            if (typeof cur === 'number' && !isNaN(cur) && cur >= 0) {
              setCurrentTime(cur)
            }
            if (typeof dur === 'number' && !isNaN(dur) && dur > 0) {
              setDuration(dur)
            }
          } catch (err) {
            // Player not ready
          }
        }
      }, 250)

      return () => clearInterval(interval)
    }, [isYouTube])

    // Expose imperative methods for remote socket control (Play, Pause, Seek, Time)
    useImperativeHandle(ref, () => ({
      play: async () => {
        if (isYouTube) {
          setIsPlaying(true)
          reactPlayerRef.current?.playVideo?.()
          return Promise.resolve()
        }
        if (videoRef.current) {
          try {
            playPromiseRef.current = videoRef.current.play()
            await playPromiseRef.current
          } catch (e) {
            // Interrupted play request
          } finally {
            playPromiseRef.current = null
          }
        }
      },
      pause: () => {
        if (isYouTube) {
          setIsPlaying(false)
          reactPlayerRef.current?.pauseVideo?.()
        } else if (videoRef.current) {
          if (playPromiseRef.current) {
            playPromiseRef.current
              .then(() => {
                videoRef.current?.pause()
              })
              .catch(() => {})
          } else {
            videoRef.current.pause()
          }
        }
      },
      seek: (time: number) => {
        if (isYouTube) {
          reactPlayerRef.current?.seekTo?.(time, true)
          setCurrentTime(time)
        } else if (videoRef.current) {
          videoRef.current.currentTime = time
          setCurrentTime(time)
        }
      },
      getCurrentTime: () => {
        if (isYouTube) {
          return reactPlayerRef.current?.getCurrentTime?.() || currentTime
        }
        return videoRef.current?.currentTime || currentTime
      },
      getDuration: () => {
        if (isYouTube) {
          return reactPlayerRef.current?.getDuration?.() || duration
        }
        return videoRef.current?.duration || duration
      },
    }))

    // WebRTC Screen Stream media binding
    useEffect(() => {
      if (streamVideoRef.current && streamMedia) {
        streamVideoRef.current.srcObject = streamMedia
        streamVideoRef.current.play().catch(() => {})
      }
    }, [streamMedia, isStreamingScreen, showLocalPreview])

    // Controls timeout
    const resetControlsTimeout = useCallback(() => {
      setShowControls(true)
      if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current)
      hideControlsTimeout.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false)
        }
      }, 4000)
    }, [isPlaying])

    const togglePlay = useCallback(() => {
      if (!canControl) return
      if (isPlaying) {
        if (isYouTube) {
          reactPlayerRef.current?.pauseVideo?.()
        } else {
          videoRef.current?.pause()
        }
        setIsPlaying(false)
        onPause?.()
      } else {
        if (isYouTube) {
          reactPlayerRef.current?.playVideo?.()
        } else {
          videoRef.current?.play()?.catch(() => {})
        }
        setIsPlaying(true)
        onPlay?.()
      }
    }, [canControl, isPlaying, isYouTube, onPause, onPlay])

    const toggleMute = useCallback(() => {
      if (isYouTube) {
        if (isMuted) {
          reactPlayerRef.current?.unMute?.()
          setIsMuted(false)
        } else {
          reactPlayerRef.current?.mute?.()
          setIsMuted(true)
        }
      } else if (videoRef.current) {
        videoRef.current.muted = !isMuted
        setIsMuted(!isMuted)
      }
    }, [isMuted, isYouTube])

    const toggleFullscreen = useCallback(() => {
      if (!containerRef.current) return
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
      } else {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
      }
      onFullscreen?.()
    }, [onFullscreen])

    const handleSeek = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!canControl) return

        let totalDuration = duration
        if (totalDuration <= 0) {
          if (isYouTube) {
            totalDuration = reactPlayerRef.current?.getDuration?.() || 0
          } else if (videoRef.current) {
            totalDuration = videoRef.current.duration || 0
          }
        }

        if (totalDuration <= 0) return

        const rect = e.currentTarget.getBoundingClientRect()
        const clickPos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        const targetTime = clickPos * totalDuration

        if (isYouTube) {
          reactPlayerRef.current?.seekTo?.(targetTime, true)
        } else if (videoRef.current) {
          videoRef.current.currentTime = targetTime
        }
        setCurrentTime(targetTime)
        onSeek?.(targetTime)
      },
      [canControl, duration, isYouTube, onSeek]
    )

    const handleProgressMouseMove = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        const totalDuration = duration || (isYouTube ? reactPlayerRef.current?.getDuration?.() || 0 : 0)
        if (totalDuration <= 0) return
        const rect = e.currentTarget.getBoundingClientRect()
        const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        setHoverTime(pos * totalDuration)
      },
      [duration, isYouTube]
    )

    // Check if room is in standby state (no stream, no video)
    if (!isStreamingScreen && !hasMedia) {
      return (
        <div
          ref={containerRef}
          className="relative w-full h-full min-h-[380px] bg-[#050508] border border-[#1F1F28]"
        >
          <RoomStandby3DView
            isPro={isHostPro}
            canControl={canControl}
            onSelectVideo={onSelectVideo}
            onShareScreen={onShareScreen}
            onOpenLibrary={onOpenLibrary}
          />
        </div>
      )
    }

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

    return (
      <div
        ref={containerRef}
        onMouseMove={resetControlsTimeout}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        className="relative w-full h-full min-h-[380px] bg-black border border-[#1F1F28] overflow-hidden select-none flex items-center justify-center group"
      >
        {/* ── Screen Stream Mode ────────────────────────────────────── */}
        {isStreamingScreen ? (
          isLocalStreamer && !showLocalPreview ? (
            /* Local Streamer Infographic (Mirror Prevention) */
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#09090D] p-6 text-center space-y-4 font-mono">
              <div className="w-12 h-12 bg-[#EF2020] text-white flex items-center justify-center animate-pulse shadow-[0_0_25px_rgba(239,32,32,0.5)]">
                <Monitor className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-white uppercase tracking-wider">
                  SUA TELA ESTÁ SENDO TRANSMITIDA
                </h3>
                <p className="text-xs text-[#888] max-w-md mx-auto">
                  A prévia local foi pausada nesta janela para evitar o efeito túnel/espelho infinito. Todos os outros participantes estão assistindo com áudio em sincronia.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                {onStopStream && (
                  <button
                    onClick={onStopStream}
                    className="px-4 py-2 bg-[#EF2020] hover:bg-white text-white hover:text-black font-black text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>PARAR TRANSMISSÃO</span>
                  </button>
                )}

                <button
                  onClick={() => setShowLocalPreview(true)}
                  className="px-4 py-2 border border-[#333] hover:border-white text-[#AAA] hover:text-white font-bold text-xs uppercase transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>VER PRÉVIA</span>
                </button>
              </div>
            </div>
          ) : (
            /* Stream Video Viewport */
            <div className="relative w-full h-full bg-black flex items-center justify-center">
              <video
                ref={streamVideoRef}
                autoPlay
                playsInline
                muted={isLocalStreamer ? true : isMuted}
                className="w-full h-full object-contain"
              />

              {/* Stream Top HUD */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-30 pointer-events-auto">
                <div className="flex items-center gap-2 bg-[#EF2020] text-white text-[10px] font-mono font-black px-3 py-1 uppercase shadow-lg">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>
                    TELA AO VIVO // {isLocalStreamer ? 'SUA TELA' : streamerName || 'HOST'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isLocalStreamer && (
                    <button
                      onClick={() => setShowLocalPreview(false)}
                      className="px-2.5 py-1 bg-[#121218] border border-[#333] text-white font-mono text-[9px] uppercase hover:border-white"
                    >
                      <EyeOff className="w-3 h-3 inline mr-1 text-[#FFE600]" />
                      OCULTAR PRÉVIA
                    </button>
                  )}

                  {isLocalStreamer && onStopStream && (
                    <button
                      onClick={onStopStream}
                      className="px-3 py-1 bg-[#EF2020] hover:bg-white text-white hover:text-black font-mono font-black text-[9px] uppercase transition-colors"
                    >
                      PARAR TELA
                    </button>
                  )}
                </div>
              </div>

              {/* Stream Bottom Audio/Fullscreen Controls */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-30 bg-[#09090D]/85 border border-[#222] px-4 py-2 font-mono">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-[#FF5A00] transition-colors flex items-center gap-2 text-[11px] font-bold uppercase cursor-pointer"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-[#EF2020]" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-[#22C55E]" />
                  )}
                  <span>{isMuted ? 'ÁUDIO MUDO' : 'ÁUDIO DO SISTEMA ATIVO'}</span>
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="text-[#888] hover:text-white transition-colors p-1 cursor-pointer"
                  title="Tela cheia"
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )
        ) : isYouTube ? (
          /* YouTube Player */
          <div className="w-full h-full relative pointer-events-auto overflow-hidden">
            <YouTube
              videoId={getYouTubeVideoId(cleanSrc) || ''}
              className="w-full h-full pointer-events-none"
              iframeClassName="w-full h-full scale-[1.2]"
              opts={{
                width: '100%',
                height: '100%',
                playerVars: {
                  autoplay: 1,
                  controls: 0,
                  modestbranding: 1,
                  rel: 0,
                  disablekb: 1,
                  fs: 0,
                  iv_load_policy: 3,
                },
              }}
              onReady={(e) => {
                reactPlayerRef.current = e.target
                if (isMuted) e.target.mute()
                else e.target.unMute()
                e.target.setVolume(volume * 100)
                if (isPlaying) e.target.playVideo()
                const dur = e.target.getDuration()
                if (dur > 0) setDuration(dur)
                const cur = e.target.getCurrentTime()
                if (cur > 0) setCurrentTime(cur)
                setIsLoading(false)
                onCanPlay?.()
              }}
              onPlay={() => {
                setIsPlaying(true)
                onPlay?.()
              }}
              onPause={() => {
                setIsPlaying(false)
                onPause?.()
              }}
              onStateChange={(e) => {
                if (e.data === 1) setIsPlaying(true)
                else if (e.data === 2) setIsPlaying(false)
                else if (e.data === 3) setIsLoading(true)
                else setIsLoading(false)

                try {
                  const dur = e.target.getDuration()
                  if (dur > 0) setDuration(dur)
                  const cur = e.target.getCurrentTime()
                  if (cur > 0) setCurrentTime(cur)
                } catch (err) {}
              }}
            />
          </div>
        ) : (
          /* HTML5 Video Player */
          <video
            ref={videoRef}
            src={cleanSrc}
            poster={poster}
            className="w-full h-full object-contain"
            onTimeUpdate={() => {
              if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime)
              }
            }}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                setDuration(videoRef.current.duration)
                setIsLoading(false)
              }
            }}
            onPlay={() => {
              setIsPlaying(true)
              onPlay?.()
            }}
            onPause={() => {
              setIsPlaying(false)
              onPause?.()
            }}
            onCanPlay={() => {
              setIsLoading(false)
              onCanPlay?.()
            }}
            onClick={togglePlay}
          />
        )}

        {/* ── Overlay Controls for Video Playback ───────────────────── */}
        {!isStreamingScreen && hasMedia && (
          <>
            {/* Click to play/pause hit layer */}
            <div
              onClick={canControl ? togglePlay : undefined}
              className={cn(
                'absolute inset-0 z-10',
                canControl ? 'cursor-pointer' : 'cursor-default'
              )}
            />

            {/* Top Telemetry Overlay */}
            <div
              className={cn(
                'absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-20 transition-opacity duration-300 font-mono pointer-events-auto',
                showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
              )}
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#EF2020] text-white text-[9px] font-black uppercase shadow-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>TRANSMISSÃO SINCRONIZADA</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0E0E14] border border-[#222] text-[#888] text-[9px] uppercase">
                {canControl ? (
                  <span className="text-[#FFE600] font-bold">CONTROLE LIBERADO</span>
                ) : (
                  <span>MODO ESPECTADOR</span>
                )}
              </div>
            </div>

            {/* Bottom Cyberpunk Control Bar */}
            <div
              className={cn(
                'absolute bottom-0 left-0 right-0 z-30 p-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent border-t border-[#1F1F28] transition-opacity duration-300 pointer-events-auto font-mono',
                showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
              )}
            >
              {/* Progress Timeline Hit Area */}
              <div
                onClick={handleSeek}
                onMouseEnter={() => setIsHoveringProgress(true)}
                onMouseLeave={() => setIsHoveringProgress(false)}
                onMouseMove={handleProgressMouseMove}
                className={cn(
                  'w-full py-2 -my-2 relative flex items-center group/progress transition-all',
                  canControl ? 'cursor-pointer' : 'cursor-default'
                )}
              >
                {/* Visual Progress Track */}
                <div className="w-full h-2 bg-[#1C1C24] relative overflow-hidden transition-all group-hover/progress:h-3">
                  <div
                    className="h-full bg-[#FF5A00] transition-all relative"
                    style={{
                      width: `${progressPercent}%`,
                    }}
                  >
                    <span className="absolute right-0 top-0 bottom-0 w-1.5 bg-white shadow-[0_0_10px_#FFF]" />
                  </div>
                </div>

                {/* Hover Time Tooltip */}
                {isHoveringProgress && canControl && duration > 0 && (
                  <div
                    className="absolute -top-7 -translate-x-1/2 bg-[#0A0A0F] border border-[#FF5A00] px-2 py-0.5 text-[9px] font-mono font-bold text-white shadow-lg pointer-events-none z-40"
                    style={{
                      left: `${(hoverTime / duration) * 100}%`,
                    }}
                  >
                    {formatTime(hoverTime)}
                  </div>
                )}
              </div>

              {/* Bottom Buttons Row */}
              <div className="flex items-center justify-between pt-3">
                <div className="flex items-center gap-3">
                  {canControl && (
                    <button
                      onClick={togglePlay}
                      className="p-2 bg-[#FF5A00] hover:bg-white text-black transition-colors cursor-pointer"
                      title={isPlaying ? 'Pausar' : 'Reproduzir'}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-black" />
                      ) : (
                        <Play className="w-4 h-4 fill-black ml-0.5" />
                      )}
                    </button>
                  )}

                  <button
                    onClick={toggleMute}
                    className="p-2 border border-[#333] hover:border-white text-[#AAA] hover:text-white transition-colors cursor-pointer"
                    title={isMuted ? 'Ativar som' : 'Desativar som'}
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-[#EF2020]" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>

                  <span className="text-xs text-[#AAA] font-mono tracking-wider">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 border border-[#333] hover:border-white text-[#AAA] hover:text-white transition-colors cursor-pointer"
                    title="Tela cheia"
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }
)
