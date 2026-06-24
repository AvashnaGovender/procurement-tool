import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email-sender'

function getPurchaseTypeDisplayName(purchaseType: string): string {
  const map: Record<string, string> = {
    COD: 'COD',
    COD_IP_SHARED: 'COD IP Shared',
    CREDIT_TERMS: 'Credit Terms',
    CREDIT_TERMS_IP_SHARED: 'Credit Terms IP Shared',
    REGULAR: 'Regular Purchase',
    ONCE_OFF: 'Once-off Purchase',
  }
  return map[purchaseType] || purchaseType
}

function formatAnnualPurchaseValue(value: number | null): string {
  if (!value) return ''
  if (value <= 100000) return 'R0 - R100,000'
  if (value <= 500000) return 'R100,000 - R500,000'
  if (value <= 1000000) return 'R500,000 - R1,000,000'
  return 'R1,000,000+'
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins and procurement managers can resend
    const allowedRoles = ['ADMIN', 'PROCUREMENT_MANAGER', 'MANAGER']
    if (!allowedRoles.includes(session.user.role as string)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const initiationId = params.id

    const initiation = await prisma.supplierInitiation.findUnique({
      where: { id: initiationId },
      include: {
        initiatedBy: { select: { name: true, email: true } },
        onboarding: true,
      },
    })

    if (!initiation) {
      return NextResponse.json({ success: false, error: 'Initiation not found' }, { status: 404 })
    }

    if (initiation.status !== 'APPROVED') {
      return NextResponse.json(
        { success: false, error: 'Can only resend email for fully approved initiations' },
        { status: 400 }
      )
    }

    // Generate a fresh token (72-hour expiry)
    const newToken = `init_${initiationId}_${Date.now()}`
    const newExpiry = new Date(Date.now() + 72 * 60 * 60 * 1000)

    if (initiation.onboarding) {
      // Revoke old token and issue new one
      await prisma.supplierOnboarding.update({
        where: { id: initiation.onboarding.id },
        data: {
          onboardingToken: newToken,
          onboardingTokenExpiresAt: newExpiry,
          onboardingTokenRevoked: false,
        },
      })
    } else {
      // No onboarding record exists yet — create one
      const supplier = await prisma.supplier.findFirst({
        where: { contactEmail: { equals: initiation.supplierEmail, mode: 'insensitive' } },
      })

      await prisma.supplierOnboarding.create({
        data: {
          supplierId: supplier?.id ?? '',
          initiationId,
          contactName: initiation.supplierContactPerson,
          contactEmail: initiation.supplierEmail,
          businessType: 'OTHER',
          sector: initiation.productServiceCategory,
          currentStep: 'PENDING_SUPPLIER_RESPONSE',
          overallStatus: 'AWAITING_RESPONSE',
          onboardingToken: newToken,
          onboardingTokenExpiresAt: newExpiry,
          onboardingTokenRevoked: false,
          initiatedById: initiation.initiatedById,
        },
      })
    }

    const emailContent = `
Dear ${initiation.supplierContactPerson},

This is a reminder regarding your supplier onboarding with Schauenburg Systems.

Your onboarding request has been approved and you are required to complete your supplier registration by submitting the required documentation.

<strong>Your Request Details:</strong>
- Requester: ${initiation.requesterName || initiation.initiatedBy?.name || '—'}
- Product/Service Category: ${initiation.productServiceCategory}
${initiation.purchaseType ? `- Purchase Type: ${getPurchaseTypeDisplayName(initiation.purchaseType)}` : ''}
${initiation.annualPurchaseValue ? `- Annual Purchase Value: ${formatAnnualPurchaseValue(initiation.annualPurchaseValue)}` : ''}

<strong>Please complete your registration using the link below.</strong> This link is valid for 72 hours.

{formLink}

If you have already started your registration or have any questions, please contact our procurement team.

Best regards,
Schauenburg Systems Procurement Team
    `.trim()

    const emailResult = await sendEmail({
      to: initiation.supplierEmail,
      subject: 'Supplier Onboarding - Registration Link',
      content: emailContent,
      supplierName: initiation.supplierName,
      businessType: initiation.productServiceCategory,
      onboardingToken: newToken,
    })

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: `Failed to send email: ${emailResult.message}` },
        { status: 500 }
      )
    }

    // Update initiation email timestamps
    await prisma.supplierInitiation.update({
      where: { id: initiationId },
      data: { emailSent: true, emailSentAt: new Date() },
    })

    console.log(`✅ Onboarding email resent for initiation ${initiationId} to ${initiation.supplierEmail}`)

    return NextResponse.json({
      success: true,
      message: `Onboarding email resent to ${initiation.supplierEmail}`,
    })
  } catch (error: any) {
    console.error('Resend email error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
