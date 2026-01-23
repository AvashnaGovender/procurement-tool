import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const token = formData.get('token')?.toString()
    const creditAccountInfo = formData.get('creditAccountInfo')?.toString()
    const signedCreditApplication = formData.get('signedCreditApplication') as File

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      )
    }

    if (!creditAccountInfo || !creditAccountInfo.trim()) {
      return NextResponse.json(
        { success: false, error: 'Credit account information is required' },
        { status: 400 }
      )
    }

    if (!signedCreditApplication) {
      return NextResponse.json(
        { success: false, error: 'Fully signed credit application document is required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (signedCreditApplication.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'Only PDF files are accepted for the Credit Application' },
        { status: 400 }
      )
    }

    // Find onboarding record by token
    const onboarding = await prisma.supplierOnboarding.findUnique({
      where: { creditApplicationToken: token },
      include: {
        supplier: {
          select: {
            id: true,
            supplierCode: true
          }
        }
      }
    })

    if (!onboarding) {
      return NextResponse.json(
        { success: false, error: 'Invalid token or credit application not found' },
        { status: 404 }
      )
    }

    if (onboarding.creditApplicationFormSubmitted) {
      return NextResponse.json(
        { success: false, error: 'Credit application form has already been submitted' },
        { status: 400 }
      )
    }

    if (!onboarding.supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      )
    }

    // Save the fully signed credit application file
    const supplierCode = onboarding.supplier.supplierCode
    const uploadsDir = join(
      process.cwd(),
      'data',
      'uploads',
      'suppliers',
      supplierCode,
      'creditApplication',
      'fullySigned'
    )

    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const bytes = await signedCreditApplication.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const timestamp = Date.now()
    const fileName = `fully-signed-credit-application-${timestamp}.pdf`
    const filePath = join(uploadsDir, fileName)

    await writeFile(filePath, buffer)

    // Update onboarding record
    await prisma.supplierOnboarding.update({
      where: { id: onboarding.id },
      data: {
        creditApplicationFormSubmitted: true,
        creditApplicationFormSubmittedAt: new Date(),
        creditApplicationInfo: creditAccountInfo.trim()
      }
    })

    // Update supplier's airtableData to include fully signed credit application
    const supplier = await prisma.supplier.findUnique({
      where: { id: onboarding.supplier.id },
      select: { airtableData: true }
    })

    if (supplier) {
      const currentAirtableData = (supplier.airtableData as any) || {}
      const updatedAirtableData = {
        ...currentAirtableData,
        fullySignedCreditApplication: {
          fileName: fileName,
          submittedAt: new Date().toISOString(),
          creditAccountInfo: creditAccountInfo.trim()
        }
      }

      await prisma.supplier.update({
        where: { id: onboarding.supplier.id },
        data: {
          airtableData: updatedAirtableData
        }
      })
    }

    // Create timeline entry
    await prisma.onboardingTimeline.create({
      data: {
        onboardingId: onboarding.id,
        step: 'REVIEW',
        status: 'CREDIT_APPLICATION_SUBMITTED',
        action: 'Credit application form submitted',
        description: 'Supplier submitted fully signed credit application and credit account information',
        performedBy: 'Supplier',
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Credit application form submitted successfully'
    })
  } catch (error) {
    console.error('Error submitting credit application form:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit credit application form'
      },
      { status: 500 }
    )
  }
}

