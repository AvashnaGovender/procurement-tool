import { NextRequest, NextResponse } from 'next/server'
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/supplier-portal/session'
import { validateMagicLinkToken } from '@/lib/supplier-portal/token'

/**
 * Session-validated proxy for the onboarding form submission.
 * Verifies the supplier session and then forwards the FormData to the
 * existing internal submit handler, which contains all the save + notify logic.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const onboardingToken = formData.get('onboardingToken')?.toString()

    if (!onboardingToken) {
      return NextResponse.json({ success: false, error: 'onboardingToken is required' }, { status: 400 })
    }

    // Validate magic link token
    const tokenResult = await validateMagicLinkToken(onboardingToken, 'onboarding')
    if (!tokenResult.valid) {
      return NextResponse.json(
        { success: false, error: tokenResult.message, code: tokenResult.code },
        { status: 401 }
      )
    }

    // Validate supplier session
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value
    if (!sessionToken) {
      return NextResponse.json({ success: false, error: 'Authentication required', code: 'NO_SESSION' }, { status: 401 })
    }

    const session = await validateSession(sessionToken, tokenResult.onboarding.id)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Session expired or invalid', code: 'INVALID_SESSION' }, { status: 401 })
    }

    // Forward to internal submit handler
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const internalResponse = await fetch(`${baseUrl}/api/supplier-form/submit`, {
      method: 'POST',
      body: formData,
    })

    const result = await internalResponse.json()
    return NextResponse.json(result, { status: internalResponse.status })
  } catch (error) {
    console.error('Supplier portal submit/onboarding error:', error)
    return NextResponse.json({ success: false, error: 'Submission failed. Please try again.' }, { status: 500 })
  }
}
