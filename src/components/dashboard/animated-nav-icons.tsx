'use client'

import { motion } from 'framer-motion'

interface IconProps {
  active?: boolean
  isHovered?: boolean
  className?: string
}

// ── 1. INÍCIO: CYBERPUNK RADAR & ISOMETRIC GATEWAY ───────────────
export function NavIconHome({ active, isHovered, className }: IconProps) {
  const isExcited = active || isHovered

  return (
    <div className={`relative w-5 h-5 flex items-center justify-center ${className || ''}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Outer Hexagon / Frame */}
        <motion.path
          d="M12 2L21 7V17L12 22L3 17V7L12 2Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{
            strokeDasharray: isExcited ? ['1 0', '4 2', '1 0'] : '0 0',
            scale: isExcited ? 1.05 : 1,
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />

        {/* Center Radar Crosshair */}
        <motion.line
          x1="12"
          y1="6"
          x2="12"
          y2="18"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="2 2"
          animate={{ opacity: isExcited ? [0.4, 1, 0.4] : 0.4 }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        <motion.line
          x1="6"
          y1="12"
          x2="18"
          y2="12"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="2 2"
          animate={{ opacity: isExcited ? [0.4, 1, 0.4] : 0.4 }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
        />

        {/* Pulsing Core Point */}
        <motion.circle
          cx="12"
          cy="12"
          r="2.5"
          fill="currentColor"
          animate={{
            scale: isExcited ? [1, 1.4, 1] : 1,
            opacity: isExcited ? [0.8, 1, 0.8] : 0.7,
          }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      </svg>
    </div>
  )
}

// ── 2. SALAS AO VIVO: CRT BROADCAST MONITOR WITH EQUALIZER ────────
export function NavIconRooms({ active, isHovered, className }: IconProps) {
  const isExcited = active || isHovered

  return (
    <div className={`relative w-5 h-5 flex items-center justify-center ${className || ''}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Monitor Screen Frame */}
        <rect
          x="2"
          y="3"
          width="20"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />

        {/* Monitor Stand Base */}
        <path
          d="M8 21H16M12 17V21"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Live Broadcast Waves / Audio Equalizer Bars inside Screen */}
        <motion.line
          x1="6"
          y1="10"
          x2="6"
          y2="13"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          animate={{
            y1: isExcited ? [10, 6, 11, 7, 10] : 10,
          }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.line
          x1="10"
          y1="8"
          x2="10"
          y2="13"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          animate={{
            y1: isExcited ? [8, 5, 12, 6, 8] : 8,
          }}
          transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
        />
        <motion.line
          x1="14"
          y1="7"
          x2="14"
          y2="13"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          animate={{
            y1: isExcited ? [7, 11, 5, 9, 7] : 7,
          }}
          transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />
        <motion.line
          x1="18"
          y1="9"
          x2="18"
          y2="13"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          animate={{
            y1: isExcited ? [9, 6, 12, 8, 9] : 9,
          }}
          transition={{ duration: 0.55, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
        />

        {/* Live Rec Dot */}
        <motion.circle
          cx="19"
          cy="6"
          r="1.5"
          fill="#EF2020"
          animate={{
            opacity: isExcited ? [1, 0.2, 1] : 0.8,
            scale: isExcited ? [1, 1.3, 1] : 1,
          }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      </svg>
    </div>
  )
}

// ── 3. LOJA VIP: QUANTUM GEM / CROWN REACTOR ─────────────────────
export function NavIconShop({ active, isHovered, className }: IconProps) {
  const isExcited = active || isHovered

  return (
    <div className={`relative w-5 h-5 flex items-center justify-center ${className || ''}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Crown / Diamond Facets */}
        <motion.path
          d="M4 8L7 4L12 8L17 4L20 8L18 19H6L4 8Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{
            scale: isExcited ? [1, 1.06, 1] : 1,
          }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Center Facet Lines */}
        <path
          d="M7 4L6 19M17 4L18 19M12 8V19"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.6"
        />

        {/* Floating Sparkle Crown Jewel */}
        <motion.circle
          cx="12"
          cy="4"
          r="1.5"
          fill="currentColor"
          animate={{
            scale: isExcited ? [1, 1.5, 1] : 1,
            y: isExcited ? [0, -1.5, 0] : 0,
            opacity: isExcited ? [0.6, 1, 0.6] : 0.7,
          }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </svg>
    </div>
  )
}

// ── 4. BIBLIOTECA: LASER REEL / CLOUD DATA CASSETTE ──────────────
export function NavIconLibrary({ active, isHovered, className }: IconProps) {
  const isExcited = active || isHovered

  return (
    <div className={`relative w-5 h-5 flex items-center justify-center ${className || ''}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Cassette Body Frame */}
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />

        {/* Left Tape Spool Reel (Spinning on hover/active) */}
        <motion.g
          style={{ originX: '7px', originY: '12px' }}
          animate={{
            rotate: isExcited ? 360 : 0,
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <circle cx="7" cy="12" r="2.5" stroke="currentColor" strokeWidth="1" />
          <line x1="7" y1="9.5" x2="7" y2="14.5" stroke="currentColor" strokeWidth="0.8" />
          <line x1="4.5" y1="12" x2="9.5" y2="12" stroke="currentColor" strokeWidth="0.8" />
        </motion.g>

        {/* Right Tape Spool Reel (Spinning on hover/active) */}
        <motion.g
          style={{ originX: '17px', originY: '12px' }}
          animate={{
            rotate: isExcited ? 360 : 0,
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <circle cx="17" cy="12" r="2.5" stroke="currentColor" strokeWidth="1" />
          <line x1="17" y1="9.5" x2="17" y2="14.5" stroke="currentColor" strokeWidth="0.8" />
          <line x1="14.5" y1="12" x2="19.5" y2="12" stroke="currentColor" strokeWidth="0.8" />
        </motion.g>

        {/* Connecting Magnetic Tape Line */}
        <line x1="7" y1="14.5" x2="17" y2="14.5" stroke="currentColor" strokeWidth="1" />

        {/* Laser Read Head */}
        <motion.polygon
          points="11,10 13,10 12,8"
          fill="currentColor"
          animate={{
            opacity: isExcited ? [0.4, 1, 0.4] : 0.6,
          }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      </svg>
    </div>
  )
}

// ── 5. AMIGOS: NEURAL P2P MESH / CONNECTED AVATARS ───────────────
export function NavIconFriends({ active, isHovered, className }: IconProps) {
  const isExcited = active || isHovered

  return (
    <div className={`relative w-5 h-5 flex items-center justify-center ${className || ''}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Node 1 (Left Avatar) */}
        <motion.circle
          cx="6"
          cy="9"
          r="3"
          stroke="currentColor"
          strokeWidth="1.5"
          animate={{
            y: isExcited ? [0, -1, 0] : 0,
          }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        />
        <path
          d="M2 19C2 16 4 14 7 14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Node 2 (Right Avatar) */}
        <motion.circle
          cx="17"
          cy="9"
          r="3"
          stroke="currentColor"
          strokeWidth="1.5"
          animate={{
            y: isExcited ? [0, 1, 0] : 0,
          }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />
        <path
          d="M21 19C21 16 19 14 16 14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* P2P Laser Mesh Connection Beam between Avatars */}
        <motion.line
          x1="9.5"
          y1="9"
          x2="13.5"
          y2="9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="2 1"
          animate={{
            opacity: isExcited ? [0.4, 1, 0.4] : 0.6,
            strokeDashoffset: isExcited ? [0, -6] : 0,
          }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
        />

        {/* Central Sync Pulse Beacon */}
        <motion.circle
          cx="11.5"
          cy="9"
          r="1.2"
          fill="currentColor"
          animate={{
            scale: isExcited ? [1, 1.8, 1] : 1,
            opacity: isExcited ? [0.5, 1, 0.5] : 0.7,
          }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      </svg>
    </div>
  )
}

// ── 6. CONVITES: QUANTUM BEACON / ENCRYPTED MAIL TRANSPONDER ─────
export function NavIconInvites({ active, isHovered, className }: IconProps) {
  const isExcited = active || isHovered

  return (
    <div className={`relative w-5 h-5 flex items-center justify-center ${className || ''}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Envelope Base */}
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />

        {/* Flap fold line */}
        <motion.path
          d="M3 7L12 13L21 7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{
            d: isExcited
              ? ['M3 7L12 13L21 7', 'M3 7L12 11L21 7', 'M3 7L12 13L21 7']
              : 'M3 7L12 13L21 7',
          }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Signal Radar Waves emmiting from apex */}
        <motion.path
          d="M9 2C10 1 14 1 15 2"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          animate={{
            opacity: isExcited ? [0, 1, 0] : 0,
            y: isExcited ? [1, -2, -4] : 0,
          }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
        />
        <motion.path
          d="M7 0C9 -1 15 -1 17 0"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          animate={{
            opacity: isExcited ? [0, 0.8, 0] : 0,
            y: isExcited ? [2, -1, -3] : 0,
          }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
    </div>
  )
}
