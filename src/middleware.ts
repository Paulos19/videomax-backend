import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from './auth'

/**
 * Route protection for /room/* routes.
 *
 * Uses NextAuth v5's `auth()` wrapper which properly handles JWE (encrypted JWT)
 * session tokens. The previous implementation used `jwtVerify` (JWS signature
 * verification) which is incompatible with NextAuth v5's encrypted session tokens.
 */

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Protect /room/* routes — require authenticated session
  if (pathname.startsWith('/room')) {
    if (!req.auth) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/room/:path*'],
}
