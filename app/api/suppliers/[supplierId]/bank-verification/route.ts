import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/suppliers/[supplierId]/bank-verification
 * Returns the latest bank verification result for the supplier, or null.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ supplierId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { supplierId } = await params
    const latest = await prisma.bankVerification.findFirst({
      where: { supplierId },
      orderBy: { createdAt: 'desc' },
      select: { result: true, createdAt: true }
    })

    return NextResponse.json({
      success: true,
      data: latest ? { ...(latest.result as object), verifiedAt: latest.createdAt } : null
    })
  } catch (error) {
    console.error('GET bank-verification error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
