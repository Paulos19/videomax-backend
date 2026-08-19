'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Film,
  Folder,
  FolderPlus,
  Upload,
  MoreVertical,
  Trash2,
  FolderOpen,
  ArrowLeft,
  X,
  Check,
  Pencil,
  Plus,
  Sparkles,
  Search,
  Play,
  Crown,
  Radio,
  ExternalLink,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { YoutubeIcon } from '@/components/icons/youtube'
import { toast } from 'sonner'
import { UploadDropzone } from '@/lib/uploadthing'
import {
  getVideosWithFolders,
  createFolder,
  deleteFolder,
  renameFolder,
  saveVideo,
  deleteVideo,
  moveVideoToFolder,
} from '../../actions'
import { isYouTubeUrl, getYouTubeThumbnail } from '@/lib/youtube'
import { useSession } from 'next-auth/react'
import { LibraryVault3DView } from '@/components/dashboard/library-vault-3d'
import { CreateRoomDialog } from '../components/create-room-dialog'
import { cn } from '@/lib/utils'

interface VideoItem {
  id: string
  title: string
  url: string
  folderId: string | null
  createdAt: Date | string
}

interface FolderItem {
  id: string
  name: string
  createdAt: Date | string
}

export default function VideosPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const [videos, setVideos] = useState<VideoItem[]>([])
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFolder, setActiveFolder] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [editingFolder, setEditingFolder] = useState<string | null>(null)
  const [editFolderName, setEditFolderName] = useState('')
  const [liveUser, setLiveUser] = useState<any>(null)

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [addTab, setAddTab] = useState<'youtube' | 'upload'>('youtube')
  const [createRoomOpen, setCreateRoomOpen] = useState(false)
  const [preselectedVideoUrl, setPreselectedVideoUrl] = useState('')

  // YouTube state
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [youtubeTitle, setYoutubeTitle] = useState('')
  const [isSavingYoutube, setIsSavingYoutube] = useState(false)
  const [youtubeError, setYoutubeError] = useState('')

  const loadData = useCallback(async () => {
    try {
      const [data, meRes] = await Promise.all([
        getVideosWithFolders(),
        fetch('/api/user/me').then((res) => (res.ok ? res.json() : null)),
      ])
      setVideos(data.videos as VideoItem[])
      setFolders(data.folders as FolderItem[])
      if (meRes?.user) setLiveUser(meRes.user)
    } catch {
      toast.error('Erro ao carregar biblioteca.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const user = liveUser || session?.user
  const userPlan = (user?.plan || 'FREE').toUpperCase()
  const isPro = userPlan === 'PRO' || userPlan === 'MAXPRO'

  // Limits based on plan
  const maxVideos = isPro ? Infinity : 10
  const maxFolders = isPro ? Infinity : 3
  const isAtVideoLimit = !isPro && videos.length >= maxVideos
  const isAtFolderLimit = !isPro && folders.length >= maxFolders

  const filteredVideos = useMemo(() => {
    const list = activeFolder
      ? videos.filter((v) => v.folderId === activeFolder)
      : videos

    if (!searchQuery.trim()) return list
    const q = searchQuery.toLowerCase().trim()
    return list.filter((v) => v.title.toLowerCase().includes(q))
  }, [videos, activeFolder, searchQuery])

  const activeFolderName = activeFolder
    ? folders.find((f) => f.id === activeFolder)?.name || 'Pasta'
    : null

  const handleCreateFolder = useCallback(async () => {
    if (!newFolderName.trim()) return
    if (isAtFolderLimit) {
      toast.error('Limite de 3 pastas atingido no Plano Free.', {
        description: 'Faça upgrade para o MAXPRO para criar pastas ilimitadas!',
      })
      return
    }

    try {
      await createFolder(newFolderName.trim())
      setNewFolderName('')
      setShowNewFolder(false)
      toast.success('Pasta criada com sucesso!')
      await loadData()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao criar pasta')
    }
  }, [newFolderName, isAtFolderLimit, loadData])

  const handleRenameFolder = useCallback(
    async (folderId: string) => {
      if (!editFolderName.trim()) return
      try {
        await renameFolder(folderId, editFolderName.trim())
        setEditingFolder(null)
        setEditFolderName('')
        toast.success('Pasta renomeada!')
        await loadData()
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Erro ao renomear pasta')
      }
    },
    [editFolderName, loadData]
  )

  const handleDeleteFolder = useCallback(
    async (folderId: string) => {
      if (!confirm('Excluir esta pasta? Os vídeos permanecerão na sua biblioteca.')) return
      try {
        await deleteFolder(folderId)
        if (activeFolder === folderId) setActiveFolder(null)
        toast.success('Pasta excluída.')
        await loadData()
      } catch {
        toast.error('Erro ao excluir pasta.')
      }
    },
    [activeFolder, loadData]
  )

  const handleDeleteVideo = useCallback(
    async (videoId: string) => {
      if (!confirm('Remover este vídeo da sua biblioteca?')) return
      try {
        await deleteVideo(videoId)
        toast.success('Vídeo removido da biblioteca.')
        await loadData()
      } catch {
        toast.error('Erro ao excluir vídeo.')
      }
    },
    [loadData]
  )

  const handleMoveVideo = useCallback(
    async (videoId: string, folderId: string | null) => {
      try {
        await moveVideoToFolder(videoId, folderId)
        toast.success('Vídeo organizado com sucesso!')
        await loadData()
      } catch {
        toast.error('Erro ao mover vídeo.')
      }
    },
    [loadData]
  )

  const handleSaveYoutube = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!youtubeUrl.trim()) return
    if (!isYouTubeUrl(youtubeUrl)) {
      setYoutubeError('Insira um link válido do YouTube')
      return
    }

    if (isAtVideoLimit) {
      toast.error('Limite de 10 vídeos atingido no Plano Free.', {
        description: 'Faça upgrade para o MAXPRO para salvar vídeos ilimitados!',
      })
      return
    }

    setIsSavingYoutube(true)
    setYoutubeError('')

    try {
      const title = youtubeTitle.trim() || 'Vídeo do YouTube'
      await saveVideo(title, youtubeUrl.trim(), activeFolder)
      setYoutubeUrl('')
      setYoutubeTitle('')
      setShowAddModal(false)
      toast.success('Vídeo salvo na biblioteca!')
      await loadData()
    } catch (err: unknown) {
      setYoutubeError(err instanceof Error ? err.message : 'Erro ao salvar vídeo')
    } finally {
      setIsSavingYoutube(false)
    }
  }

  const handleStartRoomWithVideo = (video: VideoItem) => {
    setPreselectedVideoUrl(video.url)
    setCreateRoomOpen(true)
  }

  const detectedThumb = useMemo(() => {
    if (youtubeUrl && isYouTubeUrl(youtubeUrl)) {
      return getYouTubeThumbnail(youtubeUrl)
    }
    return null
  }, [youtubeUrl])

  return (
    <div className="space-y-6">
      
      {/* ── HEADER COMMAND BANNER ─────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[#09090D] border border-[#222] p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div
          className={cn(
            'absolute top-0 right-0 w-80 h-full blur-3xl pointer-events-none opacity-20 transition-colors',
            isPro ? 'bg-[#FFE600]' : 'bg-[#FF5A00]'
          )}
        />

        {/* Left Info */}
        <div className="flex items-center gap-4 relative z-10 flex-1 min-w-0">
          <div
            className={cn(
              'w-12 h-12 flex items-center justify-center font-black shrink-0 shadow-[0_0_20px_rgba(255,90,0,0.3)]',
              isPro ? 'bg-[#FFE600] text-black' : 'bg-[#FF5A00] text-black'
            )}
          >
            <Film className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-[#FF5A00] uppercase font-bold tracking-widest bg-[#14141E] px-2 py-0.5 border border-[#222]">
                [ CLOUD STORAGE // NUVEM ]
              </span>
              {isPro ? (
                <span className="flex items-center gap-1 bg-[#1E1408] border border-[#FFE600]/40 px-2 py-0.2 text-[#FFE600] font-mono text-[9px] font-bold uppercase">
                  <Crown className="w-2.5 h-2.5 fill-[#FFE600]" />
                  CLUSTER VIP ILIMITADO ∞
                </span>
              ) : (
                <span className="text-[9px] font-mono text-[#777] bg-[#111] border border-[#222] px-2 py-0.2 uppercase">
                  CAPACIDADE: {videos.length}/10 VÍDEOS
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black font-mono text-white uppercase tracking-tight truncate">
              BIBLIOTECA DE VÍDEOS
            </h1>
            <p className="text-[11px] font-mono text-[#888] truncate">
              {videos.length} vídeos salvos • {folders.length} pastas organizadas
            </p>
          </div>
        </div>

        {/* Center: 3D Holographic Film Cassette */}
        <div className="hidden lg:flex items-center justify-center relative z-10">
          <LibraryVault3DView isPro={isPro} className="w-28 h-24 relative" />
        </div>

        {/* Right Actions */}
        <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => setShowNewFolder(true)}
            className="py-2.5 px-4 bg-[#121218] hover:bg-[#1C1C24] text-white border border-[#333] hover:border-[#FF5A00] font-mono font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[#FF5A00]" />
            <span>[ NOVA PASTA ]</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="py-2.5 px-5 bg-[#FF5A00] hover:bg-white text-black font-mono font-black text-[11px] uppercase tracking-widest transition-all duration-150 shadow-[0_0_20px_rgba(255,90,0,0.35)] flex items-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>[ ADICIONAR VÍDEO ]</span>
          </button>
        </div>
      </div>

      {/* ── PLAN CAPACITY NOTIFICATION (FREE VS MAXPRO) ───────────── */}
      {!isPro && (
        <div className="p-3 bg-gradient-to-r from-[#1A1208] to-[#0A0704] border border-[#FF5A00]/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF5A00] animate-pulse" />
            <span className="text-[#DDD]">
              Plano Free: <strong>{videos.length}/10</strong> vídeos e <strong>{folders.length}/3</strong> pastas.
            </span>
          </div>
          <button
            onClick={() => router.push('/dashboard/loja')}
            className="text-[10px] font-bold text-[#FFE600] hover:underline uppercase flex items-center gap-1"
          >
            <span>DESBLOQUEAR ARMAZENAMENTO ILIMITADO NO MAXPRO →</span>
          </button>
        </div>
      )}

      {/* ── SEARCH & FOLDERS BAR ───────────────────────────────────── */}
      <div className="space-y-4">
        
        {/* Search Bar */}
        <div className="relative max-w-md">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none text-[#FF5A00] font-mono text-[11px]">
            <span className="animate-pulse">_</span>
            <Search className="w-3.5 h-3.5 text-[#777]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="BUSCAR VÍDEOS NA BIBLIOTECA..."
            className="w-full h-10 bg-[#09090D] border border-[#222] text-[#F5F5F5] pl-10 pr-12 text-[11px] font-mono placeholder:text-[#555] outline-none focus:border-[#FF5A00] transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 border border-[#333] bg-[#050505] text-[9px] font-mono text-[#777] pointer-events-none hidden sm:block">
            ⌘ K
          </div>
        </div>

        {/* Folders Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {/* Root All Folder */}
          <button
            onClick={() => setActiveFolder(null)}
            className={cn(
              'px-3.5 py-2 text-[10px] font-mono uppercase font-bold border transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap',
              activeFolder === null
                ? 'bg-[#FF5A00] text-black border-[#FF5A00] shadow-[0_0_12px_rgba(255,90,0,0.3)]'
                : 'bg-[#09090D] text-[#777] border-[#222] hover:text-white hover:border-[#333]'
            )}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>[ TODOS OS VÍDEOS ]</span>
            <span className="text-[9px] px-1 py-0.2 bg-black/40 text-current font-bold">
              {videos.length}
            </span>
          </button>

          {/* Individual Folders */}
          {folders.map((f) => {
            const isActive = activeFolder === f.id
            const folderVideoCount = videos.filter((v) => v.folderId === f.id).length

            return (
              <div key={f.id} className="relative group shrink-0">
                <button
                  onClick={() => setActiveFolder(f.id)}
                  className={cn(
                    'px-3.5 py-2 text-[10px] font-mono uppercase font-bold border transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap',
                    isActive
                      ? isPro
                        ? 'bg-[#FFE600] text-black border-[#FFE600] shadow-[0_0_12px_rgba(255,230,0,0.3)]'
                        : 'bg-[#FF5A00] text-black border-[#FF5A00] shadow-[0_0_12px_rgba(255,90,0,0.3)]'
                      : 'bg-[#09090D] text-[#888] border-[#222] hover:text-white hover:border-[#333]'
                  )}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>{f.name}</span>
                  <span className="text-[9px] px-1 py-0.2 bg-black/40 text-current font-bold">
                    {folderVideoCount}
                  </span>
                </button>

                {/* Folder Actions (Delete / Rename) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteFolder(f.id)
                  }}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#EF2020] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[8px] cursor-pointer"
                  title="Excluir pasta"
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── VIDEOS GRID ────────────────────────────────────────────── */}
      {filteredVideos.length === 0 ? (
        <div className="p-12 bg-[#09090D] border border-[#222] text-center space-y-4 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: 'linear-gradient(#FF5A00 1px, transparent 1px), linear-gradient(90deg, #FF5A00 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative z-10 max-w-[460px] mx-auto space-y-3">
            <div className="w-12 h-12 bg-[#14141E] border border-[#333] flex items-center justify-center mx-auto text-[#FF5A00]">
              <Film className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-mono font-bold text-white uppercase">
              {searchQuery ? `Nenhum vídeo com "${searchQuery}"` : 'Sua biblioteca está vazia'}
            </h3>

            <p className="text-[11px] font-mono text-[#888]">
              {activeFolder
                ? `Esta pasta "${activeFolderName}" ainda não possui vídeos associados.`
                : 'Adicione links do YouTube ou faça upload de arquivos de vídeo MP4 para assistir com seus amigos.'}
            </p>

            <div className="pt-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-[#FF5A00] hover:bg-white text-black font-mono font-black text-[11px] uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,90,0,0.35)] cursor-pointer"
              >
                [ + ADICIONAR PRIMEIRO VÍDEO ]
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredVideos.map((video) => {
            const isYT = isYouTubeUrl(video.url)
            const thumb = isYT ? getYouTubeThumbnail(video.url) : null
            const currentFolder = folders.find((f) => f.id === video.folderId)

            return (
              <div
                key={video.id}
                className="group relative bg-[#09090D] border border-[#222] hover:border-[#FF5A00] flex flex-col justify-between overflow-hidden shadow-xl transition-all duration-200"
              >
                {/* Thumbnail Header */}
                <div className="relative aspect-video w-full bg-[#050508] overflow-hidden border-b border-[#222]">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#121218]">
                      <Film className="w-8 h-8 text-[#FF5A00]/50" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />

                  {/* Platform Badge */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/80 border border-[#333] px-2 py-0.5 text-white font-mono text-[9px] font-bold uppercase">
                    {isYT ? (
                      <>
                        <YoutubeIcon className="w-3 h-3 text-[#EF2020]" />
                        <span>YOUTUBE</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3 h-3 text-[#3B82F6]" />
                        <span>NUVEM MP4</span>
                      </>
                    )}
                  </div>

                  {/* Folder Tag */}
                  {currentFolder && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-[#151520] border border-[#333] px-2 py-0.5 text-[#FFE600] font-mono text-[9px] font-bold">
                      <Folder className="w-2.5 h-2.5" />
                      <span>{currentFolder.name}</span>
                    </div>
                  )}
                </div>

                {/* Info Body */}
                <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-[12px] font-mono font-bold text-white uppercase group-hover:text-[#FF5A00] transition-colors line-clamp-2 leading-snug">
                      {video.title}
                    </h3>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-[#1C1C24] space-y-2">
                    {/* Primary Action: Start Room */}
                    <button
                      onClick={() => handleStartRoomWithVideo(video)}
                      className="w-full py-2 bg-[#FF5A00] hover:bg-white text-black font-mono font-black text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(255,90,0,0.2)]"
                    >
                      <Play className="w-3 h-3 fill-black" />
                      <span>CRIAR SALA NESTE VÍDEO</span>
                    </button>

                    {/* Secondary Actions (Move to folder & Delete) */}
                    <div className="flex items-center justify-between gap-2 pt-1 text-[9px] font-mono">
                      {/* Move Folder Select */}
                      <select
                        value={video.folderId || ''}
                        onChange={(e) => handleMoveVideo(video.id, e.target.value || null)}
                        className="bg-[#050508] border border-[#222] text-[#888] hover:text-white px-2 py-1 outline-none text-[9px] font-mono max-w-[140px] cursor-pointer"
                      >
                        <option value="">Sem Pasta</option>
                        {folders.map((f) => (
                          <option key={f.id} value={f.id}>
                            📁 {f.name}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="p-1 text-[#777] hover:text-[#EF2020] transition-colors cursor-pointer"
                        title="Remover vídeo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── MODAL: CREATE NEW FOLDER ──────────────────────────────── */}
      {showNewFolder && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowNewFolder(false)}
        >
          <div
            className="w-full max-w-md bg-[#09090D] border border-[#222] p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-[#FF5A00]" />
                <h3 className="font-mono font-bold text-white text-sm uppercase">
                  [ CRIAR NOVA PASTA ]
                </h3>
              </div>
              <button
                onClick={() => setShowNewFolder(false)}
                className="text-[#777] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-mono text-[#888] uppercase block">
                NOME DA PASTA
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Ex: Animes, Músicas, Podcasts..."
                className="w-full h-11 bg-[#050508] border border-[#333] text-white px-3 text-[11px] font-mono outline-none focus:border-[#FF5A00]"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowNewFolder(false)}
                className="px-4 py-2 border border-[#333] text-[#888] hover:text-white font-mono text-[10px] uppercase cursor-pointer"
              >
                CANCELAR
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-5 py-2 bg-[#FF5A00] hover:bg-white text-black font-mono font-black text-[10px] uppercase cursor-pointer"
              >
                CRIAR PASTA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD VIDEO ──────────────────────────────────────── */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="w-full max-w-lg bg-[#09090D] border border-[#222] p-6 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#FF5A00]" />
                <h3 className="font-mono font-bold text-white text-sm uppercase">
                  [ ADICIONAR VÍDEO À BIBLIOTECA ]
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#777] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Add Tabs */}
            <div className="flex items-center gap-2 border-b border-[#222] pb-3">
              <button
                onClick={() => setAddTab('youtube')}
                className={cn(
                  'px-3.5 py-1.5 font-mono text-[10px] uppercase font-bold border transition-all flex items-center gap-1.5',
                  addTab === 'youtube'
                    ? 'bg-[#EF2020] text-white border-[#EF2020]'
                    : 'bg-[#121218] text-[#777] border-[#333] hover:text-white'
                )}
              >
                <YoutubeIcon className="w-3.5 h-3.5" />
                <span>LINK DO YOUTUBE</span>
              </button>

              <button
                onClick={() => setAddTab('upload')}
                className={cn(
                  'px-3.5 py-1.5 font-mono text-[10px] uppercase font-bold border transition-all flex items-center gap-1.5',
                  addTab === 'upload'
                    ? 'bg-[#3B82F6] text-white border-[#3B82F6]'
                    : 'bg-[#121218] text-[#777] border-[#333] hover:text-white'
                )}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>UPLOAD MP4 / NUVEM</span>
              </button>
            </div>

            {/* Tab: YouTube */}
            {addTab === 'youtube' ? (
              <form onSubmit={handleSaveYoutube} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-[#888] uppercase block">
                    URL DO VÍDEO (YOUTUBE)
                  </label>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full h-11 bg-[#050508] border border-[#333] text-white px-3 text-[11px] font-mono outline-none focus:border-[#FF5A00]"
                    required
                  />
                  {youtubeError && (
                    <p className="text-[10px] font-mono text-[#EF2020]">{youtubeError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-[#888] uppercase block">
                    TÍTULO PERSONALIZADO (OPCIONAL)
                  </label>
                  <input
                    type="text"
                    value={youtubeTitle}
                    onChange={(e) => setYoutubeTitle(e.target.value)}
                    placeholder="Nome do vídeo para sua biblioteca..."
                    className="w-full h-11 bg-[#050508] border border-[#333] text-white px-3 text-[11px] font-mono outline-none focus:border-[#FF5A00]"
                  />
                </div>

                {/* Instant Thumbnail Preview */}
                {detectedThumb && (
                  <div className="p-3 bg-[#050508] border border-[#222] space-y-2">
                    <span className="text-[9px] font-mono text-[#22C55E] uppercase block">
                      ✓ VÍDEO DETECTADO COM SUCESSO:
                    </span>
                    <div className="relative aspect-video w-44 bg-black overflow-hidden border border-[#333]">
                      <img src={detectedThumb} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-[#333] text-[#888] hover:text-white font-mono text-[10px] uppercase cursor-pointer"
                  >
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingYoutube}
                    className="px-6 py-2.5 bg-[#FF5A00] hover:bg-white text-black font-mono font-black text-[10px] uppercase transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingYoutube ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>SALVAR NA BIBLIOTECA</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Tab: Upload Dropzone */
              <div className="space-y-4">
                <UploadDropzone
                  endpoint="videoUploader"
                  onClientUploadComplete={async (res) => {
                    if (res && res[0]) {
                      const file = res[0]
                      await saveVideo(file.name, file.url, activeFolder)
                      setShowAddModal(false)
                      toast.success('Upload concluído com sucesso!')
                      await loadData()
                    }
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(`Erro no upload: ${error.message}`)
                  }}
                  className="ut-label:text-[#FF5A00] ut-button:bg-[#FF5A00] border-2 border-dashed border-[#333] bg-[#050508] p-6"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Room Dialog with preselected video */}
      {createRoomOpen && (
        <CreateRoomDialog
          initialVideoUrl={preselectedVideoUrl}
          onClose={() => {
            setCreateRoomOpen(false)
            setPreselectedVideoUrl('')
          }}
        />
      )}
    </div>
  )
}
