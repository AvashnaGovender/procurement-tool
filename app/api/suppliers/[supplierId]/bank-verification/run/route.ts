import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const WORKER_API_URL = process.env.WORKER_API_URL || 'http://localhost:8001'
/** Worker can take several minutes (PDF + LLM). Use a long timeout to avoid HeadersTimeoutError. */
const WORKER_FETCH_TIMEOUT_MS = 400_000 // 400 seconds

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

    const fileName = bankFiles[0]
    // Read file directly from disk (same path as document API) so we send exact bytes to the worker.
    // Fetching via HTTP can change encoding or return HTML on auth errors, causing PDF parse errors.
    const filePath = join(
      process.cwd(),
      'data',
      'uploads',
      'suppliers',
      supplier.supplierCode,
      `v${latestVersion.version}`,
      'bankConfirmation',
      fileName
    )
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: `Document not found at expected path` },
        { status: 404 }
      )
    }
    const buffer = await readFile(filePath)

    const formData = new FormData()
    formData.append('file', new Blob([buffer], { type: 'application/pdf' }), fileName)

    // Node's default fetch (undici) uses ~300s headers timeout, which can hit before the worker finishes.
    // Use undici's fetch with a custom Agent so the request can run up to WORKER_FETCH_TIMEOUT_MS.
    const { fetch: undiciFetch, Agent } = await import('undici')
    const agent = new Agent({
      headersTimeout: WORKER_FETCH_TIMEOUT_MS,
      bodyTimeout: WORKER_FETCH_TIMEOUT_MS,
    })
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), WORKER_FETCH_TIMEOUT_MS)
    let verifyRes: Response
    try {
      verifyRes = await undiciFetch(`${WORKER_API_URL}/verify-bank-statement`, {
        method: 'POST',
        body: formData,
        dispatcher: agent,
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeoutId)
    }

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
