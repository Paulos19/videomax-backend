'use client'

import { useState, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, Sparkles } from 'lucide-react'

interface Message {
  id: number
  user: string
  color: string
  text: string
  badge?: string
}

const INITIAL_MESSAGES: Message[] = [
  { id: 1, user: 'Lucas', color: '#FF5A00', text: 'Quem aí reparou nos detalhes da iluminação?', badge: 'HOST' },
  { id: 2, user: 'Marina', color: '#F5F5F5', text: 'Ficou demais essa iluminação! 🔥', badge: 'CO-HOST' },
  { id: 3, user: 'Beatriz', color: '#A3A3A3', text: 'Pausa em 01:45 pra olhar a cena!' },
]

const COLOR_OPTIONS = ['#FF5A00', '#F5F5F5', '#A3A3A3', '#EF2020']

export function SectionChat() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [inputText, setInputText] = useState('')
  const [selectedColor, setSelectedColor] = useState('#FF5A00')

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // Brutalist vertical scroll parallax
  const yText = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputText.trim()) return

    const newMessage: Message = {
      id: Date.now(),
      user: 'Você',
      color: selectedColor,
      text: inputText,
    }

    setMessages((prev) => [...prev, newMessage])
    setInputText('')
  }

  return (
    <section
      ref={sectionRef}
      id="chat"
      className="relative min-h-[100vh] w-full bg-[#050505] flex flex-col justify-center py-32 overflow-hidden border-t border-[#222]"
    >
      {/* Background Vertical Text */}
      <div className="absolute top-0 right-0 bottom-0 pointer-events-none opacity-[0.05] select-none overflow-hidden flex items-center justify-end">
        <motion.div style={{ y: yText }} className="whitespace-nowrap origin-bottom-right -rotate-90 translate-x-full">
          <span className="text-[25vw] font-black leading-none text-[#F5F5F5]">
            O CHAT.
          </span>
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left: Asymmetric Typography */}
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-[#FF5A00] tracking-widest uppercase mb-4">
            [SYS_CHAT: ENABLED]
          </span>
          <h2 className="text-[40px] sm:text-[60px] font-black leading-[0.9] tracking-tight text-white mb-8 uppercase">
            A conversa<br/>faz parte do filme.
          </h2>
          <p className="text-[14px] font-mono text-[#A3A3A3] leading-relaxed border-l-2 border-[#FF5A00] pl-4 max-w-[500px]">
            Escolha a cor do seu nickname, envie mensagens instantâneas e comente as melhores cenas sem perder um único segundo de reprodução.
          </p>
        </div>

        {/* Right: Technical Brutalist Chat UI */}
        <div className="w-full bg-[#080808] border border-[#222] p-6 relative">
          
          {/* Accent corners */}
          <div className="absolute top-0 left-0 w-2 h-2 bg-[#F5F5F5]" />
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#F5F5F5]" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#222]">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#FF5A00]" />
              <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">
                SALA_MAX_8829 / CHAT
              </span>
            </div>
            
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`w-4 h-4 rounded-none transition-all cursor-pointer border ${
                    selectedColor === c ? 'border-white scale-110' : 'border-[#222]'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Chat Scroll Feed */}
          <div className="flex flex-col h-[300px] overflow-y-auto space-y-3 py-2 pr-2 chat-scroll">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-start bg-[#111] p-3 border-l-2"
                  style={{ borderColor: m.color }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: m.color }}>
                      {m.user}
                    </span>
                    {m.badge && (
                      <span className="text-[8px] font-mono font-bold bg-[#222] text-[#A3A3A3] px-1 py-0.5 rounded-none uppercase">
                        {m.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-[#F5F5F5] font-mono leading-snug">{m.text}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Interactive Input Form */}
          <form onSubmit={handleSendMessage} className="pt-4 border-t border-[#222] flex items-center gap-2 mt-2">
            <div className="flex-1 h-10 bg-[#111] border border-[#333] flex items-center px-3">
              <input
                type="text"
                placeholder="ENVIE UMA MENSAGEM..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full bg-transparent text-[10px] font-mono text-white focus:outline-none placeholder:text-[#5F5F5F]"
              />
            </div>
            <button
              type="submit"
              className="h-10 px-4 bg-[#FF5A00] hover:bg-[#F5F5F5] hover:text-[#050505] transition-colors flex items-center justify-center text-[#050505] cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      </div>
    </section>
  )
}
