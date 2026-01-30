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

    // All authenticated users can view initiations
    // (Filtering logic below ensures users only see their own or ones they need to approve)

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

    console.log(`\n📋 Fetching initiations for user: ${session.user.email}`)
    console.log(`   User ID: ${session.user.id}`)
    console.log(`   User Role: ${session.user.role}`)
    console.log(`   Active delegations: ${activeDelegations.length}`)

    // Build where clause based on user role
    // - Admins can see all initiations
    // - Users with approval responsibilities see initiations they need to approve OR created
    // - Regular users only see their own initiations
    let userFilterClause = {}
    
    if (session.user.role !== 'ADMIN') {
      console.log(`   ⚙️ Building filter for non-admin user`)
      
      // Build OR conditions: initiations they created OR where they are assigned as approver
      const orConditions = [
        { initiatedById: session.user.id }
      ]
      
      // Always check if user is assigned as manager approver (regardless of role)
      // This allows users who are assigned as managers to specific users to see their initiations
      orConditions.push({ 
        managerApproval: { 
          approverId: session.user.id 
        } 
      })
      console.log(`   ✅ Added manager approval filter for user ID: ${session.user.id}`)
      
      // Always check if user is assigned as procurement approver (regardless of role)
      orConditions.push({ 
        procurementApproval: { 
          approverId: session.user.id 
        } 
      })
      console.log(`   ✅ Added procurement approval filter for user ID: ${session.user.id}`)
      
      userFilterClause = { OR: orConditions }
      console.log(`   📝 OR conditions count: ${orConditions.length}`)
    } else {
      console.log(`   Admin user - no filtering`)
    }
    
    console.log(`   User filter clause:`, JSON.stringify(userFilterClause, null, 2))

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
            id: true,
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
      orderBy: [
        {
          submittedAt: 'desc'
        },
        {
          createdAt: 'desc'
        }
      ]
    })

    console.log(`\n📊 Found ${initiations.length} initiations for user ${session.user.email} (role: ${session.user.role})`)
    
    // Log each initiation for debugging
    initiations.forEach((init, index) => {
      console.log(`   [${index + 1}] ${init.supplierName}`)
      console.log(`       Status: ${init.status}`)
      console.log(`       InitiatedBy: ${init.initiatedById} (${init.initiatedBy?.name})`)
      console.log(`       HasOnboarding: ${!!init.onboarding}`)
      
      if (init.managerApproval) {
        console.log(`       Manager Approval:`)
        console.log(`         Status: ${init.managerApproval.status}`)
        console.log(`         ApproverId: ${init.managerApproval.approverId}`)
        console.log(`         Approver Name: ${init.managerApproval.approver.name}`)
        console.log(`         Matches Current User? ${init.managerApproval.approverId === session.user.id ? '✅ YES' : '❌ NO'}`)
      } else {
        console.log(`       Manager Approval: ❌ NULL`)
      }
      
      if (init.procurementApproval) {
        console.log(`       Procurement Approval:`)
        console.log(`         Status: ${init.procurementApproval.status}`)
        console.log(`         ApproverId: ${init.procurementApproval.approverId}`)
        console.log(`         Approver Name: ${init.procurementApproval.approver.name}`)
        console.log(`         Matches Current User? ${init.procurementApproval.approverId === session.user.id ? '✅ YES' : '❌ NO'}`)
      } else {
        console.log(`       Procurement Approval: ❌ NULL`)
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
        createdAt: initiation.createdAt,
        productServiceCategory: initiation.productServiceCategory,
        relationshipDeclaration: initiation.relationshipDeclaration,
        processReadUnderstood: initiation.processReadUnderstood,
        dueDiligenceCompleted: initiation.dueDiligenceCompleted,
        initiatedById: initiation.initiatedById, // Include initiator ID for frontend filtering
        initiatedBy: {
          name: initiation.initiatedBy?.name || 'Unknown',
          email: initiation.initiatedBy?.email || 'Unknown'
        },
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
        purchaseType: initiation.purchaseType,
        regularPurchase: initiation.regularPurchase,
        onceOffPurchase: initiation.onceOffPurchase,
        annualPurchaseValue: initiation.annualPurchaseValue,
        creditApplication: initiation.creditApplication,
        creditApplicationReason: initiation.creditApplicationReason,
        onboardingReason: initiation.onboardingReason,
        supplierLocation: initiation.supplierLocation,
        currency: initiation.currency,
        customCurrency: initiation.customCurrency,
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


