'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Socket } from 'socket.io-client'

interface UseWebRTCProps {
  socket: Socket | null
  roomId: string
  currentUserId: string | null
  viewers: Array<{ id: string; name: string }>
}

export interface StartScreenShareResult {
  success: boolean
  reason?: 'cancelled' | 'denied' | 'not_supported' | 'error'
  message?: string
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
}

export function useWebRTC({ socket, roomId, currentUserId, viewers }: UseWebRTCProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamerId, setStreamerId] = useState<string | null>(null)
  const [streamerName, setStreamerName] = useState<string | null>(null)

  // Map of targetUserId -> RTCPeerConnection
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map())
  const localStreamRef = useRef<MediaStream | null>(null)
  const viewersRef = useRef(viewers)

  useEffect(() => {
    viewersRef.current = viewers
  }, [viewers])

  // Helper to close a specific peer connection
  const closePeer = useCallback((userId: string) => {
    const pc = peerConnections.current.get(userId)
    if (pc) {
      pc.onicecandidate = null
      pc.ontrack = null
      pc.close()
      peerConnections.current.delete(userId)
    }
  }, [])

  // Helper to close all peer connections
  const closeAllPeers = useCallback(() => {
    peerConnections.current.forEach((pc, userId) => {
      pc.onicecandidate = null
      pc.ontrack = null
      pc.close()
    })
    peerConnections.current.clear()
  }, [])

  // Stop screen sharing (Broadcaster)
  const stopScreenShare = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
    }
    setLocalStream(null)
    closeAllPeers()

    if (socket && roomId) {
      socket.emit('stream-state-change', { isStreaming: false })
    }
  }, [socket, roomId, closeAllPeers])

  // Create a peer connection for a target user (Broadcaster side)
  const createBroadcasterPeer = useCallback(
    async (targetUserId: string, stream: MediaStream) => {
      if (!socket || targetUserId === currentUserId) return

      closePeer(targetUserId)

      const pc = new RTCPeerConnection(ICE_SERVERS)
      peerConnections.current.set(targetUserId, pc)

      // Add local video & audio tracks to peer connection with quality parameters
      stream.getTracks().forEach((track) => {
        const sender = pc.addTrack(track, stream)
        if (track.kind === 'video' && sender.setParameters) {
          try {
            const params = sender.getParameters()
            if (params) {
              params.degradationPreference = 'maintain-resolution'
              sender.setParameters(params).catch(() => {})
            }
          } catch {}
        }
      })

      // Send ICE candidates to target user
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc-ice-candidate', {
            targetUserId,
            candidate: event.candidate,
          })
        }
      }

      try {
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        socket.emit('webrtc-offer', {
          targetUserId,
          offer,
        })
      } catch (err) {
        console.error('[WebRTC] Erro ao criar oferta para:', targetUserId, err)
      }
    },
    [socket, currentUserId, closePeer]
  )

  // Start screen sharing (Broadcaster)
  const startScreenShare = useCallback(async (): Promise<StartScreenShareResult> => {
    if (!socket || !currentUserId) {
      return { success: false, reason: 'error', message: 'Sem conexão com a sala.' }
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
      return {
        success: false,
        reason: 'not_supported',
        message: 'Seu navegador não possui suporte para compartilhamento de tela.'
      }
    }

    try {
      // Capture screen + audio (system/tab audio) with high resolution & 60fps
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
          cursor: 'always',
          width: { ideal: 1920, max: 2560 },
          height: { ideal: 1080, max: 1440 },
          frameRate: { ideal: 30, max: 60 }
        } as any,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      localStreamRef.current = stream
      setLocalStream(stream)

      // If user stops sharing via browser bar
      if (stream.getVideoTracks().length > 0) {
        stream.getVideoTracks()[0].onended = () => {
          stopScreenShare()
        }
      }

      // Signal stream start to room
      socket.emit('stream-state-change', { isStreaming: true })

      // Create peer connections for all current viewers in room
      const otherViewers = viewersRef.current.filter((v) => v.id !== currentUserId)
      for (const viewer of otherViewers) {
        await createBroadcasterPeer(viewer.id, stream)
      }

      return { success: true }
    } catch (err: any) {
      // Graceful handling of user cancellation or permission refusal (avoids Next.js dev error overlay)
      if (
        err?.name === 'NotAllowedError' ||
        err?.name === 'PermissionDeniedError' ||
        err?.message?.includes('Permission denied') ||
        err?.message?.includes('cancelled')
      ) {
        console.log('[WebRTC] Compartilhamento de tela cancelado pelo usuário.')
        return {
          success: false,
          reason: 'cancelled',
          message: 'Compartilhamento de tela cancelado.'
        }
      }

      console.warn('[WebRTC] Erro na captura de mídia:', err?.message || err)
      return {
        success: false,
        reason: 'error',
        message: err?.message || 'Não foi possível capturar a tela.'
      }
    }
  }, [socket, currentUserId, stopScreenShare, createBroadcasterPeer])

  // Socket signaling event listeners
  useEffect(() => {
    if (!socket) return

    // 1. Stream state change event from room
    const handleStreamStateChange = (data: {
      isStreaming: boolean
      streamerId: string | null
      streamerName: string | null
    }) => {
      setIsStreaming(data.isStreaming)
      setStreamerId(data.streamerId)
      setStreamerName(data.streamerName)

      if (!data.isStreaming) {
        setRemoteStream(null)
        closeAllPeers()
      }
    }

    // 2. Room Info on join/refresh (for users entering mid-stream)
    const handleRoomInfo = (info: {
      isStreamingScreen?: boolean
      streamerId?: string | null
      streamerName?: string | null
    }) => {
      if (info.isStreamingScreen) {
        setIsStreaming(true)
        setStreamerId(info.streamerId || null)
        setStreamerName(info.streamerName || null)
      } else {
        setIsStreaming(false)
        setStreamerId(null)
        setStreamerName(null)
        setRemoteStream(null)
      }
    }

    // 3. Incoming WebRTC offer (Viewer side)
    const handleOffer = async ({
      senderId,
      offer,
    }: {
      senderId: string
      offer: RTCSessionDescriptionInit
    }) => {
      if (senderId === currentUserId) return

      // Instantly switch viewer to stream mode when offer arrives mid-stream
      setIsStreaming(true)
      setStreamerId(senderId)

      closePeer(senderId)

      const pc = new RTCPeerConnection(ICE_SERVERS)
      peerConnections.current.set(senderId, pc)

      // When remote track (video/audio) arrives
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0])
        }
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc-ice-candidate', {
            targetUserId: senderId,
            candidate: event.candidate,
          })
        }
      }

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        socket.emit('webrtc-answer', {
          targetUserId: senderId,
          answer,
        })
      } catch (err) {
        console.error('[WebRTC] Erro ao responder oferta de:', senderId, err)
      }
    }

    // 4. Incoming WebRTC answer (Broadcaster side)
    const handleAnswer = async ({
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
          console.error('[WebRTC] Erro ao definir resposta remota de:', senderId, err)
        }
      }
    }

    // 5. Incoming ICE candidate
    const handleIceCandidate = async ({
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
          console.error('[WebRTC] Erro ao adicionar candidato ICE de:', senderId, err)
        }
      }
    }

    // 6. New user joined (Broadcaster side: send offer after slight delay so new user's socket is ready)
    const handleUserJoined = (data: { userId: string }) => {
      if (localStreamRef.current && data.userId !== currentUserId) {
        setTimeout(() => {
          if (localStreamRef.current) {
            createBroadcasterPeer(data.userId, localStreamRef.current)
          }
        }, 300)
      }
    }

    // 7. User left (clean peer)
    const handleUserLeft = (data: { userId: string }) => {
      closePeer(data.userId)
    }

    socket.on('stream-state-change', handleStreamStateChange)
    socket.on('room-info', handleRoomInfo)
    socket.on('webrtc-offer', handleOffer)
    socket.on('webrtc-answer', handleAnswer)
    socket.on('webrtc-ice-candidate', handleIceCandidate)
    socket.on('user-joined', handleUserJoined)
    socket.on('user-left', handleUserLeft)

    return () => {
      socket.off('stream-state-change', handleStreamStateChange)
      socket.off('room-info', handleRoomInfo)
      socket.off('webrtc-offer', handleOffer)
      socket.off('webrtc-answer', handleAnswer)
      socket.off('webrtc-ice-candidate', handleIceCandidate)
      socket.off('user-joined', handleUserJoined)
      socket.off('user-left', handleUserLeft)
    }
  }, [socket, currentUserId, createBroadcasterPeer, closePeer, closeAllPeers])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop())
      }
      closeAllPeers()
    }
  }, [closeAllPeers])

  return {
    localStream,
    remoteStream,
    isStreaming,
    streamerId,
    streamerName,
    isLocalStreamer: streamerId === currentUserId,
    startScreenShare,
    stopScreenShare,
  }
}
