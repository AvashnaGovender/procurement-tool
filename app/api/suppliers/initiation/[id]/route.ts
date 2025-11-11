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

    // Only allow deletion of certain statuses (not approved or completed ones)
    const allowedStatuses = ['SUBMITTED', 'MANAGER_APPROVED', 'PROCUREMENT_APPROVED', 'REJECTED']
    const protectedStatuses = ['APPROVED', 'EMAIL_SENT', 'SUPPLIER_EMAILED']
    
    if (!allowedStatuses.includes(initiation.status)) {
      let errorMessage = `Cannot delete initiation with current status '${initiation.status}'. `
      
      if (protectedStatuses.includes(initiation.status)) {
        errorMessage += `This initiation has been approved and supplier has been notified. Deletion is not allowed to maintain data integrity.`
      } else {
        errorMessage += `Only initiations with SUBMITTED, MANAGER_APPROVED, PROCUREMENT_APPROVED, or REJECTED status can be deleted.`
      }
      
      return NextResponse.json({ 
        error: errorMessage
      }, { status: 400 })
    }

    // Delete the initiation (this will cascade delete related approvals due to foreign key constraints)
    console.log('Attempting to delete initiation:', initiationId)
    console.log('Initiation status:', initiation.status)
    
    await prisma.supplierInitiation.delete({
      where: { id: initiationId }
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
