import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  typescript: true,
})

export interface UserSubscriptionPlan {
  plan: 'FREE' | 'PRO' | 'MAXPRO'
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

  const hasDbProPlan = user.plan === 'PRO' || user.plan === 'MAXPRO'
  const isStripeActive =
    !!user.stripeCurrentPeriodEnd &&
    user.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now()

  const isPro = hasDbProPlan || isStripeActive

  let isCanceled = false
  if (user.stripeSubscriptionId) {
    try {
      const stripePlan = await stripe.subscriptions.retrieve(user.stripeSubscriptionId)
      isCanceled = stripePlan.cancel_at_period_end
    } catch {
      // Ignore stripe retrieve errors
    }
  }

  const resolvedPlan: 'FREE' | 'PRO' | 'MAXPRO' = isPro
    ? (user.plan === 'MAXPRO' ? 'MAXPRO' : 'PRO')
    : 'FREE'

  return {
    plan: resolvedPlan,
    isPro,
    stripeCustomerId: user.stripeCustomerId,
    stripeSubscriptionId: user.stripeSubscriptionId,
    stripePriceId: user.stripePriceId,
    stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
    isCanceled,
  }
}
