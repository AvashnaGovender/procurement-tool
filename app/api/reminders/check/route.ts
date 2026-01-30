import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email-sender'
import { format, differenceInHours } from 'date-fns'

// Manual trigger or can be called by cron
export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Starting reminder check...')
    
    const results = {
      supplierDocuments: 0,
      managerApprovals: 0,
      procurementApprovals: 0,
      buyerReviews: 0,
      supplierRevisions: 0,
      errors: [] as string[]
    }

    // Get all enabled reminder configurations
    const configs = await prisma.reminderConfiguration.findMany({
      where: { isEnabled: true }
    })

    for (const config of configs) {
      try {
        switch (config.reminderType) {
          case 'SUPPLIER_DOCUMENT_SUBMISSION':
            results.supplierDocuments += await checkSupplierDocumentSubmission(config)
            break
          case 'MANAGER_APPROVAL_PENDING':
            results.managerApprovals += await checkManagerApprovals(config)
            break
          case 'PROCUREMENT_APPROVAL_PENDING':
            results.procurementApprovals += await checkProcurementApprovals(config)
            break
          case 'BUYER_REVIEW_PENDING':
            results.buyerReviews += await checkBuyerReviews(config)
            break
          case 'SUPPLIER_REVISION_PENDING':
            results.supplierRevisions += await checkSupplierRevisions(config)
            break
        }
      } catch (error) {
        console.error(`Error checking ${config.reminderType}:`, error)
        results.errors.push(`${config.reminderType}: ${error}`)
      }
    }

    console.log('✅ Reminder check completed:', results)

    return NextResponse.json({
      success: true,
      results
    })

  } catch (error) {
    console.error('❌ Error in reminder check:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check reminders' },
      { status: 500 }
    )
  }
}

