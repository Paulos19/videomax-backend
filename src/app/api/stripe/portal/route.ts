import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = session.user.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        stripeCustomerId: true,
      },
    })

    if (!user?.stripeCustomerId) {
      return NextResponse.json({ error: 'Cliente Stripe não encontrado' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${appUrl}/profile`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error: any) {
    console.error('[STRIPE PORTAL ERROR]', error)
    return NextResponse.json(
      { error: error?.message || 'Erro ao abrir o portal de assinaturas' },
      { status: 500 }
    )
  }
}
