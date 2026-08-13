import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const currentUserId = session.user.id
    const { hostUserId } = await req.json()

    if (!hostUserId) {
      return NextResponse.json({ error: 'hostUserId é obrigatório' }, { status: 400 })
    }

    // 1. Host has full access to their own room
    if (currentUserId === hostUserId) {
      return NextResponse.json({
        allowed: true,
        isHost: true,
        isFriend: true,
        message: 'Acesso liberado (Você é o Host da sala)'
      })
    }

    // 2. Check if currentUserId and hostUserId are ACCEPTED friends in DB
    const friend = await prisma.friendRequest.findFirst({
      where: {
        status: 'ACCEPTED',
        OR: [
          { senderId: currentUserId, receiverId: hostUserId },
          { senderId: hostUserId, receiverId: currentUserId },
        ],
      },
    })

    if (friend) {
      return NextResponse.json({
        allowed: true,
        isHost: false,
        isFriend: true,
        message: 'Acesso liberado (Vínculo de amizade confirmado)'
      })
    }

    // 3. User is not a friend -> Requires Host Approval
    return NextResponse.json({
      allowed: false,
      isHost: false,
      isFriend: false,
      requiresApproval: true,
      message: 'Apenas amigos cadastrados têm acesso direto. É necessário enviar uma solicitação ao Host.'
    })
  } catch (error: any) {
    console.error('[ROOM ACCESS CHECK ERROR]', error)
    return NextResponse.json(
      { error: error?.message || 'Erro ao verificar permissão da sala' },
      { status: 500 }
    )
  }
}
