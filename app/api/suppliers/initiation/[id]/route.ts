import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: initiationId } = await params

    const initiation = await prisma.supplierInitiation.findUnique({
      where: { id: initiationId },
      include: {
        managerApproval: {
          include: {
            approver: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        procurementApproval: {
          include: {
            approver: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        initiatedBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!initiation) {
      return NextResponse.json({ error: 'Initiation not found' }, { status: 404 })
    }

    // Check if user has permission to view this initiation
    const canView = 
      session.user.role === 'ADMIN' ||
      session.user.role === 'PROCUREMENT_MANAGER' ||
      initiation.initiatedById === session.user.id ||
      (initiation.managerApproval && initiation.managerApproval.approverId === session.user.id) ||
      (initiation.procurementApproval && initiation.procurementApproval.approverId === session.user.id)

    if (!canView) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({
      id: initiation.id,
      status: initiation.status,
      supplierName: initiation.supplierName,
      businessUnit: initiation.businessUnit,
      submittedAt: initiation.submittedAt,
      managerApproval: initiation.managerApproval ? {
        status: initiation.managerApproval.status,
        approver: initiation.managerApproval.approver.name,
        approvedAt: initiation.managerApproval.approvedAt,
        comments: initiation.managerApproval.comments
      } : null,
      procurementApproval: initiation.procurementApproval ? {
        status: initiation.procurementApproval.status,
        approver: initiation.procurementApproval.approver.name,
        approvedAt: initiation.procurementApproval.approvedAt,
        comments: initiation.procurementApproval.comments
      } : null,
      emailSent: initiation.emailSent,
      emailSentAt: initiation.emailSentAt
    })

  } catch (error) {
    console.error('Error fetching initiation data:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch initiation data' 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: initiationId } = await params

    // Check if user has permission to delete initiations
    const canDelete = ['ADMIN', 'PROCUREMENT_MANAGER', 'APPROVER'].includes(session.user.role)
    
    if (!canDelete) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get the initiation to check its status
    const initiation = await prisma.supplierInitiation.findUnique({
      where: { id: initiationId }
    })

    if (!initiation) {
      return NextResponse.json({ error: 'Initiation not found' }, { status: 404 })
    }

    // Check if initiation has an associated onboarding/supplier
    // If it does and the supplier form has been submitted, we should be more careful
    const onboarding = await prisma.supplierOnboarding.findFirst({
      where: { initiationId: initiationId }
    })
    
    // Only allow deletion if:
    // 1. No onboarding record exists, OR
    // 2. Onboarding exists but supplier hasn't submitted form yet, OR
    // 3. User is ADMIN (admins can delete anything)
    const canDeleteInitiation = 
      session.user.role === 'ADMIN' ||
      !onboarding ||
      (onboarding && !onboarding.supplierFormSubmitted)
    
    if (!canDeleteInitiation) {
      return NextResponse.json({ 
        error: `Cannot delete initiation. The supplier has already submitted their onboarding form. Please delete the supplier submission instead.`
      }, { status: 400 })
    }

    // Delete the initiation and related records in a transaction
    console.log('Attempting to delete initiation:', initiationId)
    console.log('Initiation status:', initiation.status)
    
    await prisma.$transaction(async (tx) => {
      // Delete related approvals first (they have foreign key constraints)
      await tx.managerApproval.deleteMany({
        where: { initiationId: initiationId }
      })
      await tx.procurementApproval.deleteMany({
        where: { initiationId: initiationId }
      })
      
      // Delete the initiation
      await tx.supplierInitiation.delete({
        where: { id: initiationId }
      })
      
      // If onboarding exists but supplier hasn't submitted, delete it too
      if (onboarding && !onboarding.supplierFormSubmitted) {
        await tx.onboardingTimeline.deleteMany({
          where: { onboardingId: onboarding.id }
        })
        await tx.supplierOnboarding.delete({
          where: { id: onboarding.id }
        })
      }
    })

    console.log('Initiation deleted successfully')
    return NextResponse.json({ 
      success: true, 
      message: 'Supplier initiation deleted successfully' 
    })

  } catch (error) {
    console.error('Error deleting initiation:', error)
    return NextResponse.json({ 
      error: 'Failed to delete initiation' 
    }, { status: 500 })
  }
}
