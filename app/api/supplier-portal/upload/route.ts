import { NextRequest, NextResponse } from 'next/server'
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/supplier-portal/session'
import { validateMagicLinkToken, FormType } from '@/lib/supplier-portal/token'

/**
 * Session-validated document upload proxy.
 * The supplier must have a valid session before uploading any documents.
 * Forwards the multipart request to the existing internal upload handler.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const onboardingToken = formData.get('onboardingToken')?.toString()
    const formType = (formData.get('formType')?.toString() || 'onboarding') as FormType

    if (!onboardingToken) {
      return NextResponse.json({ success: false, error: 'onboardingToken is required' }, { status: 400 })
    }

    // Validate magic link token
    const tokenResult = await validateMagicLinkToken(onboardingToken, formType)
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

    // Forward to internal supplier-form upload handler
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const internalResponse = await fetch(`${baseUrl}/api/supplier-form/upload`, {
      method: 'POST',
      body: formData,
    })

    const result = await internalResponse.json()
    return NextResponse.json(result, { status: internalResponse.status })
  } catch (error) {
    console.error('Supplier portal upload error:', error)
    return NextResponse.json({ success: false, error: 'Upload failed. Please try again.' }, { status: 500 })
  }
}
