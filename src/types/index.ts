export interface Video {
  id: string
  title: string
  url: string
  createdAt?: string
}

export interface ChatMessage {
  id: string
  userId: string
  userName: string
  message: string
  type?: 'system' | 'user'
  timestamp?: string
  reactions?: Array<{ emoji: string; count: number }>
}

export interface ChatPayload {
  text: string
  color: string
  image: string
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
