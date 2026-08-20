import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const body = await req.text()
  const headerObj = await headers()
  const signature = headerObj.get('Stripe-Signature') || headerObj.get('stripe-signature') || ''

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[STRIPE WEBHOOK ERROR] STRIPE_WEBHOOK_SECRET não configurada no servidor.')
    return NextResponse.json({ error: 'Configuração de webhook incompleta no servidor.' }, { status: 500 })
  }

  if (!signature) {
    return NextResponse.json({ error: 'Assinatura Stripe ausente.' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error(`[STRIPE WEBHOOK ERROR] Assinatura inválida: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // 1. Checkout Session Completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    if (session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
      const userId = session.metadata?.userId || subscription.metadata?.userId
      const periodEnd = (subscription as any).current_period_end

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: 'PRO',
            stripeCustomerId: subscription.customer as string,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price.id,
            stripeCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
          },
        })
      }
    }
  }

  // 2. Subscription Created or Updated
  if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string
    const periodEnd = (subscription as any).current_period_end

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { stripeCustomerId: customerId },
          { stripeSubscriptionId: subscription.id },
        ],
      },
    })

    if (user) {
      const isPro = subscription.status === 'active' || subscription.status === 'trialing'
      await prisma.user.update({
        where: { id: user.id },
        data: {
          plan: isPro ? 'PRO' : 'FREE',
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0]?.price.id,
          stripeCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
        },
      })
    }
  }

  // 3. Subscription Deleted (Canceled)
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { stripeCustomerId: customerId },
          { stripeSubscriptionId: subscription.id },
        ],
      },
    })

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          plan: 'FREE',
          stripeSubscriptionId: null,
          stripePriceId: null,
          stripeCurrentPeriodEnd: null,
        },
      })
    }
  }

  return NextResponse.json({ received: true })
}
