import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { decode } from 'next-auth/jwt'

/**
 * GET /api/auth/token
 *
 * Returns the raw NextAuth JWT session token so the web client can pass it
 * to the WebSocket server for authentication.
 *
 * This endpoint is protected by NextAuth's built-in session check.
 * The token is HTTP-only cookie-based, so only this server-side endpoint
 * can extract it.
 */
export async function GET() {
  // Verify the user is authenticated via their session
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  // Extract the raw JWT from the cookie
  // In Next.js route handlers we don't have direct access to request cookies,
  // but `auth()` already validated the session. We can re-encode a minimal JWT
  // or use the token from the JWT callback.
  //
  // Alternative approach: use NextAuth's encode to create a fresh token
  // that the WS server can verify with the same secret.
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  // Build a minimal JWT payload with the user's ID
  const now = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(
    JSON.stringify({
      id: (session.user as Record<string, unknown>).id,
      email: session.user.email,
      name: session.user.name,
      iat: now,
      exp: now + 60 * 60, // 1 hour expiry
    })
  ).toString('base64url')

  // Sign with HMAC-SHA256
  const { createHmac } = await import('crypto')
  const signature = createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url')
  const token = `${header}.${payload}.${signature}`

  return NextResponse.json({ token })
}
