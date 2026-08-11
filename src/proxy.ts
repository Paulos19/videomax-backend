import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Optimistic route protection for /room/* routes.
 *
 * Uses a lightweight cookie check instead of the full `auth()` wrapper
 * to avoid importing Node.js modules (Prisma, bcrypt, etc.) which are
 * not available in Edge runtime on Vercel.
 *
 * The actual session verification happens in the page component via
 * useSession() and in the token API route via auth().
 *
 * Renamed from middleware.ts → proxy.ts per Next.js 16 convention.
 */

const SESSION_COOKIE_NAMES = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /room/* routes
  if (pathname.startsWith('/room')) {
    const hasSession = SESSION_COOKIE_NAMES.some(
      (name) => request.cookies.get(name)?.value
    )

    if (!hasSession) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/room/:path*'],
}
