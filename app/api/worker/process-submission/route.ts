import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const WORKER_API_URL = process.env.WORKER_API_URL || 'http://localhost:8001'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { submissionId, supplierId, onboardingId, documents, adminEmails } = body

    // Validate required fields
    if (!submissionId || !supplierId || !onboardingId || !documents?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get admin emails if not provided
    let adminEmailsList = adminEmails || []
    if (!adminEmailsList.length) {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { email: true }
      })
      adminEmailsList = admins.map(admin => admin.email)
    }

    // Prepare documents for worker service
    const workerDocuments = documents.map((doc: any) => ({
      id: doc.id,
      type: doc.documentType || 'unknown',
      file_path: doc.filePath,
      file_name: doc.fileName,
      file_size: doc.fileSize
    }))

    // Call worker service
    const workerResponse = await fetch(`${WORKER_API_URL}/process-submission`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        submission_id: submissionId,
        supplier_id: supplierId,
        onboarding_id: onboardingId,
        documents: workerDocuments,
        admin_emails: adminEmailsList
      })
    })

    if (!workerResponse.ok) {
      const error = await workerResponse.text()
      throw new Error(`Worker service error: ${error}`)
    }

    const result = await workerResponse.json()

    // Update onboarding status
    await prisma.supplierOnboarding.update({
      where: { id: onboardingId },
      data: {
        currentStep: 'REVIEW',
        overallStatus: 'UNDER_REVIEW',
        reviewStartedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Processing started',
      taskId: result.task_id,
      submissionId: result.submission_id
    })

  } catch (error) {
    console.error('Error starting worker processing:', error)
    return NextResponse.json(
      { error: 'Failed to start processing' },
      { status: 500 }
    )
  }
}

