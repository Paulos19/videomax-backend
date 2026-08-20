'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { X, Play, Upload, Check, Loader2, Sparkles, Plus, Users, Send, AlertTriangle } from 'lucide-react'
import { YoutubeIcon as Youtube } from '@/components/icons/youtube'
import { UploadDropzone } from '@/lib/uploadthing'
import { saveVideo, createRoomInviteNotification } from '@/app/(main)/actions'
import { cn } from '@/lib/utils'
import { isYouTubeUrl, getYouTubeThumbnail, fetchYouTubeMetadata } from '@/lib/youtube'
import { useNotifications } from '@/contexts/notification-context'
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
  const { emailVerified } = useNotifications()
  const [activeTab, setActiveTab] = useState<'youtube' | 'upload' | 'empty'>('youtube')
  const [resendingVerification, setResendingVerification] = useState(false)

  const handleResendVerification = async () => {
    if (!session?.user?.email || resendingVerification) return
    setResendingVerification(true)
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || 'E-mail de ativação reenviado!')
      } else {
        toast.error(data.error || 'Erro ao reenviar.')
      }
    } catch {
      toast.error('Erro de conexão.')
    } finally {
      setResendingVerification(false)
    }
  }

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
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`pending_room_video_${roomCode}`, JSON.stringify({ url, title }))
      }
      broadcastInvitesToFriends(roomCode)
      onClose()
      window.location.href = `/room/${roomCode}`
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Erro ao criar sala.')
    } finally {
      setIsSaving(false)
    }
  }, [youtubeUrl, youtubeTitle, onClose, invitedFriends])

  const handleCreateEmptyRoom = useCallback(() => {
    const roomCode = generateRoomCode()
    broadcastInvitesToFriends(roomCode)
    onClose()
    window.location.href = `/room/${roomCode}`
  }, [onClose, invitedFriends])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-white dark:bg-[#09090D] border border-slate-200 dark:border-[#222] rounded-none w-full max-w-lg mx-4 animate-scale-in relative overflow-hidden shadow-2xl transition-colors">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#222]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF5A00]" />
            <h2 className="text-slate-900 dark:text-white font-mono font-bold text-base uppercase">
              [ CRIAR NOVA SALA ]
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-slate-100 dark:bg-[#121218] border border-slate-300 dark:border-[#333] hover:border-[#FF5A00] flex items-center justify-center text-slate-500 dark:text-[#888] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Invited Friends Badge Banner */}
        {invitedFriends.length > 0 && (
          <div className="px-6 py-2.5 bg-orange-50 dark:bg-[#1A1208] border-b border-orange-200 dark:border-[#FF5A00]/40 flex items-center justify-between text-[11px] font-mono transition-colors">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#FF5A00]" />
              <span className="text-slate-800 dark:text-white font-bold">
                {invitedFriends.length} amigo(s) selecionado(s) para convite automático.
              </span>
            </div>
            <span className="text-[9px] text-amber-600 dark:text-[#FFE600] font-bold uppercase">
              WEBRTC MESH
            </span>
          </div>
        )}

        {/* Tabs Selection */}
        <div className="flex border-b border-slate-200 dark:border-[#222]">
          <button
            onClick={() => setActiveTab('youtube')}
            className={cn(
              'flex-1 py-3 text-[11px] font-mono uppercase font-bold text-center border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer',
              activeTab === 'youtube'
                ? 'border-[#FF5A00] text-[#FF5A00] bg-[#FF5A00]/5'
                : 'border-transparent text-slate-500 dark:text-[#777] hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <Youtube className="w-4 h-4 text-[#EF2020]" />
            <span>YOUTUBE</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={cn(
              'flex-1 py-3 text-[11px] font-mono uppercase font-bold text-center border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer',
              activeTab === 'upload'
                ? 'border-[#FF5A00] text-[#FF5A00] bg-[#FF5A00]/5'
                : 'border-transparent text-slate-500 dark:text-[#777] hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <Upload className="w-4 h-4 text-[#3B82F6]" />
            <span>NUVEM MP4</span>
          </button>

          <button
            onClick={() => setActiveTab('empty')}
            className={cn(
              'flex-1 py-3 text-[11px] font-mono uppercase font-bold text-center border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer',
              activeTab === 'empty'
                ? 'border-[#FF5A00] text-[#FF5A00] bg-[#FF5A00]/5'
                : 'border-transparent text-slate-500 dark:text-[#777] hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <Play className="w-4 h-4 text-[#16A34A] dark:text-[#22C55E]" />
            <span>SALA VAZIA</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {!emailVerified && (
            <div className="p-4 bg-orange-50 dark:bg-[#140C06] border border-orange-300 dark:border-[#FF5A00] text-slate-900 dark:text-white font-mono space-y-2.5 shadow-sm dark:shadow-[0_0_20px_rgba(255,90,0,0.15)] transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-orange-600 dark:text-[#FF5A00] font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-[#FF5A00] animate-ping" />
                  <span>[ E-MAIL NÃO VERIFICADO ]</span>
                </div>
                <span className="text-[9px] text-slate-500 dark:text-[#888] uppercase">BLOQUEIO ATIVO</span>
              </div>
              <p className="text-[11px] text-slate-700 dark:text-[#CCCCCC] font-sans leading-relaxed">
                Para criar salas de transmissão e convidar amigos, você precisa verificar seu endereço de e-mail <strong>({session?.user?.email})</strong>.
              </p>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendingVerification}
                className="px-3 py-1.5 bg-[#FF5A00] hover:bg-slate-900 dark:hover:bg-white text-white dark:text-black font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {resendingVerification ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                <span>{resendingVerification ? 'ENVIANDO...' : 'REENVIAR LINK DE ATIVAÇÃO ✉️'}</span>
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-[#1A0A0A] border border-red-300 dark:border-[#EF2020]/40 text-red-600 dark:text-[#EF2020] text-[11px] font-mono transition-colors">
              {errorMsg}
            </div>
          )}

          {activeTab === 'youtube' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-600 dark:text-[#888] uppercase block">
                  LINK DO VÍDEO DO YOUTUBE
                </label>
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full h-11 bg-slate-50 dark:bg-[#050508] border border-slate-300 dark:border-[#333] text-slate-900 dark:text-white px-3 text-[11px] font-mono outline-none focus:border-[#FF5A00] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-600 dark:text-[#888] uppercase block">
                  TÍTULO DA SALA
                </label>
                <input
                  type="text"
                  value={youtubeTitle}
                  onChange={(e) => setYoutubeTitle(e.target.value)}
                  placeholder="Ex: Sessão de Cinema com a Galera"
                  className="w-full h-11 bg-slate-50 dark:bg-[#050508] border border-slate-300 dark:border-[#333] text-slate-900 dark:text-white px-3 text-[11px] font-mono outline-none focus:border-[#FF5A00] transition-colors"
                />
              </div>

              {coverPreview && (
                <div className="relative aspect-video w-full bg-black overflow-hidden border border-slate-300 dark:border-[#333]">
                  <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <button
                onClick={handleCreateYoutubeRoom}
                disabled={isSaving || !emailVerified}
                className="w-full py-3.5 bg-[#FF5A00] hover:bg-slate-900 dark:hover:bg-white text-white dark:text-black font-mono font-black text-[11px] uppercase tracking-widest transition-all duration-150 shadow-[0_0_20px_rgba(255,90,0,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
                <span>
                  {!emailVerified
                    ? '[ E-MAIL NÃO CONFIRMADO ]'
                    : isSaving
                    ? '[ INICIANDO SALA... ]'
                    : '[ INICIAR SALA COM VÍDEO ]'}
                </span>
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
                    if (typeof window !== 'undefined') {
                      sessionStorage.setItem(
                        `pending_room_video_${roomCode}`,
                        JSON.stringify({ url: file.url, title: file.name })
                      )
                    }
                    broadcastInvitesToFriends(roomCode)
                    onClose()
                    window.location.href = `/room/${roomCode}`
                  }
                }}
                onUploadError={(error: Error) => {
                  toast.error(`Erro no upload: ${error.message}`)
                }}
                className="ut-label:text-[#FF5A00] ut-button:bg-[#FF5A00] border-2 border-dashed border-slate-300 dark:border-[#333] bg-slate-50 dark:bg-[#050508] p-6 transition-colors"
              />
            </div>
          )}

          {activeTab === 'empty' && (
            <div className="space-y-4 text-center py-4">
              <p className="text-[11px] font-mono text-slate-500 dark:text-[#888] leading-relaxed max-w-sm mx-auto">
                Crie uma sala vazia pronta para compartilhar sua tela ou adicionar vídeos depois pelo chat.
              </p>
              <button
                onClick={handleCreateEmptyRoom}
                disabled={!emailVerified}
                className="w-full py-3.5 bg-[#FF5A00] hover:bg-slate-900 dark:hover:bg-white text-white dark:text-black font-mono font-black text-[11px] uppercase tracking-widest transition-all duration-150 shadow-[0_0_20px_rgba(255,90,0,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {!emailVerified ? '[ E-MAIL NÃO CONFIRMADO ]' : '[ INICIAR SALA LIVRE AGORA ]'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
