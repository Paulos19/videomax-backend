'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  variant?: 'compact' | 'full' | 'sidebar'
  className?: string
}

export function ThemeToggle({ variant = 'compact', className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        className={cn(
          'w-9 h-9 border border-[#222] dark:border-[#222] bg-[#09090D] dark:bg-[#09090D] opacity-40 animate-pulse',
          className
        )}
      />
    )
  }

  const isDark = (theme === 'system' ? resolvedTheme : theme) === 'dark'

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  if (variant === 'sidebar') {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        title={isDark ? 'Alternar para Tema Claro (Light Mode)' : 'Alternar para Tema Escuro (Dark Mode)'}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 text-[11px] font-mono font-bold uppercase transition-all duration-200 border cursor-pointer select-none',
          isDark
            ? 'bg-[#09090D] border-[#222] text-[#AAA] hover:text-white hover:border-[#FF5A00]/50 hover:bg-[#111118]'
            : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:border-orange-400 hover:bg-slate-50 shadow-sm',
          className
        )}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'w-5 h-5 flex items-center justify-center rounded-none transition-colors',
              isDark ? 'text-[#FFB800]' : 'text-amber-600'
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isDark ? (
                <motion.div
                  key="moon"
                  initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon className="w-3.5 h-3.5 fill-current" />
                </motion.div>
              ) : (
                <motion.div
                  key="sun"
                  initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun className="w-3.5 h-3.5 stroke-[2.5]" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <span className="truncate">{isDark ? '[ TEMA DARK ]' : '[ TEMA LIGHT ]'}</span>
        </div>

        <span
          className={cn(
            'text-[9px] px-1.5 py-0.5 border font-bold uppercase',
            isDark
              ? 'bg-[#151520] border-[#262635] text-[#FF5A00]'
              : 'bg-orange-50 border-orange-200 text-orange-600'
          )}
        >
          {isDark ? 'OBSIDIAN' : 'TITANIUM'}
        </span>
      </button>
    )
  }

  if (variant === 'full') {
    return (
      <div
        className={cn(
          'flex items-center p-1 border transition-colors select-none',
          isDark ? 'bg-[#09090D] border-[#262635]' : 'bg-slate-100 border-slate-300',
          className
        )}
      >
        <button
          onClick={() => setTheme('dark')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono font-bold uppercase transition-all cursor-pointer',
            isDark
              ? 'bg-[#FF5A00] text-black shadow-[0_0_12px_rgba(255,90,0,0.4)]'
              : 'text-slate-500 hover:text-slate-900'
          )}
        >
          <Moon className="w-3 h-3 fill-current" />
          <span>DARK</span>
        </button>

        <button
          onClick={() => setTheme('light')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono font-bold uppercase transition-all cursor-pointer',
            !isDark
              ? 'bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]'
              : 'text-[#777] hover:text-white'
          )}
        >
          <Sun className="w-3 h-3 stroke-[2.5]" />
          <span>LIGHT</span>
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={isDark ? 'Alternar para Tema Claro' : 'Alternar para Tema Escuro'}
      className={cn(
        'relative w-9 h-9 flex items-center justify-center border transition-all duration-200 cursor-pointer overflow-hidden group select-none',
        isDark
          ? 'bg-[#09090D] border-[#262635] text-[#AAA] hover:text-white hover:border-[#FF5A00] hover:shadow-[0_0_15px_rgba(255,90,0,0.25)]'
          : 'bg-white border-slate-200 text-slate-700 hover:text-orange-600 hover:border-orange-400 hover:shadow-[0_0_15px_rgba(249,115,22,0.15)] shadow-sm',
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center text-[#FFB800] group-hover:text-[#FF5A00]"
          >
            <Moon className="w-4 h-4 fill-current" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center text-amber-600 group-hover:text-orange-600"
          >
            <Sun className="w-4 h-4 stroke-[2.5]" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}
