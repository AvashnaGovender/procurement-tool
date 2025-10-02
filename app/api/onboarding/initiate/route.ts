import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contactName, contactEmail, businessType, sector, emailContent, requiredDocuments } = body

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please login first.' },
        { status: 401 }
      )
    }

    // Find or create user in our database
    let dbUser = await prisma.user.findUnique({
      where: { email: user.email! }
    })

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: user.email!,
          name: user.email!.split('@')[0],
          password: 'supabase-auth',
          role: 'USER',
          isActive: true,
        }
      })
    }

    // Generate unique onboarding token
    const onboardingToken = randomBytes(32).toString('hex')

    // Create supplier and onboarding record in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Generate unique supplier code
      const supplierCode = `SUP-${Date.now()}-${Math.random().toString(36).substring(7)}`
      
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

