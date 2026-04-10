import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { runBankVerification } from '@/lib/bank-verification-run'

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
    const result = await runBankVerification(supplierId)

    if (!result.success) {
      const status = result.error === 'Supplier not found' ? 404 : result.error.includes('not found') ? 404 : result.error.includes('Worker') ? 502 : 400
      return NextResponse.json({ success: false, error: result.error }, { status })
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    console.error('POST bank-verification/run error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
