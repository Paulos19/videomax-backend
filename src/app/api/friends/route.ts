import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ friends: [] })
    }

    const userId =
      session.user.id ||
      (
        await prisma.user.findUnique({
          where: { email: session.user.email! },
          select: { id: true },
        })
      )?.id

    if (!userId) {
      return NextResponse.json({ friends: [] })
    }

    const acceptedRequests = await prisma.friendRequest.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            chatColor: true,
            plan: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            chatColor: true,
            plan: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    const friends = acceptedRequests.map((req) => {
      const friendUser = req.senderId === userId ? req.receiver : req.sender
      return {
        id: friendUser.id,
        name: friendUser.name || friendUser.email.split('@')[0],
        email: friendUser.email,
        image: friendUser.image,
        chatColor: friendUser.chatColor,
        plan: friendUser.plan,
        status: 'offline', // will be hydrated in real-time by socket presence
      }
    })

    return NextResponse.json({ friends })
  } catch (error) {
    console.error('Error fetching friends:', error)
    return NextResponse.json({ error: 'Erro ao buscar amigos', friends: [] }, { status: 500 })
  }
}
