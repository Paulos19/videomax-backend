'use client'

import { useState, useCallback } from 'react'
import { X, BarChart2, Plus, Trash2, Clock, CheckCircle2 } from 'lucide-react'
import { CreatePollPayload } from '@/types'
import { cn } from '@/lib/utils'

interface PollCreatorModalProps {
  isOpen: boolean
  onClose: () => void
  onCreatePoll: (payload: CreatePollPayload) => void
}

const TIMER_OPTIONS = [
  { label: 'Sem limite', value: null },
  { label: '15s', value: 15 },
  { label: '30s', value: 30 },
  { label: '1 min', value: 60 },
  { label: '2 min', value: 120 },
]

export function PollCreatorModal({ isOpen, onClose, onCreatePoll }: PollCreatorModalProps) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState<string[]>(['', ''])
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, ''])
    }
  }

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const handleOptionChange = (text: string, index: number) => {
    const updated = [...options]
    updated[index] = text
    setOptions(updated)
    setErrorMsg('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedQuestion = question.trim()
    if (!trimmedQuestion) {
      setErrorMsg('Insira uma pergunta para a enquete.')
      return
    }

    const validOptions = options.map((opt) => opt.trim()).filter((opt) => opt.length > 0)
    if (validOptions.length < 2) {
      setErrorMsg('Forneça pelo menos 2 opções de resposta preenchidas.')
      return
    }

    onCreatePoll({
      question: trimmedQuestion,
      options: validOptions,
      durationSeconds,
    })

    // Reset and close
    setQuestion('')
    setOptions(['', ''])
    setDurationSeconds(null)
    setErrorMsg('')
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none font-mono animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-[#0A0A0F] border-2 border-[#FFE600] w-full max-w-md shadow-[0_0_40px_rgba(255,230,0,0.25)] flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1F1F28] bg-[#0E0E14]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#FFE600] flex items-center justify-center text-black font-bold">
              <BarChart2 className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs font-black text-white uppercase tracking-wider">
              [ NOVA ENQUETE AO VIVO ]
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 border border-[#333] hover:border-white text-[#888] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Question Input */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-[#888] uppercase block">
              PERGUNTA DA ENQUETE
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value)
                setErrorMsg('')
              }}
              placeholder="Ex: O que acharam desse trailer?"
              className="w-full bg-[#121218] border border-[#333] focus:border-[#FFE600] text-white px-3 py-2 text-xs font-mono outline-none"
              maxLength={200}
              autoFocus
            />
          </div>

          {/* Options Inputs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[9px] font-bold text-[#888] uppercase block">
                OPÇÕES DE RESPOSTA ({options.length}/5)
              </label>
              {options.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-[9px] font-bold text-[#FFE600] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>ADICIONAR OPÇÃO</span>
                </button>
              )}
            </div>

            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#777] w-4 shrink-0 text-center">
                  {idx + 1}.
                </span>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(e.target.value, idx)}
                  placeholder={`Opção ${idx + 1}`}
                  className="flex-1 bg-[#121218] border border-[#333] focus:border-[#FFE600] text-white px-3 py-1.5 text-xs font-mono outline-none"
                  maxLength={100}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    className="p-1.5 text-[#666] hover:text-[#EF2020] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Timer Selector */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-[#888] uppercase flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#FFE600]" />
              <span>DURAÇÃO DA ENQUETE</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {TIMER_OPTIONS.map((item, idx) => {
                const isSelected = durationSeconds === item.value
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setDurationSeconds(item.value)}
                    className={cn(
                      'py-1.5 text-[9px] font-bold uppercase transition-all border cursor-pointer text-center truncate px-1',
                      isSelected
                        ? 'bg-[#FFE600] text-black border-[#FFE600] font-black'
                        : 'bg-[#121218] text-[#888] border-[#222] hover:border-[#444] hover:text-white'
                    )}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>

          {errorMsg && (
            <p className="text-[10px] font-bold text-[#EF2020] uppercase">{errorMsg}</p>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-[#FFE600] hover:bg-white text-black font-black text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-[0_0_15px_rgba(255,230,0,0.3)] flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>INICIAR ENQUETE AO VIVO</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
