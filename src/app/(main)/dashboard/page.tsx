'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import io, { Socket } from 'socket.io-client'
import { HomeHeader } from './components/home-header'
import { LiveRoomsSection } from './components/live-rooms-section'
import { LiveRoomData } from './components/live-room-card'
import { RecentRoomsSection } from './components/recent-rooms-section'
import { RecentRoomData } from './components/recent-room-item'
import { ContinueWatching } from './components/continue-watching'
import { ContinueWatchingData } from './components/continue-watching-card'
import { WatchTogetherCTA } from './components/watch-together-cta'
import { FriendsActivity } from './components/friends-activity'
import { FriendActivityData } from './components/friend-activity-item'
import { PendingInvites } from './components/pending-invites'

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'https://services-videomax-websocket.khdya3.easypanel.host/'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [liveRooms, setLiveRooms] = useState<LiveRoomData[]>([])
  const [recentRooms, setRecentRooms] = useState<RecentRoomData[]>([])
  const [continueWatchingItems, setContinueWatchingItems] = useState<ContinueWatchingData[]>([])
  const [friendsList, setFriendsList] = useState<FriendActivityData[]>([])

  // Fetch initial videos & friends
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch videos
        const vRes = await fetch('/api/mobile/videos')
        if (vRes.ok) {
          const vData = await vRes.json()
          if (Array.isArray(vData?.videos)) {
            const mappedContinue: ContinueWatchingData[] = vData.videos.slice(0, 3).map((v: any) => ({
              videoId: v.id,
              title: v.title,
              subtitle: 'Continuar reprodução',
              thumbnailUrl: v.url.includes('youtube.com') || v.url.includes('youtu.be')
                ? `https://img.youtube.com/vi/${v.url.split('v=')[1]?.split('&')[0] || v.url.split('/').pop()}/hqdefault.jpg`
                : undefined,
              progress: 45,
              url: v.url,
            }))
            setContinueWatchingItems(mappedContinue)

            const mappedRecent: RecentRoomData[] = vData.videos.slice(0, 4).map((v: any, idx: number) => ({
              roomId: `RM-${100 + idx}`,
              title: v.title,
              thumbnailUrl: v.url.includes('youtube.com') || v.url.includes('youtu.be')
                ? `https://img.youtube.com/vi/${v.url.split('v=')[1]?.split('&')[0] || v.url.split('/').pop()}/hqdefault.jpg`
                : undefined,
              creatorName: session?.user?.name || 'Paulin',
              creatorImage: session?.user?.image || undefined,
              timeAgo: idx === 0 ? '2h atrás' : idx === 1 ? 'Ontem' : 'Há 3 dias',
              participants: [
                { userId: 'u1', userName: session?.user?.name || 'Paulin', userImage: session?.user?.image || undefined }
              ]
            }))
            setRecentRooms(mappedRecent)
          }
        }

        // Fetch friends
        const fRes = await fetch('/api/mobile/friends')
        if (fRes.ok) {
          const fData = await fRes.json()
          if (Array.isArray(fData?.friends)) {
            const mappedFriends: FriendActivityData[] = fData.friends.map((f: any) => ({
              id: f.id,
              name: f.name || f.email.split('@')[0],
              email: f.email,
              image: f.image || undefined,
              status: 'online',
            }))
            setFriendsList(mappedFriends)
          }
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
      }
    }

    fetchData()
  }, [session])

  // Real-time socket binding for active rooms
  useEffect(() => {
    let socket: Socket | null = null
    let cancelled = false

    const initSocket = async () => {
      let wsToken: string | undefined
      try {
        const tokenRes = await fetch('/api/auth/token')
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json()
          wsToken = tokenData.token
        }
      } catch {}

      if (cancelled) return

      socket = io(SOCKET_SERVER_URL, {
        auth: wsToken ? { token: wsToken } : undefined,
        transports: ['websocket', 'polling'],
      })

      socket.on('connect', () => {
        if (cancelled) return
        socket?.emit('get-active-rooms')
      })

      socket.on('active-rooms-update', (rooms: any[]) => {
        if (cancelled || !Array.isArray(rooms)) return
        const mappedLiveRooms: LiveRoomData[] = rooms.map((r) => ({
          roomId: r.roomId,
          hostUserId: r.hostUserId || '',
          hostName: r.hostName || r.viewers?.[0]?.userName || 'Host',
          hostImage: r.viewers?.[0]?.userImage,
          videoTitle: r.videoTitle || `Sala #${r.roomId}`,
          videoUrl: r.videoUrl,
          viewerCount: r.viewers?.length || 0,
          viewers: r.viewers || []
        }))
        setLiveRooms(mappedLiveRooms)
      })

      socket.on('active-rooms-list', (rooms: any[]) => {
        if (cancelled || !Array.isArray(rooms)) return
        const mappedLiveRooms: LiveRoomData[] = rooms.map((r) => ({
          roomId: r.roomId,
          hostUserId: r.hostUserId || '',
          hostName: r.hostName || r.viewers?.[0]?.userName || 'Host',
          hostImage: r.viewers?.[0]?.userImage,
          videoTitle: r.videoTitle || `Sala #${r.roomId}`,
          videoUrl: r.videoUrl,
          viewerCount: r.viewers?.length || 0,
          viewers: r.viewers || []
        }))
        setLiveRooms(mappedLiveRooms)
      })
    }

    initSocket()

    return () => {
      cancelled = true
      if (socket) socket.disconnect()
    }
  }, [])

  return (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <HomeHeader user={session?.user} />

      {/* Main Content Layout: Grid (3fr Main, 1fr Right Sidebar on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
        {/* Main Content Column (3 columns on xl, 2 on lg) */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-8 min-w-0">
          {/* Section 1: O que está rolando */}
          <LiveRoomsSection rooms={liveRooms} />

          {/* Section 2: Salas recentes */}
          <RecentRoomsSection rooms={recentRooms} />

          {/* Section 3: Continue assistindo & WatchTogether CTA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ContinueWatching items={continueWatchingItems} />
            <WatchTogetherCTA />
          </div>
        </div>

        {/* Right Sidebar Column (~300px fixed feel) */}
        <div className="space-y-6 lg:sticky lg:top-6">
          <FriendsActivity initialFriends={friendsList} />
          <PendingInvites user={session?.user} />
        </div>
      </div>
    </div>
  )
}

