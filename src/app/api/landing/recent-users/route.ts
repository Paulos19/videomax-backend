import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()
    const currentUserId = session?.user?.id

    // Fetch friend requests involving the current user to detect network relationships
    let friendMap = new Map<string, 'ACCEPTED' | 'PENDING'>()
    if (currentUserId) {
      const requests = await prisma.friendRequest.findMany({
        where: {
          OR: [
            { senderId: currentUserId },
            { receiverId: currentUserId },
          ],
        },
      })
      for (const r of requests) {
        const otherId = r.senderId === currentUserId ? r.receiverId : r.senderId
        if (r.status === 'ACCEPTED') {
          friendMap.set(otherId, 'ACCEPTED')
        } else if (r.status === 'PENDING' && !friendMap.has(otherId)) {
          friendMap.set(otherId, 'PENDING')
        }
      }
    }

    // Fetch real registered users from the database, excluding current user and anonymous records
    const users = await prisma.user.findMany({
      where: {
        ...(currentUserId ? { id: { not: currentUserId } } : {}),
        name: {
          notIn: ['Anonymous', 'anonymous', 'ANONYMOUS', 'Usuário', 'usuário', 'Usuario', 'usuario'],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        chatColor: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 12,
    })

    const formatted = users.map((u, idx) => {
      const friendship = friendMap.get(u.id)
      const isFriend = friendship === 'ACCEPTED'
      const isPending = friendship === 'PENDING'

      return {
        id: u.id,
        alias: u.name
          ? u.name.includes('@')
            ? u.name.split('@')[0]
            : u.name
          : `USER_${u.id.slice(-4).toUpperCase()}`,
        name: u.name || u.email?.split('@')[0] || 'Usuário VideoMax',
        image: u.image || '',
        color:
          u.chatColor ||
          ['#FF5A00', '#3B82F6', '#22C55E', '#A855F7', '#EC4899'][idx % 5],
        status: 'offline' as const,
        lastSeen: new Date(u.updatedAt).getTime(),
        isFriend,
        isPending,
      }
    })

    return NextResponse.json({
      success: true,
      users: formatted,
      currentUserId: currentUserId || null,
    })
  } catch (error: any) {
    console.error('[API recent-users error]:', error)
    return NextResponse.json({ success: false, users: [] }, { status: 500 })
  }
}
