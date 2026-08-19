'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Check, Search } from 'lucide-react'

interface MediaCard {
  id: number
  title: string
  duration: string
  category: string
  color: string
}

const SAMPLE_MEDIA: MediaCard[] = [
  { id: 1, title: 'TRAILER OFICIAL HD — SCI-FI 2026', duration: '02:45', category: 'YOUTUBE', color: '#EF2020' },
  { id: 2, title: 'GRAVAÇÃO DO GAMEPLAY', duration: '45:12', category: 'NUVEM', color: '#FF5A00' },
  { id: 3, title: 'DOCUMENTÁRIO 4K', duration: '1:12:00', category: 'YOUTUBE', color: '#3B82F6' },
  { id: 4, title: 'ANIMAÇÃO CURTA', duration: '15:30', category: 'MP4 LINK', color: '#A855F7' },
]

export function SectionLibrary() {
  const [urlInput, setUrlInput] = useState('')
  const [imported, setImported] = useState(false)

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault()
    if (!urlInput) return
    setImported(true)
    setTimeout(() => setImported(false), 2500)
  }

  const samplePaste = (url: string) => {
    setUrlInput(url)
  }

  return (
    <section
      id="biblioteca"
      className="relative min-h-screen w-full bg-[#050505] flex flex-col justify-center py-32 overflow-hidden border-t border-[#222]"
    >
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12 w-full flex flex-col">
        
        <div className="flex flex-col items-center text-center mb-24">
          <span className="text-[10px] font-mono text-[#FF5A00] tracking-widest uppercase mb-4">
            [SYS_LIBRARY: ACTIVE]
          </span>
          <h2 className="text-[50px] sm:text-[90px] lg:text-[110px] font-black leading-[0.85] tracking-tight text-white uppercase mb-8">
            Cinema<br/>
            <span className="text-transparent" style={{ WebkitTextStroke: '2px #FF5A00' }}>Na Nuvem.</span>
          </h2>
          <p className="text-[14px] font-mono text-[#A3A3A3] max-w-[600px]">
            Cole links do vídeos diretos ou organize sua galeria por pastas com histórico automático de reprodução.
          </p>
        </div>

        {/* Interactive URL Importer Bar */}
        <form
          onSubmit={handleImport}
          className="w-full max-w-[800px] mx-auto bg-[#080808] border border-[#333] flex flex-col sm:flex-row items-center p-2 mb-8"
        >
          <div className="flex-1 flex items-center gap-3 px-4 w-full h-12">
            <span className="text-[12px] font-mono text-[#FF5A00] animate-pulse">_</span>
            <input
              type="text"
              placeholder="INSERIR LINK YOUTUBE OU MP4..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full bg-transparent text-[10px] font-mono text-white focus:outline-none placeholder:text-[#5F5F5F]"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto h-12 bg-[#F5F5F5] hover:bg-[#FF5A00] hover:text-white text-[#050505] text-[10px] font-mono font-bold px-8 transition-colors flex items-center justify-center gap-2 cursor-pointer uppercase"
          >
            {imported ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>CARREGADO</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>BUSCAR VÍDEO</span>
              </>
            )}
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-24">
          <button
            onClick={() => samplePaste('https://youtube.com/watch?v=dQw4w9WgXcQ')}
            className="text-[10px] font-mono border border-[#333] px-4 py-2 text-[#A3A3A3] hover:text-white hover:border-[#F5F5F5] transition-colors cursor-pointer uppercase"
          >
            [ YOUTUBE PRESET ]
          </button>
          <button
            onClick={() => samplePaste('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4')}
            className="text-[10px] font-mono border border-[#333] px-4 py-2 text-[#A3A3A3] hover:text-white hover:border-[#F5F5F5] transition-colors cursor-pointer uppercase"
          >
            [ MP4 PRESET ]
          </button>
        </div>

        {/* Brutalist Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-[#222]">
          {SAMPLE_MEDIA.map((item) => (
            <div
              key={item.id}
              className="group relative bg-[#050505] border-r border-b border-[#222] p-6 hover:bg-[#080808] transition-colors flex flex-col justify-between aspect-square"
            >
              {/* Background fill on hover */}
              <div className="absolute inset-0 bg-[#FF5A00] scale-y-0 origin-bottom group-hover:scale-y-100 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0 opacity-10" />
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <span
                    className="text-[10px] font-mono font-bold uppercase tracking-wider mb-4 block"
                    style={{ color: item.color }}
                  >
                    {item.category}
                  </span>
                  <h3 className="text-[18px] font-black leading-tight text-[#F5F5F5] group-hover:text-[#FF5A00] transition-colors">
                    {item.title}
                  </h3>
                </div>

                <div className="flex items-end justify-between">
                  <span className="text-[24px] font-mono font-black text-[#333] group-hover:text-white transition-colors">
                    {item.duration}
                  </span>
                  
                  <div className="w-10 h-10 border border-[#333] group-hover:border-[#FF5A00] group-hover:bg-[#FF5A00] flex items-center justify-center transition-all cursor-pointer text-[#5F5F5F] group-hover:text-white">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
