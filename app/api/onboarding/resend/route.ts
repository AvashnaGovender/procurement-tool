import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { supplierId, emailContent } = body

    if (!supplierId) {
      return NextResponse.json(
        { success: false, error: 'Missing supplierId' },
        { status: 400 }
      )
    }

    const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } })
    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      )
    }

    // Find or create onboarding record
    let onboarding = await prisma.supplierOnboarding.findFirst({ where: { supplierId } })
    if (!onboarding) {
      onboarding = await prisma.supplierOnboarding.create({
        data: { supplierId, currentStep: 'initiate', overallStatus: 'PENDING', emailSent: false }
      })
    }

    // Generate a fresh onboarding token
    const onboardingToken = randomBytes(32).toString('hex')

    await prisma.supplierOnboarding.update({
      where: { id: onboarding.id },
      data: { onboardingToken, emailSent: false }
    })

    // Send email via existing endpoint (reuse templating and SMTP)
    const sendResp = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: supplier.contactEmail,
        subject: 'Supplier Onboarding - Welcome',
        content: emailContent,
        supplierName: supplier.companyName || supplier.contactPerson,
        businessType: supplier.businessType || 'GENERAL',
        onboardingToken
      })
    })

    const sendData = await sendResp.json()
    if (!sendResp.ok || !sendData.success) {
      throw new Error(sendData?.message || 'Failed to send onboarding email')
    }

    // Mark email as sent
    await prisma.supplierOnboarding.update({
      where: { id: onboarding.id },
      data: { emailSent: true, emailSentAt: new Date(), emailMessageId: sendData.emailId }
    })

    return NextResponse.json({ success: true, onboardingId: onboarding.id })
  } catch (error) {
    console.error('Error resending onboarding email:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to resend onboarding email' },
      { status: 500 }
    )
  }
}
















