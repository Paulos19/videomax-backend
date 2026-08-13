import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getUserSubscriptionPlan } from '@/lib/stripe'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ plan: 'FREE', isPro: false }, { status: 200 })
    }

    const subscription = await getUserSubscriptionPlan(session.user.id)
    return NextResponse.json(subscription)
  } catch (error: any) {
    console.error('[STRIPE GET SUBSCRIPTION ERROR]', error)
    return NextResponse.json({ plan: 'FREE', isPro: false }, { status: 500 })
  }
}
