import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateMagicLinkToken, FormType } from '@/lib/supplier-portal/token'
import { verifyOtp, OTP_MAX_ATTEMPTS } from '@/lib/supplier-portal/otp'
import { createSession, SESSION_COOKIE_NAME } from '@/lib/supplier-portal/session'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, otp, formType } = body as { token?: string; otp?: string; formType?: FormType }

    if (!token || !otp || !formType) {
      return NextResponse.json(
        { success: false, error: 'token, otp, and formType are required' },
        { status: 400 }
      )
    }

    if (formType !== 'onboarding' && formType !== 'credit') {
      return NextResponse.json(
        { success: false, error: 'formType must be "onboarding" or "credit"' },
        { status: 400 }
      )
    }

    // Re-validate the magic link token
    const tokenResult = await validateMagicLinkToken(token, formType)
    if (!tokenResult.valid) {
      return NextResponse.json(
        { success: false, error: tokenResult.message, code: tokenResult.code },
        { status: 400 }
      )
    }

    const { id: onboardingId, contactEmail } = tokenResult.onboarding

    // Find the most recent non-invalidated OTP for this record
    const otpRecord = await prisma.supplierOtp.findFirst({
      where: { onboardingId, formType, invalidated: false },
      orderBy: { createdAt: 'desc' },
    })

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, error: 'No active verification code found. Please request a new code.' },
        { status: 400 }
      )
    }

    if (otpRecord.expiresAt < new Date()) {
      await prisma.supplierOtp.update({ where: { id: otpRecord.id }, data: { invalidated: true } })
      return NextResponse.json(
        { success: false, error: 'Verification code has expired. Please request a new one.', code: 'EXPIRED' },
        { status: 400 }
      )
    }

    if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
      await prisma.supplierOtp.update({ where: { id: otpRecord.id }, data: { invalidated: true } })
      return NextResponse.json(
        { success: false, error: 'Too many incorrect attempts. Please request a new code.', code: 'MAX_ATTEMPTS' },
        { status: 429 }
      )
    }

    const isValid = verifyOtp(otp, otpRecord.salt, otpRecord.otpHash)

    if (!isValid) {
      const newAttempts = otpRecord.attempts + 1
      const shouldInvalidate = newAttempts >= OTP_MAX_ATTEMPTS

      await prisma.supplierOtp.update({
        where: { id: otpRecord.id },
        data: { attempts: newAttempts, invalidated: shouldInvalidate },
      })

      const remaining = OTP_MAX_ATTEMPTS - newAttempts
      return NextResponse.json(
        {
          success: false,
          error: shouldInvalidate
            ? 'Too many incorrect attempts. Please request a new code.'
            : `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
          code: shouldInvalidate ? 'MAX_ATTEMPTS' : 'INVALID_OTP',
          attemptsRemaining: Math.max(remaining, 0),
        },
        { status: 400 }
      )
    }

    // OTP is correct — invalidate it and create a session
    await prisma.supplierOtp.update({ where: { id: otpRecord.id }, data: { invalidated: true } })

    const { sessionToken, session } = await createSession({
      onboardingId,
      formType,
      email: contactEmail,
    })

    // Use Secure flag only when the request actually arrived over HTTPS.
    // When behind a proxy (Cloudflare, nginx), the original protocol is in X-Forwarded-Proto.
    // Falling back to NODE_ENV alone is wrong when the server runs HTTP on port 3000.
    const proto =
      request.headers.get('x-forwarded-proto') ??
      (request.url.startsWith('https') ? 'https' : 'http')
    const isSecure = proto === 'https'

    const response = NextResponse.json({ success: true })
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      expires: session.expiresAt,
    })

    return response
  } catch (error) {
    console.error('OTP verify error:', error)
    return NextResponse.json(
      { success: false, error: 'Verification failed. Please try again.' },
      { status: 500 }
    )
  }
}
