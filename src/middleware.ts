import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

/**
 * Server-side route protection for /room/* routes.
 *
 * Verifies the JWT session token using HMAC-SHA256 signature verification
 * via the `jose` library. This is more secure than just decoding the payload.
 */

const PROTECTED = [/^\/room(\/|$)/]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const needsAuth = PROTECTED.some((re) => re.test(pathname))
  if (!needsAuth) return NextResponse.next()

  const sessionToken =
    req.cookies.get('authjs.session-token')?.value ||
    req.cookies.get('__Secure-authjs.session-token')?.value

  if (!sessionToken) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
    if (!secret) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const secretBytes = new TextEncoder().encode(secret)

    // Verify JWT signature using HMAC-SHA256
    const { payload } = await jwtVerify(sessionToken, secretBytes, {
      algorithms: ['HS256'],
    })

    // Check expiration (belt-and-suspenders — jose already checks exp)
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  } catch {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: ['/room/:path*'],
}
