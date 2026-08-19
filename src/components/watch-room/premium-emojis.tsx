'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface PremiumEmojiDef {
  id: string
  code: string
  name: string
  unicodeFallback: string
  previewColor: string
}

export const PREMIUM_EMOJIS: PremiumEmojiDef[] = [
  { id: 'vip_fire', code: ':vip_fire:', name: 'Chama Quântica', unicodeFallback: '🔥', previewColor: '#FF5A00' },
  { id: 'vip_heart', code: ':vip_heart:', name: 'Coração Neon', unicodeFallback: '❤️', previewColor: '#EF2020' },
  { id: 'vip_crown', code: ':vip_crown:', name: 'Coroa Real MAXPRO', unicodeFallback: '👑', previewColor: '#FFE600' },
  { id: 'vip_laugh', code: ':vip_laugh:', name: 'Choro de Rir', unicodeFallback: '😂', previewColor: '#FFCC00' },
  { id: 'vip_skull', code: ':vip_skull:', name: 'Caveira Cyber', unicodeFallback: '💀', previewColor: '#00F0FF' },
  { id: 'vip_rocket', code: ':vip_rocket:', name: 'Foguete Estelar', unicodeFallback: '🚀', previewColor: '#FF3366' },
  { id: 'vip_bolt', code: ':vip_bolt:', name: 'Raio Quântico', unicodeFallback: '⚡', previewColor: '#FFE600' },
  { id: 'vip_diamond', code: ':vip_diamond:', name: 'Diamante 3D', unicodeFallback: '💎', previewColor: '#00FFFF' },
  { id: 'vip_hearteyes', code: ':vip_hearteyes:', name: 'Olhos Apaixonados', unicodeFallback: '😍', previewColor: '#FF2E93' },
  { id: 'vip_cool', code: ':vip_cool:', name: 'Óculos Cyberpunk', unicodeFallback: '😎', previewColor: '#FFE600' },
  { id: 'vip_plead', code: ':vip_plead:', name: 'Carinha Fofa', unicodeFallback: '🥺', previewColor: '#FFAA00' },
  { id: 'vip_popcorn', code: ':vip_popcorn:', name: 'Pipoca Cinemática', unicodeFallback: '🍿', previewColor: '#FFDD44' },
  { id: 'vip_hundred', code: ':vip_hundred:', name: 'Cem Por Cento', unicodeFallback: '💯', previewColor: '#FF2222' },
  { id: 'vip_party', code: ':vip_party:', name: 'Festa Confete', unicodeFallback: '🥳', previewColor: '#A855F7' },
  { id: 'vip_robot', code: ':vip_robot:', name: 'Androide Mesh', unicodeFallback: '🤖', previewColor: '#00FF99' },
]

interface PremiumAnimatedEmojiProps {
  id: string
  className?: string
  size?: number
  isBig?: boolean
}

