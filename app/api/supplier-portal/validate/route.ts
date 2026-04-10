import { NextRequest, NextResponse } from 'next/server'
import { validateMagicLinkToken, FormType } from '@/lib/supplier-portal/token'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const formType = searchParams.get('type') as FormType | null

  if (!token || !formType) {
    return NextResponse.json(
      { success: false, error: 'token and type query parameters are required' },
      { status: 400 }
    )
  }

  if (formType !== 'onboarding' && formType !== 'credit') {
    return NextResponse.json(
      { success: false, error: 'type must be "onboarding" or "credit"' },
      { status: 400 }
    )
  }

  const result = await validateMagicLinkToken(token, formType)

  if (!result.valid) {
    const statusMap: Record<string, number> = {
      NOT_FOUND: 404,
      REVOKED: 410,
      EXPIRED: 410,
      WRONG_STATUS: 409,
    }
    return NextResponse.json(
      { success: false, error: result.message, code: result.code },
      { status: statusMap[result.code] ?? 400 }
    )
  }

  return NextResponse.json({
    success: true,
    email: result.onboarding.contactEmail,
    contactName: result.onboarding.contactName,
  })
}
