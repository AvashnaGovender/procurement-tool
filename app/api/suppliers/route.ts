import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit-logger'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateSupplierCode } from '@/lib/generate-supplier-code'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contactName, contactEmail, businessType, sector, emailId, requiredDocuments } = body

    // Validate required fields
    if (!contactName || !contactEmail || !businessType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: contactName, contactEmail, and businessType are required' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please login first.' },
        { status: 401 }
      )
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email! }
    })

    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: 'User not found in database.' },
        { status: 404 }
      )
    }

    // Generate alphanumeric sequential supplier code
    const supplierCode = await generateSupplierCode()
    
    // Create supplier and onboarding in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create supplier
      const supplier = await tx.supplier.create({
        data: {
          supplierCode,
          companyName: contactName, // Using contact name as company name for now
          contactPerson: contactName,
          contactEmail,
          businessType: businessType.toUpperCase().replace(/-/g, '_') as any,
          sector,
          status: 'PENDING',
          createdById: dbUser.id,
        },
      })

      // Create onboarding workflow
      const onboarding = await tx.supplierOnboarding.create({
        data: {
          supplierId: supplier.id,
          contactName,
          contactEmail,
          businessType: businessType.toUpperCase().replace(/-/g, '_') as any,
          sector,
          currentStep: 'PENDING_SUPPLIER_RESPONSE',
          overallStatus: 'EMAIL_SENT',
          emailSent: true,
          emailSentAt: new Date(),
          emailMessageId: emailId,
          requiredDocuments: requiredDocuments || [],
          initiatedById: dbUser.id,
        },
      })

      // Create timeline entry
      await tx.onboardingTimeline.create({
        data: {
          onboardingId: onboarding.id,
          step: 'INITIATE',
          status: 'EMAIL_SENT',
          action: 'Email sent to supplier',
          description: `Onboarding email sent to ${contactEmail}`,
          performedBy: 'System',
          metadata: { emailId },
        },
      })

      return { supplier, onboarding }
    })

    // Create audit log
    await createAuditLog({
      userId: dbUser.id,
      userName: dbUser.name,
      action: 'CREATE',
      entityType: 'SupplierOnboarding',
      entityId: result.onboarding.id,
      metadata: {
        supplierCode,
        contactEmail,
        businessType,
      },
    })

    console.log('✅ Supplier and onboarding created:', {
      supplierId: result.supplier.id,
      onboardingId: result.onboarding.id,
      supplierCode,
    })

    return NextResponse.json({
      success: true,
      message: 'Supplier record created successfully',
      supplier: {
        id: result.supplier.id,
        contactName,
        contactEmail,
        businessType,
        sector,
        emailId,
        requiredDocuments,
        status: 'pending',
        createdAt: result.supplier.createdAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Error creating supplier record:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create supplier record',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

