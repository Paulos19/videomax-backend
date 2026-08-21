'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Socket } from 'socket.io-client'
import { VoiceUserState } from '@/types'
import { toast } from 'sonner'

interface UseVoiceChatProps {
  socket: Socket | null
  roomId: string
  currentUserId: string | null
  currentUserName?: string
  viewers: Array<{ id: string; name: string }>
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
}

export function useVoiceChat({
  socket,
  roomId,
  currentUserId,
  currentUserName = 'Usuário',
  viewers,
}: UseVoiceChatProps) {
  const [isVoiceConnected, setIsVoiceConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isPushToTalk, setIsPushToTalk] = useState(false)
  const [isPttActive, setIsPttActive] = useState(false)
  const [isLocalSpeaking, setIsLocalSpeaking] = useState(false)
  const [isAudioDuckingEnabled, setIsAudioDuckingEnabled] = useState(true)
  const [duckingVolumeFactor, setDuckingVolumeFactor] = useState(1.0)
  const [activeSpeakers, setActiveSpeakers] = useState<Set<string>>(new Set())
  const [remoteAudioStreams, setRemoteAudioStreams] = useState<Map<string, MediaStream>>(new Map())

  // WebRTC & Audio Context refs
  const localAudioStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map())
  const viewersRef = useRef(viewers)
  const animFrameRef = useRef<number | null>(null)
  const duckingCooldownTimer = useRef<NodeJS.Timeout | null>(null)
  const isMutedRef = useRef(isMuted)
  const isPushToTalkRef = useRef(isPushToTalk)
  const isPttActiveRef = useRef(isPttActive)

  useEffect(() => {
    viewersRef.current = viewers
  }, [viewers])

  useEffect(() => {
    isMutedRef.current = isMuted
  }, [isMuted])

  useEffect(() => {
    isPushToTalkRef.current = isPushToTalk
  }, [isPushToTalk])

  useEffect(() => {
    isPttActiveRef.current = isPttActive
  }, [isPttActive])

  // Helper to close a peer connection
  const closeVoicePeer = useCallback((userId: string) => {
    const pc = peerConnections.current.get(userId)
    if (pc) {
      pc.onicecandidate = null
      pc.ontrack = null
      pc.close()
      peerConnections.current.delete(userId)
    }
  }, [])

  const closeAllVoicePeers = useCallback(() => {
    peerConnections.current.forEach((pc) => {
      pc.onicecandidate = null
      pc.ontrack = null
      pc.close()
    })
    peerConnections.current.clear()
  }, [])

  // Create an audio peer connection to a target user
  const createVoicePeer = useCallback(
    async (targetUserId: string, stream: MediaStream) => {
      if (!socket || targetUserId === currentUserId) return

      closeVoicePeer(targetUserId)

      const pc = new RTCPeerConnection(ICE_SERVERS)
      peerConnections.current.set(targetUserId, pc)

      // Add audio tracks
      stream.getAudioTracks().forEach((track) => {
        pc.addTrack(track, stream)
      })

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('voice-ice-candidate', {
            targetUserId,
            candidate: event.candidate,
          })
        }
      }

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          const remoteStream = event.streams[0]
          setRemoteAudioStreams((prev) => {
            const next = new Map(prev)
            next.set(targetUserId, remoteStream)
            return next
          })
        }
      }

      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: false,
        })
        await pc.setLocalDescription(offer)
        socket.emit('voice-offer', {
          targetUserId,
          offer,
        })
      } catch (err) {
        console.warn('[VoiceChat] Erro ao criar oferta para:', targetUserId, err)
      }
    },
    [socket, currentUserId, closeVoicePeer]
  )

  // Start voice activity detection (VAD) loop
  const startVoiceActivityDetection = useCallback((stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return

      const ctx = new AudioCtx()
      audioContextRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.4
      source.connect(analyser)
      analyserRef.current = analyser

      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      let speakingCounter = 0

      const checkVolume = () => {
        if (!analyserRef.current) return

        analyserRef.current.getByteFrequencyData(dataArray)
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i]
        }
        const avg = sum / dataArray.length

        // Mute / PTT gating
        const shouldMute = isMutedRef.current || (isPushToTalkRef.current && !isPttActiveRef.current)
        const isSpeakingNow = !shouldMute && avg > 14

        if (isSpeakingNow) {
          speakingCounter = 6
        } else {
          speakingCounter = Math.max(0, speakingCounter - 1)
        }

        const currentlySpeaking = speakingCounter > 0

        setIsLocalSpeaking((prev) => {
          if (prev !== currentlySpeaking && socket) {
            socket.emit('voice-state-update', {
              isMuted: shouldMute,
              isSpeaking: currentlySpeaking,
            })
          }
          return currentlySpeaking
        })

        animFrameRef.current = requestAnimationFrame(checkVolume)
      }

      checkVolume()
    } catch (err) {
      console.warn('[VoiceChat] Erro ao inicializar AnalyserNode:', err)
    }
  }, [socket])

  // Join Voice Channel
  const joinVoice = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      toast.error('Seu navegador não possui suporte a microfone.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      })

      localAudioStreamRef.current = stream
      setIsVoiceConnected(true)
      setIsMuted(false)
      startVoiceActivityDetection(stream)

      // Connect with other viewers
      const otherViewers = viewersRef.current.filter((v) => v.id !== currentUserId)
      for (const viewer of otherViewers) {
        await createVoicePeer(viewer.id, stream)
      }

      toast.success('Conectado ao Voice Chat da sala!')
    } catch (err: any) {
      console.warn('[VoiceChat] Permissão de microfone negada ou indisponível:', err)
      toast.error('Permissão de microfone negada.')
    }
  }, [currentUserId, createVoicePeer, startVoiceActivityDetection])

  // Leave Voice Channel
  const leaveVoice = useCallback(() => {
    if (localAudioStreamRef.current) {
      localAudioStreamRef.current.getTracks().forEach((track) => track.stop())
      localAudioStreamRef.current = null
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }

    closeAllVoicePeers()
    setIsVoiceConnected(false)
    setIsLocalSpeaking(false)
    setActiveSpeakers(new Set())
    setRemoteAudioStreams(new Map())

    if (socket) {
      socket.emit('voice-state-update', { isMuted: true, isSpeaking: false })
    }
  }, [socket, closeAllVoicePeers])

  // Toggle Mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev
      if (localAudioStreamRef.current) {
        localAudioStreamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = !next
        })
      }
      if (socket) {
        socket.emit('voice-state-update', { isMuted: next, isSpeaking: false })
      }
      return next
    })
  }, [socket])

  // Toggle Push-To-Talk
  const togglePushToTalk = useCallback(() => {
    setIsPushToTalk((prev) => {
      const next = !prev
      if (next) {
        toast.info('Modo Push-to-Talk ativado. Pressione e segure [ESPAÇO] ou use o botão para falar.')
      } else {
        toast.info('Modo Detecção de Voz ativado.')
      }
      return next
    })
  }, [])

  // Push-To-Talk Key listeners (Space key or button)
  useEffect(() => {
    if (!isVoiceConnected || !isPushToTalk) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't activate PTT if user is typing in chat or input
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault()
        setIsPttActive(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsPttActive(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isVoiceConnected, isPushToTalk])

  // Audio Ducking Computation
  useEffect(() => {
    if (!isAudioDuckingEnabled) {
      setDuckingVolumeFactor(1.0)
      return
    }

    const hasAnySpeaker = isLocalSpeaking || activeSpeakers.size > 0

    if (hasAnySpeaker) {
      if (duckingCooldownTimer.current) {
        clearTimeout(duckingCooldownTimer.current)
        duckingCooldownTimer.current = null
      }
      // Attenuate video volume to 35%
      setDuckingVolumeFactor(0.35)
    } else {
      // Restore video volume smoothly with 900ms cooldown
      if (!duckingCooldownTimer.current) {
        duckingCooldownTimer.current = setTimeout(() => {
          setDuckingVolumeFactor(1.0)
          duckingCooldownTimer.current = null
        }, 900)
      }
    }
  }, [isLocalSpeaking, activeSpeakers, isAudioDuckingEnabled])

  // Socket signaling event listeners
  useEffect(() => {
    if (!socket) return

    // 1. Remote voice offer
    const handleVoiceOffer = async ({
      senderId,
      offer,
    }: {
      senderId: string
      offer: RTCSessionDescriptionInit
    }) => {
      if (senderId === currentUserId || !isVoiceConnected) return

      closeVoicePeer(senderId)

      const pc = new RTCPeerConnection(ICE_SERVERS)
      peerConnections.current.set(senderId, pc)

      if (localAudioStreamRef.current) {
        localAudioStreamRef.current.getAudioTracks().forEach((track) => {
          pc.addTrack(track, localAudioStreamRef.current!)
        })
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('voice-ice-candidate', {
            targetUserId: senderId,
            candidate: event.candidate,
          })
        }
      }

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteAudioStreams((prev) => {
            const next = new Map(prev)
            next.set(senderId, event.streams[0])
            return next
          })
        }
      }

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        socket.emit('voice-answer', {
          targetUserId: senderId,
          answer,
        })
      } catch (err) {
        console.warn('[VoiceChat] Erro ao responder oferta de áudio:', senderId, err)
      }
    }

    // 2. Remote voice answer
    const handleVoiceAnswer = async ({
      senderId,
      answer,
    }: {
      senderId: string
      answer: RTCSessionDescriptionInit
    }) => {
      const pc = peerConnections.current.get(senderId)
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer))
        } catch (err) {
          console.warn('[VoiceChat] Erro ao definir resposta de áudio:', senderId, err)
        }
      }
    }

    // 3. Remote voice ICE candidate
    const handleVoiceIceCandidate = async ({
      senderId,
      candidate,
    }: {
      senderId: string
      candidate: RTCIceCandidateInit
    }) => {
      const pc = peerConnections.current.get(senderId)
      if (pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate))
        } catch (err) {
          console.warn('[VoiceChat] Erro ao adicionar candidato ICE de áudio:', senderId, err)
        }
      }
    }

    // 4. Remote user speaking state update
    const handleVoiceUserState = ({
      userId,
      isSpeaking,
      isMuted,
    }: {
      userId: string
      userName: string
      isSpeaking: boolean
      isMuted: boolean
    }) => {
      setActiveSpeakers((prev) => {
        const next = new Set(prev)
        if (isSpeaking && !isMuted) {
          next.add(userId)
        } else {
          next.delete(userId)
        }
        return next
      })
    }

    // 5. User joined room mid-call
    const handleUserJoined = (data: { userId: string }) => {
      if (isVoiceConnected && localAudioStreamRef.current && data.userId !== currentUserId) {
        setTimeout(() => {
          if (localAudioStreamRef.current) {
            createVoicePeer(data.userId, localAudioStreamRef.current)
          }
        }, 400)
      }
    }

    // 6. User left
    const handleUserLeft = (data: { userId: string }) => {
      closeVoicePeer(data.userId)
      setActiveSpeakers((prev) => {
        const next = new Set(prev)
        next.delete(data.userId)
        return next
      })
      setRemoteAudioStreams((prev) => {
        const next = new Map(prev)
        next.delete(data.userId)
        return next
      })
    }

    socket.on('voice-offer', handleVoiceOffer)
    socket.on('voice-answer', handleVoiceAnswer)
    socket.on('voice-ice-candidate', handleVoiceIceCandidate)
    socket.on('voice-user-state', handleVoiceUserState)
    socket.on('user-joined', handleUserJoined)
    socket.on('user-left', handleUserLeft)

    return () => {
      socket.off('voice-offer', handleVoiceOffer)
      socket.off('voice-answer', handleVoiceAnswer)
      socket.off('voice-ice-candidate', handleVoiceIceCandidate)
      socket.off('voice-user-state', handleVoiceUserState)
      socket.off('user-joined', handleUserJoined)
      socket.off('user-left', handleUserLeft)
    }
  }, [socket, currentUserId, isVoiceConnected, createVoicePeer, closeVoicePeer])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localAudioStreamRef.current) {
        localAudioStreamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {})
      }
      closeAllVoicePeers()
    }
  }, [closeAllVoicePeers])

  return {
    isVoiceConnected,
    isMuted,
    isPushToTalk,
    isPttActive,
    isLocalSpeaking,
    isAudioDuckingEnabled,
    duckingVolumeFactor,
    activeSpeakers,
    remoteAudioStreams,
    joinVoice,
    leaveVoice,
    toggleMute,
    togglePushToTalk,
    setIsPttActive,
    toggleAudioDucking: () => setIsAudioDuckingEnabled((prev) => !prev),
  }
}
