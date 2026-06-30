import { NextRequest, NextResponse } from 'next/server'

const protectedRoutes = ['/dashboard', '/members', '/memberships', '/checkin', '/reports', '/audit-logs', '/settings']
const publicRoutes = ['/sign-in', '/sign-up', '/']

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if route is protected
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))
  
  if (!isProtected) {
    return NextResponse.next()
  }

  // Check if there's a session cookie
  const sessionCookie = request.cookies.get('better-auth.session_token')
  
  // Redirect to sign-in if no session
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)'],
}
