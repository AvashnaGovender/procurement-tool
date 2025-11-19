import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admins can see all suppliers, others only see their own
    const whereClause = session.user.role === 'ADMIN' 
      ? {} 
      : { createdById: session.user.id }

    const suppliers = await prisma.supplier.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        supplierCode: true,
        companyName: true,
        contactPerson: true,
        contactEmail: true,
        contactPhone: true,
        status: true,
        createdAt: true,
        createdById: true,
        natureOfBusiness: true,
        sector: true,
        bbbeeLevel: true,
        numberOfEmployees: true,
        airtableData: true,
        onboarding: {
          select: {
            id: true,
            revisionCount: true,
            revisionRequested: true,
            emailSent: true,
            supplierFormSubmitted: true,
            currentStep: true,
            overallStatus: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      suppliers
    })
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch suppliers'
      },
      { status: 500 }
    )
  }
}

