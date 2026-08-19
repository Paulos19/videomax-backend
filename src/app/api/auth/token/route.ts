import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { SignJWT } from 'jose'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/auth/token
 *
 * Returns a minimal JWT signed with HMAC-SHA256 via `jose` so the web client
 * can pass it to the WebSocket server for authentication.
 *
 * Uses the same `jose` library and HS256 algorithm as the WebSocket server's
 * `jwtVerify()` middleware, ensuring signature compatibility.
 */
export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const secretBytes = new TextEncoder().encode(secret)

  const userId = (session.user as Record<string, unknown>).id as string
  let userPlan = 'FREE'
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, stripeCurrentPeriodEnd: true },
    })
    if (user?.plan === 'MAXPRO' || user?.plan === 'PRO') {
      userPlan = user.plan
    }
  }

  // Build a minimal JWT using jose — same library the WebSocket server uses
  const token = await new SignJWT({
    id: userId,
    email: session.user.email,
    name: session.user.name,
    plan: userPlan,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secretBytes)

  return NextResponse.json({ token, plan: userPlan })
}
