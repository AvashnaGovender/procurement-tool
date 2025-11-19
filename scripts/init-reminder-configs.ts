import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Initialize default reminder configurations
 * Run this script to set up the reminder system
 */
async function initReminderConfigs() {
  console.log('🔔 Initializing reminder configurations...')

  try {
    const configs = [
      {
        reminderType: 'SUPPLIER_DOCUMENT_SUBMISSION',
        firstReminderAfterHours: 24, // 1 day
        secondReminderAfterHours: 72, // 3 days
        finalReminderAfterHours: 120, // 5 days
        isEnabled: true,
        emailSubjectTemplate: 'Reminder: Complete Your Supplier Onboarding',
        emailBodyTemplate: `Dear {supplierName},

This is a friendly reminder to complete your supplier onboarding documentation.

It has been {hoursAgo} hours since we sent you the onboarding email, and we notice your documentation is still pending.

Please click the button below to complete your registration:

{onboardingLink}

If you have any questions or need assistance, please don't hesitate to contact our procurement team.

Best regards,
Procurement Team`
      },
      {
        reminderType: 'MANAGER_APPROVAL_PENDING',
        firstReminderAfterHours: 24, // 1 day
        secondReminderAfterHours: 48, // 2 days
        finalReminderAfterHours: 72, // 3 days
        isEnabled: true,
        emailSubjectTemplate: 'Reminder: Supplier Approval Pending',
        emailBodyTemplate: `Dear {managerName},

You have a pending supplier initiation approval that requires your attention.

<strong>Supplier:</strong> {supplierName}
<strong>Requested by:</strong> {requesterName}
<strong>Category:</strong> {category}
<strong>Submitted:</strong> {submittedDate}
<strong>Hours pending:</strong> {hoursAgo}

Please review and approve or reject this request:

{approvalsLink}

Best regards,
Procurement System`
      },
      {
        reminderType: 'PROCUREMENT_APPROVAL_PENDING',
        firstReminderAfterHours: 24, // 1 day
        secondReminderAfterHours: 48, // 2 days
        finalReminderAfterHours: 72, // 3 days
        isEnabled: true,
        emailSubjectTemplate: 'Reminder: Procurement Approval Pending',
        emailBodyTemplate: `Dear {procurementManagerName},

You have a pending procurement approval that requires your attention.

<strong>Supplier:</strong> {supplierName}
<strong>Requested by:</strong> {requesterName}
<strong>Category:</strong> {category}
<strong>Manager Status:</strong> {managerStatus}
<strong>Submitted:</strong> {submittedDate}
<strong>Hours pending:</strong> {hoursAgo}

Please review and approve or reject this request:

{approvalsLink}

Best regards,
Procurement System`
      },
      {
        reminderType: 'BUYER_REVIEW_PENDING',
        firstReminderAfterHours: 48, // 2 days
        secondReminderAfterHours: 96, // 4 days
        finalReminderAfterHours: 144, // 6 days
        isEnabled: true,
        emailSubjectTemplate: 'Reminder: Supplier Documents Awaiting Review',
        emailBodyTemplate: `Dear {buyerName},

The supplier documents for {supplierName} are awaiting your review.

<strong>Supplier:</strong> {supplierName}
<strong>Submitted:</strong> {submittedDate}
<strong>Hours pending:</strong> {hoursAgo}

Please review the submitted documents:

{reviewLink}

Best regards,
Procurement System`
      },
      {
        reminderType: 'SUPPLIER_REVISION_PENDING',
        firstReminderAfterHours: 48, // 2 days
        secondReminderAfterHours: 96, // 4 days
        finalReminderAfterHours: 144, // 6 days
        isEnabled: true,
        emailSubjectTemplate: 'Reminder: Document Revision Required',
        emailBodyTemplate: `Dear Supplier,

This is a reminder that your documents require revision before we can proceed with your onboarding.

Please review the feedback provided and resubmit your corrected documents as soon as possible.

Best regards,
Procurement Team`
      }
    ]

    for (const config of configs) {
      const existing = await prisma.reminderConfiguration.findFirst({
        where: { reminderType: config.reminderType }
      })

      if (existing) {
        // Update existing
        await prisma.reminderConfiguration.update({
          where: { id: existing.id },
          data: config
        })
        console.log(`✅ Updated: ${config.reminderType}`)
      } else {
        // Create new
        await prisma.reminderConfiguration.create({
          data: config
        })
        console.log(`✅ Created: ${config.reminderType}`)
      }
    }

    console.log('\n✅ Reminder configurations initialized successfully!')
    console.log('\n📋 Summary:')
    const allConfigs = await prisma.reminderConfiguration.findMany()
    allConfigs.forEach(config => {
      console.log(`   - ${config.reminderType}: ${config.isEnabled ? '✅ Enabled' : '❌ Disabled'}`)
      console.log(`     Intervals: ${config.firstReminderAfterHours}h, ${config.secondReminderAfterHours}h, ${config.finalReminderAfterHours}h`)
    })

  } catch (error) {
    console.error('❌ Error initializing reminder configurations:', error)
  } finally {
    await prisma.$disconnect()
  }
}

initReminderConfigs()

