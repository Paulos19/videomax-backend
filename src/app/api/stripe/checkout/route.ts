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
    const userEmail = session.user.email

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        stripeCustomerId: true,
      },
    })

    let stripeCustomerId = user?.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userEmail || undefined,
        name: session.user.name || undefined,
        metadata: {
          userId,
        },
      })
      stripeCustomerId = customer.id

      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId },
      })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const priceId = process.env.STRIPE_PRO_PRICE_ID || 'price_1U3zoqDKuwlnHiVMXr1UXQV9'

    const stripeSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId,
      },
      success_url: `${appUrl}/dashboard?subscription=success`,
      cancel_url: `${appUrl}/profile?subscription=canceled`,
    })

    return NextResponse.json({ url: stripeSession.url })
  } catch (error: any) {
    console.error('[STRIPE CHECKOUT ERROR]', error)
    return NextResponse.json(
      { error: error?.message || 'Erro ao criar sessão de checkout' },
      { status: 500 }
    )
  }
}
