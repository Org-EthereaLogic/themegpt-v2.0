import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const url = request.nextUrl.clone()

  // 1. Firebase Hosting cookie unpacking (must run FIRST)
  // Firebase Hosting strips all cookies except __session.
  // The NextAuth route handler packs all auth cookies into __session.
  // Here we unpack them so NextAuth can read individual cookies.
  const sessionCookie = request.cookies.get('__session')
  let modifiedHeaders: Headers | null = null

  if (sessionCookie?.value) {
    try {
      const packed: Record<string, string> = JSON.parse(
        decodeURIComponent(sessionCookie.value)
      )
      if (Object.keys(packed).length > 0) {
        modifiedHeaders = new Headers(request.headers)
        const existingCookies = request.headers.get('cookie') || ''
        const unpackedParts = Object.entries(packed)
          .map(([name, value]) => `${name}=${value}`)
          .join('; ')
        modifiedHeaders.set(
          'cookie',
          existingCookies ? `${existingCookies}; ${unpackedParts}` : unpackedParts
        )
      }
    } catch {
      // malformed __session, continue without unpacking
    }
  }

  // 2. Fix Cloud Run URL bypass
  // Redirect anything ending in .a.run.app to custom domain
  // Allow API routes through for direct Cloud Run diagnostics
  if (host.includes('.a.run.app')) {
    if (url.pathname.startsWith('/api/')) {
      return modifiedHeaders
        ? NextResponse.next({ request: { headers: modifiedHeaders } })
        : NextResponse.next()
    }
    url.host = 'themegpt.ai'
    url.protocol = 'https'
    url.port = ''
    return NextResponse.redirect(url)
  }

  // 3. Fix Canonical Domain/OAuth mismatch
  // Redirect www to non-www
  if (host.startsWith('www.')) {
    url.host = 'themegpt.ai'
    url.protocol = 'https'
    url.port = ''
    return NextResponse.redirect(url)
  }

  return modifiedHeaders
    ? NextResponse.next({ request: { headers: modifiedHeaders } })
    : NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
