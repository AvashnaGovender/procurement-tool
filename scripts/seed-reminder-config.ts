import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding reminder configurations...')

  // Default reminder configurations (24 hour reminders)
  const configs = [
    {
      reminderType: 'SUPPLIER_DOCUMENT_SUBMISSION',
      firstReminderAfterHours: 24,
      secondReminderAfterHours: 24,
      finalReminderAfterHours: 24,
      isEnabled: true,
      emailSubjectTemplate: 'Reminder: Complete Your Supplier Onboarding Documentation',
      emailBodyTemplate: `Dear {supplierName},

This is a reminder to complete your supplier onboarding documentation for Schauenburg Systems.

We sent you the onboarding invitation {hoursAgo} hours ago, but we haven't received your documentation yet.

To complete your registration, please click the link below:
{onboardingLink}

Required documents include:
- Company Registration (CIPC Documents)
- B-BBEE Certificate
- Tax Clearance or Letter of Good Standing
- Bank Confirmation Letter
- Signed NDA

If you need assistance or have questions, please don't hesitate to contact our procurement team.

Best regards,
Schauenburg Systems Procurement Team`
    },
    {
      reminderType: 'MANAGER_APPROVAL_PENDING',
      firstReminderAfterHours: 24,
      secondReminderAfterHours: 24,
      finalReminderAfterHours: 24,
      isEnabled: true,
      emailSubjectTemplate: 'Reminder: Supplier Initiation Awaiting Your Approval',
      emailBodyTemplate: `Dear {managerName},

A supplier initiation request is awaiting your approval.

<strong>Supplier Details:</strong>
- <strong>Supplier Name:</strong> {supplierName}
- <strong>Requested By:</strong> {requesterName}
- <strong>Category:</strong> {category}
- <strong>Submitted:</strong> {submittedDate}

This request has been pending for {hoursAgo} hours. Please review and approve/reject at your earliest convenience.

{approvalsLink}

Best regards,
Procurement System`
    },
    {
      reminderType: 'PM_REVIEW_PENDING',
      firstReminderAfterHours: 24,
      secondReminderAfterHours: 24,
      finalReminderAfterHours: 24,
      isEnabled: true,
      emailSubjectTemplate: 'Reminder: Supplier Documents Awaiting Your Review',
      emailBodyTemplate: `Dear {pmName},

A supplier has submitted their onboarding documents and they are awaiting your review.

<strong>Supplier Details:</strong>
- <strong>Supplier Name:</strong> {supplierName}
- <strong>Supplier Code:</strong> {supplierCode}
- <strong>Submitted:</strong> {submittedDate}
- <strong>Hours Pending:</strong> {hoursAgo}

Please review the documents and approve, reject, or request revisions.

{reviewLink}

Best regards,
Procurement System`
    },
    {
      reminderType: 'SUPPLIER_REVISION_PENDING',
      firstReminderAfterHours: 24,
      secondReminderAfterHours: 24,
      finalReminderAfterHours: 24,
      isEnabled: true,
      emailSubjectTemplate: 'Reminder: Please Resubmit Your Revised Documents',
      emailBodyTemplate: `Dear {supplierName},

We requested revisions to your supplier onboarding documentation {hoursAgo} hours ago.

<strong>Revision Requested:</strong> {revisionDate}
<strong>Revision Notes:</strong>
{revisionNotes}

Please resubmit your documents with the requested changes using the link below:
{onboardingLink}

If you have questions about the requested revisions, please contact our procurement team.

Best regards,
Schauenburg Systems Procurement Team`
    }
  ]

  for (const config of configs) {
    const existing = await prisma.reminderConfiguration.findUnique({
      where: { reminderType: config.reminderType as any }
    })

    if (existing) {
      console.log(`✓ Reminder config already exists: ${config.reminderType}`)
      continue
    }

    await prisma.reminderConfiguration.create({
      data: config as any
    })
    console.log(`✓ Created reminder config: ${config.reminderType}`)
  }

  console.log('✨ Reminder configurations seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding reminder configurations:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

