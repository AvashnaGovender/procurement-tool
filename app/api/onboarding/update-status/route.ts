import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { onboardingId, emailSent, emailMessageId, formSubmitted, currentStep, overallStatus } = body

    const updateData: any = {}
    
    if (emailSent !== undefined) {
      updateData.emailSent = emailSent
      updateData.emailSentAt = new Date()
    }
    
    if (emailMessageId) {
      updateData.emailMessageId = emailMessageId
    }
    
    if (formSubmitted !== undefined) {
      updateData.supplierFormSubmitted = formSubmitted
      updateData.supplierFormSubmittedAt = new Date()
    }
    
    if (currentStep) {
      updateData.currentStep = currentStep
    }
    
    if (overallStatus) {
      updateData.overallStatus = overallStatus
    }

    const onboarding = await prisma.supplierOnboarding.update({
      where: { id: onboardingId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      onboarding
    })
  } catch (error) {
    console.error('Error updating onboarding status:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update onboarding status'
      },
      { status: 500 }
    )
  }
}

