'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Check, Copy } from 'lucide-react'

interface Friend {
  id: number
  name: string
  alias: string
  color: string
  status: 'online' | 'watching' | 'offline'
  invited?: boolean
}

const SAMPLE_FRIENDS: Friend[] = [
  { id: 1, name: 'Carolina Dias', alias: 'CAROL_D', color: '#EF2020', status: 'online' },
  { id: 2, name: 'Matheus Silva', alias: 'MATT_99', color: '#3B82F6', status: 'watching' },
  { id: 3, name: 'Renata Lima', alias: 'REHLIMA', color: '#A855F7', status: 'online' },
  { id: 4, name: 'Felipe Costa', alias: 'F_COSTA', color: '#10B981', status: 'offline' },
]

export function SectionSocial() {
  const [friends, setFriends] = useState<Friend[]>(SAMPLE_FRIENDS)
  const [copiedLink, setCopiedLink] = useState(false)

  const toggleInvite = (id: number) => {
    setFriends((prev) =>
      prev.map((f) => (f.id === id ? { ...f, invited: !f.invited } : f))
    )
  }

  const copyRoomLink = () => {
    navigator.clipboard?.writeText('https://videomax.app/room/MAX-8829')
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <section
      id="comunidade"
      className="relative min-h-[100vh] w-full bg-[#050505] flex flex-col justify-center py-32 overflow-hidden border-t border-[#222]"
    >
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12 w-full flex flex-col">
        
        {/* Asymmetric Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-[#222] pb-12">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-[#FF5A00] tracking-widest uppercase mb-4">
              [SYS_NETWORK: CONNECTED]
            </span>
            <h2 className="text-[50px] sm:text-[80px] font-black leading-[0.85] tracking-tight text-white uppercase">
              Sua Sala.<br/>
              <span className="text-transparent" style={{ WebkitTextStroke: '2px #F5F5F5' }}>Seus Amigos.</span>
            </h2>
          </div>
          <div className="mt-8 md:mt-0 max-w-[300px]">
            <p className="text-[14px] font-mono text-[#A3A3A3] leading-relaxed border-l-2 border-[#FF5A00] pl-4">
              Adicione amigos à sua rede, envie convites instantâneos com 1 clique e veja quem está online.
            </p>
          </div>
        </div>

        {/* Top Room Link Sharing Widget - Brutalist Style */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-[#080808] border border-[#222] mb-12">
          <div className="flex flex-col mb-4 sm:mb-0">
            <span className="text-[10px] font-mono text-[#A3A3A3] mb-1 uppercase">Link de Acesso Rápido</span>
            <span className="text-[16px] font-mono font-bold text-white">videomax.app/room/MAX-8829</span>
          </div>

          <button
            onClick={copyRoomLink}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FF5A00] hover:bg-[#F5F5F5] text-[#050505] text-[10px] uppercase font-mono font-bold px-6 py-4 transition-colors cursor-pointer"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'COPIADO!' : 'COPIAR LINK'}</span>
          </button>
        </div>

        {/* Friends Database Table */}
        <div className="w-full bg-[#050505] border border-[#222]">
          
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#222] bg-[#080808]">
            <div className="col-span-1 text-[10px] font-mono font-bold text-[#A3A3A3] uppercase">ID</div>
            <div className="col-span-4 text-[10px] font-mono font-bold text-[#A3A3A3] uppercase">Usuário</div>
            <div className="col-span-3 text-[10px] font-mono font-bold text-[#A3A3A3] uppercase">Status</div>
            <div className="col-span-4 text-[10px] font-mono font-bold text-[#A3A3A3] uppercase text-right">Ação</div>
          </div>

          {/* Table Rows */}
          {friends.map((f, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              key={f.id}
              className="grid grid-cols-12 gap-4 p-4 border-b border-[#222] items-center hover:bg-[#111] transition-colors group"
            >
              <div className="col-span-1 text-[10px] font-mono text-[#5F5F5F]">
                {String(f.id).padStart(3, '0')}
              </div>
              
              <div className="col-span-4 flex items-center gap-3">
                <div
                  className="w-8 h-8 flex items-center justify-center text-[10px] font-mono font-bold text-[#050505] transition-transform group-hover:skew-x-[-10deg]"
                  style={{ backgroundColor: f.color }}
                >
                  {f.alias.substring(0,2)}
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-mono font-bold text-white uppercase">{f.alias}</span>
                  <span className="text-[10px] font-mono text-[#8A8A8A]">{f.name}</span>
                </div>
              </div>

              <div className="col-span-3 flex items-center gap-2">
                <span className={`w-2 h-2 ${
                  f.status === 'online' ? 'bg-[#22C55E]' : f.status === 'watching' ? 'bg-[#FFB800]' : 'bg-[#5F5F5F]'
                }`} />
                <span className="text-[10px] font-mono text-[#A3A3A3] uppercase">
                  {f.status === 'online' ? 'DISPONÍVEL' : f.status === 'watching' ? 'ASSISTINDO' : 'OFFLINE'}
                </span>
              </div>

              <div className="col-span-4 flex justify-end">
                <button
                  onClick={() => toggleInvite(f.id)}
                  className={`text-[10px] font-mono font-bold px-4 py-2 uppercase transition-all cursor-pointer flex items-center gap-2 border ${
                    f.invited
                      ? 'bg-[#111] text-[#22C55E] border-[#22C55E]'
                      : 'bg-transparent text-white border-[#333] hover:border-white'
                  }`}
                >
                  {f.invited ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>ENVIADO</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3 text-[#FF5A00]" />
                      <span>CONVIDAR</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
