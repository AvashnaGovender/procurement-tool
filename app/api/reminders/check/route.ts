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
      pmReviews: 0,
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
          case 'PM_REVIEW_PENDING':
            results.pmReviews += await checkPMReviews(config)
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

    // Check if 24 hours have passed
    if (hoursSinceEmailSent < 24) continue

    // Check if reminder was already sent
    const existingReminder = await prisma.reminderLog.findFirst({
      where: {
        reminderType: config.reminderType,
        referenceId: onboarding.id,
        status: { in: ['SENT', 'PENDING'] }
      }
    })

    if (existingReminder) continue
    
    const reminderCount = 1

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

    // Check if 24 hours have passed
    if (hoursSinceCreated < 24) continue

    // Check if reminder was already sent
    const existingReminder = await prisma.reminderLog.findFirst({
      where: {
        reminderType: config.reminderType,
        referenceId: approval.id,
        status: { in: ['SENT', 'PENDING'] }
      }
    })

    if (existingReminder) continue
    
    const reminderCount = 1

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

async function checkPMReviews(config: any): Promise<number> {
  let remindersSent = 0

  // Find suppliers that have submitted documents but PM hasn't taken action
  const pendingReviews = await prisma.supplier.findMany({
    where: {
      status: {
        in: ['UNDER_REVIEW', 'AWAITING_FINAL_APPROVAL']
      },
      onboarding: {
        supplierFormSubmitted: true,
        revisionRequested: false  // Don't remind if already requested revision
      }
    },
    include: {
      onboarding: {
        include: {
          initiation: {
            include: {
              initiatedBy: true
            }
          }
        }
      }
    }
  })

  const now = new Date()

  // Get all PM users
  const pmUsers = await prisma.user.findMany({
    where: {
      role: 'PROCUREMENT_MANAGER',
      isActive: true
    }
  })

  if (pmUsers.length === 0) return 0

  for (const supplier of pendingReviews) {
    if (!supplier.onboarding?.supplierFormSubmittedAt) continue

    const hoursSinceSubmitted = differenceInHours(now, new Date(supplier.onboarding.supplierFormSubmittedAt))

    // Check if 24 hours have passed
    if (hoursSinceSubmitted < 24) continue

    // Send reminder to each PM
    for (const pm of pmUsers) {
      // Check if reminder was already sent to this PM for this supplier
      const existingReminder = await prisma.reminderLog.findFirst({
        where: {
          reminderType: config.reminderType,
          referenceId: supplier.id,
          recipientEmail: pm.email,
          status: { in: ['SENT', 'PENDING'] }
        }
      })

      if (existingReminder) continue

      const emailBody = config.emailBodyTemplate
        ?.replace(/{pmName}/g, pm.name)
        ?.replace(/{supplierName}/g, supplier.companyName)
        ?.replace(/{supplierCode}/g, supplier.supplierCode)
        ?.replace(/{submittedDate}/g, format(new Date(supplier.onboarding.supplierFormSubmittedAt), 'PP'))
        ?.replace(/{hoursAgo}/g, hoursSinceSubmitted.toString())
        ?.replace(/{reviewLink}/g, `${process.env.NEXTAUTH_URL}/admin/supplier-submissions/${supplier.id}`)

      try {
        await sendEmail({
          to: pm.email,
          subject: config.emailSubjectTemplate || 'Reminder: Supplier Documents Awaiting Review',
          content: emailBody || 'You have supplier documents awaiting review.'
        })

        await prisma.reminderLog.create({
          data: {
            reminderType: config.reminderType,
            referenceId: supplier.id,
            referenceType: 'Supplier',
            recipientEmail: pm.email,
            recipientName: pm.name,
            reminderCount: 1,
            subject: config.emailSubjectTemplate,
            content: emailBody || '',
            status: 'SENT',
            sentAt: new Date()
          }
        })

        remindersSent++
        console.log(`✓ Sent PM review reminder to ${pm.email} for supplier ${supplier.supplierCode}`)
      } catch (error) {
        console.error(`✗ Failed to send PM review reminder:`, error)
      }
    }
  }

  return remindersSent
}

async function checkSupplierRevisions(config: any): Promise<number> {
  let remindersSent = 0

  // Find suppliers who were requested to revise but haven't resubmitted
  const pendingRevisions = await prisma.supplierOnboarding.findMany({
    where: {
      revisionRequested: true,
      supplierFormSubmitted: true  // They submitted once, now need to resubmit
      // If they haven't resubmitted after the revision request
    },
    include: {
      supplier: true
    }
  })

  const now = new Date()

  for (const onboarding of pendingRevisions) {
    if (!onboarding.revisionRequestedAt || !onboarding.supplier) continue

    // Check if there's a newer submission after the revision request
    if (onboarding.supplierFormSubmittedAt && 
        new Date(onboarding.supplierFormSubmittedAt) > new Date(onboarding.revisionRequestedAt)) {
      // Supplier has already resubmitted, skip
      continue
    }

    const hoursSinceRevisionRequest = differenceInHours(now, new Date(onboarding.revisionRequestedAt))

    // Check if 24 hours have passed
    if (hoursSinceRevisionRequest < 24) continue

    // Check if reminder was already sent
    const existingReminder = await prisma.reminderLog.findFirst({
      where: {
        reminderType: config.reminderType,
        referenceId: onboarding.id,
        status: { in: ['SENT', 'PENDING'] }
      }
    })

    if (existingReminder) continue

    const emailBody = config.emailBodyTemplate
      ?.replace(/{supplierName}/g, onboarding.contactName)
      ?.replace(/{hoursAgo}/g, hoursSinceRevisionRequest.toString())
      ?.replace(/{revisionDate}/g, format(new Date(onboarding.revisionRequestedAt), 'PP'))
      ?.replace(/{revisionNotes}/g, onboarding.revisionNotes || 'Please review and revise your documents.')
      ?.replace(/{onboardingLink}/g, `${process.env.NEXTAUTH_URL}/supplier-onboarding-form?token=${onboarding.onboardingToken}`)

    try {
      await sendEmail({
        to: onboarding.contactEmail,
        subject: config.emailSubjectTemplate || 'Reminder: Revise Your Supplier Documents',
        content: emailBody || 'Please revise and resubmit your supplier documents.'
      })

      await prisma.reminderLog.create({
        data: {
          reminderType: config.reminderType,
          referenceId: onboarding.id,
          referenceType: 'SupplierOnboarding',
          recipientEmail: onboarding.contactEmail,
          recipientName: onboarding.contactName,
          reminderCount: 1,
          subject: config.emailSubjectTemplate,
          content: emailBody || '',
          status: 'SENT',
          sentAt: new Date(),
          metadata: {
            hoursSinceRevisionRequest,
            revisionRequestedAt: onboarding.revisionRequestedAt
          }
        }
      })

      remindersSent++
      console.log(`✓ Sent revision reminder to ${onboarding.contactEmail}`)
    } catch (error) {
      console.error(`✗ Failed to send revision reminder:`, error)
    }
  }

  return remindersSent
}

