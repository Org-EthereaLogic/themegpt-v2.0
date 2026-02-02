import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const url = request.nextUrl.clone()

  // 1. Fix Cloud Run URL bypass (Issue 1)
  // Redirect anything ending in .a.run.app to custom domain
  if (host.includes('.a.run.app')) {
    url.host = 'themegpt.ai'
    url.protocol = 'https'
    url.port = ''
    return NextResponse.redirect(url)
  }

  // 2. Fix Canonical Domain/OAuth mismatch (Issue 2)
  // Redirect www to non-www
  if (host.startsWith('www.')) {
     url.host = 'themegpt.ai'
     url.protocol = 'https'
     url.port = ''
     return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  // Match all request paths except for:
  // - api/health (health checks should often bypass redirects to avoid looping/issues in some envs, but here we redirect everything else)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
