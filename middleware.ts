import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Routes exposed on the public supplier subdomain (suppliers.schauenburg.co.za)
const SUPPLIER_SUBDOMAIN_ALLOWED_PATHS = [
  '/supplier-onboarding-form',
  '/credit-application-form',
  '/supplier-portal',
  '/api/supplier-portal',
  // Internal form + upload endpoints proxied through the session-validated portal routes
  '/api/supplier-form',
  '/api/suppliers/get-by-token',
  '/api/suppliers/credit-application',
  '/api/suppliers/documents',
]

// Pages that require no internal NextAuth token
const PUBLIC_PAGE_PATHS = [
  '/login',
  '/supplier-onboarding-form',
  '/credit-application-form',
  '/supplier-portal',
]

// API routes that require no internal NextAuth token
const PUBLIC_API_PATHS = [
  '/api/supplier-form',
  '/api/suppliers/get-by-token',
  '/api/suppliers/credit-application',
  '/api/custom-options',
  '/api/register',
  '/api/supplier-portal',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host') ?? ''

  // ── Subdomain isolation ─────────────────────────────────────────────────────
  // When the request arrives from the public supplier subdomain, only supplier
  // portal routes are reachable. Every other path returns 404 so the internal
  // platform is structurally unreachable from the public internet.
  const isSupplierSubdomain =
    host.startsWith('suppliers.') ||
    host === (process.env.SUPPLIER_PORTAL_HOST ?? '')

  if (isSupplierSubdomain) {
    const isAllowedOnSubdomain = SUPPLIER_SUBDOMAIN_ALLOWED_PATHS.some(p =>
      pathname.startsWith(p)
    )
    if (!isAllowedOnSubdomain) {
      return new NextResponse(null, { status: 404 })
    }
  }

  // ── Internal NextAuth authentication ───────────────────────────────────────
  const isPublicPage = PUBLIC_PAGE_PATHS.some(p => pathname.startsWith(p))
  if (isPublicPage) return NextResponse.next()

  const isPublicApi = PUBLIC_API_PATHS.some(p => pathname.startsWith(p))
  // Allow suppliers to download the signed credit application (accessed via token link)
  const isSignedCreditDownload =
    pathname.startsWith('/api/suppliers/documents/') &&
    pathname.includes('signedCreditApplication')

  if (isPublicApi || isSignedCreditDownload) return NextResponse.next()

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    const restrictedPaths = ['/admin/supplier-submissions', '/admin/approvals']
    const isRestrictedPath = restrictedPaths.some(p => pathname.startsWith(p))
    if (!isRestrictedPath) {
      loginUrl.searchParams.set('callbackUrl', pathname)
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

