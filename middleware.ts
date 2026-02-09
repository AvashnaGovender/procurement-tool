import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  
  // Public paths that don't require authentication
  const publicPaths = ['/login', '/supplier-onboarding-form', '/credit-application-form']
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))
  
  // Allow public paths without authentication
  if (isPublicPath) {
    return NextResponse.next()
  }
  
  // Public API routes for supplier form and credit application (no authentication required)
  const publicApiPaths = [
    '/api/supplier-form',
    '/api/suppliers/get-by-token',
    '/api/suppliers/credit-application',
    '/api/custom-options'
  ]
  const isPublicApiPath = publicApiPaths.some(path => request.nextUrl.pathname.startsWith(path))
  // Allow suppliers to download the signed credit application (they access via token link, no session)
  const isSignedCreditDownload = request.nextUrl.pathname.startsWith('/api/suppliers/documents/') && request.nextUrl.pathname.includes('signedCreditApplication')
  
  // Check if user is authenticated for protected routes
  if (!token && !isPublicApiPath && !isSignedCreditDownload) {
    const loginUrl = new URL('/login', request.url)
    
    // Only preserve callback URL for non-restricted routes
    // Restricted admin routes should not be saved as callback URLs
    const restrictedPaths = ['/admin/supplier-submissions', '/admin/approvals']
    const isRestrictedPath = restrictedPaths.some(path => request.nextUrl.pathname.startsWith(path))
    
    // Only set callback URL if it's not a restricted path
    if (!isRestrictedPath) {
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    }
    
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

