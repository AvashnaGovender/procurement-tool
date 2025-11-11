import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ supplierId: string }> }
) {
  try {
    const { supplierId } = await params
    
    // Get the most recent analysis job for this supplier
    const job = await prisma.aIAnalysisJob.findFirst({
      where: { supplierId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        progress: true,
        currentStep: true,
        logs: true,
        results: true,
        summary: true,
        errorMessage: true,
        failedAt: true,
        startedAt: true,
        completedAt: true,
        aiMode: true,
        totalDocuments: true,
        processedDocuments: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!job) {
      return NextResponse.json({
        success: true,
        job: null,
        message: 'No analysis job found'
      })
    }

    return NextResponse.json({
      success: true,
      job: {
        ...job,
        logs: job.logs || [],
      }
    })
  } catch (error) {
    console.error('Error fetching AI analysis status:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch status' },
      { status: 500 }
    )
  }
}

