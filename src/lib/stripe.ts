import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  typescript: true,
})

export interface UserSubscriptionPlan {
  plan: 'FREE' | 'PRO'
  isPro: boolean
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
  stripePriceId?: string | null
  stripeCurrentPeriodEnd?: Date | null
  isCanceled?: boolean
}

export async function getUserSubscriptionPlan(userId: string): Promise<UserSubscriptionPlan> {
  if (!userId) {
    return { plan: 'FREE', isPro: false }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      stripePriceId: true,
      stripeCurrentPeriodEnd: true,
    },
  })

  if (!user) {
    return { plan: 'FREE', isPro: false }
  }

  const isPro =
    user.plan === 'PRO' &&
    !!user.stripeCurrentPeriodEnd &&
    user.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now()

  let isCanceled = false
  if (isPro && user.stripeSubscriptionId) {
    try {
      const stripePlan = await stripe.subscriptions.retrieve(user.stripeSubscriptionId)
      isCanceled = stripePlan.cancel_at_period_end
    } catch {
      // Ignore stripe retrieve errors
    }
  }

  return {
    plan: isPro ? 'PRO' : 'FREE',
    isPro,
    stripeCustomerId: user.stripeCustomerId,
    stripeSubscriptionId: user.stripeSubscriptionId,
    stripePriceId: user.stripePriceId,
    stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
    isCanceled,
  }
}
