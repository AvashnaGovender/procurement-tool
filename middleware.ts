import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  
  // Public paths that don't require authentication
  const publicPaths = ['/login', '/supplier-onboarding-form']
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))
  
  // Allow public paths without authentication
  if (isPublicPath) {
    return NextResponse.next()
  }
  
  // Check if user is authenticated for protected routes
  if (!token && !request.nextUrl.pathname.startsWith('/api/supplier-form')) {
    const loginUrl = new URL('/login', request.url)
    // Preserve the original URL as callback for redirect after login
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     * - api/auth (NextAuth routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|logo.png|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

