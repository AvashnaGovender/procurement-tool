import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const WORKER_API_URL = process.env.WORKER_API_URL || 'http://localhost:8001'

/**
 * POST /api/suppliers/[supplierId]/bank-verification/run
 * Runs bank confirmation verification (first bank doc only) and stores result.
 * Call this when docs are received (background) or when PM clicks "Run check".
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ supplierId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const internalSecret = request.headers.get('x-trigger-secret')
    const validInternal = process.env.BANK_VERIFICATION_TRIGGER_SECRET && internalSecret === process.env.BANK_VERIFICATION_TRIGGER_SECRET
    if (!session?.user && !validInternal) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { supplierId } = await params
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      select: {
        id: true,
        supplierCode: true,
        airtableData: true,
      },
    })

    if (!supplier) {
      return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 404 })
    }

    const airtableData = supplier.airtableData as any
    if (!airtableData?.allVersions?.length) {
      return NextResponse.json(
        { success: false, error: 'No document versions available' },
        { status: 400 }
      )
    }

    const latestVersion = airtableData.allVersions[airtableData.allVersions.length - 1]
    const bankFiles = latestVersion.uploadedFiles?.bankConfirmation
    if (!Array.isArray(bankFiles) || bankFiles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No bank confirmation document to verify' },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const fileName = bankFiles[0]
    const fileUrl = `${baseUrl}/api/suppliers/documents/${supplier.supplierCode}/v${latestVersion.version}/bankConfirmation/${encodeURIComponent(fileName)}`

    const fileResponse = await fetch(fileUrl)
    if (!fileResponse.ok) {
      return NextResponse.json(
        { success: false, error: `Failed to fetch document: ${fileResponse.statusText}` },
        { status: 502 }
      )
    }

    const fileBlob = await fileResponse.blob()
    const arrayBuffer = await fileBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const formData = new FormData()
    formData.append('file', new Blob([buffer], { type: fileBlob.type || 'application/pdf' }), fileName)

    const verifyRes = await fetch(`${WORKER_API_URL}/verify-bank-statement`, {
      method: 'POST',
      body: formData,
    })

    if (!verifyRes.ok) {
      const errText = await verifyRes.text()
      return NextResponse.json(
        { success: false, error: `Worker verification failed: ${verifyRes.status} - ${errText.slice(0, 200)}` },
        { status: 502 }
      )
    }

    const verifyData = await verifyRes.json()

    await prisma.bankVerification.create({
      data: {
        supplierId: supplier.id,
        result: verifyData as any,
      },
    })

    return NextResponse.json({
      success: true,
      data: verifyData,
    })
  } catch (error) {
    console.error('POST bank-verification/run error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
