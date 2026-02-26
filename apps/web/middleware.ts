import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication — unauthenticated users redirect to /login
const PROTECTED_PATHS = ['/account', '/success']

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )
}

function hasSessionToken(
  request: NextRequest,
  packed: Record<string, string> | null
): boolean {
  const secureName = '__Secure-next-auth.session-token'
  const devName = 'next-auth.session-token'

  if (packed && (packed[secureName] || packed[devName])) {
    return true
  }

  if (
    request.cookies.get(secureName)?.value ||
    request.cookies.get(devName)?.value
  ) {
    return true
  }

  return false
}

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const url = request.nextUrl.clone()

  // 1. Firebase Hosting cookie unpacking (must run FIRST)
  // Firebase Hosting strips all cookies except __session.
  // The NextAuth route handler packs all auth cookies into __session.
  // Here we unpack them so NextAuth can read individual cookies.
  const sessionCookie = request.cookies.get('__session')
  let modifiedHeaders: Headers | null = null
  let packed: Record<string, string> | null = null

  if (sessionCookie?.value) {
    try {
      packed = JSON.parse(
        decodeURIComponent(sessionCookie.value)
      )
      if (packed && Object.keys(packed).length > 0) {
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

  // 4. Mobile traffic rewrite
  // Chrome extensions don't work on mobile — serve the mobile landing page
  // (with email capture) instead of the dead-end CWS CTAs.
  // Uses rewrite (not redirect) to avoid an extra round-trip (~886ms saving).
  // Only applies to homepage — other pages (/login, /account, etc.) render normally.
  const userAgent = request.headers.get('user-agent') || ''
  const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  const skipMobile = url.searchParams.get('skip_mobile') === '1'

  if (isMobile && !skipMobile && url.pathname === '/') {
    url.pathname = '/mobile'
    // Preserve UTM params for attribution tracking; rewrite keeps original URL
    return modifiedHeaders
      ? NextResponse.rewrite(url, { request: { headers: modifiedHeaders } })
      : NextResponse.rewrite(url)
  }

  // 5. Auth gate for protected routes
  if (isProtectedPath(url.pathname) && !hasSessionToken(request, packed)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', url.pathname + url.search)
    return NextResponse.redirect(loginUrl)
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
