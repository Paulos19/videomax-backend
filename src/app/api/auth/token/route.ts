import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { SignJWT } from 'jose'

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

  // Build a minimal JWT using jose — same library the WebSocket server uses
  const token = await new SignJWT({
    id: (session.user as Record<string, unknown>).id,
    email: session.user.email,
    name: session.user.name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secretBytes)

  return NextResponse.json({ token })
}
