import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/supplier-portal/session'
import { validateMagicLinkToken } from '@/lib/supplier-portal/token'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ success: false, error: 'token is required' }, { status: 400 })
    }

    // Validate magic link
    const tokenResult = await validateMagicLinkToken(token, 'credit')
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

    const onboarding = await prisma.supplierOnboarding.findUnique({
      where: { creditApplicationToken: token },
      include: {
        supplier: {
          select: {
            id: true,
            supplierCode: true,
            companyName: true,
            contactPerson: true,
            contactEmail: true,
            airtableData: true,
          },
        },
      },
    })

    if (!onboarding) {
      return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 })
    }

    let signedCreditAppUrl: string | null = null
    const airtableData = onboarding.supplier?.airtableData as any
    if (airtableData?.signedCreditApplication?.fileName) {
      const fileName = airtableData.signedCreditApplication.fileName
      const supplierCode = onboarding.supplier?.supplierCode
      if (supplierCode) {
        signedCreditAppUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/suppliers/documents/${supplierCode}/signedCreditApplication/${encodeURIComponent(fileName)}`
      }
    }

    return NextResponse.json({
      success: true,
      supplier: {
        supplierCode: onboarding.supplier?.supplierCode,
        companyName: onboarding.supplier?.companyName,
        contactPerson: onboarding.supplier?.contactPerson,
        contactEmail: onboarding.supplier?.contactEmail,
      },
      signedCreditAppUrl,
      creditAccountInfo: onboarding.creditApplicationInfo || null,
      submitted: onboarding.creditApplicationFormSubmitted,
    })
  } catch (error) {
    console.error('Supplier portal form/credit error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch form data' }, { status: 500 })
  }
}
