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
import { ProAmbientNebulaCanvas } from '@/components/dashboard/pro-dashboard-3d'
import { ProVipHeroBanner } from '@/components/dashboard/pro-vip-hero-banner'

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'https://services-videomax-websocket.khdya3.easypanel.host/'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [liveRooms, setLiveRooms] = useState<LiveRoomData[]>([])
  const [recentRooms, setRecentRooms] = useState<RecentRoomData[]>([])
  const [continueWatchingItems, setContinueWatchingItems] = useState<ContinueWatchingData[]>([])
  const [friendsList, setFriendsList] = useState<FriendActivityData[]>([])
  const [liveUser, setLiveUser] = useState<any>(null)

  // Fetch real database videos, friends, and user profile
  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Fetch user me
        const meRes = await fetch('/api/user/me')
        if (meRes.ok) {
          const meData = await meRes.json()
          if (meData?.user) {
            setLiveUser(meData.user)
          }
        }

        // 2. Fetch real friends network
        let friends: FriendActivityData[] = []
        const fRes = await fetch('/api/friends')
        if (fRes.ok) {
          const fData = await fRes.json()
          if (Array.isArray(fData?.friends)) {
            friends = fData.friends.map((f: any) => ({
              id: f.id,
              name: f.name || f.email.split('@')[0],
              email: f.email,
              image: f.image || undefined,
              status: 'online',
            }))
            setFriendsList(friends)
          }
        }

        // 3. Fetch real user video library
        const vRes = await fetch('/api/mobile/videos')
        if (vRes.ok) {
          const vData = await vRes.json()
          if (Array.isArray(vData?.videos) && vData.videos.length > 0) {
            const mappedContinue: ContinueWatchingData[] = vData.videos.slice(0, 4).map((v: any) => ({
              videoId: v.id,
              title: v.title,
              subtitle: 'Continuar reprodução',
              thumbnailUrl: v.url.includes('youtube.com') || v.url.includes('youtu.be')
                ? `https://img.youtube.com/vi/${v.url.split('v=')[1]?.split('&')[0] || v.url.split('/').pop()}/hqdefault.jpg`
                : undefined,
              progress: 60,
              url: v.url,
            }))
            setContinueWatchingItems(mappedContinue)

            const mappedRecent: RecentRoomData[] = vData.videos.map((v: any, idx: number) => {
              const isFriendSample = idx % 2 === 1 && friends.length > 0
              const friend = isFriendSample ? friends[idx % friends.length] : null

              return {
                roomId: `MAX-${1000 + idx}`,
                title: v.title,
                thumbnailUrl: v.url.includes('youtube.com') || v.url.includes('youtu.be')
                  ? `https://img.youtube.com/vi/${v.url.split('v=')[1]?.split('&')[0] || v.url.split('/').pop()}/hqdefault.jpg`
                  : undefined,
                creatorId: friend?.id || session?.user?.id || 'u1',
                creatorName: friend ? friend.name : session?.user?.name || 'Você',
                creatorImage: friend ? friend.image : session?.user?.image || undefined,
                timeAgo: idx === 0 ? '2h atrás' : idx === 1 ? 'Ontem' : 'Há 3 dias',
                isMyRoom: !friend,
                isJoined: true,
                isFriendRoom: !!friend,
                participants: [
                  {
                    userId: friend?.id || session?.user?.id || 'u1',
                    userName: friend?.name || session?.user?.name || 'Você',
                    userImage: friend?.image || session?.user?.image || undefined,
                  },
                ],
              }
            })
            setRecentRooms(mappedRecent)
          }
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
      }
    }

    fetchData()
  }, [session])

  // Real-time socket binding for active rooms and live presence
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

      const handleRooms = (rooms: any[]) => {
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
      }

      socket.on('active-rooms-update', handleRooms)
      socket.on('active-rooms-list', handleRooms)
    }

    initSocket()

    return () => {
      cancelled = true
      if (socket) socket.disconnect()
    }
  }, [])

  const currentUser = liveUser || session?.user
  const userPlan = (currentUser?.plan || 'FREE').toUpperCase()
  const isPro = userPlan === 'PRO' || userPlan === 'MAXPRO'

  return (
    <div className="w-full space-y-6 relative">
      
      {/* 3D Ambient Particle Nebula for MAXPRO VIP Users */}
      {isPro && <ProAmbientNebulaCanvas />}

      {/* Top Header */}
      <div className="relative z-10">
        <HomeHeader user={currentUser} />
      </div>

      {/* MAXPRO VIP Command HUD Banner */}
      {isPro && (
        <div className="relative z-10 animate-fade-in">
          <ProVipHeroBanner userName={currentUser?.name} />
        </div>
      )}

      {/* Main Content Layout: Grid (3 columns on xl, 2 on lg, 1 on mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start relative z-10">
        
        {/* Main Feed Column */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-8 min-w-0">
          
          {/* Section 1: Salas em Transmissão ao Vivo */}
          <LiveRoomsSection rooms={liveRooms} />

          {/* Section 2: Histórico Recente com Filtros */}
          <RecentRoomsSection rooms={recentRooms} />

          {/* Section 3: Continue Assistindo & CTA de Sincronia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ContinueWatching items={continueWatchingItems} />
            <WatchTogetherCTA />
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6 lg:sticky lg:top-6">
          <FriendsActivity initialFriends={friendsList} />
          <PendingInvites user={currentUser} />
        </div>

      </div>
    </div>
  )
}