async function checkSupplierDocumentSubmission(config: any): Promise<number> {
  let remindersNot = 0
  
  // Find supplier onboardings where email was sent but documents not submitted
  const pendingOnboardings = await prisma.supplierOnboarding.findMany({
    where: {
      emailSent: true,
      supplierFormSubmitted: false,
      overallStatus: {
        in: ['EMAIL_SENT', 'AWAITING_RESPONSE']
      }
    },
    include: {
      initiation: true
    }
  })

  const now = new Date()

  for (const onboarding of pendingOnboardings) {
    if (!onboarding.emailSentAt) continue

    const hoursSinceEmailSent = differenceInHours(now, new Date(onboarding.emailSentAt))

    // Determine which reminder to send
    let reminderCount = 0
    if (hoursSinceEmailSent >= config.finalReminderAfterHours) {
      reminderCount = 3
    } else if (hoursSinceEmailSent >= config.secondReminderAfterHours) {
      reminderCount = 2
    } else if (hoursSinceEmailSent >= config.firstReminderAfterHours) {
      reminderCount = 1
    }

    if (reminderCount === 0) continue

    // Check if this reminder count was already sent
    const existingReminder = await prisma.reminderLog.findFirst({
      where: {
        reminderType: config.reminderType,
        referenceId: onboarding.id,
        reminderCount,
        status: { in: ['SENT', 'PENDING'] }
      }
    })

    if (existingReminder) continue

    // Send reminder
    const emailBody = config.emailBodyTemplate
      ?.replace(/{supplierName}/g, onboarding.contactName)
      ?.replace(/{hoursAgo}/g, hoursSinceEmailSent.toString())
      ?.replace(/{onboardingLink}/g, `${process.env.NEXTAUTH_URL}/supplier-onboarding-form?token=${onboarding.onboardingToken}`)

    try {
      await sendEmail({
        to: onboarding.contactEmail,
        subject: config.emailSubjectTemplate || 'Reminder: Complete Your Supplier Onboarding',
        content: emailBody || 'Please complete your supplier onboarding documentation.'
      })

      await prisma.reminderLog.create({
        data: {
          reminderType: config.reminderType,
          referenceId: onboarding.id,
          referenceType: 'SupplierOnboarding',
          recipientEmail: onboarding.contactEmail,
          recipientName: onboarding.contactName,
          reminderCount,
          subject: config.emailSubjectTemplate,
          content: emailBody || '',
          status: 'SENT',
          sentAt: new Date(),
          metadata: {
            hoursSinceEmailSent,
            emailSentAt: onboarding.emailSentAt
          }
        }
      })

      remindersNot++
      console.log(`✓ Sent reminder ${reminderCount} to ${onboarding.contactEmail}`)
    } catch (error) {
      await prisma.reminderLog.create({
        data: {
          reminderType: config.reminderType,
          referenceId: onboarding.id,
          referenceType: 'SupplierOnboarding',
          recipientEmail: onboarding.contactEmail,
          recipientName: onboarding.contactName,
          reminderCount,
          subject: config.emailSubjectTemplate,
          content: emailBody || '',
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      })
      console.error(`✗ Failed to send reminder to ${onboarding.contactEmail}:`, error)
    }
  }

  return remindersNot
}

async function checkManagerApprovals(config: any): Promise<number> {
  let remindersSent = 0

  // Find initiations pending manager approval
  const pendingApprovals = await prisma.managerApproval.findMany({
    where: {
      status: 'PENDING'
    },
    include: {
      approver: true,
      initiation: {
        include: {
          initiatedBy: true
        }
      }
    }
  })

  const now = new Date()

  for (const approval of pendingApprovals) {
    const hoursSinceCreated = differenceInHours(now, new Date(approval.createdAt))

    let reminderCount = 0
    if (hoursSinceCreated >= config.finalReminderAfterHours) {
      reminderCount = 3
    } else if (hoursSinceCreated >= config.secondReminderAfterHours) {
      reminderCount = 2
    } else if (hoursSinceCreated >= config.firstReminderAfterHours) {
      reminderCount = 1
    }

    if (reminderCount === 0) continue

    const existingReminder = await prisma.reminderLog.findFirst({
      where: {
        reminderType: config.reminderType,
        referenceId: approval.id,
        reminderCount,
        status: { in: ['SENT', 'PENDING'] }
      }
    })

    if (existingReminder) continue

    const emailBody = config.emailBodyTemplate
      ?.replace(/{managerName}/g, approval.approver.name)
      ?.replace(/{supplierName}/g, approval.initiation.supplierName)
      ?.replace(/{requesterName}/g, approval.initiation.initiatedBy.name)
      ?.replace(/{category}/g, approval.initiation.productServiceCategory)
      ?.replace(/{submittedDate}/g, format(new Date(approval.initiation.submittedAt), 'PP'))
      ?.replace(/{hoursAgo}/g, hoursSinceCreated.toString())
      ?.replace(/{approvalsLink}/g, `${process.env.NEXTAUTH_URL}/admin/approvals`)

    try {
      await sendEmail({
        to: approval.approver.email,
        subject: config.emailSubjectTemplate || 'Reminder: Approval Pending',
        content: emailBody || 'You have pending approvals.'
      })

      await prisma.reminderLog.create({
        data: {
          reminderType: config.reminderType,
          referenceId: approval.id,
          referenceType: 'ManagerApproval',
          recipientEmail: approval.approver.email,
          recipientName: approval.approver.name,
          reminderCount,
          subject: config.emailSubjectTemplate,
          content: emailBody || '',
          status: 'SENT',
          sentAt: new Date()
        }
      })

      remindersSent++
      console.log(`✓ Sent manager approval reminder ${reminderCount} to ${approval.approver.email}`)
    } catch (error) {
      console.error(`✗ Failed to send reminder:`, error)
    }
  }

  return remindersSent
}

async function checkProcurementApprovals(config: any): Promise<number> {
  let remindersSent = 0

  const pendingApprovals = await prisma.procurementApproval.findMany({
    where: {
      status: 'PENDING'
    },
    include: {
      approver: true,
      initiation: {
        include: {
          initiatedBy: true,
          managerApproval: true
        }
      }
    }
  })

  const now = new Date()

  for (const approval of pendingApprovals) {
    const hoursSinceCreated = differenceInHours(now, new Date(approval.createdAt))

    let reminderCount = 0
    if (hoursSinceCreated >= config.finalReminderAfterHours) {
      reminderCount = 3
    } else if (hoursSinceCreated >= config.secondReminderAfterHours) {
      reminderCount = 2
    } else if (hoursSinceCreated >= config.firstReminderAfterHours) {
      reminderCount = 1
    }

    if (reminderCount === 0) continue

    const existingReminder = await prisma.reminderLog.findFirst({
      where: {
        reminderType: config.reminderType,
        referenceId: approval.id,
        reminderCount,
        status: { in: ['SENT', 'PENDING'] }
      }
    })

    if (existingReminder) continue

    const emailBody = config.emailBodyTemplate
      ?.replace(/{procurementManagerName}/g, approval.approver.name)
      ?.replace(/{supplierName}/g, approval.initiation.supplierName)
      ?.replace(/{requesterName}/g, approval.initiation.initiatedBy.name)
      ?.replace(/{category}/g, approval.initiation.productServiceCategory)
      ?.replace(/{submittedDate}/g, format(new Date(approval.initiation.submittedAt), 'PP'))
      ?.replace(/{managerStatus}/g, approval.initiation.managerApproval?.status || 'PENDING')
      ?.replace(/{hoursAgo}/g, hoursSinceCreated.toString())
      ?.replace(/{approvalsLink}/g, `${process.env.NEXTAUTH_URL}/admin/approvals`)

    try {
      await sendEmail({
        to: approval.approver.email,
        subject: config.emailSubjectTemplate || 'Reminder: Procurement Approval Pending',
        content: emailBody || 'You have pending procurement approvals.'
      })

      await prisma.reminderLog.create({
        data: {
          reminderType: config.reminderType,
          referenceId: approval.id,
          referenceType: 'ProcurementApproval',
          recipientEmail: approval.approver.email,
          recipientName: approval.approver.name,
          reminderCount,
          subject: config.emailSubjectTemplate,
          content: emailBody || '',
          status: 'SENT',
          sentAt: new Date()
        }
      })

      remindersSent++
      console.log(`✓ Sent procurement approval reminder ${reminderCount} to ${approval.approver.email}`)
    } catch (error) {
      console.error(`✗ Failed to send reminder:`, error)
    }
  }

  return remindersSent
}

async function checkBuyerReviews(config: any): Promise<number> {
  let remindersSent = 0

  // Find suppliers with submitted documents that are UNDER_REVIEW
  const pendingReviews = await prisma.supplier.findMany({
    where: {
      status: 'UNDER_REVIEW'
    },
    include: {
      onboarding: {
        include: {
          initiatedBy: true
        }
      }
    }
  })

  const now = new Date()

  for (const supplier of pendingReviews) {
    if (!supplier.onboarding?.supplierFormSubmittedAt) continue

    const hoursSinceSubmitted = differenceInHours(now, new Date(supplier.onboarding.supplierFormSubmittedAt))

    let reminderCount = 0
    if (hoursSinceSubmitted >= config.finalReminderAfterHours) {
      reminderCount = 3
    } else if (hoursSinceSubmitted >= config.secondReminderAfterHours) {
      reminderCount = 2
    } else if (hoursSinceSubmitted >= config.firstReminderAfterHours) {
      reminderCount = 1
    }

    if (reminderCount === 0) continue

    const existingReminder = await prisma.reminderLog.findFirst({
      where: {
        reminderType: config.reminderType,
        referenceId: supplier.id,
        reminderCount,
        status: { in: ['SENT', 'PENDING'] }
      }
    })

    if (existingReminder) continue

    const buyerEmail = supplier.onboarding.initiatedBy.email
    const buyerName = supplier.onboarding.initiatedBy.name

    const emailBody = config.emailBodyTemplate
      ?.replace(/{buyerName}/g, buyerName)
      ?.replace(/{supplierName}/g, supplier.companyName)
      ?.replace(/{submittedDate}/g, format(new Date(supplier.onboarding.supplierFormSubmittedAt), 'PP'))
      ?.replace(/{hoursAgo}/g, hoursSinceSubmitted.toString())
      ?.replace(/{reviewLink}/g, `${process.env.NEXTAUTH_URL}/admin/approvals?tab=reviews`)

    try {
      await sendEmail({
        to: buyerEmail,
        subject: config.emailSubjectTemplate || 'Reminder: Supplier Documents Awaiting Review',
        content: emailBody || 'You have supplier documents awaiting review.'
      })

      await prisma.reminderLog.create({
        data: {
          reminderType: config.reminderType,
          referenceId: supplier.id,
          referenceType: 'Supplier',
          recipientEmail: buyerEmail,
          recipientName: buyerName,
          reminderCount,
          subject: config.emailSubjectTemplate,
          content: emailBody || '',
          status: 'SENT',
          sentAt: new Date()
        }
      })

      remindersSent++
      console.log(`✓ Sent buyer review reminder ${reminderCount} to ${buyerEmail}`)
    } catch (error) {
      console.error(`✗ Failed to send reminder:`, error)
    }
  }

  return remindersSent
}

async function checkSupplierRevisions(config: any): Promise<number> {
  // This would check suppliers who have been requested to revise
  // Implementation similar to above
  return 0
}

