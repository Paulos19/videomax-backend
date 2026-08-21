'use client'

import { useState, useCallback, useEffect } from 'react'
import { X, Play, Film, Link as LinkIcon, Upload, Check, FolderOpen, HardDrive } from 'lucide-react'
import { YoutubeIcon as Youtube } from '@/components/icons/youtube'
import { Video } from '@/types'
import { isYouTubeUrl, getYouTubeThumbnail, fetchYouTubeMetadata } from '@/lib/youtube'
import { isGoogleDriveUrl, getGoogleDriveFileId, fetchGoogleDriveMetadata, getGoogleDriveThumbnail } from '@/lib/google-drive'
import { getVideosWithFolders } from '@/app/(main)/actions'
import { cn } from '@/lib/utils'

interface VideoSelectorModalProps {
  videos?: Video[]
  currentVideoUrl?: string
  onSelectVideo: (video: { url: string; title?: string }) => void
  onClose: () => void
}

export function VideoSelectorModal({
  videos = [],
  currentVideoUrl,
  onSelectVideo,
  onClose,
}: VideoSelectorModalProps) {
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [googleDriveUrl, setGoogleDriveUrl] = useState('')
  const [customTitle, setCustomTitle] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [libraryVideos, setLibraryVideos] = useState<Video[]>(videos)
  const [loadingLibrary, setLoadingLibrary] = useState(false)
  const [activeTab, setActiveTab] = useState<'youtube' | 'drive' | 'library'>('youtube')

  useEffect(() => {
    let cancelled = false
    setLoadingLibrary(true)
    getVideosWithFolders()
      .then((data: any) => {
        if (!cancelled && data?.videos) {
          setLibraryVideos(data.videos as Video[])
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingLibrary(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleConfirmYoutube = async () => {
    const trimmed = youtubeUrl.trim()
    if (!trimmed) {
      setErrorMsg('Insira uma URL válida do YouTube.')
      return
    }

    if (!isYouTubeUrl(trimmed)) {
      setErrorMsg('URL inválida. Ex: https://www.youtube.com/watch?v=...')
      return
    }

    const meta = await fetchYouTubeMetadata(trimmed)
    onSelectVideo({
      url: trimmed,
      title: customTitle.trim() || meta?.title || 'YouTube Stream',
    })
  }

  const handleConfirmGoogleDrive = async () => {
    const trimmed = googleDriveUrl.trim()
    if (!trimmed) {
      setErrorMsg('Insira uma URL de compartilhamento do Google Drive.')
      return
    }

    if (!isGoogleDriveUrl(trimmed)) {
      setErrorMsg('URL inválida. Ex: https://drive.google.com/file/d/ID/view?usp=sharing')
      return
    }

    const fileId = getGoogleDriveFileId(trimmed)
    const meta = await fetchGoogleDriveMetadata(trimmed, customTitle)

    onSelectVideo({
      url: trimmed,
      title: customTitle.trim() || meta?.title || `Google Drive Video (${fileId?.slice(0, 8) || 'Drive'})`,
    })
  }

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose]
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none font-mono animate-in fade-in duration-150"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#0A0A0F] border-2 border-[#FF5A00] w-full max-w-lg shadow-[0_0_40px_rgba(255,90,0,0.3)] flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1F1F28] bg-[#0E0E14]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#FF5A00] flex items-center justify-center text-black font-bold">
              <Film className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs font-black text-white uppercase tracking-wider">
              [ TRANSMITIR NOVO VÍDEO ]
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 border border-[#333] hover:border-white text-[#888] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#1F1F28] bg-[#07070B]">
          <button
            onClick={() => {
              setActiveTab('youtube')
              setErrorMsg('')
            }}
            className={cn(
              'flex-1 py-2.5 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer',
              activeTab === 'youtube'
                ? 'bg-[#150F08] text-[#FF5A00] border-b-2 border-[#FF5A00]'
                : 'text-[#777] hover:text-white'
            )}
          >
            <Youtube className="w-3.5 h-3.5" />
            <span>YOUTUBE</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('drive')
              setErrorMsg('')
            }}
            className={cn(
              'flex-1 py-2.5 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer',
              activeTab === 'drive'
                ? 'bg-[#150F08] text-[#FF5A00] border-b-2 border-[#FF5A00]'
                : 'text-[#777] hover:text-white'
            )}
          >
            <HardDrive className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>GOOGLE DRIVE</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('library')
              setErrorMsg('')
            }}
            className={cn(
              'flex-1 py-2.5 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer',
              activeTab === 'library'
                ? 'bg-[#150F08] text-[#FF5A00] border-b-2 border-[#FF5A00]'
                : 'text-[#777] hover:text-white'
            )}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>BIBLIOTECA ({libraryVideos.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
          {activeTab === 'youtube' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#888] uppercase block">
                  URL DO YOUTUBE
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => {
                    setYoutubeUrl(e.target.value)
                    setErrorMsg('')
                  }}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-[#121218] border border-[#333] focus:border-[#FF5A00] text-white px-3 py-2 text-xs font-mono outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#888] uppercase block">
                  TÍTULO PERSONALIZADO (OPCIONAL)
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Ex: Sessão Especial de Domingo"
                  className="w-full bg-[#121218] border border-[#333] focus:border-[#FF5A00] text-white px-3 py-2 text-xs font-mono outline-none"
                />
              </div>

              {errorMsg && (
                <p className="text-[10px] font-bold text-[#EF2020] uppercase">{errorMsg}</p>
              )}

              <button
                onClick={handleConfirmYoutube}
                className="w-full py-2.5 bg-[#FF5A00] hover:bg-white text-black font-black text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-[0_0_15px_rgba(255,90,0,0.3)] mt-2"
              >
                TRANSMITIR ESTE VÍDEO AGORA
              </button>
            </div>
          )}

          {activeTab === 'drive' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#0F172A]/70 border border-[#1E293B] text-[10px] text-[#94A3B8] space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#38BDF8] font-bold">
                  <HardDrive className="w-3 h-3" />
                  <span>COMO TRANSMITIR DO GOOGLE DRIVE:</span>
                </div>
                <p>1. No Google Drive, clique com o botão direito no arquivo de vídeo &gt; <strong>Compartilhar</strong>.</p>
                <p>2. Altere o Acesso Geral para: <strong className="text-white">Qualquer pessoa com o link</strong>.</p>
                <p>3. Copie o link gerado e cole no campo abaixo.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#888] uppercase block">
                  LINK DE COMPARTILHAMENTO DO GOOGLE DRIVE
                </label>
                <input
                  type="url"
                  value={googleDriveUrl}
                  onChange={(e) => {
                    setGoogleDriveUrl(e.target.value)
                    setErrorMsg('')
                  }}
                  placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                  className="w-full bg-[#121218] border border-[#333] focus:border-[#38BDF8] text-white px-3 py-2 text-xs font-mono outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#888] uppercase block">
                  TÍTULO DO VÍDEO (OPCIONAL)
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Ex: Filme / Apresentação Gravada"
                  className="w-full bg-[#121218] border border-[#333] focus:border-[#38BDF8] text-white px-3 py-2 text-xs font-mono outline-none"
                />
              </div>

              {errorMsg && (
                <p className="text-[10px] font-bold text-[#EF2020] uppercase">{errorMsg}</p>
              )}

              <button
                onClick={handleConfirmGoogleDrive}
                className="w-full py-2.5 bg-[#38BDF8] hover:bg-white text-black font-black text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.3)] mt-2"
              >
                TRANSMITIR VÍDEO DO GOOGLE DRIVE
              </button>
            </div>
          )}

          {activeTab === 'library' && (
            <div className="space-y-2">
              {loadingLibrary ? (
                <div className="p-6 text-center text-xs text-[#888]">
                  CARREGANDO BIBLIOTECA...
                </div>
              ) : libraryVideos.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#777]">
                  Nenhum vídeo cadastrado na sua biblioteca.
                </div>
              ) : (
                libraryVideos.map((vid) => (
                  <div
                    key={vid.id}
                    onClick={() =>
                      onSelectVideo({
                        url: vid.url,
                        title: vid.title,
                      })
                    }
                    className="p-2.5 bg-[#121218] border border-[#222] hover:border-[#FF5A00] hover:bg-[#181824] flex items-center justify-between gap-3 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 bg-[#FF5A00] text-black flex items-center justify-center shrink-0">
                        <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-white uppercase truncate block">
                          {vid.title}
                        </span>
                        <span className="text-[9px] text-[#777] truncate block">
                          {vid.url}
                        </span>
                      </div>
                    </div>

                    <button className="px-2.5 py-1 bg-[#FF5A00] text-black font-black text-[9px] uppercase shrink-0">
                      ESCOLHER
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

