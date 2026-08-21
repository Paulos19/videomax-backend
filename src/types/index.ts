export interface Video {
  id: string
  title: string
  url: string
  createdAt?: string
}

export interface ChatReplyInfo {
  messageId: string
  userName: string
  text: string
  color?: string
  isPro?: boolean
}

export interface ChatMessage {
  id: string
  userId: string
  userName: string
  userImage?: string
  color?: string
  image?: string
  message: string
  type?: 'system' | 'user' | 'sticker'
  stickerUrl?: string
  timestamp?: string
  reactions?: Array<{ emoji: string; count: number }>
  userReactions?: Record<string, string>
  replyTo?: ChatReplyInfo | null
  isPro?: boolean
}

export interface ChatPayload {
  text: string
  color: string
  image: string
  type?: 'text' | 'sticker'
  stickerUrl?: string
  replyTo?: ChatReplyInfo | null
  isPro?: boolean
}

export interface UserProfile {
  id: string
  name: string | null
  image: string | null
  chatColor: string | null
}

export interface PlayerStateData {
  type: 'play' | 'pause' | 'seek' | 'change-video'
  currentTime?: number
  url?: string
  videoTitle?: string
  senderId?: string
  serverTimestamp?: number
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export interface VideosResponse {
  videos: Video[]
  pagination: PaginationInfo
}

export interface RoomInfo {
  roomId: string
  hostUserId: string
  hostPlan?: string
  maxViewers?: number
  coHostIds?: string[]
  videoTitle?: string
  videoUrl?: string
  isStreamingScreen?: boolean
  streamerId?: string | null
  streamerName?: string | null
  activePoll?: Poll | null
}

export interface PollOption {
  id: string
  text: string
  votes: string[] // User IDs who voted for this option
  voteCount: number
}

export interface Poll {
  id: string
  roomId: string
  question: string
  options: PollOption[]
  createdBy: {
    id: string
    name: string
  }
  totalVotes: number
  createdAt: number
  expiresAt?: number | null
  isClosed?: boolean
  userVotedOptionId?: string | null
}

export interface CreatePollPayload {
  question: string
  options: string[]
  durationSeconds?: number | null
}

export interface VoiceUserState {
  userId: string
  userName: string
  isMuted: boolean
  isSpeaking: boolean
}

