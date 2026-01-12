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

    // Only Procurement Managers can see suppliers awaiting final approval
    if (session.user.role !== 'PROCUREMENT_MANAGER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch suppliers with status AWAITING_FINAL_APPROVAL
    const suppliers = await prisma.supplier.findMany({
      where: {
        status: 'AWAITING_FINAL_APPROVAL'
      },
      include: {
        onboarding: {
          include: {
            initiation: {
              include: {
                initiatedBy: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format the response
    const formattedSuppliers = suppliers.map(supplier => ({
      id: supplier.id,
      supplierCode: supplier.supplierCode,
      companyName: supplier.companyName,
      contactPerson: supplier.contactPerson,
      contactEmail: supplier.contactEmail,
      status: supplier.status,
      createdAt: supplier.createdAt.toISOString(),
      initiator: supplier.onboarding?.initiation?.initiatedBy ? {
        name: supplier.onboarding.initiation.initiatedBy.name,
        email: supplier.onboarding.initiation.initiatedBy.email
      } : null,
      purchaseType: supplier.onboarding?.initiation?.purchaseType || null,
      creditApplication: supplier.onboarding?.initiation?.creditApplication || false
    }))

    return NextResponse.json(formattedSuppliers)
  } catch (error) {
    console.error('Error fetching suppliers awaiting final approval:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suppliers awaiting final approval' },
      { status: 500 }
    )
  }
}

