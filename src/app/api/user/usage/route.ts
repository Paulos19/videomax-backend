import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getUserSubscriptionPlan } from '@/lib/stripe'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(session.user.id ? [{ id: session.user.id }] : []),
          ...(session.user.email ? [{ email: session.user.email }] : []),
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        plan: true,
        chatColor: true,
        createdAt: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripeCurrentPeriodEnd: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const [videosCount, foldersCount, friendsCount, subscription] = await Promise.all([
      prisma.video.count({ where: { userId: user.id } }),
      prisma.folder.count({ where: { userId: user.id } }),
      prisma.friendRequest.count({
        where: {
          status: 'ACCEPTED',
          OR: [{ senderId: user.id }, { receiverId: user.id }],
        },
      }),
      getUserSubscriptionPlan(user.id),
    ])

    const isPro = subscription.isPro || user.plan === 'PRO' || user.plan === 'MAXPRO'
    const plan = isPro ? (user.plan === 'MAXPRO' ? 'MAXPRO' : 'PRO') : 'FREE'

    return NextResponse.json({
      user,
      subscription: {
        ...subscription,
        plan,
        isPro,
      },
      usage: {
        videosCount,
        maxVideos: isPro ? null : 10,
        foldersCount,
        maxFolders: isPro ? null : 3,
        friendsCount,
        maxRoomParticipants: isPro ? 6 : 2,
        streamingQuality: isPro ? '1080p 60FPS Full HD' : '720p HD Padrão',
        meshNetwork: isPro ? 'Mesh 6X Ultra Low Latency' : 'P2P Padrão',
      },
    })
  } catch (error) {
    console.error('Error fetching usage data:', error)
    return NextResponse.json({ error: 'Erro ao calcular telemetria de uso' }, { status: 500 })
  }
}
