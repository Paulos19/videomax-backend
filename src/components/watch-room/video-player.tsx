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
  Loader2
} from 'lucide-react'
import { YoutubeIcon as Youtube } from '@/components/icons/youtube'
import { cn } from '@/lib/utils'
import { isYouTubeUrl } from '@/lib/youtube'

// Dynamically import ReactPlayer to prevent SSR hydration mismatches
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false })

export interface VideoPlayerHandle {
  play: () => void
  pause: () => void
  seek: (time: number) => void
  getCurrentTime: () => number
}

interface VideoPlayerProps {
  src: string
  poster?: string
  onPlay?: () => void
  onPause?: () => void
  onSeek?: (time: number) => void
  onFullscreen?: () => void
  isRemoteUpdate?: boolean
  onRemoteUpdateDone?: () => void
  onCanPlay?: () => void
}

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayer(
    {
      src,
      poster,
      onPlay,
      onPause,
      onSeek,
      onFullscreen,
      isRemoteUpdate = false,
      onRemoteUpdateDone,
      onCanPlay
    },
    ref
  ) {
    const videoRef = useRef<HTMLVideoElement>(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reactPlayerRef = useRef<any>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null)

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
      play: () => {
        if (isYouTube) {
          setIsPlaying(true)
          return Promise.resolve()
        }
        return videoRef.current?.play().catch(() => {}) ?? Promise.resolve()
      },
      pause: () => {
        if (isYouTube) {
          setIsPlaying(false)
        } else {
          videoRef.current?.pause()
        }
      },
      seek: (time: number) => {
        setCurrentTime(time)
        if (isYouTube) {
          if (typeof reactPlayerRef.current?.seekTo === 'function') {
            reactPlayerRef.current.seekTo(time, 'seconds')
          } else if (reactPlayerRef.current) {
            reactPlayerRef.current.currentTime = time
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

    // Controls visibility timer
    const startHideControlsTimer = useCallback(() => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current)
      }
      setShowControls(true)
      if (isPlaying) {
        hideControlsTimeout.current = setTimeout(() => setShowControls(false), 3000)
      }
    }, [isPlaying])

    const handleMouseMove = useCallback(() => {
      startHideControlsTimer()
    }, [startHideControlsTimer])

    // Toggle Play/Pause
    const togglePlay = useCallback(() => {
      if (isYouTube) {
        if (isPlaying) {
          setIsPlaying(false)
          handlePause()
        } else {
          setIsPlaying(true)
          handlePlay()
        }
      } else if (videoRef.current) {
        if (videoRef.current.paused) {
          videoRef.current.play()
        } else {
          videoRef.current.pause()
        }
      }
    }, [isYouTube, isPlaying, handlePlay, handlePause])

    // Toggle Mute
    const toggleMute = useCallback(() => {
      const newMuted = !isMuted
      setIsMuted(newMuted)
      if (!isYouTube && videoRef.current) {
        videoRef.current.muted = newMuted
      }
    }, [isMuted, isYouTube])

    // Seek handler
    const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const time = parseFloat(e.target.value)
      setCurrentTime(time)
      if (isYouTube) {
        if (typeof reactPlayerRef.current?.seekTo === 'function') {
          reactPlayerRef.current.seekTo(time, 'seconds')
        } else if (reactPlayerRef.current) {
          reactPlayerRef.current.currentTime = time
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

    // Progress percentage
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0
    const bufferedProgress = duration > 0 ? (buffered / duration) * 100 : 0

    return (
      <div
        ref={containerRef}
        className="relative w-full max-h-[calc(100vh-180px)] bg-[#050507] rounded-2xl overflow-hidden border border-white/[0.08] group flex items-center justify-center"
        style={{ aspectRatio: '16/9' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {/* Render ReactPlayer for YouTube or native <video> for uploaded files */}
        {isYouTube ? (
          <div className="w-full h-full relative">
            <ReactPlayer
              ref={reactPlayerRef}
              src={src}
              playing={isPlaying}
              muted={isMuted}
              volume={volume}
              controls={false}
              width="100%"
              height="100%"
              onReady={() => setIsLoading(false)}
              onPlay={handlePlay}
              onPause={handlePause}
              onTimeUpdate={(e: React.SyntheticEvent<HTMLVideoElement>) => {
                if (e?.currentTarget?.currentTime) {
                  setCurrentTime(e.currentTarget.currentTime)
                }
                if (e?.currentTarget?.duration) {
                  setDuration(e.currentTarget.duration)
                  setIsLoading(false)
                }
              }}
            />
          </div>
        ) : (
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            className="w-full h-full object-contain"
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
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={togglePlay}
        />

        {/* Live / YouTube Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-room-accent/85 px-3 py-1.5 rounded-full backdrop-blur-sm z-20 pointer-events-none">
          {isYouTube ? (
            <>
              <Youtube className="w-4 h-4 text-white" />
              <span className="text-white text-xs font-semibold tracking-wide">YOUTUBE</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-white text-xs font-semibold tracking-wide">AO VIVO</span>
            </>
          )}
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 pointer-events-none">
            <Loader2 className="w-10 h-10 text-room-accent animate-spin" />
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
                className="absolute top-0 left-0 h-full bg-room-accent rounded-full"
                style={{ width: `${progress}%` }}
              />

              {/* Input range */}
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
                  className="text-white hover:text-room-accent transition-colors hover:scale-105 active:scale-95"
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
