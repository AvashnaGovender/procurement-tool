import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contactName, contactEmail, businessType, sector, emailContent, requiredDocuments } = body

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

    // Check for duplicate email address
    const existingSupplier = await prisma.supplier.findFirst({
      where: { contactEmail }
    })

    if (existingSupplier) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'A supplier with this email address already exists.',
          existingSupplier: {
            id: existingSupplier.id,
            companyName: existingSupplier.companyName,
            contactPerson: existingSupplier.contactPerson,
            status: existingSupplier.status
          }
        },
        { status: 400 }
      )
    }

    // Generate unique onboarding token
    const onboardingToken = randomBytes(32).toString('hex')

    // Import generateSupplierCode
    const { generateSupplierCode } = await import('@/lib/generate-supplier-code')
    
    // Create supplier and onboarding record in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Generate alphanumeric sequential supplier code
      const supplierCode = await generateSupplierCode()
      
      // Create supplier
      const supplier = await tx.supplier.create({
        data: {
          supplierCode,
          contactPerson: contactName,
          companyName: contactName, // Will be updated when form is submitted
          contactEmail,
          businessType: businessType.toUpperCase().replace('-', '_'),
          sector,
          status: 'PENDING',
          createdById: dbUser.id,
        }
      })

      // Create onboarding record
      const onboarding = await tx.supplierOnboarding.create({
        data: {
          supplier: {
            connect: { id: supplier.id }
          },
          initiatedBy: {
            connect: { id: dbUser.id }
          },
          contactName,
          contactEmail,
          businessType: businessType.toUpperCase().replace('-', '_'),
          sector,
          emailContent,
          requiredDocuments,
          currentStep: 'INITIATE',
          overallStatus: 'INITIATED',
          onboardingToken,
        }
      })

      return { supplier, onboarding }
    })

    return NextResponse.json({
      success: true,
      supplier: result.supplier,
      onboarding: result.onboarding,
      token: onboardingToken
    })
  } catch (error) {
    console.error('Error creating onboarding record:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create onboarding record'
      },
      { status: 500 }
    )
  }
}

