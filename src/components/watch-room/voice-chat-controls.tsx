'use client'

import { useEffect, useRef } from 'react'
import {
  Mic,
  MicOff,
  Headphones,
  PhoneOff,
  Radio,
  Volume2,
  VolumeX,
  Volume1,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceChatControlsProps {
  isVoiceConnected: boolean
  isMuted: boolean
  isPushToTalk: boolean
  isPttActive: boolean
  isLocalSpeaking: boolean
  isAudioDuckingEnabled: boolean
  duckingVolumeFactor: number
  activeSpeakersCount: number
  remoteAudioStreams: Map<string, MediaStream>
  onJoinVoice: () => void
  onLeaveVoice: () => void
  onToggleMute: () => void
  onTogglePushToTalk: () => void
  onSetPttActive: (active: boolean) => void
  onToggleAudioDucking: () => void
}

export function VoiceChatControls({
  isVoiceConnected,
  isMuted,
  isPushToTalk,
  isPttActive,
  isLocalSpeaking,
  isAudioDuckingEnabled,
  duckingVolumeFactor,
  activeSpeakersCount,
  remoteAudioStreams,
  onJoinVoice,
  onLeaveVoice,
  onToggleMute,
  onTogglePushToTalk,
  onSetPttActive,
  onToggleAudioDucking,
}: VoiceChatControlsProps) {
  // Remote audio elements map
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map())

  // Attach remote streams to audio elements
  useEffect(() => {
    remoteAudioStreams.forEach((stream, userId) => {
      let audioEl = audioElementsRef.current.get(userId)
      if (!audioEl) {
        audioEl = new Audio()
        audioEl.autoplay = true
        audioElementsRef.current.set(userId, audioEl)
      }
      if (audioEl.srcObject !== stream) {
        audioEl.srcObject = stream
        audioEl.play().catch(() => {})
      }
    })

    // Clean up detached streams
    audioElementsRef.current.forEach((el, uId) => {
      if (!remoteAudioStreams.has(uId)) {
        el.srcObject = null
        el.remove()
        audioElementsRef.current.delete(uId)
      }
    })
  }, [remoteAudioStreams])

  if (!isVoiceConnected) {
    return (
      <button
        onClick={onJoinVoice}
        className="px-2.5 py-1.5 bg-[#121218] hover:bg-[#22C55E] text-[#22C55E] hover:text-black border border-[#22C55E]/40 hover:border-[#22C55E] text-[9px] font-black uppercase tracking-wider font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.15)]"
      >
        <Headphones className="w-3.5 h-3.5" />
        <span>ENTRAR NO VOICE CHAT</span>
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1.5 font-mono">
      {/* Mic Mute / Unmute Button */}
      <button
        onClick={onToggleMute}
        className={cn(
          'px-2 py-1 border text-[9px] font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer shadow-sm',
          isMuted
            ? 'bg-[#EF2020]/20 border-[#EF2020] text-[#EF2020] hover:bg-[#EF2020] hover:text-white'
            : isLocalSpeaking
            ? 'bg-[#22C55E] border-[#22C55E] text-black shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse'
            : 'bg-[#121218] border-[#22C55E] text-[#22C55E] hover:bg-[#22C55E] hover:text-black'
        )}
        title={isMuted ? 'Desmutar Microfone' : 'Mutar Microfone'}
      >
        {isMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
        <span>{isMuted ? 'MUTADO' : isLocalSpeaking ? 'FALANDO...' : 'MIC ATIVO'}</span>
      </button>

      {/* Push-to-Talk Button (when PTT is active) */}
      {isPushToTalk ? (
        <button
          onMouseDown={() => onSetPttActive(true)}
          onMouseUp={() => onSetPttActive(false)}
          onTouchStart={() => onSetPttActive(true)}
          onTouchEnd={() => onSetPttActive(false)}
          className={cn(
            'px-2 py-1 border text-[9px] font-black uppercase flex items-center gap-1 transition-all select-none cursor-pointer',
            isPttActive
              ? 'bg-[#FF5A00] text-black border-[#FF5A00] shadow-[0_0_15px_rgba(255,90,0,0.5)]'
              : 'bg-[#121218] text-[#888] border-[#333] hover:border-white hover:text-white'
          )}
        >
          <Radio className="w-3 h-3" />
          <span>[SEGURE PTT]</span>
        </button>
      ) : (
        <button
          onClick={onTogglePushToTalk}
          className="px-2 py-1 bg-[#121218] border border-[#333] hover:border-[#FF5A00] text-[#888] hover:text-[#FF5A00] text-[9px] font-bold uppercase transition-colors cursor-pointer"
          title="Alternar para Push-to-Talk"
        >
          PTT
        </button>
      )}

      {/* Audio Ducking Indicator / Toggle */}
      <button
        onClick={onToggleAudioDucking}
        className={cn(
          'px-2 py-1 border text-[9px] font-bold uppercase flex items-center gap-1 transition-colors cursor-pointer',
          isAudioDuckingEnabled
            ? duckingVolumeFactor < 1
              ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8] animate-pulse'
              : 'bg-[#121218] border-[#38BDF8]/50 text-[#38BDF8]'
            : 'bg-[#121218] border-[#333] text-[#666] line-through'
        )}
        title={
          isAudioDuckingEnabled
            ? `Audio Ducking Ativo: O volume do vídeo é reduzido automaticamente quando alguém fala (Atual: ${Math.round(
                duckingVolumeFactor * 100
              )}%)`
            : 'Audio Ducking Desativado'
        }
      >
        <Sparkles className="w-3 h-3" />
        <span className="hidden sm:inline">DUCKING</span>
      </button>

      {/* Disconnect from Voice */}
      <button
        onClick={onLeaveVoice}
        className="p-1 bg-[#121218] border border-[#333] hover:border-[#EF2020] text-[#888] hover:text-[#EF2020] transition-colors cursor-pointer"
        title="Desconectar do canal de voz"
      >
        <PhoneOff className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
