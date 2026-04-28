import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email-sender'

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

    // Fetch onboarding info if it exists
    const onboarding = await prisma.supplierOnboarding.findUnique({
      where: { initiationId: initiation.id }
    })

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
      emailSentAt: initiation.emailSentAt,
      onboarding: onboarding ? {
        id: onboarding.id,
        overallStatus: onboarding.overallStatus,
        currentStep: onboarding.currentStep,
        supplierFormSubmitted: onboarding.supplierFormSubmitted,
        supplierFormSubmittedAt: onboarding.supplierFormSubmittedAt,
        revisionRequested: onboarding.revisionRequested,
        revisionCount: onboarding.revisionCount,
        approvedAt: onboarding.approvedAt,
        rejectedAt: onboarding.rejectedAt
      } : null
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
    console.log('🗑️ DELETE request received for initiation')
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      console.log('❌ Unauthorized - no session')
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized',
        message: 'You must be logged in to delete an initiation'
      }, { status: 401 })
    }

    console.log('✅ User authenticated:', session.user.email, 'Role:', session.user.role)

    const { id: initiationId } = await params
    console.log('🔍 Attempting to delete initiation:', initiationId)

    // Get the initiation to check its status and ownership
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
        }
      }
    })

    if (!initiation) {
      console.log('❌ Initiation not found:', initiationId)
      return NextResponse.json({ 
        success: false,
        error: 'Initiation not found',
        message: `No initiation found with ID: ${initiationId}`
      }, { status: 404 })
    }

    console.log('📋 Found initiation:', {
      id: initiation.id,
      status: initiation.status,
      supplierName: initiation.supplierName,
      initiatedBy: initiation.initiatedById
    })

    // Check if user has permission to delete initiations
    const isAdmin = ['ADMIN', 'PROCUREMENT_MANAGER', 'APPROVER'].includes(session.user.role)
    const isOwner = initiation.initiatedById === session.user.id
    
    console.log('🔐 Permission check:', {
      isAdmin,
      isOwner,
      userRole: session.user.role,
      initiationStatus: initiation.status
    })
    
    // Users can delete their own drafts and rejected requests
    // Admins can delete more statuses
    const canDelete = isAdmin || (
      isOwner && (
        initiation.status === 'DRAFT' ||
        initiation.status === 'REJECTED' ||
        initiation.status === 'SUBMITTED' ||
        initiation.status === 'MANAGER_APPROVED'
      )
    )
    
    if (!canDelete) {
      console.log('❌ Permission denied')
      return NextResponse.json({ 
        success: false,
        error: 'Forbidden',
        message: 'You can only delete/withdraw your own eligible initiation requests, or you need admin privileges.'
      }, { status: 403 })
    }

    // Withdraw is only allowed before procurement has approved and before supplier email/onboarding starts.
    const allowedStatuses = ['DRAFT', 'SUBMITTED', 'MANAGER_APPROVED', 'REJECTED']
    const protectedStatuses = ['APPROVED', 'EMAIL_SENT', 'SUPPLIER_EMAILED']
    
    if (!allowedStatuses.includes(initiation.status)) {
      console.log('❌ Status not allowed for deletion:', initiation.status)
      let errorMessage = `Cannot delete initiation with current status '${initiation.status}'. `
      
      if (protectedStatuses.includes(initiation.status)) {
        errorMessage += `This initiation has been approved and supplier has been notified. Deletion is not allowed to maintain data integrity.`
      } else {
        errorMessage += `Only initiations with DRAFT, SUBMITTED, MANAGER_APPROVED, or REJECTED status can be deleted/withdrawn.`
      }
      
      return NextResponse.json({ 
        success: false,
        error: errorMessage,
        message: errorMessage
      }, { status: 400 })
    }

    console.log('✅ Permission granted, proceeding with deletion...')

    const isWithdraw = isOwner && (initiation.status === 'SUBMITTED' || initiation.status === 'MANAGER_APPROVED')

    // If initiator withdraws after manager approval (PM still pending), notify manager.
    if (isWithdraw && initiation.status === 'MANAGER_APPROVED' && initiation.managerApproval?.status === 'APPROVED' && initiation.managerApproval.approver?.email) {
      try {
        const initiationsUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/supplier-initiations`
        const managerEmailContent = `
Dear ${initiation.managerApproval.approver.name},

The supplier initiation request below has been withdrawn by the initiator after your approval:

- Supplier Name: ${initiation.supplierName}
- Supplier Email: ${initiation.supplierEmail}
- Initiation ID: ${initiation.id}

No further procurement approval is required for this request.

You can view your initiations here:
${initiationsUrl}

Best regards,
Schauenburg Systems Procurement System
        `.trim()

        await sendEmail({
          to: initiation.managerApproval.approver.email,
          subject: 'Supplier Initiation Withdrawn by Initiator',
          content: managerEmailContent,
          supplierName: initiation.supplierName,
          businessType: initiation.productServiceCategory
        })
      } catch (emailError) {
        console.error('⚠️ Failed to send manager withdrawal notification:', emailError)
        // Do not block withdrawal if notification fails
      }
    }

    // Delete the initiation and all related records in a transaction
    console.log('Attempting to delete initiation:', initiationId)
    console.log('Initiation status:', initiation.status)
    
    await prisma.$transaction(async (tx) => {
      // Get onboarding if it exists
      const onboarding = await tx.supplierOnboarding.findUnique({
        where: { initiationId }
      })

      // Delete all onboarding-related records if they exist
      if (onboarding) {
        // Delete onboarding timeline entries
        await tx.onboardingTimeline.deleteMany({
          where: { onboardingId: onboarding.id }
        })
        console.log(`✅ Deleted timeline entries for onboarding: ${onboarding.id}`)

        // Delete supplier documents
        await tx.supplierDocument.deleteMany({
          where: { onboardingId: onboarding.id }
        })
        console.log(`✅ Deleted supplier documents for onboarding: ${onboarding.id}`)

        // Delete email reminders
        await tx.emailReminder.deleteMany({
          where: { onboardingId: onboarding.id }
        })
        console.log(`✅ Deleted email reminders for onboarding: ${onboarding.id}`)

        // Delete verification checks
        await tx.verificationCheck.deleteMany({
          where: { onboardingId: onboarding.id }
        })
        console.log(`✅ Deleted verification checks for onboarding: ${onboarding.id}`)
      }

      // Delete manager approval if exists
      await tx.managerApproval.deleteMany({
        where: { initiationId }
      })
      console.log(`✅ Deleted manager approval for initiation: ${initiationId}`)
      
      // Delete procurement approval if exists
      await tx.procurementApproval.deleteMany({
        where: { initiationId }
      })
      console.log(`✅ Deleted procurement approval for initiation: ${initiationId}`)
      
      // Delete onboarding if exists
      if (onboarding) {
        await tx.supplierOnboarding.delete({
          where: { id: onboarding.id }
        })
        console.log(`✅ Deleted onboarding record: ${onboarding.id}`)
      }
      
      // Delete the initiation
      await tx.supplierInitiation.delete({
        where: { id: initiationId }
      })
      console.log(`✅ Deleted supplier initiation: ${initiationId}`)
    })

    console.log(isWithdraw ? 'Initiation withdrawn successfully' : 'Initiation deleted successfully')
    return NextResponse.json({ 
      success: true, 
      message: isWithdraw ? 'Supplier initiation withdrawn successfully' : 'Supplier initiation deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting initiation:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error details:', errorMessage)
    
    return NextResponse.json({ 
      success: false,
      error: 'Failed to delete initiation',
      message: errorMessage,
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
