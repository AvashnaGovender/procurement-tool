import { NextRequest, NextResponse } from 'next/server'
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/supplier-portal/session'

/**
 * Validates the supplier_session cookie against the expected onboarding record.
 * Returns null if valid (access granted), or a NextResponse with 401 if not.
 *
 * Usage at the top of a route handler:
 *   const guard = await requireSupplierSession(request, onboardingId)
 *   if (guard) return guard
 */
export async function requireSupplierSession(
  request: NextRequest,
  onboardingId: string
): Promise<NextResponse | null> {
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value

  if (!sessionToken) {
    return NextResponse.json(
      { success: false, error: 'Authentication required', code: 'NO_SESSION' },
      { status: 401 }
    )
  }

  const session = await validateSession(sessionToken, onboardingId)
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Session expired or invalid. Please verify your identity again.', code: 'INVALID_SESSION' },
      { status: 401 }
    )
  }

  return null
}
