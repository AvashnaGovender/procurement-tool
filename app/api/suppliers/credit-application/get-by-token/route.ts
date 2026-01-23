import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      )
    }

    // Find onboarding record by credit application token
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
            airtableData: true
          }
        }
      }
    })

    if (!onboarding) {
      return NextResponse.json(
        { success: false, error: 'Invalid token or credit application not found' },
        { status: 404 }
      )
    }

    // Get signed credit application file URL if available
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
        contactEmail: onboarding.supplier?.contactEmail
      },
      signedCreditAppUrl,
      creditAccountInfo: onboarding.creditApplicationInfo || null,
      submitted: onboarding.creditApplicationFormSubmitted
    })
  } catch (error) {
    console.error('Error fetching credit application data:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch credit application data'
      },
      { status: 500 }
    )
  }
}

