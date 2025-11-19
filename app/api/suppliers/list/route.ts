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

    console.log(`📋 Fetching suppliers for user: ${session.user.email}, role: ${session.user.role}`)

    // Define where clause based on user role:
    // - ADMIN, MANAGER, PROCUREMENT_MANAGER: See all suppliers
    // - Regular users: Only see approved suppliers OR suppliers they created
    let whereClause: any = {}

    if (['ADMIN', 'MANAGER', 'PROCUREMENT_MANAGER'].includes(session.user.role)) {
      // Managers and admins see all suppliers
      whereClause = {}
    } else {
      // Regular users only see:
      // 1. Suppliers they created (to track their initiation), OR
      // 2. Approved suppliers (public supplier directory)
      whereClause = {
        OR: [
          { createdById: session.user.id },
          { status: 'APPROVED' }
        ]
      }
    }

    console.log(`   Where clause:`, JSON.stringify(whereClause))

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

    console.log(`   ✅ Returning ${suppliers.length} suppliers`)

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

