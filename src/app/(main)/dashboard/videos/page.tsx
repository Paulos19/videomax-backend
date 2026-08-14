'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Film, Folder, FolderPlus, Upload, MoreVertical, Trash2,
  FolderOpen, ArrowLeft, X, Check, Pencil, GripVertical,
  Plus, Sparkles, Search
} from 'lucide-react'
import { YoutubeIcon } from '@/components/icons/youtube'
import { toast } from 'sonner'
import { UploadDropzone } from '@/lib/uploadthing'
import {
  getVideosWithFolders, createFolder, deleteFolder, renameFolder,
  saveVideo, deleteVideo, moveVideoToFolder
} from '../../actions'
import { isYouTubeUrl, getYouTubeThumbnail } from '@/lib/youtube'
import { useSession } from 'next-auth/react'
import { HomeHeader } from '../components/home-header'

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
  const { data: session } = useSession();

  const [videos, setVideos] = useState<VideoItem[]>([])
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFolder, setActiveFolder] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [editingFolder, setEditingFolder] = useState<string | null>(null)
  const [editFolderName, setEditFolderName] = useState('')
  const [contextMenu, setContextMenu] = useState<{ type: 'video' | 'folder'; id: string; x: number; y: number } | null>(null)

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [addTab, setAddTab] = useState<'youtube' | 'upload'>('youtube')

  // YouTube state
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [youtubeTitle, setYoutubeTitle] = useState('')
  const [isSavingYoutube, setIsSavingYoutube] = useState(false)
  const [youtubeError, setYoutubeError] = useState('')

  // Upload state
  const [uploadTitle, setUploadTitle] = useState('')
  const [addSuccess, setAddSuccess] = useState(false)
  const [movingVideo, setMovingVideo] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      const data = await getVideosWithFolders()
      setVideos(data.videos as VideoItem[])
      setFolders(data.folders as FolderItem[])
    } catch {
      toast.error('Erro ao carregar vídeos e pastas.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Close context menu on click outside
  useEffect(() => {
    const handler = () => setContextMenu(null)
    if (contextMenu) {
      document.addEventListener('click', handler)
      return () => document.removeEventListener('click', handler)
    }
  }, [contextMenu])

  const filteredVideos = (
    activeFolder
      ? videos.filter(v => v.folderId === activeFolder)
      : videos.filter(v => !v.folderId)
  ).filter(v => {
    if (!searchQuery.trim()) return true
    return v.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
  })

  const activeFolderName = activeFolder
    ? folders.find(f => f.id === activeFolder)?.name || 'Pasta'
    : null

  const handleCreateFolder = useCallback(async () => {
    if (!newFolderName.trim()) return
    try {
      await createFolder(newFolderName.trim())
      setNewFolderName('')
      setShowNewFolder(false)
      toast.success('Pasta criada com sucesso!')
      await loadData()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao criar pasta')
    }
  }, [newFolderName, loadData])

  const handleRenameFolder = useCallback(async (folderId: string) => {
    if (!editFolderName.trim()) return
    try {
      await renameFolder(folderId, editFolderName.trim())
      setEditingFolder(null)
      setEditFolderName('')
      toast.success('Pasta renomeada com sucesso!')
      await loadData()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao renomear pasta')
    }
  }, [editFolderName, loadData])

  const handleDeleteFolder = useCallback(async (folderId: string) => {
    if (!confirm('Excluir esta pasta? Os vídeos voltarão para a raiz da biblioteca.')) return
    try {
      await deleteFolder(folderId)
      if (activeFolder === folderId) setActiveFolder(null)
      toast.success('Pasta excluída.')
      await loadData()
    } catch {
      toast.error('Erro ao excluir pasta.')
    }
  }, [activeFolder, loadData])

  const handleDeleteVideo = useCallback(async (videoId: string) => {
    if (!confirm('Excluir este vídeo da sua biblioteca?')) return
    try {
      await deleteVideo(videoId)
      toast.success('Vídeo removido.')
      await loadData()
    } catch {
      toast.error('Erro ao excluir vídeo.')
    }
  }, [loadData])

  const handleMoveVideo = useCallback(async (videoId: string, folderId: string | null) => {
    try {
      await moveVideoToFolder(videoId, folderId)
      setMovingVideo(null)
      toast.success('Vídeo movido!')
      await loadData()
    } catch {
      toast.error('Erro ao mover vídeo.')
    }
  }, [loadData])

  const handleUploadComplete = useCallback(async (url: string) => {
    const title = uploadTitle.trim() || 'Vídeo Upload'
    await saveVideo(title, url, activeFolder)
    setAddSuccess(true)
    setUploadTitle('')
    toast.success('Vídeo enviado com sucesso!')
    await loadData()
  }, [uploadTitle, activeFolder, loadData])

  const handleSaveYoutube = useCallback(async () => {
    setYoutubeError('')
    const url = youtubeUrl.trim()
    const title = youtubeTitle.trim()

    if (!url) {
      setYoutubeError('Por favor, insira a URL do vídeo.')
      return
    }

    if (!isYouTubeUrl(url)) {
      setYoutubeError('URL do YouTube inválida. Ex: https://www.youtube.com/watch?v=...')
      return
    }

    if (!title) {
      setYoutubeError('Por favor, defina um título para o vídeo.')
      return
    }

    try {
      setIsSavingYoutube(true)
      await saveVideo(title, url, activeFolder)
      setAddSuccess(true)
      setYoutubeUrl('')
      setYoutubeTitle('')
      toast.success('Vídeo do YouTube salvo!')
      await loadData()
    } catch (e: unknown) {
      setYoutubeError(e instanceof Error ? e.message : 'Erro ao salvar vídeo.')
    } finally {
      setIsSavingYoutube(false)
    }
  }, [youtubeUrl, youtubeTitle, activeFolder, loadData])

  const showContextMenu = useCallback((e: React.MouseEvent, type: 'video' | 'folder', id: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ type, id, x: e.clientX, y: e.clientY })
  }, [])

  return (
    <div className="w-full min-w-0 space-y-6 animate-fade-in">
      {/* Top Header */}
      <HomeHeader user={session?.user} />
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-[#0B0B0B] border border-[#242424] relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF5A00]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3">
            {activeFolder && (
              <button
                onClick={() => setActiveFolder(null)}
                className="w-10 h-10 rounded-xl bg-[#151515] border border-[#242424] hover:border-[#FF5A00] flex items-center justify-center text-[#8A8A8A] hover:text-[#F5F5F5] transition-all"
                title="Voltar para a raiz"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            <div className="w-12 h-12 rounded-2xl brand-gradient flex items-center justify-center text-white brand-glow-strong shrink-0">
              <Folder className="w-6 h-6" />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] tracking-tight">
                {activeFolder ? activeFolderName : 'Biblioteca de Vídeos'}
              </h1>
              <p className="text-xs sm:text-sm text-[#8A8A8A]">
                {activeFolder
                  ? `${filteredVideos.length} vídeos salvos nesta pasta`
                  : `${videos.length} vídeos salvos · ${folders.length} pastas organizadas`}
              </p>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3 relative z-10 shrink-0">
          {!activeFolder && (
            <button
              onClick={() => setShowNewFolder(true)}
              className="py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#151515] border border-[#242424] hover:border-[#FF5A00] text-[#F5F5F5] transition-all flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4 text-[#FF5A00]" />
              <span>Nova pasta</span>
            </button>
          )}

          <button
            onClick={() => { setShowAddModal(true); setAddSuccess(false) }}
            className="py-3 px-5 rounded-xl font-bold text-xs sm:text-sm text-white brand-gradient brand-glow-strong hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 shadow-xl border border-amber-400/30"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar vídeo</span>
          </button>
        </div>
      </div>

      {/* New Folder Inline Form */}
      {showNewFolder && (
        <div className="p-4 rounded-xl bg-[#0B0B0B] border border-[#FF5A00]/50 flex items-center gap-3 animate-fade-in">
          <FolderPlus className="w-5 h-5 text-[#FF5A00] shrink-0" />
          <input
            autoFocus
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolder()
              if (e.key === 'Escape') { setShowNewFolder(false); setNewFolderName('') }
            }}
            placeholder="Digite o nome da nova pasta..."
            className="flex-1 bg-[#151515] border border-[#242424] text-[#F5F5F5] px-4 py-2.5 rounded-xl text-sm placeholder:text-[#5F5F5F] outline-none focus:border-[#FF5A00] transition-all"
          />
          <button
            onClick={handleCreateFolder}
            className="px-4 py-2.5 rounded-xl brand-gradient text-white text-xs font-bold flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            <span>Criar</span>
          </button>
          <button
            onClick={() => { setShowNewFolder(false); setNewFolderName('') }}
            className="p-2.5 rounded-xl bg-[#151515] text-[#8A8A8A] hover:text-[#F5F5F5]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Input Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar vídeos na biblioteca..."
          className="w-full bg-[#0B0B0B] border border-[#242424] text-[#F5F5F5] pl-11 pr-4 py-2.5 rounded-xl text-xs sm:text-sm placeholder:text-[#5F5F5F] outline-none focus:border-[#FF5A00] transition-all"
        />
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#8A8A8A] text-sm font-medium">
          Carregando biblioteca de vídeos...
        </div>
      ) : (
        <div className="space-y-8">
          {/* Folders Section (Root View) */}
          {!activeFolder && folders.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">Pastas</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {folders.map((folder) => {
                  const count = videos.filter(v => v.folderId === folder.id).length
                  return (
                    <div
                      key={folder.id}
                      className="group relative bg-[#0B0B0B] border border-[#242424] hover:border-[#FF5A00]/50 rounded-2xl p-4 cursor-pointer hover:bg-[#111111] transition-all duration-300 shadow-md"
                      onClick={() => setActiveFolder(folder.id)}
                      onContextMenu={(e) => showContextMenu(e, 'folder', folder.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FF5A00]/10 border border-[#FF5A00]/30 flex items-center justify-center text-[#FF5A00]">
                          <Folder className="w-5 h-5" />
                        </div>
                        <button
                          onClick={(e) => showContextMenu(e, 'folder', folder.id)}
                          className="w-7 h-7 rounded-lg opacity-0 group-hover:opacity-100 bg-[#151515] flex items-center justify-center text-[#8A8A8A] hover:text-[#F5F5F5] transition-all"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {editingFolder === folder.id ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            autoFocus
                            value={editFolderName}
                            onChange={(e) => setEditFolderName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameFolder(folder.id)
                              if (e.key === 'Escape') setEditingFolder(null)
                            }}
                            onBlur={() => handleRenameFolder(folder.id)}
                            className="flex-1 bg-[#151515] border border-[#FF5A00] text-[#F5F5F5] px-2 py-1 rounded-lg text-xs outline-none"
                          />
                        </div>
                      ) : (
                        <>
                          <p className="text-[#F5F5F5] text-sm font-bold truncate group-hover:text-[#FF5A00] transition-colors">
                            {folder.name}
                          </p>
                          <p className="text-[#8A8A8A] text-xs mt-0.5 font-medium">
                            {count} {count === 1 ? 'vídeo' : 'vídeos'}
                          </p>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Videos Grid Section */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">
              {activeFolder ? 'Vídeos nesta pasta' : 'Todos os Vídeos'}
            </h2>

            {filteredVideos.length === 0 ? (
              <div className="py-16 text-center bg-[#0B0B0B] border border-[#242424] rounded-2xl space-y-4 max-w-md mx-auto p-6">
                <Film className="w-12 h-12 text-[#FF5A00]/40 mx-auto" />
                <div>
                  <h3 className="text-base font-bold text-[#F5F5F5]">Nenhum vídeo nesta pasta</h3>
                  <p className="text-xs text-[#8A8A8A] mt-1">
                    Adicione links do YouTube ou envie vídeos para assistir com seus amigos nas salas.
                  </p>
                </div>
                <button
                  onClick={() => { setShowAddModal(true); setAddSuccess(false) }}
                  className="py-2.5 px-4 rounded-xl brand-gradient text-white text-xs font-bold inline-flex items-center gap-1.5 brand-glow-strong hover:scale-105 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar primeiro vídeo</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video) => {
                  const isYt = isYouTubeUrl(video.url)
                  const ytThumb = isYt ? getYouTubeThumbnail(video.url) : null

                  return (
                    <div
                      key={video.id}
                      className="group relative bg-[#0B0B0B] border border-[#242424] hover:border-[#FF5A00]/50 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-xl flex flex-col justify-between"
                    >
                      {/* Video Thumbnail Header */}
                      <div className="relative aspect-video w-full bg-[#151515] overflow-hidden flex items-center justify-center">
                        {ytThumb ? (
                          <img
                            src={ytThumb}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#151515] via-[#111111] to-[#0B0B0B] flex items-center justify-center">
                            <Film className="w-10 h-10 text-[#FF5A00]/40" />
                          </div>
                        )}

                        {/* YouTube Badge */}
                        {isYt && (
                          <div className="absolute top-3 left-3 bg-[#EF2020] text-white px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-md">
                            <YoutubeIcon className="w-3.5 h-3.5" />
                            <span>YouTube</span>
                          </div>
                        )}

                        {/* Move overlay */}
                        {movingVideo === video.id && (
                          <div className="absolute inset-0 bg-[#0B0B0B]/95 flex flex-col p-4 z-10 space-y-2">
                            <p className="text-xs font-bold text-[#F5F5F5]">Mover vídeo para:</p>
                            <div className="space-y-1 overflow-y-auto max-h-32">
                              <button
                                onClick={() => handleMoveVideo(video.id, null)}
                                className={cn(
                                  "w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2",
                                  !video.folderId ? "bg-[#FF5A00]/10 text-[#FF5A00]" : "text-[#8A8A8A] hover:bg-[#151515]"
                                )}
                              >
                                <FolderOpen className="w-3.5 h-3.5" />
                                <span>Raiz (Sem pasta)</span>
                              </button>
                              {folders.map((f) => (
                                <button
                                  key={f.id}
                                  onClick={() => handleMoveVideo(video.id, f.id)}
                                  className={cn(
                                    "w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2",
                                    video.folderId === f.id ? "bg-[#FF5A00]/10 text-[#FF5A00]" : "text-[#8A8A8A] hover:bg-[#151515]"
                                  )}
                                >
                                  <Folder className="w-3.5 h-3.5" />
                                  <span>{f.name}</span>
                                </button>
                              ))}
                            </div>
                            <button
                              onClick={() => setMovingVideo(null)}
                              className="text-[11px] text-[#8A8A8A] hover:text-[#F5F5F5] pt-1"
                            >
                              Cancelar
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Video Info Footer */}
                      <div className="p-4 flex items-center justify-between gap-3 border-t border-[#242424]">
                        <div className="min-w-0 flex-1">
                          <p className="text-[#F5F5F5] font-bold text-sm truncate group-hover:text-[#FF5A00] transition-colors">
                            {video.title}
                          </p>
                          <p className="text-[#8A8A8A] text-xs mt-0.5">
                            {new Date(video.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => { e.stopPropagation(); setMovingVideo(movingVideo === video.id ? null : video.id) }}
                            className="p-2 rounded-lg bg-[#151515] text-[#8A8A8A] hover:text-[#F5F5F5] transition-colors"
                            title="Mover para pasta"
                          >
                            <GripVertical className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => showContextMenu(e, 'video', video.id)}
                            className="p-2 rounded-lg bg-[#151515] text-[#8A8A8A] hover:text-[#F5F5F5] transition-colors"
                            title="Opções"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-[#0B0B0B] border border-[#242424] rounded-xl shadow-2xl py-1.5 min-w-[160px] animate-scale-in"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.type === 'folder' ? (
            <>
              <button
                onClick={() => {
                  const folder = folders.find(f => f.id === contextMenu.id)
                  if (folder) {
                    setEditingFolder(folder.id)
                    setEditFolderName(folder.name)
                  }
                  setContextMenu(null)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#F5F5F5] hover:bg-[#151515] transition-colors"
              >
                <Pencil className="w-4 h-4 text-[#8A8A8A]" />
                Renomear
              </button>
              <button
                onClick={() => { handleDeleteFolder(contextMenu.id); setContextMenu(null) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#EF2020] hover:bg-[#EF2020]/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Excluir pasta
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setMovingVideo(contextMenu.id); setContextMenu(null) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#F5F5F5] hover:bg-[#151515] transition-colors"
              >
                <Folder className="w-4 h-4 text-[#8A8A8A]" />
                Mover para pasta
              </button>
              <button
                onClick={() => { handleDeleteVideo(contextMenu.id); setContextMenu(null) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#EF2020] hover:bg-[#EF2020]/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Excluir vídeo
              </button>
            </>
          )}
        </div>
      )}

      {/* Add / Upload Video Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowAddModal(false); setAddSuccess(false) } }}
        >
          <div className="bg-[#0B0B0B] border border-[#242424] rounded-2xl w-full max-w-lg mx-4 animate-scale-in relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-[2px] brand-gradient" />

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#242424]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FF5A00]" />
                <h2 className="text-[#F5F5F5] font-bold text-lg">Adicionar à Biblioteca</h2>
              </div>
              <button
                onClick={() => { setShowAddModal(false); setAddSuccess(false) }}
                className="w-8 h-8 rounded-xl bg-[#151515] hover:bg-[#242424] flex items-center justify-center text-[#8A8A8A] hover:text-[#F5F5F5] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs selection */}
            {!addSuccess && (
              <div className="flex bg-[#151515] p-1 mx-6 mt-5 rounded-xl border border-[#242424]">
                <button
                  onClick={() => setAddTab('youtube')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
                    addTab === 'youtube'
                      ? "brand-gradient text-white shadow-md"
                      : "text-[#8A8A8A] hover:text-[#F5F5F5]"
                  )}
                >
                  <YoutubeIcon className="w-4 h-4 text-red-500" />
                  YouTube
                </button>
                <button
                  onClick={() => setAddTab('upload')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
                    addTab === 'upload'
                      ? "brand-gradient text-white shadow-md"
                      : "text-[#8A8A8A] hover:text-[#F5F5F5]"
                  )}
                >
                  <Upload className="w-4 h-4" />
                  Upload de Arquivo
                </button>
              </div>
            )}

            <div className="p-6">
              {addSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[#F5F5F5] font-bold text-base">Vídeo adicionado com sucesso!</p>
                    <p className="text-[#8A8A8A] text-xs mt-1">
                      O vídeo está salvo e pronto para ser assistido nas suas salas.
                    </p>
                  </div>
                  <button
                    onClick={() => { setAddSuccess(false); setYoutubeUrl(''); setYoutubeTitle(''); setUploadTitle('') }}
                    className="py-2.5 px-4 rounded-xl brand-gradient text-white text-xs font-bold inline-flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar outro vídeo</span>
                  </button>
                </div>
              ) : addTab === 'youtube' ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-[#8A8A8A] text-xs font-semibold mb-1.5 block uppercase tracking-wider">
                      Link do Vídeo (YouTube) *
                    </label>
                    <input
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full bg-[#151515] border border-[#242424] text-[#F5F5F5] px-4 py-3 rounded-xl text-sm placeholder:text-[#5F5F5F] outline-none focus:border-[#FF5A00] transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[#8A8A8A] text-xs font-semibold mb-1.5 block uppercase tracking-wider">
                      Título do Vídeo *
                    </label>
                    <input
                      type="text"
                      value={youtubeTitle}
                      onChange={(e) => setYoutubeTitle(e.target.value)}
                      placeholder="Ex: Filmes da Noite — Arcane Ep 3"
                      className="w-full bg-[#151515] border border-[#242424] text-[#F5F5F5] px-4 py-3 rounded-xl text-sm placeholder:text-[#5F5F5F] outline-none focus:border-[#FF5A00] transition-all"
                    />
                  </div>

                  {youtubeError && (
                    <p className="text-[#EF2020] text-xs font-medium">{youtubeError}</p>
                  )}

                  <button
                    onClick={handleSaveYoutube}
                    disabled={isSavingYoutube || !youtubeUrl.trim() || !youtubeTitle.trim()}
                    className={cn(
                      "w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                      !isSavingYoutube && youtubeUrl.trim() && youtubeTitle.trim()
                        ? "brand-gradient text-white brand-glow-strong hover:brightness-110 active:scale-[0.98]"
                        : "bg-[#151515] text-[#5F5F5F] cursor-not-allowed"
                    )}
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isSavingYoutube ? 'Salvando...' : 'Salvar vídeo'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-[#8A8A8A] text-xs font-semibold mb-1.5 block uppercase tracking-wider">
                      Título (opcional)
                    </label>
                    <input
                      type="text"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="Ex: Vídeo de Férias"
                      className="w-full bg-[#151515] border border-[#242424] text-[#F5F5F5] px-4 py-3 rounded-xl text-sm placeholder:text-[#5F5F5F] outline-none focus:border-[#FF5A00] transition-all"
                    />
                  </div>
                  <UploadDropzone
                    endpoint="videoUploader"
                    onClientUploadComplete={async (res) => {
                      if (res?.[0]) {
                        await handleUploadComplete(res[0].url)
                      }
                    }}
                    onUploadError={(error: Error) => {
                      toast.error(`Erro no upload: ${error.message}`)
                    }}
                    appearance={{
                      container: "flex flex-col items-center justify-center border-dashed border-[#242424] bg-[#151515] rounded-xl p-6 hover:border-[#FF5A00]/40 transition-colors",
                      uploadIcon: "text-[#FF5A00]/40 mb-2",
                      label: "text-[#8A8A8A] hover:text-[#FF5A00] text-sm font-medium",
                      allowedContent: "text-[#5F5F5F] text-xs",
                      button: "brand-gradient px-5 py-2 rounded-lg text-white text-sm font-bold mt-3"
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
