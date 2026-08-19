'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Loader2, Sticker as StickerIcon, X, Check, Image as ImageIcon, Sparkles, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getStickerPacks, saveSticker, createStickerPack } from '@/app/(main)/actions/stickers'
import { useUploadThing } from '@/lib/uploadthing'
import { toast } from 'sonner'
import Image from 'next/image'

interface Sticker {
  id: string
  url: string
}

interface StickerPack {
  id: string
  name: string
  stickers: Sticker[]
}

interface StickerPickerProps {
  onSelectSticker: (url: string) => void
  onClose: () => void
}

export function StickerPicker({ onSelectSticker, onClose }: StickerPickerProps) {
  const [activeTab, setActiveTab] = useState<'library' | 'create'>('library')
  const [packs, setPacks] = useState<StickerPack[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Upload state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const { startUpload } = useUploadThing('stickerUploader')

  useEffect(() => {
    loadPacks()
  }, [])

  const loadPacks = async () => {
    try {
      const data = await getStickerPacks()
      setPacks(data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. O limite é 5MB.')
      return
    }

    setSelectedFile(file)
    setProcessedBlob(null)
    setPreviewUrl(null)
    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/process-sticker', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Erro ao processar imagem')
      }

      const blob = await response.blob()
      setProcessedBlob(blob)
      setPreviewUrl(URL.createObjectURL(blob))
    } catch (err) {
      toast.error('Falha ao processar figurinha.')
      setSelectedFile(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSaveSticker = async () => {
    if (!processedBlob) return

    setIsUploading(true)
    try {
      const ext = processedBlob.type === 'image/webp' ? '.webp' : '.gif'
      const fileToUpload = new File([processedBlob], `sticker-${Date.now()}${ext}`, {
        type: processedBlob.type,
      })

      const res = await startUpload([fileToUpload])
      if (!res || !res[0]) throw new Error('Upload falhou')

      const url = res[0].url

      const defaultPack = packs[0]
      let packId = defaultPack?.id

      if (!packId) {
        const newPack = await createStickerPack('Favoritos')
        packId = newPack.id
      }

      await saveSticker(packId, url)
      toast.success('Figurinha salva com sucesso!')

      setSelectedFile(null)
      setProcessedBlob(null)
      setPreviewUrl(null)
      await loadPacks()
      setActiveTab('library')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar figurinha.')
    } finally {
      setIsUploading(false)
    }
  }

  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div
      ref={pickerRef}
      className="w-[calc(100vw-32px)] max-w-[340px] sm:w-[320px] h-[370px] bg-[#0A0A0F] border-2 border-[#FF5A00] shadow-[0_0_35px_rgba(255,90,0,0.35)] flex flex-col overflow-hidden font-mono select-none animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header / Tabs */}
      <div className="flex items-center justify-between p-2 border-b border-[#1F1F28] bg-[#0E0E14] shrink-0 gap-1.5">
        <div className="flex gap-1 flex-1">
          <button
            onClick={() => setActiveTab('library')}
            className={cn(
              'flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer',
              activeTab === 'library'
                ? 'bg-[#FF5A00] text-black shadow-sm'
                : 'text-[#888] hover:text-white hover:bg-[#151520]'
            )}
          >
            <StickerIcon className="w-3.5 h-3.5" />
            <span>MINHAS</span>
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={cn(
              'flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer',
              activeTab === 'create'
                ? 'bg-[#FF5A00] text-black shadow-sm'
                : 'text-[#888] hover:text-white hover:bg-[#151520]'
            )}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ CRIAR</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 border border-[#333] hover:border-white text-[#888] hover:text-white transition-colors cursor-pointer shrink-0"
          title="Fechar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 relative">
        {activeTab === 'library' ? (
          isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-[#888]">
              <Loader2 className="w-5 h-5 text-[#FF5A00] animate-spin mr-2" />
              <span>CARREGANDO...</span>
            </div>
          ) : packs.length === 0 || packs.every((p) => p.stickers.length === 0) ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[#777] p-4 text-center">
              <StickerIcon className="w-8 h-8 mb-2 opacity-30 text-[#FF5A00]" />
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                NENHUMA FIGURINHA SALVA
              </p>
              <p className="text-[9px] mt-1 text-[#666]">
                Crie sua figurinha personalizada na aba "+ CRIAR"
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {packs.map(
                (pack) =>
                  pack.stickers.length > 0 && (
                    <div key={pack.id}>
                      <h4 className="text-[9px] font-black text-[#888] uppercase tracking-wider mb-2 px-0.5">
                        [ {pack.name} ]
                      </h4>
                      <div className="grid grid-cols-4 gap-2">
                        {pack.stickers.map((sticker) => (
                          <button
                            key={sticker.id}
                            onClick={() => {
                              onSelectSticker(sticker.url)
                              onClose()
                            }}
                            className="aspect-square bg-[#121218] border border-[#222] hover:border-[#FF5A00] hover:bg-[#181824] transition-all flex items-center justify-center p-1 cursor-pointer group"
                          >
                            <Image
                              src={sticker.url}
                              alt="Sticker"
                              width={64}
                              height={64}
                              className="object-contain w-full h-full group-hover:scale-110 transition-transform"
                              unoptimized
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )
              )}
            </div>
          )
        ) : (
          <div className="h-full flex flex-col">
            {!selectedFile ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2.5 text-center px-2">
                <div className="w-12 h-12 bg-[#121218] border border-[#333] flex items-center justify-center text-[#FF5A00]">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    UPLOAD DE FIGURINHA
                  </h3>
                  <p className="text-[9px] text-[#777] mt-0.5">
                    Formato Sticker (512x512) cortado automaticamente
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-[#FF5A00] hover:bg-white text-black font-black text-[10px] uppercase tracking-wider transition-colors cursor-pointer shadow-[0_0_15px_rgba(255,90,0,0.3)] mt-1"
                >
                  SELECIONAR ARQUIVO
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/png, image/jpeg, image/webp, image/gif, video/mp4"
                  className="hidden"
                />
              </div>
            ) : isProcessing ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
                <Loader2 className="w-6 h-6 text-[#FF5A00] animate-spin" />
                <p className="text-xs font-bold text-white uppercase">PROCESSANDO IMAGEM...</p>
                <p className="text-[9px] text-[#777]">Otimizando para figurinha</p>
              </div>
            ) : previewUrl ? (
              <div className="flex-1 flex flex-col items-center justify-between py-1">
                <div className="flex-1 flex items-center justify-center w-full">
                  <div className="relative w-28 h-28 bg-[#121218] border border-[#FF5A00] flex items-center justify-center p-2">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                </div>
                <div className="w-full space-y-1.5 pt-2">
                  <button
                    onClick={handleSaveSticker}
                    disabled={isUploading}
                    className="w-full py-2 bg-[#22C55E] hover:bg-white text-black font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>{isUploading ? 'SALVANDO...' : 'SALVAR FIGURINHA'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFile(null)
                      setPreviewUrl(null)
                      setProcessedBlob(null)
                    }}
                    disabled={isUploading}
                    className="w-full py-1.5 bg-[#121218] hover:bg-[#222] text-[#888] hover:text-white font-bold text-[9px] uppercase transition-colors cursor-pointer border border-[#333]"
                  >
                    CANCELAR
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
