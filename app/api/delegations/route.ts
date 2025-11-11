import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'

// GET - Fetch all delegations (given or received)
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
    const type = searchParams.get('type') // 'given', 'received', or 'all'
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const userId = session.user.id

    let delegations: any[] = []

    if (type === 'given' || type === 'all' || !type) {
      const given = await prisma.userDelegation.findMany({
        where: {
          delegatorId: userId,
          ...(includeInactive ? {} : { isActive: true })
        },
        include: {
          delegate: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              department: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      delegations.push(...given.map(d => ({ ...d, direction: 'given' })))
    }

    if (type === 'received' || type === 'all' || !type) {
      const received = await prisma.userDelegation.findMany({
        where: {
          delegateId: userId,
          ...(includeInactive ? {} : { isActive: true })
        },
        include: {
          delegator: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              department: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      delegations.push(...received.map(d => ({ ...d, direction: 'received' })))
    }

    // Auto-deactivate expired delegations
    const now = new Date()
    for (const delegation of delegations) {
      if (delegation.isActive && new Date(delegation.endDate) < now) {
        await prisma.userDelegation.update({
          where: { id: delegation.id },
          data: { isActive: false }
        })
        delegation.isActive = false
      }
    }

    return NextResponse.json({
      success: true,
      delegations
    })

  } catch (error) {
    console.error('Error fetching delegations:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new delegation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { delegateId, delegationType, startDate, endDate, reason, notes } = body

    // Validation
    if (!delegateId || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if delegating to self
    if (delegateId === session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot delegate to yourself' },
        { status: 400 }
      )
    }

    // Check if delegate user exists
    const delegate = await prisma.user.findUnique({
      where: { id: delegateId }
    })

    if (!delegate) {
      return NextResponse.json(
        { success: false, error: 'Delegate user not found' },
        { status: 404 }
      )
    }

    // Check date validity
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (end <= start) {
      return NextResponse.json(
        { success: false, error: 'End date must be after start date' },
        { status: 400 }
      )
    }

    // Create delegation
    const delegation = await prisma.userDelegation.create({
      data: {
        delegatorId: session.user.id,
        delegateId,
        delegationType: delegationType || 'ALL_APPROVALS',
        startDate: start,
        endDate: end,
        reason,
        notes,
        isActive: true,
        createdBy: session.user.id
      },
      include: {
        delegate: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
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

    // Send email notification to delegate
    try {
      const { sendEmail } = await import('@/lib/email-sender')
      
      const delegationTypeLabel: Record<string, string> = {
        'ALL_APPROVALS': 'All Approvals',
        'MANAGER_APPROVALS': 'Manager Approvals',
        'PROCUREMENT_APPROVALS': 'Procurement Approvals',
        'REQUISITION_APPROVALS': 'Requisition Approvals',
        'CONTRACT_APPROVALS': 'Contract Approvals'
      }

      const emailContent = `
Dear ${delegation.delegate.name},

${delegation.delegator.name} has delegated their approval authority to you.

<strong>Delegation Details:</strong>
- <strong>Delegator:</strong> ${delegation.delegator.name} (${delegation.delegator.email})
- <strong>Type:</strong> ${delegationTypeLabel[delegation.delegationType] || delegation.delegationType}
- <strong>Period:</strong> ${format(start, 'PP')} to ${format(end, 'PP')}
${reason ? `- <strong>Reason:</strong> ${reason}` : ''}
${notes ? `- <strong>Notes:</strong> ${notes}` : ''}

During this period, you will be able to approve requests on behalf of ${delegation.delegator.name}. 
Any approvals you make will be tracked in your name with a note indicating you are acting as a delegate.

You can view and manage your delegations in the Settings page.

Best regards,
Procurement Team
      `.trim()

      await sendEmail({
        to: delegation.delegate.email,
        subject: `Approval Authority Delegated to You by ${delegation.delegator.name}`,
        content: emailContent
      })
    } catch (emailError) {
      console.error('Failed to send delegation email:', emailError)
      // Don't fail the delegation creation if email fails
    }

    return NextResponse.json({
      success: true,
      delegation
    })

  } catch (error) {
    console.error('Error creating delegation:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Deactivate a delegation
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const delegationId = searchParams.get('id')

    if (!delegationId) {
      return NextResponse.json(
        { success: false, error: 'Delegation ID is required' },
        { status: 400 }
      )
    }

    // Check if delegation exists and belongs to user
    const delegation = await prisma.userDelegation.findUnique({
      where: { id: delegationId }
    })

    if (!delegation) {
      return NextResponse.json(
        { success: false, error: 'Delegation not found' },
        { status: 404 }
      )
    }

    // Only the delegator or admin can deactivate
    if (delegation.delegatorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Not authorized to delete this delegation' },
        { status: 403 }
      )
    }

    // Deactivate instead of delete (for audit trail)
    await prisma.userDelegation.update({
      where: { id: delegationId },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Delegation deactivated successfully'
    })

  } catch (error) {
    console.error('Error deleting delegation:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

