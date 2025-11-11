import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Check if user has active delegations (useful for showing indicators)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || session.user.id
    const delegationType = searchParams.get('type')

    const now = new Date()

    // Find active delegations where user is the delegator (giving authority)
    const givenDelegations = await prisma.userDelegation.findMany({
      where: {
        delegatorId: userId,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
        ...(delegationType ? { delegationType: delegationType as any } : {})
      },
      include: {
        delegate: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Find active delegations where user is the delegate (receiving authority)
    const receivedDelegations = await prisma.userDelegation.findMany({
      where: {
        delegateId: userId,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
        ...(delegationType ? { delegationType: delegationType as any } : {})
      },
      include: {
        delegator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      hasActiveDelegations: givenDelegations.length > 0 || receivedDelegations.length > 0,
      givenCount: givenDelegations.length,
      receivedCount: receivedDelegations.length,
      givenDelegations,
      receivedDelegations
    })

  } catch (error) {
    console.error('Error checking delegations:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

