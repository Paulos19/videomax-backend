'use client'

import { useRef, useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react'
import dynamic from 'next/dynamic'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Subtitles,
  Loader2,
  Monitor,
  Square,
  Radio
} from 'lucide-react'
import { YoutubeIcon as Youtube } from '@/components/icons/youtube'
import { cn } from '@/lib/utils'
import { isYouTubeUrl, getYouTubeVideoId } from '@/lib/youtube'
import YouTube from 'react-youtube'

export interface VideoPlayerHandle {
  play: () => Promise<void>
  pause: () => void
  seek: (time: number) => void
  getCurrentTime: () => number
  getDuration: () => number
}

interface VideoPlayerProps {
  src: string
  poster?: string
  canControl?: boolean
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
}

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayer(
    {
      src,
      poster,
      canControl = true,
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
      onStopStream
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
    const [isLoading, setIsLoading] = useState(true)
    const [volume, setVolume] = useState(1)

    const isYouTube = isYouTubeUrl(src)

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
            // Ignore AbortError: The play() request was interrupted by a call to pause()
          } finally {
            playPromiseRef.current = null
          }
        }
      },
      pause: async () => {
        if (isYouTube) {
          setIsPlaying(false)
          reactPlayerRef.current?.pauseVideo?.()
        } else if (videoRef.current) {
          if (playPromiseRef.current) {
            try {
              await playPromiseRef.current
            } catch (e) {
              // Ignore
            }
          }
          videoRef.current.pause()
        }
      },
      seek: (time: number) => {
        setCurrentTime(time)
        if (isYouTube) {
          if (typeof reactPlayerRef.current?.seekTo === 'function') {
            reactPlayerRef.current.seekTo(time, true)
          }
        } else if (videoRef.current) {
          videoRef.current.currentTime = time
        }
      },
      getCurrentTime: () => {
        if (isYouTube && reactPlayerRef.current) {
          if (typeof reactPlayerRef.current.getCurrentTime === 'function') {
            return reactPlayerRef.current.getCurrentTime()
          }
          return reactPlayerRef.current.currentTime ?? currentTime
        }
        return videoRef.current?.currentTime ?? 0
      },
      getDuration: () => {
        if (isYouTube && reactPlayerRef.current) {
          if (typeof reactPlayerRef.current.getDuration === 'function') {
            return reactPlayerRef.current.getDuration()
          }
          return reactPlayerRef.current.duration ?? duration
        }
        return videoRef.current?.duration ?? duration
      }
    }))

    // Format time mm:ss
    const formatTime = (seconds: number) => {
      if (!seconds || isNaN(seconds)) return '0:00'
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Handle remote updates
    useEffect(() => {
      if (isRemoteUpdate) {
        onRemoteUpdateDone?.()
      }
    }, [isRemoteUpdate, onRemoteUpdateDone])

    // YouTube time polling
    useEffect(() => {
      if (!isYouTube || !isPlaying) return;
      const interval = setInterval(() => {
        if (reactPlayerRef.current?.getCurrentTime) {
          const time = reactPlayerRef.current.getCurrentTime();
          if (typeof time === 'number') {
             setCurrentTime(time);
          }
          const loaded = reactPlayerRef.current.getVideoLoadedFraction?.();
          if (typeof loaded === 'number' && duration > 0) {
             setBuffered(loaded * duration);
          }
        }
      }, 500);
      return () => clearInterval(interval);
    }, [isYouTube, isPlaying, duration]);

    // YouTube play/pause sync
    useEffect(() => {
      if (isYouTube && reactPlayerRef.current) {
        const state = reactPlayerRef.current.getPlayerState?.()
        if (isPlaying && state !== 1 && state !== 3) {
          reactPlayerRef.current.playVideo?.()
        } else if (!isPlaying && state === 1) {
          reactPlayerRef.current.pauseVideo?.()
        }
      }
    }, [isPlaying, isYouTube])

    // --- HTML5 Video Event Handlers ---
    const handleTimeUpdate = useCallback(() => {
      if (!isYouTube && videoRef.current) {
        setCurrentTime(videoRef.current.currentTime)
      }
    }, [isYouTube])

    const handleLoadedMetadata = useCallback(() => {
      if (!isYouTube && videoRef.current) {
        setDuration(videoRef.current.duration)
        setIsLoading(false)
      }
    }, [isYouTube])

    const handleProgress = useCallback(() => {
      if (!isYouTube && videoRef.current && videoRef.current.buffered.length > 0) {
        setBuffered(videoRef.current.buffered.end(videoRef.current.buffered.length - 1))
      }
    }, [isYouTube])

    // --- Common Play/Pause Callbacks ---
    const handlePlay = useCallback(() => {
      setIsPlaying(true)
      onPlay?.()
      startHideControlsTimer()
    }, [onPlay])

    const handlePause = useCallback(() => {
      setIsPlaying(false)
      onPause?.()
    }, [onPause])

    const handleWaiting = useCallback(() => setIsLoading(true), [])
    const handleCanPlay = useCallback(() => {
      setIsLoading(false)
      onCanPlay?.()
    }, [onCanPlay])

    // Controls visibility timer (auto-hide controls & top tags after 5s)
    const startHideControlsTimer = useCallback(() => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current)
      }
      setShowControls(true)
      if (isPlaying) {
        hideControlsTimeout.current = setTimeout(() => setShowControls(false), 5000)
      }
    }, [isPlaying])

    const handleMouseMove = useCallback(() => {
      startHideControlsTimer()
    }, [startHideControlsTimer])

    // Toggle Play/Pause safely avoiding AbortError
    const togglePlay = useCallback(async () => {
      if (isYouTube) {
        if (isPlaying) {
          setIsPlaying(false)
          reactPlayerRef.current?.pauseVideo?.()
          handlePause()
        } else {
          setIsPlaying(true)
          reactPlayerRef.current?.playVideo?.()
          handlePlay()
        }
      } else if (videoRef.current) {
        if (videoRef.current.paused) {
          try {
            playPromiseRef.current = videoRef.current.play()
            await playPromiseRef.current
          } catch (e) {
            // Ignore play interruption
          } finally {
            playPromiseRef.current = null
          }
        } else {
          if (playPromiseRef.current) {
            try {
              await playPromiseRef.current
            } catch (e) {
              // Ignore
            }
          }
          videoRef.current.pause()
        }
      }
    }, [isYouTube, isPlaying, handlePlay, handlePause])

    // Toggle Mute
    const toggleMute = useCallback(() => {
      const newMuted = !isMuted
      setIsMuted(newMuted)
      if (isYouTube && reactPlayerRef.current) {
        if (newMuted) reactPlayerRef.current.mute?.()
        else reactPlayerRef.current.unMute?.()
      } else if (!isYouTube && videoRef.current) {
        videoRef.current.muted = newMuted
      }
    }, [isMuted, isYouTube])

    // Seek handler
    const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const time = parseFloat(e.target.value)
      setCurrentTime(time)
      if (isYouTube) {
        if (typeof reactPlayerRef.current?.seekTo === 'function') {
          reactPlayerRef.current.seekTo(time, true)
        }
      } else if (videoRef.current) {
        videoRef.current.currentTime = time
      }
      onSeek?.(time)
    }, [isYouTube, onSeek])

    // Fullscreen handler
    const toggleFullscreen = useCallback(() => {
      if (!containerRef.current) return

      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
      onFullscreen?.()
    }, [onFullscreen])

    useEffect(() => {
      const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement)
      }
      document.addEventListener('fullscreenchange', handleFullscreenChange)
      return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }, [])

    useEffect(() => {
      if (isStreamingScreen && streamVideoRef.current && streamMedia) {
        streamVideoRef.current.srcObject = streamMedia
      }
    }, [isStreamingScreen, streamMedia])

    // Progress percentage
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0
    const bufferedProgress = duration > 0 ? (buffered / duration) * 100 : 0

    return (
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-[#050507] rounded-2xl overflow-hidden border border-[#242424] group flex items-center justify-center shrink-0"
        style={{ touchAction: 'manipulation' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {/* Render Live WebRTC Screen Stream when active */}
        {isStreamingScreen ? (
          <div className="relative w-full h-full bg-black flex items-center justify-center">
            <video
              ref={streamVideoRef}
              autoPlay
              playsInline
              muted={isLocalStreamer ? true : isMuted}
              className="w-full h-full object-contain"
            />

            {/* Top Stream Status Overlay */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-30 pointer-events-auto">
              <div className="flex items-center gap-2 bg-red-600/90 backdrop-blur-md text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg border border-red-500/30">
                <Radio className="w-4 h-4 animate-pulse text-white" />
                <span>TELA AO VIVO — {isLocalStreamer ? 'Sua Tela' : streamerName || 'Host'}</span>
              </div>

              {isLocalStreamer && onStopStream && (
                <button
                  onClick={onStopStream}
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 border border-red-400/40"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>Parar Transmissão</span>
                </button>
              )}
            </div>

            {/* Stream View Controls (Mute/Unmute & Fullscreen for viewers) */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-30 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="text-white/80 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
                >
                  {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
                  <span>{isMuted ? 'Áudio Mudo' : 'Áudio do Sistema Ativo'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="text-white/80 hover:text-white transition-colors p-1"
                  aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
                >
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        ) : isYouTube && src ? (
          <div className="w-full h-full relative pointer-events-auto overflow-hidden">
            <YouTube
              videoId={getYouTubeVideoId(src) || ''}
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
                  iv_load_policy: 3
                }
              }}
              onReady={(e) => {
                console.log('YouTube onReady fired')
                reactPlayerRef.current = e.target
                if (isMuted) e.target.mute()
                else e.target.unMute()
                e.target.setVolume(volume * 100)
                
                if (isPlaying) {
                  e.target.playVideo()
                }
                
                const dur = e.target.getDuration()
                if (dur > 0) setDuration(dur)
                
                setIsLoading(false)
                onCanPlay?.()
              }}
              onPlay={() => {
                console.log('YouTube onPlay fired')
                handlePlay()
              }}
              onPause={() => {
                console.log('YouTube onPause fired')
                handlePause()
              }}
              onError={(e) => {
                console.warn('YouTube Error:', e?.data || e)
                setIsLoading(false)
              }}
              onStateChange={(e) => {
                // 1=playing, 2=paused, 3=buffering
                if (e.data === 1 && !isPlaying) handlePlay()
                if (e.data === 2 && isPlaying) handlePause()
                if (e.data === 3) setIsLoading(true)
                else setIsLoading(false)
              }}
            />
          </div>
        ) : (
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            className="w-full h-full object-contain"
            style={{ touchAction: 'manipulation' }}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onProgress={handleProgress}
            onPlay={handlePlay}
            onPause={handlePause}
            onWaiting={handleWaiting}
            onCanPlay={handleCanPlay}
            onClick={togglePlay}
          />
        )}

        {/* Click layer to toggle play/pause */}
        <div
          className={cn("absolute inset-0 z-10", canControl ? "cursor-pointer" : "cursor-default")}
          style={{ touchAction: 'manipulation' }}
          onClick={canControl ? togglePlay : undefined}
        />

        {/* Top Overlay Bar: AO VIVO + Sincronizado + Host Pill (Auto-hides after 5s) */}
        <div
          className={cn(
            "absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-20 transition-opacity duration-300 pointer-events-auto",
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="flex items-center gap-1.5 bg-[#EF2020] text-white text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider shadow-lg shadow-[#EF2020]/30 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              AO VIVO
            </div>

            <div
              className="flex items-center gap-1 bg-black/70 backdrop-blur-md border border-white/10 text-white text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg truncate"
              title="Seu vídeo é sincronizado automaticamente com o host desta sala."
            >
              <span className="text-[#FFB800]">⚡</span>
              <span className="truncate">Sincronizado <span className="hidden sm:inline">com Host</span></span>
              <span className="text-[10px] text-[#8A8A8A] font-mono cursor-help hidden xs:inline">ⓘ</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md border border-white/10 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg text-[11px] sm:text-xs font-bold text-[#F5F5F5] shrink-0">
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#FF5A00] flex items-center justify-center text-[9px] sm:text-[10px] text-white font-extrabold">
              H
            </div>
            <span className="hidden xs:inline">Henrique</span>
            <span className="text-[#FFB800]">👑</span>
          </div>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 pointer-events-none">
            <Loader2 className="w-10 h-10 text-[#FF5A00] animate-spin" />
          </div>
        )}

        {/* Controls overlay */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 video-gradient transition-opacity duration-300 z-20",
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <div className="px-4 pb-4 pt-16">
            {/* Progress bar */}
            <div className="relative h-1.5 mb-3 group/progress">
              {/* Buffered */}
              <div
                className="absolute inset-0 bg-white/20 rounded-full"
                style={{ width: `${bufferedProgress}%` }}
              />

              {/* Progress */}
              <div
                className="absolute top-0 left-0 h-full brand-gradient rounded-full"
                style={{ width: `${progress}%` }}
              />

              {/* Input range */}
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={canControl ? handleSeek : undefined}
                disabled={!canControl}
                className={cn("absolute inset-0 w-full h-full opacity-0", canControl ? "cursor-pointer" : "cursor-not-allowed")}
              />

              {/* Thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none"
                style={{ left: `calc(${progress}% - 7px)` }}
              />
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between">
              {/* Left controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  disabled={!canControl}
                  className={cn(
                    "transition-colors",
                    canControl
                      ? "text-white hover:text-room-accent hover:scale-105 active:scale-95"
                      : "text-white/40 cursor-not-allowed"
                  )}
                  aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>

                <button
                  onClick={toggleMute}
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label={isMuted ? 'Ativar som' : 'Desativar som'}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>

                <span className="text-white/70 text-xs font-medium">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-3">
                <button
                  className="text-white/60 hover:text-white transition-colors"
                  aria-label="Legendas"
                >
                  <Subtitles className="w-4.5 h-4.5" />
                </button>

                <button
                  className="text-white/60 hover:text-white transition-colors"
                  aria-label="Configurações"
                >
                  <Settings className="w-4.5 h-4.5" />
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="text-white/60 hover:text-white transition-colors"
                  aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
                >
                  {isFullscreen ? <Minimize className="w-4.5 h-4.5" /> : <Maximize className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)
