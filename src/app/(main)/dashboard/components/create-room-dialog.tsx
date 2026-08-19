'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { X, Play, Upload, Check, Loader2, Sparkles, Plus, Users } from 'lucide-react'
import { YoutubeIcon as Youtube } from '@/components/icons/youtube'
import { UploadDropzone } from '@/lib/uploadthing'
import { saveVideo, createRoomInviteNotification } from '@/app/(main)/actions'
import { cn } from '@/lib/utils'
import { isYouTubeUrl, getYouTubeThumbnail, fetchYouTubeMetadata } from '@/lib/youtube'
import { toast } from 'sonner'
import io from 'socket.io-client'
import { useSession } from 'next-auth/react'

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'https://services-videomax-websocket.khdya3.easypanel.host/'

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export interface InvitedFriendPayload {
  id: string
  name?: string | null
  email: string
}

interface CreateRoomDialogProps {
  onClose: () => void
  initialVideoUrl?: string
  invitedFriends?: InvitedFriendPayload[]
}

export function CreateRoomDialog({ onClose, initialVideoUrl, invitedFriends = [] }: CreateRoomDialogProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'youtube' | 'upload' | 'empty'>('youtube')

  // YouTube state
  const [youtubeUrl, setYoutubeUrl] = useState(initialVideoUrl || '')
  const [youtubeTitle, setYoutubeTitle] = useState('')
  const [coverPreview, setCoverPreview] = useState<string | null>(
    initialVideoUrl && isYouTubeUrl(initialVideoUrl) ? getYouTubeThumbnail(initialVideoUrl) : null
  )
  const [isLoadingMeta, setIsLoadingMeta] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleUrlChange = async (url: string) => {
    setYoutubeUrl(url)
    setErrorMsg('')
    if (isYouTubeUrl(url)) {
      const thumb = getYouTubeThumbnail(url)
      if (thumb) setCoverPreview(thumb)

      setIsLoadingMeta(true)
      const meta = await fetchYouTubeMetadata(url)
      setIsLoadingMeta(false)

      if (meta?.thumbnail) setCoverPreview(meta.thumbnail)
      if (meta?.title && !youtubeTitle) {
        setYoutubeTitle(meta.title)
      }
    } else {
      setCoverPreview(null)
    }
  }

  const broadcastInvitesToFriends = async (roomCode: string) => {
    if (!invitedFriends || invitedFriends.length === 0) return

    try {
      let wsToken: string | undefined
      try {
        const tokenRes = await fetch('/api/auth/token')
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json()
          wsToken = tokenData.token
        }
      } catch {}

      const socket = io(SOCKET_SERVER_URL, {
        auth: wsToken ? { token: wsToken } : undefined,
        transports: ['websocket', 'polling'],
      })
      const senderName = session?.user?.name || session?.user?.email || 'Um amigo'

      invitedFriends.forEach(async (friend) => {
        await createRoomInviteNotification(friend.id, roomCode, senderName).catch(() => {})
        socket.emit('invite-to-room', {
          targetUserId: friend.id,
          roomCode,
          senderName,
        })
      })

      setTimeout(() => {
        socket.disconnect()
      }, 3000)

      toast.success(`Convite de sala enviado para ${invitedFriends.length} amigo(s)!`)
    } catch {}
  }

  const handleCreateYoutubeRoom = useCallback(async () => {
    setErrorMsg('')
    const url = youtubeUrl.trim()
    const title = youtubeTitle.trim()

    if (!url) {
      setErrorMsg('Por favor, insira a URL do vídeo.')
      return
    }

    if (!isYouTubeUrl(url)) {
      setErrorMsg('URL do YouTube inválida. Ex: https://www.youtube.com/watch?v=...')
      return
    }

    if (!title) {
      setErrorMsg('Por favor, defina um título para a sala/vídeo.')
      return
    }

    try {
      setIsSaving(true)
      await saveVideo(title, url, null)
      const roomCode = generateRoomCode()
      broadcastInvitesToFriends(roomCode)
      onClose()
      router.push(`/room/${roomCode}`)
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Erro ao criar sala.')
    } finally {
      setIsSaving(false)
    }
  }, [youtubeUrl, youtubeTitle, onClose, router, invitedFriends])

  const handleCreateEmptyRoom = useCallback(() => {
    const roomCode = generateRoomCode()
    broadcastInvitesToFriends(roomCode)
    onClose()
    router.push(`/room/${roomCode}`)
  }, [onClose, router, invitedFriends])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-[#09090D] border border-[#222] rounded-none w-full max-w-lg mx-4 animate-scale-in relative overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF5A00]" />
            <h2 className="text-white font-mono font-bold text-base uppercase">
              [ CRIAR NOVA SALA ]
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-[#121218] border border-[#333] hover:border-[#FF5A00] flex items-center justify-center text-[#888] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Invited Friends Badge Banner */}
        {invitedFriends.length > 0 && (
          <div className="px-6 py-2.5 bg-[#1A1208] border-b border-[#FF5A00]/40 flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#FF5A00]" />
              <span className="text-white font-bold">
                {invitedFriends.length} amigo(s) selecionado(s) para convite automático.
              </span>
            </div>
            <span className="text-[9px] text-[#FFE600] font-bold uppercase">
              WEBRTC MESH
            </span>
          </div>
        )}

        {/* Tabs Selection */}
        <div className="flex border-b border-[#222]">
          <button
            onClick={() => setActiveTab('youtube')}
            className={cn(
              'flex-1 py-3 text-[11px] font-mono uppercase font-bold text-center border-b-2 transition-all flex items-center justify-center gap-2',
              activeTab === 'youtube'
                ? 'border-[#FF5A00] text-[#FF5A00] bg-[#FF5A00]/5'
                : 'border-transparent text-[#777] hover:text-white'
            )}
          >
            <Youtube className="w-4 h-4 text-[#EF2020]" />
            <span>YOUTUBE</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={cn(
              'flex-1 py-3 text-[11px] font-mono uppercase font-bold text-center border-b-2 transition-all flex items-center justify-center gap-2',
              activeTab === 'upload'
                ? 'border-[#FF5A00] text-[#FF5A00] bg-[#FF5A00]/5'
                : 'border-transparent text-[#777] hover:text-white'
            )}
          >
            <Upload className="w-4 h-4 text-[#3B82F6]" />
            <span>NUVEM MP4</span>
          </button>

          <button
            onClick={() => setActiveTab('empty')}
            className={cn(
              'flex-1 py-3 text-[11px] font-mono uppercase font-bold text-center border-b-2 transition-all flex items-center justify-center gap-2',
              activeTab === 'empty'
                ? 'border-[#FF5A00] text-[#FF5A00] bg-[#FF5A00]/5'
                : 'border-transparent text-[#777] hover:text-white'
            )}
          >
            <Play className="w-4 h-4 text-[#22C55E]" />
            <span>SALA VAZIA</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-[#1A0A0A] border border-[#EF2020]/40 text-[#EF2020] text-[11px] font-mono">
              {errorMsg}
            </div>
          )}

          {activeTab === 'youtube' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-[#888] uppercase block">
                  LINK DO VÍDEO DO YOUTUBE
                </label>
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full h-11 bg-[#050508] border border-[#333] text-white px-3 text-[11px] font-mono outline-none focus:border-[#FF5A00]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-[#888] uppercase block">
                  TÍTULO DA SALA
                </label>
                <input
                  type="text"
                  value={youtubeTitle}
                  onChange={(e) => setYoutubeTitle(e.target.value)}
                  placeholder="Ex: Sessão de Cinema com a Galera"
                  className="w-full h-11 bg-[#050508] border border-[#333] text-white px-3 text-[11px] font-mono outline-none focus:border-[#FF5A00]"
                />
              </div>

              {coverPreview && (
                <div className="relative aspect-video w-full bg-black overflow-hidden border border-[#333]">
                  <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <button
                onClick={handleCreateYoutubeRoom}
                disabled={isSaving}
                className="w-full py-3.5 bg-[#FF5A00] hover:bg-white text-black font-mono font-black text-[11px] uppercase tracking-widest transition-all duration-150 shadow-[0_0_20px_rgba(255,90,0,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-black" />}
                <span>[ INICIAR SALA COM VÍDEO ]</span>
              </button>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-4">
              <UploadDropzone
                endpoint="videoUploader"
                onClientUploadComplete={async (res) => {
                  if (res && res[0]) {
                    const file = res[0]
                    await saveVideo(file.name, file.url, null)
                    const roomCode = generateRoomCode()
                    broadcastInvitesToFriends(roomCode)
                    onClose()
                    router.push(`/room/${roomCode}`)
                  }
                }}
                onUploadError={(error: Error) => {
                  toast.error(`Erro no upload: ${error.message}`)
                }}
                className="ut-label:text-[#FF5A00] ut-button:bg-[#FF5A00] border-2 border-dashed border-[#333] bg-[#050508] p-6"
              />
            </div>
          )}

          {activeTab === 'empty' && (
            <div className="space-y-4 text-center py-4">
              <p className="text-[11px] font-mono text-[#888] leading-relaxed max-w-sm mx-auto">
                Crie uma sala vazia pronta para compartilhar sua tela ou adicionar vídeos depois pelo chat.
              </p>
              <button
                onClick={handleCreateEmptyRoom}
                className="w-full py-3.5 bg-[#FF5A00] hover:bg-white text-black font-mono font-black text-[11px] uppercase tracking-widest transition-all duration-150 shadow-[0_0_20px_rgba(255,90,0,0.35)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>[ INICIAR SALA LIVRE AGORA ]</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