export function PremiumAnimatedEmoji({ id, className, size = 32, isBig = false }: PremiumAnimatedEmojiProps) {
  const s = size

  const baseMotionProps = {
    initial: { scale: 0.2, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: 'spring' as const, stiffness: 500, damping: 20 },
    whileHover: { scale: 1.25, rotate: 6, transition: { duration: 0.2 } },
    whileTap: { scale: 0.9 },
  }

  switch (id) {
    case 'vip_fire':
    case ':vip_fire:':
      return (
        <motion.span
          {...baseMotionProps}
          style={{ width: s, height: s }}
          className={cn('inline-flex items-center justify-center relative select-none shrink-0 cursor-pointer', className)}
        >
          <motion.svg
            viewBox="0 0 36 36"
            width={s}
            height={s}
            animate={{
              scale: [1, 1.1, 0.95, 1.08, 1],
              rotate: [-2, 3, -2, 2, 0],
              filter: [
                'drop-shadow(0 0 8px rgba(255,90,0,0.8))',
                'drop-shadow(0 0 16px rgba(255,160,0,1))',
                'drop-shadow(0 0 8px rgba(255,90,0,0.8))',
              ],
            }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <defs>
              <linearGradient id="fireGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#EF2020" />
                <stop offset="45%" stopColor="#FF5A00" />
                <stop offset="100%" stopColor="#FFE600" />
              </linearGradient>
            </defs>
            <path
              fill="url(#fireGrad)"
              d="M18 2C16 8 10 12 10 20c0 5 4 10 8 12 4-2 8-7 8-12 0-8-6-12-8-20z"
            />
            <motion.path
              animate={{ y: [0, -1.5, 0], opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              fill="#FFFFFF"
              d="M18 16c-1 3-3 5-3 8 0 2 1.5 4 3 5 1.5-1 3-3 3-5 0-3-2-5-3-8z"
            />
          </motion.svg>
        </motion.span>
      )

    case 'vip_heart':
    case ':vip_heart:':
      return (
        <motion.span
          {...baseMotionProps}
          style={{ width: s, height: s }}
          className={cn('inline-flex items-center justify-center relative select-none shrink-0 cursor-pointer', className)}
        >
          <motion.svg
            viewBox="0 0 36 36"
            width={s}
            height={s}
            animate={{
              scale: [1, 1.25, 1.05, 1.28, 1],
              filter: [
                'drop-shadow(0 0 10px rgba(255,0,80,0.8))',
                'drop-shadow(0 0 22px rgba(255,0,80,1))',
                'drop-shadow(0 0 10px rgba(255,0,80,0.8))',
              ],
            }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <defs>
              <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF1E66" />
                <stop offset="60%" stopColor="#FF0044" />
                <stop offset="100%" stopColor="#880020" />
              </linearGradient>
            </defs>
            <path
              fill="url(#heartGrad)"
              stroke="#FFF"
              strokeWidth="0.8"
              d="M18 30s-11-7-11-15a6 6 0 0111-3.5A6 6 0 0129 15c0 8-11 15-11 15z"
            />
          </motion.svg>
        </motion.span>
      )

    case 'vip_crown':
    case ':vip_crown:':
      return (
        <motion.span
          {...baseMotionProps}
          style={{ width: s, height: s }}
          className={cn('inline-flex items-center justify-center relative select-none shrink-0 cursor-pointer', className)}
        >
          <motion.svg
            viewBox="0 0 36 36"
            width={s}
            height={s}
            animate={{
              y: [0, -4, 0],
              rotate: [-3, 3, -3],
              filter: [
                'drop-shadow(0 0 10px rgba(255,230,0,0.8))',
                'drop-shadow(0 0 20px rgba(255,230,0,1))',
                'drop-shadow(0 0 10px rgba(255,230,0,0.8))',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF9A6" />
                <stop offset="40%" stopColor="#FFE600" />
                <stop offset="100%" stopColor="#D48800" />
              </linearGradient>
            </defs>
            <path fill="url(#goldGrad)" d="M6 26l3-16 6 8 3-12 3 12 6-8 3 16H6z" />
            <circle cx="9" cy="9" r="2.2" fill="#FFFFFF" />
            <motion.circle
              cx="18"
              cy="5"
              r="2.5"
              fill="#FFFFFF"
              animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <circle cx="27" cy="9" r="2.2" fill="#FFFFFF" />
            <rect x="6" y="27" width="24" height="3" fill="#E69900" />
          </motion.svg>
        </motion.span>
      )

    case 'vip_laugh':
    case ':vip_laugh:':
      return (
        <motion.span
          {...baseMotionProps}
          style={{ width: s, height: s }}
          className={cn('inline-flex items-center justify-center relative select-none shrink-0 cursor-pointer', className)}
        >
          <motion.svg
            viewBox="0 0 36 36"
            width={s}
            height={s}
            animate={{
              rotate: [-6, 6, -6],
              y: [0, -3, 0],
              filter: 'drop-shadow(0 0 10px rgba(255,204,0,0.9))',
            }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
          >
            <circle cx="18" cy="18" r="15" fill="#FFCC00" />
            <path d="M10 20c2 5 14 5 16 0H10z" fill="#3B2314" />
            <path d="M13 22c2 3 8 3 10 0H13z" fill="#FFFFFF" />
            <path d="M9 13l5 2-5 2M27 13l-5 2 5 2" stroke="#3B2314" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <motion.path
              d="M7 17c0 3 2 5 3 5s1-2 1-5-4-3-4 0z"
              fill="#00D2FF"
              animate={{ y: [0, 2, 0], scaleY: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
            <motion.path
              d="M29 17c0 3-2 5-3 5s-1-2-1-5 4-3 4 0z"
              fill="#00D2FF"
              animate={{ y: [0, 2, 0], scaleY: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          </motion.svg>
        </motion.span>
      )

    case 'vip_skull':
    case ':vip_skull:':
      return (
        <motion.span
          {...baseMotionProps}
          style={{ width: s, height: s }}
          className={cn('inline-flex items-center justify-center relative select-none shrink-0 cursor-pointer', className)}
        >
          <motion.svg
            viewBox="0 0 36 36"
            width={s}
            height={s}
            animate={{
              scale: [1, 1.06, 1],
              filter: [
                'drop-shadow(0 0 10px rgba(0,240,255,0.8))',
                'drop-shadow(0 0 20px rgba(0,240,255,1))',
                'drop-shadow(0 0 10px rgba(0,240,255,0.8))',
              ],
            }}
            transition={{ duration: 1.6, repeat: Infinity }}
          >
            <path d="M18 4C10 4 6 10 6 18c0 5 3 9 5 11v5h14v-5c2-2 5-6 5-11 0-8-4-14-12-14z" fill="#0E0E18" stroke="#00F0FF" strokeWidth="1.8" />
            <motion.circle
              cx="13"
              cy="16"
              r="3.5"
              fill="#00F0FF"
              animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            <motion.circle
              cx="23"
              cy="16"
              r="3.5"
              fill="#00F0FF"
              animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            <circle cx="13" cy="16" r="2" fill="#FFFFFF" />
            <circle cx="23" cy="16" r="2" fill="#FFFFFF" />
            <path d="M13 29v3M18 29v3M23 29v3" stroke="#00F0FF" strokeWidth="1.5" />
          </motion.svg>
        </motion.span>
      )

    case 'vip_rocket':
    case ':vip_rocket:':
      return (
        <motion.span
          {...baseMotionProps}
          style={{ width: s, height: s }}
          className={cn('inline-flex items-center justify-center relative select-none shrink-0 cursor-pointer', className)}
        >
          <motion.svg
            viewBox="0 0 36 36"
            width={s}
            height={s}
            animate={{
              y: [0, -6, 0],
              x: [0, 1.5, -1.5, 0],
              rotate: [0, 3, -3, 0],
              filter: 'drop-shadow(0 0 12px rgba(255,51,102,0.9))',
            }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path d="M28 8c-6-1-12 2-15 5L7 19l4 4 6-6c3-3 6-9 11-9z" fill="#F0F0FF" />
            <path d="M28 8c-2 4-2 8-5 11l-4-4c3-3 7-5 9-7z" fill="#FF3366" />
            <circle cx="21" cy="15" r="2.5" fill="#00F0FF" />
            <motion.path
              d="M7 19c-4 1-6 6-6 6s5-2 6-6z"
              fill="#FF9900"
              animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 0.4, repeat: Infinity }}
            />
            <motion.path
              d="M11 23c-1 4-6 6-6 6s2-5 6-6z"
              fill="#FFE600"
              animate={{ scale: [1, 1.4, 1], opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            />
          </motion.svg>
        </motion.span>
      )

    case 'vip_bolt':
    case ':vip_bolt:':
      return (
        <motion.span
          {...baseMotionProps}
          style={{ width: s, height: s }}
          className={cn('inline-flex items-center justify-center relative select-none shrink-0 cursor-pointer', className)}
        >
          <motion.svg
            viewBox="0 0 36 36"
            width={s}
            height={s}
            animate={{
              scale: [1, 1.18, 0.92, 1.22, 1],
              filter: [
                'drop-shadow(0 0 12px rgba(255,230,0,0.9))',
                'drop-shadow(0 0 24px rgba(255,230,0,1))',
                'drop-shadow(0 0 12px rgba(255,230,0,0.9))',
              ],
            }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <polygon points="20,2 7,19 16,19 13,34 29,15 19,15" fill="#FFE600" stroke="#FFF" strokeWidth="1" />
          </motion.svg>
        </motion.span>
      )

    case 'vip_diamond':
    case ':vip_diamond:':
      return (
        <motion.span
          {...baseMotionProps}
          style={{ width: s, height: s }}
          className={cn('inline-flex items-center justify-center relative select-none shrink-0 cursor-pointer', className)}
        >
          <motion.svg
            viewBox="0 0 36 36"
            width={s}
            height={s}
            animate={{
              rotateY: [0, 360],
              scale: [1, 1.1, 1],
              filter: [
                'drop-shadow(0 0 10px rgba(0,255,255,0.8))',
                'drop-shadow(0 0 20px rgba(0,255,255,1))',
                'drop-shadow(0 0 10px rgba(0,255,255,0.8))',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <polygon points="18,4 30,13 18,32 6,13" fill="#00FFFF" opacity="0.85" stroke="#FFFFFF" strokeWidth="1" />
            <polygon points="18,4 23,13 18,32 13,13" fill="#FFFFFF" opacity="0.6" />
          </motion.svg>
        </motion.span>
      )

    case 'vip_hearteyes':
    case ':vip_hearteyes:':
      return (
        <motion.span
          {...baseMotionProps}
          style={{ width: s, height: s }}
          className={cn('inline-flex items-center justify-center relative select-none shrink-0 cursor-pointer', className)}
        >
          <motion.svg
            viewBox="0 0 36 36"
            width={s}
            height={s}
            animate={{
              scale: [1, 1.1, 1],
              rotate: [-3, 3, -3],
              filter: 'drop-shadow(0 0 10px rgba(255,46,147,0.9))',
            }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <circle cx="18" cy="18" r="15" fill="#FFCC00" />
            <path d="M12 23c2 4 10 4 12 0" stroke="#3B2314" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <motion.path
              d="M12 16s-4-3-4-6a3 3 0 015-1.5A3 3 0 0116 10c0 3-4 6-4 6z"
              fill="#FF0055"
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            <motion.path
              d="M24 16s-4-3-4-6a3 3 0 015-1.5A3 3 0 0128 10c0 3-4 6-4 6z"
              fill="#FF0055"
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          </motion.svg>
        </motion.span>
      )

    case 'vip_cool':
    case ':vip_cool:':
      return (
        <motion.span
          {...baseMotionProps}
          style={{ width: s, height: s }}
          className={cn('inline-flex items-center justify-center relative select-none shrink-0 cursor-pointer', className)}
        >
          <motion.svg
            viewBox="0 0 36 36"
            width={s}
            height={s}
            animate={{
              y: [0, -3, 0],
              filter: 'drop-shadow(0 0 10px rgba(255,204,0,0.9))',
            }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <circle cx="18" cy="18" r="15" fill="#FFCC00" />
            <path d="M13 24c3 3 7 3 10 0" stroke="#3B2314" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M5 14h26l-3 6H8l-3-6z" fill="#0A0A10" stroke="#FFE600" strokeWidth="1" />
            <motion.line
              x1="7"
              y1="17"
              x2="16"
              y2="17"
              stroke="#FFE600"
              strokeWidth="1.2"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            <motion.line
              x1="20"
              y1="17"
              x2="29"
              y2="17"
              stroke="#FFE600"
              strokeWidth="1.2"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          </motion.svg>
        </motion.span>
      )

    case 'vip_plead':
    case ':vip_plead:':
      return (
        <motion.span
          {...baseMotionProps}
          style={{ width: s, height: s }}
          className={cn('inline-flex items-center justify-center relative select-none shrink-0 cursor-pointer', className)}
        >
          <motion.svg
            viewBox="0 0 36 36"
            width={s}
            height={s}
            animate={{
              scale: [1, 1.08, 1],
              rotate: [-1.5, 1.5, -1.5],
              filter: 'drop-shadow(0 0 10px rgba(255,170,0,0.9))',
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <circle cx="18" cy="18" r="15" fill="#FFAA00" />
            <circle cx="12" cy="15" r="5" fill="#181824" />
            <circle cx="24" cy="15" r="5" fill="#181824" />
            <motion.circle
              cx="10"
              cy="13"
              r="2.2"
              fill="#FFFFFF"
              animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 0.9, repeat: Infinity }}
            />
            <motion.circle
              cx="22"
              cy="13"
              r="2.2"
              fill="#FFFFFF"
              animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 0.9, repeat: Infinity }}
            />
            <circle cx="13.5" cy="16.5" r="1" fill="#FFFFFF" />
            <circle cx="25.5" cy="16.5" r="1" fill="#FFFFFF" />
            <path d="M15 25c1.5-2 4.5-2 6 0" stroke="#3B2314" strokeWidth="2" strokeLinecap="round" fill="none" />
          </motion.svg>
        </motion.span>
      )

    case 'vip_popcorn':
    case ':vip_popcorn:':
      return (
        <motion.span
          {...baseMotionProps}
          style={{ width: s, height: s }}
          className={cn('inline-flex items-center justify-center relative select-none shrink-0 cursor-pointer', className)}
        >
          <motion.svg
            viewBox="0 0 36 36"
            width={s}
            height={s}
            animate={{
              y: [0, -4, 0],
              filter: 'drop-shadow(0 0 10px rgba(255,221,68,0.9))',
            }}
            transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path d="M9 16l3 16h12l3-16H9z" fill="#EF2020" />
            <path d="M13 16l1 16h3l-1-16h-3zM21 16l-1 16h3l1-16h-3z" fill="#FFFFFF" />
            <motion.circle
              cx="12"
              cy="13"
              r="3.5"
              fill="#FFF275"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
            <motion.circle
              cx="18"
              cy="11"
              r="4.2"
              fill="#FFE600"
              animate={{ y: [0, -3.5, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
            <circle cx="18" cy="11" r="4" fill="#FFF8B0" />
            <motion.circle
              cx="24"
              cy="13"
              r="3.5"
              fill="#FFF275"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 0.7, repeat: Infinity }}
            />
          </motion.svg>
        </motion.span>
      )

    case 'vip_hundred':
    case ':vip_hundred:':
      return (
        <motion.span
          {...baseMotionProps}
          style={{ width: s, height: s }}
          className={cn('inline-flex items-center justify-center relative select-none shrink-0 cursor-pointer', className)}
        >
          <motion.svg
            viewBox="0 0 36 36"
            width={s}
            height={s}
            animate={{
              scale: [1, 1.14, 0.96, 1.12, 1],
              filter: [
                'drop-shadow(0 0 10px rgba(255,34,34,0.9))',
                'drop-shadow(0 0 20px rgba(255,34,34,1))',
                'drop-shadow(0 0 10px rgba(255,34,34,0.9))',
              ],
            }}
            transition={{ duration: 1.1, repeat: Infinity }}
          >
            <text x="18" y="22" fill="#FF2222" fontSize="16" fontWeight="900" textAnchor="middle" fontFamily="monospace">
              100
            </text>
            <line x1="6" y1="27" x2="30" y2="27" stroke="#FF2222" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="8" y1="31" x2="28" y2="31" stroke="#FF2222" strokeWidth="2" strokeLinecap="round" />
          </motion.svg>
        </motion.span>
      )

    case 'vip_party':
    case ':vip_party:':
      return (
        <motion.span
          {...baseMotionProps}
          style={{ width: s, height: s }}
          className={cn('inline-flex items-center justify-center relative select-none shrink-0 cursor-pointer', className)}
        >
          <motion.svg
            viewBox="0 0 36 36"
            width={s}
            height={s}
            animate={{
              rotate: [-8, 8, -8],
              scale: [1, 1.1, 1],
              filter: 'drop-shadow(0 0 10px rgba(168,85,247,0.9))',
            }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <circle cx="16" cy="20" r="13" fill="#FFCC00" />
            <polygon points="12,12 28,4 22,20" fill="#A855F7" stroke="#FFE600" strokeWidth="1" />
            <circle cx="28" cy="4" r="2" fill="#FFE600" />
            <motion.circle
              cx="6"
              cy="8"
              r="1.8"
              fill="#00F0FF"
              animate={{ y: [0, -3, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            <motion.circle
              cx="32"
              cy="14"
              r="1.8"
              fill="#FF3366"
              animate={{ y: [0, -3, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.9, repeat: Infinity }}
            />
            <circle cx="8" cy="28" r="1.4" fill="#FFE600" />
          </motion.svg>
        </motion.span>
      )

    case 'vip_robot':
    case ':vip_robot:':
      return (
        <motion.span
          {...baseMotionProps}
          style={{ width: s, height: s }}
          className={cn('inline-flex items-center justify-center relative select-none shrink-0 cursor-pointer', className)}
        >
          <motion.svg
            viewBox="0 0 36 36"
            width={s}
            height={s}
            animate={{
              y: [0, -3, 0],
              filter: [
                'drop-shadow(0 0 10px rgba(0,255,153,0.8))',
                'drop-shadow(0 0 20px rgba(0,255,153,1))',
                'drop-shadow(0 0 10px rgba(0,255,153,0.8))',
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <rect x="7" y="10" width="22" height="18" rx="2" fill="#0E1218" stroke="#00FF99" strokeWidth="1.8" />
            <line x1="18" y1="10" x2="18" y2="4" stroke="#00FF99" strokeWidth="2" />
            <motion.circle
              cx="18"
              cy="4"
              r="2.5"
              fill="#00FF99"
              animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 0.7, repeat: Infinity }}
            />
            <rect x="10" y="14" width="5" height="4" fill="#00FF99" />
            <rect x="21" y="14" width="5" height="4" fill="#00FF99" />
            <line x1="12" y1="23" x2="24" y2="23" stroke="#00FF99" strokeWidth="2" strokeDasharray="2,1" />
          </motion.svg>
        </motion.span>
      )

    default:
      return null
  }
}

/**
 * Accurately analyzes text and counts standalone emojis (VIP codes and/or unicode pictographs)
 */
export function getEmojiAnalysis(text: string): { isOnly: boolean; count: number } {
  if (!text) return { isOnly: false, count: 0 }
  const trimmed = text.trim()
  if (!trimmed) return { isOnly: false, count: 0 }

  // Count VIP codes
  const vipMatches = trimmed.match(/:vip_[a-z0-9_]+:/g) || []
  const vipCount = vipMatches.length

  // Strip VIP codes from text
  const textWithoutVip = trimmed.replace(/:vip_[a-z0-9_]+:/g, '')
  const noSpaces = textWithoutVip.replace(/\s+/g, '')

  // Only VIP codes
  if (vipCount > 0 && noSpaces.length === 0) {
    return { isOnly: true, count: vipCount }
  }

  // Count unicode emojis
  let unicodeCount = 0
  try {
    const emojiRegex = /^(\p{Extended_Pictographic}|\p{Emoji_Presentation}|\p{Emoji_Modifier}|\p{Emoji_Component}|\uFE0F|\u200D)+$/u
    if (emojiRegex.test(noSpaces)) {
      const matches = noSpaces.match(/\p{Extended_Pictographic}/gu)
      if (matches) {
        unicodeCount = matches.length
      }
    } else {
      // Contains regular words/text
      return { isOnly: false, count: 0 }
    }
  } catch {
    return { isOnly: false, count: 0 }
  }

  const totalCount = vipCount + unicodeCount
  if (totalCount >= 1) {
    return { isOnly: true, count: totalCount }
  }

  return { isOnly: false, count: 0 }
}

/**
 * Checks if a message consists strictly of standard unicode emojis or VIP emoji codes
 */
export function isOnlyEmojis(text: string): boolean {
  return getEmojiAnalysis(text).isOnly
}

/**
 * Returns dynamic sizing classes & pixel dimensions based on the number of emojis:
 * - 1 emoji:  56px  (text-5xl)
 * - 2 emojis: 42px  (text-4xl)
 * - 3 emojis: 32px  (text-3xl)
 * - 4+ emojis: 24px (text-2xl)
 */
function getDynamicEmojiSizing(count: number, defaultSize = 28) {
  if (count === 1) {
    return {
      vipSize: 56,
      textClass: 'text-5xl sm:text-6xl my-1.5',
    }
  }
  if (count === 2) {
    return {
      vipSize: 42,
      textClass: 'text-4xl sm:text-5xl my-1',
    }
  }
  if (count === 3) {
    return {
      vipSize: 32,
      textClass: 'text-3xl my-0.5',
    }
  }
  if (count >= 4) {
    return {
      vipSize: 24,
      textClass: 'text-2xl',
    }
  }
  return {
    vipSize: defaultSize,
    textClass: 'text-xs',
  }
}

/**
 * Parses a chat text message and replaces VIP emoji codes (e.g. :vip_fire:) with animated Framer Motion components.
 * Only renders animated VIP emojis if the message author is actually PRO/MAXPRO (isSenderPro).
 * Dynamically scales emojis based on quantity: "Quanto mais emoji, menor o tamanho"!
 */
export function renderFormattedChatMessage(text: string, defaultSize = 28, isSenderPro = false): React.ReactNode {
  if (!text) return ''

  const { isOnly, count } = getEmojiAnalysis(text)
  const { vipSize, textClass } = getDynamicEmojiSizing(isOnly ? count : 0, defaultSize)

  const parts = text.split(/(:vip_[a-z0-9_]+:)/g)

  // Standard unicode-only standalone message
  if (parts.length === 1) {
    if (isOnly) {
      return (
        <motion.span
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          className={cn(
            'leading-none inline-block filter drop-shadow-md select-text tracking-wide transition-transform hover:scale-115 cursor-pointer',
            textClass
          )}
        >
          {text}
        </motion.span>
      )
    }
    return text
  }

  return (
    <span className={cn('inline-flex flex-wrap items-center gap-1.5', isOnly && 'my-1')}>
      {parts.map((part, index) => {
        if (part.startsWith(':vip_') && part.endsWith(':')) {
          const match = PREMIUM_EMOJIS.find((e) => e.code === part)
          if (match) {
            // Only render animated VIP emoji if the author has PRO access
            if (isSenderPro) {
              return (
                <PremiumAnimatedEmoji
                  key={`${part}-${index}`}
                  id={match.id}
                  size={vipSize}
                  isBig={isOnly && count <= 2}
                  className="inline-block mx-0.5 align-middle"
                />
              )
            } else {
              // Free sender fallback: render standard unicode character
              if (isOnly) {
                return (
                  <motion.span
                    key={index}
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    className={cn(
                      'leading-none inline-block filter drop-shadow-md select-text transition-transform hover:scale-115 cursor-pointer',
                      textClass
                    )}
                  >
                    {match.unicodeFallback}
                  </motion.span>
                )
              }
              return (
                <span key={index} className="inline-block mx-0.5 align-middle">
                  {match.unicodeFallback}
                </span>
              )
            }
          }
        }
        if (isOnly && part.trim()) {
          return (
            <motion.span
              key={index}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className={cn(
                'leading-none inline-block filter drop-shadow-md select-text transition-transform hover:scale-115 cursor-pointer',
                textClass
              )}
            >
              {part}
            </motion.span>
          )
        }
        return part ? <span key={index}>{part}</span> : null
      })}
    </span>
  )
}
