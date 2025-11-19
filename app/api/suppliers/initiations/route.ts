import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to view initiations
    const canView = ['ADMIN', 'MANAGER', 'PROCUREMENT_MANAGER', 'APPROVER'].includes(session.user.role)
    
    if (!canView) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check for active delegations where current user is the delegate
    const now = new Date()
    const activeDelegations = await prisma.userDelegation.findMany({
      where: {
        delegateId: session.user.id,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now }
      },
      select: {
        delegatorId: true,
        delegationType: true
      }
    })

    // Get IDs of users this person is delegating for
    const delegatedUserIds = activeDelegations.map(d => d.delegatorId)

    // Build where clause based on user role
    // - Admins can see all initiations
    // - Managers/Procurement Managers see initiations they need to approve OR created
    // - Regular users only see their own initiations
    let userFilterClause = {}
    
    if (session.user.role !== 'ADMIN') {
      if (session.user.role === 'MANAGER' || session.user.role === 'PROCUREMENT_MANAGER') {
        // Managers see initiations where they are the approver OR they created it
        userFilterClause = {
          OR: [
            { initiatedById: session.user.id },
            ...(session.user.role === 'MANAGER' ? [{ 
              managerApproval: { 
                approverId: session.user.id 
              } 
            }] : []),
            ...(session.user.role === 'PROCUREMENT_MANAGER' ? [{ 
              procurementApproval: { 
                approverId: session.user.id 
              } 
            }] : [])
          ]
        }
      } else {
        // Regular users only see their own
        userFilterClause = { initiatedById: session.user.id }
      }
    }

    const initiations = await prisma.supplierInitiation.findMany({
      include: {
        managerApproval: {
          include: {
            approver: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        procurementApproval: {
          include: {
            approver: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        initiatedBy: {
          select: {
            name: true,
            email: true
          }
        },
        onboarding: {
          select: {
            id: true,
            supplierFormSubmitted: true
          }
        }
      },
      where: {
        AND: [
          // User filter (admins see all, users see their own)
          userFilterClause,
          // Exclude initiations where supplier has submitted their form
          // Show initiations that either:
          // 1. Don't have an onboarding record yet, OR
          // 2. Have an onboarding record but supplier hasn't submitted form
          {
            OR: [
              {
                onboarding: null
              },
              {
                onboarding: {
                  supplierFormSubmitted: false
                }
              }
            ]
          }
        ]
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    const formattedInitiations = initiations.map(initiation => {
      // Check if this initiation is visible to the user via delegation
      let isDelegated = false
      let delegationType = null
      
      // Check manager approval delegation
      if (initiation.managerApproval && delegatedUserIds.includes(initiation.managerApproval.approverId)) {
        const delegation = activeDelegations.find(d => 
          d.delegatorId === initiation.managerApproval.approverId &&
          (d.delegationType === 'ALL_APPROVALS' || d.delegationType === 'MANAGER_APPROVALS')
        )
        if (delegation) {
          isDelegated = true
          delegationType = 'MANAGER'
        }
      }
      
      // Check procurement approval delegation
      if (initiation.procurementApproval && delegatedUserIds.includes(initiation.procurementApproval.approverId)) {
        const delegation = activeDelegations.find(d => 
          d.delegatorId === initiation.procurementApproval.approverId &&
          (d.delegationType === 'ALL_APPROVALS' || d.delegationType === 'PROCUREMENT_APPROVALS')
        )
        if (delegation) {
          isDelegated = true
          delegationType = delegationType === 'MANAGER' ? 'BOTH' : 'PROCUREMENT'
        }
      }

      return {
        id: initiation.id,
        status: initiation.status,
        supplierName: initiation.supplierName,
        supplierEmail: initiation.supplierEmail,
        supplierContactPerson: initiation.supplierContactPerson,
        businessUnit: initiation.businessUnit,
        requesterName: initiation.requesterName,
        submittedAt: initiation.submittedAt,
        productServiceCategory: initiation.productServiceCategory,
        relationshipDeclaration: initiation.relationshipDeclaration,
        processReadUnderstood: initiation.processReadUnderstood,
        dueDiligenceCompleted: initiation.dueDiligenceCompleted,
        initiatedById: initiation.initiatedById, // Include initiator ID for frontend filtering
        managerApproval: initiation.managerApproval ? {
          status: initiation.managerApproval.status,
          approver: initiation.managerApproval.approver.name,
          approverId: initiation.managerApproval.approver.id,
          approvedAt: initiation.managerApproval.approvedAt,
          comments: initiation.managerApproval.comments
        } : null,
        procurementApproval: initiation.procurementApproval ? {
          status: initiation.procurementApproval.status,
          approver: initiation.procurementApproval.approver.name,
          approverId: initiation.procurementApproval.approver.id,
          approvedAt: initiation.procurementApproval.approvedAt,
          comments: initiation.procurementApproval.comments
        } : null,
        regularPurchase: initiation.regularPurchase,
        annualPurchaseValue: initiation.annualPurchaseValue,
        onceOffPurchase: initiation.onceOffPurchase,
        creditApplication: initiation.creditApplication,
        creditApplicationReason: initiation.creditApplicationReason,
        onboardingReason: initiation.onboardingReason,
        isDelegated,
        delegationType
      }
    })

    return NextResponse.json(formattedInitiations)

  } catch (error) {
    console.error('Error fetching initiations:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch initiations' 
    }, { status: 500 })
  }
}


