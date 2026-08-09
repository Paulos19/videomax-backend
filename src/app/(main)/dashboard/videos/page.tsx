'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Film, Folder, FolderPlus, Upload, MoreVertical, Trash2,
  FolderOpen, ArrowLeft, X, Check, Pencil, GripVertical
} from 'lucide-react'
import { UploadDropzone } from '@/lib/uploadthing'
import {
  getVideosWithFolders, createFolder, deleteFolder, renameFolder,
  saveVideo, deleteVideo, moveVideoToFolder
} from '../../actions'
import { cn } from '@/lib/utils'
import '@uploadthing/react/styles.css'

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
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFolder, setActiveFolder] = useState<string | null>(null)
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [editingFolder, setEditingFolder] = useState<string | null>(null)
  const [editFolderName, setEditFolderName] = useState('')
  const [contextMenu, setContextMenu] = useState<{ type: 'video' | 'folder'; id: string; x: number; y: number } | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [movingVideo, setMovingVideo] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      const data = await getVideosWithFolders()
      setVideos(data.videos as VideoItem[])
      setFolders(data.folders as FolderItem[])
    } catch {
      // Failed to load
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

  const filteredVideos = activeFolder
    ? videos.filter(v => v.folderId === activeFolder)
    : videos.filter(v => !v.folderId)

  const activeFolderName = activeFolder
    ? folders.find(f => f.id === activeFolder)?.name || 'Pasta'
    : null

  const handleCreateFolder = useCallback(async () => {
    if (!newFolderName.trim()) return
    try {
      await createFolder(newFolderName.trim())
      setNewFolderName('')
      setShowNewFolder(false)
      await loadData()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao criar pasta')
    }
  }, [newFolderName, loadData])

  const handleRenameFolder = useCallback(async (folderId: string) => {
    if (!editFolderName.trim()) return
    try {
      await renameFolder(folderId, editFolderName.trim())
      setEditingFolder(null)
      setEditFolderName('')
      await loadData()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao renomear pasta')
    }
  }, [editFolderName, loadData])

  const handleDeleteFolder = useCallback(async (folderId: string) => {
    if (!confirm('Excluir esta pasta? Os vídeos serão movidos para a raiz.')) return
    try {
      await deleteFolder(folderId)
      if (activeFolder === folderId) setActiveFolder(null)
      await loadData()
    } catch {
      alert('Erro ao excluir pasta')
    }
  }, [activeFolder, loadData])

  const handleDeleteVideo = useCallback(async (videoId: string) => {
    if (!confirm('Excluir este vídeo?')) return
    try {
      await deleteVideo(videoId)
      await loadData()
    } catch {
      alert('Erro ao excluir vídeo')
    }
  }, [loadData])

  const handleMoveVideo = useCallback(async (videoId: string, folderId: string | null) => {
    try {
      await moveVideoToFolder(videoId, folderId)
      setMovingVideo(null)
      await loadData()
    } catch {
      alert('Erro ao mover vídeo')
    }
  }, [loadData])

  const handleUpload = useCallback(async (url: string) => {
    const title = uploadTitle.trim() || 'Sem título'
    await saveVideo(title, url, activeFolder)
    setUploadSuccess(true)
    setUploadTitle('')
    await loadData()
  }, [uploadTitle, activeFolder, loadData])

  const showContextMenu = useCallback((e: React.MouseEvent, type: 'video' | 'folder', id: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ type, id, x: e.clientX, y: e.clientY })
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {activeFolder && (
            <button
              onClick={() => setActiveFolder(null)}
              className="w-8 h-8 rounded-lg bg-room-surface-2 hover:bg-room-surface-3 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-room-text-secondary" />
            </button>
          )}
          <div>
            <h1 className="text-room-text text-2xl font-bold">
              {activeFolder ? activeFolderName : 'Meus vídeos'}
            </h1>
            <p className="text-room-text-secondary text-sm mt-0.5">
              {activeFolder
                ? `${filteredVideos.length} ${filteredVideos.length === 1 ? 'vídeo' : 'vídeos'} nesta pasta`
                : `${videos.length} ${videos.length === 1 ? 'vídeo' : 'vídeos'} · ${folders.length} ${folders.length === 1 ? 'pasta' : 'pastas'}`
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!activeFolder && (
            <button
              onClick={() => setShowNewFolder(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-room-surface-2 hover:bg-room-surface-3 border border-room-border text-room-text transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova pasta</span>
            </button>
          )}
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold brand-gradient text-white transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Enviar vídeo</span>
          </button>
        </div>
      </div>

      {/* New folder input */}
      {showNewFolder && (
        <div className="mb-6 flex items-center gap-2">
          <FolderPlus className="w-5 h-5 text-room-accent shrink-0" />
          <input
            autoFocus
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolder()
              if (e.key === 'Escape') { setShowNewFolder(false); setNewFolderName('') }
            }}
            placeholder="Nome da pasta"
            className="flex-1 max-w-xs bg-room-surface-2 border border-room-border-light text-room-text px-4 py-2 rounded-xl text-sm placeholder:text-room-text-secondary/40 outline-none focus:border-room-accent/50 transition-colors"
          />
          <button
            onClick={handleCreateFolder}
            className="w-8 h-8 rounded-lg bg-room-accent flex items-center justify-center text-white"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setShowNewFolder(false); setNewFolderName('') }}
            className="w-8 h-8 rounded-lg bg-room-surface-3 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-room-text-secondary" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-room-text-secondary">Carregando...</div>
      ) : (
        <div className="space-y-6">
          {/* Folders (only in root view) */}
          {!activeFolder && folders.length > 0 && (
            <div>
              <h2 className="text-room-text-secondary text-xs font-semibold uppercase tracking-wider mb-3">Pastas</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {folders.map((folder) => {
                  const count = videos.filter(v => v.folderId === folder.id).length
                  return (
                    <div
                      key={folder.id}
                      className="group relative bg-room-surface border border-room-border rounded-xl p-4 cursor-pointer hover:border-room-accent/30 hover:bg-room-surface-2 transition-all"
                      onClick={() => setActiveFolder(folder.id)}
                      onContextMenu={(e) => showContextMenu(e, 'folder', folder.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-room-accent/10 flex items-center justify-center">
                          <Folder className="w-5 h-5 text-room-accent" />
                        </div>
                        <button
                          onClick={(e) => showContextMenu(e, 'folder', folder.id)}
                          className="w-7 h-7 rounded-lg opacity-0 group-hover:opacity-100 bg-room-surface-3 flex items-center justify-center transition-opacity"
                        >
                          <MoreVertical className="w-3.5 h-3.5 text-room-text-secondary" />
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
                            className="flex-1 bg-room-surface-3 border border-room-accent/50 text-room-text px-2 py-1 rounded-lg text-sm outline-none"
                          />
                        </div>
                      ) : (
                        <>
                          <p className="text-room-text text-sm font-medium truncate">{folder.name}</p>
                          <p className="text-room-text-secondary text-xs mt-0.5">
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

          {/* Videos */}
          <div>
            <h2 className="text-room-text-secondary text-xs font-semibold uppercase tracking-wider mb-3">
              {activeFolder ? 'Vídeos nesta pasta' : 'Vídeos recentes'}
            </h2>
            {filteredVideos.length === 0 ? (
              <div className="text-center py-16 bg-room-surface border border-room-border rounded-2xl">
                <Film className="w-12 h-12 text-room-text-secondary/20 mx-auto mb-3" />
                <p className="text-room-text-secondary text-sm">
                  {activeFolder ? 'Esta pasta está vazia' : 'Nenhum vídeo ainda'}
                </p>
                <button
                  onClick={() => setShowUpload(true)}
                  className="mt-3 text-room-accent text-sm font-semibold hover:underline"
                >
                  Enviar primeiro vídeo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredVideos.map((video) => (
                  <div
                    key={video.id}
                    className="group relative bg-room-surface border border-room-border rounded-xl overflow-hidden hover:border-room-accent/30 transition-all"
                  >
                    {/* Thumbnail placeholder */}
                    <div className="aspect-video bg-room-surface-2 flex items-center justify-center relative">
                      <Film className="w-8 h-8 text-room-text-secondary/20" />
                      {/* Move dropdown */}
                      {movingVideo === video.id && (
                        <div className="absolute inset-0 bg-room-surface/95 flex flex-col p-3 z-10">
                          <p className="text-room-text-secondary text-xs font-medium mb-2">Mover para:</p>
                          <button
                            onClick={() => handleMoveVideo(video.id, null)}
                            className={cn(
                              "text-left px-3 py-2 rounded-lg text-sm transition-colors",
                              !video.folderId
                                ? "bg-room-accent/10 text-room-accent"
                                : "text-room-text hover:bg-room-surface-3"
                            )}
                          >
                            <FolderOpen className="w-4 h-4 inline mr-2" />
                            Raiz
                          </button>
                          {folders.map(f => (
                            <button
                              key={f.id}
                              onClick={() => handleMoveVideo(video.id, f.id)}
                              className={cn(
                                "text-left px-3 py-2 rounded-lg text-sm transition-colors",
                                video.folderId === f.id
                                  ? "bg-room-accent/10 text-room-accent"
                                  : "text-room-text hover:bg-room-surface-3"
                              )}
                            >
                              <Folder className="w-4 h-4 inline mr-2" />
                              {f.name}
                            </button>
                          ))}
                          <button
                            onClick={() => setMovingVideo(null)}
                            className="mt-2 text-room-text-secondary text-xs hover:text-room-text"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="p-3 flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-room-text text-sm font-medium truncate">{video.title}</p>
                        <p className="text-room-text-secondary text-xs">
                          {new Date(video.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); setMovingVideo(movingVideo === video.id ? null : video.id) }}
                          className="w-7 h-7 rounded-lg bg-room-surface-3 flex items-center justify-center"
                          title="Mover"
                        >
                          <GripVertical className="w-3.5 h-3.5 text-room-text-secondary" />
                        </button>
                        <button
                          onClick={(e) => showContextMenu(e, 'video', video.id)}
                          className="w-7 h-7 rounded-lg bg-room-surface-3 flex items-center justify-center"
                        >
                          <MoreVertical className="w-3.5 h-3.5 text-room-text-secondary" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-room-surface-2 border border-room-border rounded-xl shadow-xl py-1 min-w-[160px] animate-scale-in"
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
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-room-text hover:bg-room-surface-3 transition-colors"
              >
                <Pencil className="w-4 h-4 text-room-text-secondary" />
                Renomear
              </button>
              <button
                onClick={() => { handleDeleteFolder(contextMenu.id); setContextMenu(null) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-room-red hover:bg-room-red/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Excluir pasta
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setMovingVideo(contextMenu.id); setContextMenu(null) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-room-text hover:bg-room-surface-3 transition-colors"
              >
                <Folder className="w-4 h-4 text-room-text-secondary" />
                Mover para pasta
              </button>
              <button
                onClick={() => { handleDeleteVideo(contextMenu.id); setContextMenu(null) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-room-red hover:bg-room-red/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            </>
          )}
        </div>
      )}

      {/* Upload modal */}
      {showUpload && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowUpload(false); setUploadSuccess(false) } }}
        >
          <div className="bg-room-surface border border-room-border rounded-2xl w-full max-w-lg mx-4 animate-scale-in relative overflow-hidden">
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] brand-gradient" />

            <div className="flex items-center justify-between px-5 py-4 border-b border-room-border">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-room-accent" />
                <h2 className="text-room-text font-semibold">Enviar vídeo</h2>
                {activeFolderName && (
                  <span className="text-room-text-secondary text-xs bg-room-surface-3 px-2 py-0.5 rounded-full">
                    {activeFolderName}
                  </span>
                )}
              </div>
              <button
                onClick={() => { setShowUpload(false); setUploadSuccess(false) }}
                className="w-8 h-8 rounded-full bg-room-surface-2 hover:bg-room-surface-3 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-room-text-secondary" />
              </button>
            </div>
            <div className="p-5">
              {uploadSuccess ? (
                <div className="text-center py-8">
                  <Film className="w-12 h-12 text-room-online mx-auto mb-3" />
                  <p className="text-room-text font-medium mb-1">Vídeo enviado!</p>
                  <button
                    onClick={() => { setUploadSuccess(false); setUploadTitle('') }}
                    className="text-room-accent text-sm font-semibold hover:underline mt-2"
                  >
                    Enviar outro
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-room-text-secondary text-xs font-semibold mb-1.5 block">Título (opcional)</label>
                    <input
                      type="text"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="Ex: O Senhor dos Anéis"
                      className="w-full bg-room-surface-3 border border-room-border-light text-room-text px-4 py-2.5 rounded-xl text-sm placeholder:text-room-text-secondary/40 outline-none focus:border-room-accent/50 transition-colors"
                    />
                  </div>
                  <UploadDropzone
                    endpoint="videoUploader"
                    onClientUploadComplete={async (res) => {
                      if (res?.[0]) {
                        await handleUpload(res[0].url)
                      }
                    }}
                    onUploadError={(error: Error) => {
                      alert(`Erro no upload: ${error.message}`)
                    }}
                    appearance={{
                      container: "border-dashed border-room-border bg-room-surface-2/50 rounded-xl p-6 hover:border-room-accent/30 transition-colors",
                      uploadIcon: "text-room-accent/40",
                      label: "text-room-text-secondary hover:text-room-accent text-sm font-medium",
                      allowedContent: "text-room-text-secondary/40 text-xs",
                      button: "brand-gradient px-5 py-2 rounded-lg text-white text-sm font-semibold mt-3"
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
