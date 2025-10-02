import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { supplierId, status } = body

    if (!supplierId || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing supplierId or status' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED', 'INACTIVE']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      )
    }

    const supplier = await prisma.supplier.update({
      where: { id: supplierId },
      data: { 
        status,
        approvedAt: status === 'APPROVED' ? new Date() : null
      }
    })

    // Update onboarding record if it exists
    const onboarding = await prisma.supplierOnboarding.findUnique({
      where: { supplierId }
    })

    if (onboarding) {
      await prisma.supplierOnboarding.update({
        where: { id: onboarding.id },
        data: {
          approvalStatus: status === 'APPROVED' ? 'APPROVED' : status === 'REJECTED' ? 'REJECTED' : null,
          approvedAt: status === 'APPROVED' ? new Date() : null,
          rejectedAt: status === 'REJECTED' ? new Date() : null,
          completedAt: status === 'APPROVED' || status === 'REJECTED' ? new Date() : null,
        }
      })

      // Add timeline entry
      await prisma.onboardingTimeline.create({
        data: {
          onboardingId: onboarding.id,
          step: 'REVIEW',
          status: status,
          action: `Status updated to ${status}`,
          description: `Supplier status changed to ${status}`,
          performedBy: 'Admin',
        }
      })
    }

    return NextResponse.json({
      success: true,
      supplier
    })
  } catch (error) {
    console.error('Error updating supplier status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update supplier status'
      },
      { status: 500 }
    )
  }
}

