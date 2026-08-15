'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Loader2, Sticker as StickerIcon, X, Check, Image as ImageIcon } from 'lucide-react'
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

  const { startUpload } = useUploadThing("stickerUploader")

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
        body: formData
      })

      if (!response.ok) {
        throw new Error('Erro ao processar imagem')
      }

      const blob = await response.blob()
      setProcessedBlob(blob)
      setPreviewUrl(URL.createObjectURL(blob))
    } catch (err) {
      toast.error('Falha ao processar a figurinha. Tente outro arquivo.')
      setSelectedFile(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSaveSticker = async () => {
    if (!processedBlob) return

    setIsUploading(true)
    try {
      // Create a File from the Blob
      const ext = processedBlob.type === 'image/webp' ? '.webp' : '.gif'
      const fileToUpload = new File([processedBlob], `sticker-${Date.now()}${ext}`, { type: processedBlob.type })

      // Upload to UploadThing
      const res = await startUpload([fileToUpload])
      if (!res || !res[0]) throw new Error('Upload falhou')

      const url = res[0].url

      // Save to database
      const defaultPack = packs[0] // Favoritos
      let packId = defaultPack?.id

      if (!packId) {
        const newPack = await createStickerPack('Favoritos')
        packId = newPack.id
      }

      await saveSticker(packId, url)
      toast.success('Figurinha salva!')
      
      // Reset state and reload
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

  return (
    <div className="w-[320px] h-[400px] bg-[#0B0B0B] border border-[#242424] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Header / Tabs */}
      <div className="flex p-2 gap-1 border-b border-[#242424] bg-[#050505] shrink-0">
        <button
          onClick={() => setActiveTab('library')}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2",
            activeTab === 'library' ? "bg-[#151515] text-[#F5F5F5]" : "text-[#8A8A8A] hover:text-[#F5F5F5] hover:bg-[#111111]"
          )}
        >
          <StickerIcon className="w-4 h-4" />
          Minhas
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2",
            activeTab === 'create' ? "bg-[#151515] text-[#F5F5F5]" : "text-[#8A8A8A] hover:text-[#F5F5F5] hover:bg-[#111111]"
          )}
        >
          <Plus className="w-4 h-4" />
          Criar
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar relative">
        {activeTab === 'library' ? (
          isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-[#FF5A00] animate-spin" />
            </div>
          ) : packs.length === 0 || packs.every(p => p.stickers.length === 0) ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[#8A8A8A] p-4 text-center">
              <StickerIcon className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm font-semibold">Nenhuma figurinha salva</p>
              <p className="text-xs mt-1">Crie a sua primeira figurinha na aba "Criar"</p>
            </div>
          ) : (
            <div className="space-y-4">
              {packs.map(pack => pack.stickers.length > 0 && (
                <div key={pack.id}>
                  <h4 className="text-xs font-bold text-[#5F5F5F] uppercase mb-2 px-1">{pack.name}</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {pack.stickers.map(sticker => (
                      <button
                        key={sticker.id}
                        onClick={() => { onSelectSticker(sticker.url); onClose() }}
                        className="aspect-square bg-[#111111] border border-[#242424] rounded-xl overflow-hidden hover:border-[#FF5A00]/50 hover:bg-[#151515] transition-all flex items-center justify-center p-1 group"
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
              ))}
            </div>
          )
        ) : (
          <div className="h-full flex flex-col">
            {!selectedFile ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#151515] border border-[#242424] border-dashed flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-[#8A8A8A]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F5F5F5] mb-1">Upload de Imagem ou GIF</h3>
                  <p className="text-xs text-[#8A8A8A]">A imagem será cortada e com fundo transparente (512x512)</p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-xl brand-gradient text-white text-sm font-bold brand-glow mt-2 hover:brightness-110 active:scale-95 transition-all"
                >
                  Selecionar Arquivo
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
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-[#FF5A00] animate-spin" />
                <p className="text-sm font-semibold text-[#F5F5F5]">Processando e cortando...</p>
                <p className="text-xs text-[#8A8A8A]">Preparando para o formato Sticker</p>
              </div>
            ) : previewUrl ? (
              <div className="flex-1 flex flex-col items-center justify-between py-2">
                <div className="flex-1 flex items-center justify-center w-full">
                  <div className="relative w-40 h-40 bg-[#url('/transparent-pattern.png')] bg-[#111111] rounded-2xl border border-[#242424] overflow-hidden flex items-center justify-center p-2 shadow-inner">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain drop-shadow-md" />
                  </div>
                </div>
                <div className="w-full space-y-2 pt-4">
                  <button
                    onClick={handleSaveSticker}
                    disabled={isUploading}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {isUploading ? 'Salvando...' : 'Salvar Figurinha'}
                  </button>
                  <button
                    onClick={() => { setSelectedFile(null); setPreviewUrl(null); setProcessedBlob(null) }}
                    disabled={isUploading}
                    className="w-full py-2.5 rounded-xl bg-[#151515] hover:bg-[#242424] text-[#8A8A8A] hover:text-[#F5F5F5] text-sm font-bold transition-colors"
                  >
                    Cancelar
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
