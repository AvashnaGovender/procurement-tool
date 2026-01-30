import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email-sender'

// Helper function to get currency symbol
function getCurrencySymbol(currency: string | null | undefined, supplierLocation: string | null | undefined): string {
  if (!currency || supplierLocation === 'LOCAL') {
    return 'R'
  }
  
  switch (currency.toUpperCase()) {
    case 'USD': return '$'
    case 'EUR': return '€'
    case 'GBP': return '£'
    case 'ZAR': return 'R'
    default: return currency.toUpperCase() + ' '
  }
}

// Helper function to format annual purchase value as a range
function formatAnnualPurchaseValue(value: number | null | undefined, currency: string | null | undefined, supplierLocation: string | null | undefined): string {
  if (!value) return ''
  
  const symbol = getCurrencySymbol(currency, supplierLocation)
  
  if (value <= 100000) {
    return `${symbol}0 - ${symbol}100,000`
  } else if (value <= 500000) {
    return `${symbol}100,000 - ${symbol}500,000`
  } else if (value <= 1000000) {
    return `${symbol}500,000 - ${symbol}1,000,000`
  } else {
    return `${symbol}1,000,000+`
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: initiationId } = await params
    const body = await request.json()
    const { action, comments, approverRole } = body // action: 'approve' | 'reject', approverRole: 'MANAGER' | 'PROCUREMENT_MANAGER'

    // Get the initiation with approvals
    const initiation = await prisma.supplierInitiation.findUnique({
      where: { id: initiationId },
      include: {
        managerApproval: true,
        procurementApproval: true
      }
    })

    if (!initiation) {
      return NextResponse.json({ error: 'Initiation not found' }, { status: 404 })
    }

    // CRITICAL: Prevent the initiator from approving their own request
    if (initiation.initiatedById === session.user.id) {
      return NextResponse.json({ 
        error: 'You cannot approve a request that you initiated. Only assigned approvers can approve this request.' 
      }, { status: 403 })
    }

    // Check for active delegations where current user is the delegate
    const now = new Date()
    const activeDelegations = await prisma.userDelegation.findMany({
      where: {
        delegateId: session.user.id,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now }
      }
    })
    
    const delegatedUserIds = activeDelegations.map(d => d.delegatorId)
    
    // Check if user has delegation authority
    const hasDelegatedManagerAuthority = activeDelegations.some(d => 
      d.delegatorId === initiation.managerApproval?.approverId &&
      (d.delegationType === 'ALL_APPROVALS' || d.delegationType === 'MANAGER_APPROVALS')
    )
    
    const hasDelegatedProcurementAuthority = activeDelegations.some(d => 
      d.delegatorId === initiation.procurementApproval?.approverId &&
      (d.delegationType === 'ALL_APPROVALS' || d.delegationType === 'PROCUREMENT_APPROVALS')
    )
    
    console.log(`\n🔐 Approval Authorization Check:`)
    console.log(`   User: ${session.user.email} (${session.user.role})`)
    console.log(`   Initiation ID: ${initiationId}`)
    console.log(`   Manager Approval - Assigned to: ${initiation.managerApproval?.approverId || 'None'}`)
    console.log(`   Procurement Approval - Assigned to: ${initiation.procurementApproval?.approverId || 'None'}`)
    console.log(`   Active Delegations: ${activeDelegations.length}`)
    console.log(`   Delegated Manager Authority: ${hasDelegatedManagerAuthority}`)
    console.log(`   Delegated Procurement Authority: ${hasDelegatedProcurementAuthority}`)

    // Determine which approval to update based on user role and assigned approver
    const userRole = session.user.role
    const isAssignedManager = initiation.managerApproval && initiation.managerApproval.approverId === session.user.id
    const isAssignedProcurementManager = initiation.procurementApproval && initiation.procurementApproval.approverId === session.user.id
    const isAdmin = userRole === 'ADMIN'
    const isApprover = userRole === 'APPROVER'
    
    // Can act as manager if: assigned as manager OR has delegated manager authority
    const canApproveAsManager = isAssignedManager || hasDelegatedManagerAuthority
    // Can act as procurement manager if: assigned as procurement manager OR has delegated procurement authority
    const canApproveAsProcurementManager = isAssignedProcurementManager || hasDelegatedProcurementAuthority

    // Determine which approval to process
    // SEQUENTIAL WORKFLOW: Manager must approve first, then Procurement Manager
    let shouldUpdateManagerApproval = false
    let shouldUpdateProcurementApproval = false

    if (isAdmin || isApprover) {
      // Admin or Approver can act as either role, but must specify which
      if (approverRole === 'MANAGER') {
        shouldUpdateManagerApproval = true
      } else if (approverRole === 'PROCUREMENT_MANAGER') {
        // Only allow procurement approval if manager has already approved
        if (initiation.managerApproval?.status === 'APPROVED' && initiation.procurementApproval) {
          shouldUpdateProcurementApproval = true
        } else {
          return NextResponse.json({ 
            error: 'Manager must approve first before procurement approval can be processed.' 
          }, { status: 400 })
        }
      } else {
        // If no role specified, check which approval is pending
        // In sequential workflow, manager approval comes first
        if (initiation.managerApproval?.status === 'PENDING' && canApproveAsManager) {
          shouldUpdateManagerApproval = true
        } else if (initiation.managerApproval?.status === 'APPROVED' && initiation.procurementApproval?.status === 'PENDING' && canApproveAsProcurementManager) {
          shouldUpdateProcurementApproval = true
        }
      }
    } else {
      // Check based on explicit role parameter OR which approvals are pending
      if (approverRole === 'MANAGER') {
        if (canApproveAsManager && initiation.managerApproval?.status === 'PENDING') {
          shouldUpdateManagerApproval = true
        }
      } else if (approverRole === 'PROCUREMENT_MANAGER') {
        // Only allow procurement approval if manager has already approved
        if (initiation.managerApproval?.status !== 'APPROVED') {
          return NextResponse.json({ 
            error: 'Manager must approve first before procurement approval can be processed.' 
          }, { status: 400 })
        }
        if (canApproveAsProcurementManager && initiation.procurementApproval?.status === 'PENDING') {
          shouldUpdateProcurementApproval = true
        }
      } else {
        // No specific role - default to first pending approval they can handle
        // In sequential workflow, manager approval comes first
        if (canApproveAsManager && initiation.managerApproval?.status === 'PENDING') {
          shouldUpdateManagerApproval = true
        } else if (initiation.managerApproval?.status === 'APPROVED' && canApproveAsProcurementManager && initiation.procurementApproval?.status === 'PENDING') {
          shouldUpdateProcurementApproval = true
        }
      }
    }
    
    console.log(`   Can Approve as Manager: ${canApproveAsManager}`)
    console.log(`   Can Approve as Procurement: ${canApproveAsProcurementManager}`)
    console.log(`   Should Update Manager Approval: ${shouldUpdateManagerApproval}`)
    console.log(`   Should Update Procurement Approval: ${shouldUpdateProcurementApproval}`)

    if (!shouldUpdateManagerApproval && !shouldUpdateProcurementApproval) {
      return NextResponse.json({ 
        error: 'Not authorized to approve this initiation. Only the assigned approver or their delegate can approve this request.' 
      }, { status: 403 })
    }

    // Update only the appropriate approval
    if (shouldUpdateManagerApproval && initiation.managerApproval) {
      await prisma.managerApproval.update({
        where: { initiationId },
        data: {
          status: action === 'approve' ? 'APPROVED' : 'REJECTED',
          comments,
          approvedAt: new Date()
        }
      })

      // If manager rejects, update initiation status to REJECTED and notify initiator
      if (action === 'reject') {
        // Update the initiation status to REJECTED so initiator can revise and resubmit
        await prisma.supplierInitiation.update({
          where: { id: initiationId },
          data: {
            status: 'REJECTED'
          }
        })

        try {
          const initiationDetails = await prisma.supplierInitiation.findUnique({
            where: { id: initiationId },
            include: {
              initiatedBy: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          })

          if (initiationDetails && initiationDetails.initiatedBy) {
            const initiatorEmailContent = `
Dear ${initiationDetails.initiatedBy.name},

Your supplier initiation request has been rejected by the Manager.

<strong>Supplier Details:</strong>
- <strong>Supplier Name:</strong> ${initiationDetails.supplierName}
- <strong>Email:</strong> ${initiationDetails.supplierEmail}
- <strong>Business Unit(s):</strong> ${Array.isArray(initiationDetails.businessUnit) ? initiationDetails.businessUnit.map((unit: string) => unit === 'SCHAUENBURG_SYSTEMS_200' ? 'Schauenburg Systems (Pty) Ltd 300' : 'Schauenburg (Pty) Ltd 200').join(', ') : (initiationDetails.businessUnit === 'SCHAUENBURG_SYSTEMS_200' ? 'Schauenburg Systems (Pty) Ltd 300' : 'Schauenburg (Pty) Ltd 200')}
- <strong>Product/Service Category:</strong> ${initiationDetails.productServiceCategory}
- <strong>Requested by:</strong> ${initiationDetails.requesterName}

<strong>Rejection Reason:</strong>
${comments || 'No reason provided'}

<strong>Next Steps:</strong>
You can revise your initiation and resubmit it for approval. Please log in to the system and click "Revise & Resubmit" on the rejected initiation to make the necessary changes and submit again.

If you have any questions or would like to discuss this decision, please contact the Manager.

Best regards,
Schauenburg Systems Procurement System
            `.trim()

            console.log('📧 Sending rejection notification to initiator:', initiationDetails.initiatedBy.email)
            const initiatorEmailResult = await sendEmail({
              to: initiationDetails.initiatedBy.email,
              subject: 'Supplier Initiation Request Rejected - Revision Required',
              content: initiatorEmailContent,
              supplierName: initiationDetails.supplierName,
              businessType: initiationDetails.productServiceCategory
            })

            if (initiatorEmailResult.success) {
              console.log('✅ Initiator rejection notification email sent successfully')
            } else {
              console.error('❌ Failed to send initiator rejection notification email:', initiatorEmailResult.message)
            }
          }
        } catch (emailError) {
          console.error('❌ Error sending initiator rejection notification:', emailError)
          // Don't fail the process if email fails
        }
      }

      // NEW WORKFLOW: If manager approves, email supplier immediately
      if (action === 'approve') {
        console.log('✅ Manager approved - proceeding to email supplier...')
        
        // Get the initiation details
        const initiationDetails = await prisma.supplierInitiation.findUnique({
          where: { id: initiationId },
          include: {
            onboarding: true,
            initiatedBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        })

        // Check if supplier was already created and email already sent
        if (initiationDetails && !initiationDetails.emailSent && !initiationDetails.onboarding) {
          console.log('📧 Manager approved - creating supplier and sending onboarding email...')
          
          // Create a supplier record
          const supplier = await prisma.supplier.create({
            data: {
              supplierCode: `SUP-${Date.now()}`,
              supplierName: initiationDetails.supplierName,
              contactEmail: initiationDetails.supplierEmail,
              companyName: initiationDetails.supplierName,
              contactPerson: initiationDetails.supplierContactPerson,
              businessType: 'OTHER',
              sector: initiationDetails.productServiceCategory,
              status: 'PENDING',
              createdById: initiationDetails.initiatedById
            }
          })

          // Create onboarding record
          const onboardingToken = `init_${initiationId}_${Date.now()}`
          await prisma.supplierOnboarding.create({
            data: {
              supplierId: supplier.id,
              initiationId: initiationId,
              contactName: initiationDetails.supplierContactPerson,
              contactEmail: initiationDetails.supplierEmail,
              businessType: 'OTHER',
              sector: initiationDetails.productServiceCategory,
              currentStep: 'PENDING_SUPPLIER_RESPONSE',
              overallStatus: 'AWAITING_RESPONSE',
              onboardingToken: onboardingToken,
              initiatedById: initiationDetails.initiatedById
            }
          })

          // Send email to supplier
          try {
            const emailSubject = 'Supplier Onboarding - Next Steps'
            const emailContent = `
Dear ${initiationDetails.supplierContactPerson},

Thank you for your interest in becoming a supplier partner with Schauenburg Systems.

Your onboarding request has been reviewed and approved. We're excited to begin working with you!

<strong>Your Request Details:</strong>
- Business Unit: ${Array.isArray(initiationDetails.businessUnit) ? initiationDetails.businessUnit.map((unit: string) => unit === 'SCHAUENBURG_SYSTEMS_200' ? 'Schauenburg Systems (Pty) Ltd 300' : 'Schauenburg (Pty) Ltd 200').join(', ') : (initiationDetails.businessUnit === 'SCHAUENBURG_SYSTEMS_200' ? 'Schauenburg Systems (Pty) Ltd 300' : 'Schauenburg (Pty) Ltd 200')}
- Product/Service Category: ${initiationDetails.productServiceCategory}
${(initiationDetails as any).purchaseType ? `- Purchase Type: ${(initiationDetails as any).purchaseType === 'REGULAR' ? 'Regular Purchase' : (initiationDetails as any).purchaseType === 'ONCE_OFF' ? 'Once-off Purchase' : 'Shared IP'}` : ''}
${(initiationDetails as any).annualPurchaseValue ? `- Annual Purchase Value: ${formatAnnualPurchaseValue((initiationDetails as any).annualPurchaseValue, (initiationDetails as any).currency, (initiationDetails as any).supplierLocation)}` : ''}

<strong>Next Step:</strong>
Please complete your supplier registration by clicking the button below. You'll be guided through uploading the required documentation and compliance information.

{formLink}

If you have any questions, please contact our procurement team.

Best regards,
Schauenburg Systems Procurement Team
            `.trim()
            
            console.log('📧 Sending supplier onboarding email to:', initiationDetails.supplierEmail)
            const emailResult = await sendEmail({
              to: initiationDetails.supplierEmail,
              subject: emailSubject,
              content: emailContent,
              supplierName: initiationDetails.supplierName,
              businessType: initiationDetails.productServiceCategory,
              onboardingToken: onboardingToken
            })
            
            if (emailResult.success) {
              console.log('✅ Supplier onboarding email sent successfully')
            } else {
              console.error('❌ Failed to send supplier onboarding email:', emailResult.message)
            }
          } catch (emailError) {
            console.error('❌ Error sending supplier onboarding email:', emailError)
          }

          // Notify the initiator that their request was approved
          try {
            if (initiationDetails.initiatedBy) {
              const initiationsUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/supplier-initiations`
              const initiatorEmailContent = `
Dear ${initiationDetails.initiatedBy.name},

Great news! The supplier initiation request you submitted has been approved by your manager.

<strong>Supplier Details:</strong>
- <strong>Supplier Name:</strong> ${initiationDetails.supplierName}
- <strong>Email:</strong> ${initiationDetails.supplierEmail}
- <strong>Business Unit(s):</strong> ${Array.isArray(initiationDetails.businessUnit) ? initiationDetails.businessUnit.map((unit: string) => unit === 'SCHAUENBURG_SYSTEMS_200' ? 'Schauenburg Systems (Pty) Ltd 300' : 'Schauenburg (Pty) Ltd 200').join(', ') : (initiationDetails.businessUnit === 'SCHAUENBURG_SYSTEMS_200' ? 'Schauenburg Systems (Pty) Ltd 300' : 'Schauenburg (Pty) Ltd 200')}
- <strong>Product/Service Category:</strong> ${initiationDetails.productServiceCategory}

The supplier has been sent an email with instructions to complete their onboarding documentation. You can track the progress of this supplier onboarding in your Supplier Initiations dashboard.

<div style="text-align: center; margin: 30px 0;">
  <a href="${initiationsUrl}" target="_blank" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none; padding: 15px 40px; border-radius: 8px; border: none;">View Your Initiations</a>
</div>

Or copy this link to your browser: ${initiationsUrl}

Best regards,
Schauenburg Systems Procurement Team
              `.trim()
              
              console.log('📧 Sending approval notification to initiator:', initiationDetails.initiatedBy.email)
              const initiatorEmailResult = await sendEmail({
                to: initiationDetails.initiatedBy.email,
                subject: 'Supplier Onboarding Request Approved',
                content: initiatorEmailContent,
                supplierName: initiationDetails.supplierName,
                businessType: initiationDetails.productServiceCategory
              })
              
              if (initiatorEmailResult.success) {
                console.log('✅ Initiator notification email sent successfully')
              } else {
                console.error('❌ Failed to send initiator notification email:', initiatorEmailResult.message)
              }
            }
          } catch (initiatorEmailError) {
            console.error('❌ Error sending initiator notification:', initiatorEmailError)
          }

          // Update initiation status
          await prisma.supplierInitiation.update({
            where: { id: initiationId },
            data: { 
              status: 'APPROVED',
              emailSent: true,
              emailSentAt: new Date()
            }
          })
        } else if (initiationDetails) {
          console.log('⚠️ Skipping supplier creation - email already sent or onboarding record exists')
        }
      }
    }

    // NOTE: Procurement approval step has been removed from the workflow
    // Manager approval now directly triggers supplier email
    
    if (shouldUpdateProcurementApproval && initiation.procurementApproval) {
      // This code path should no longer be reached in the new workflow
      console.warn('⚠️ Procurement approval processing attempted but this step has been removed from workflow')
      
      // For backward compatibility with any old records that still have procurement approvals
      if (action === 'reject') {
        try {
          const initiationDetails = await prisma.supplierInitiation.findUnique({
            where: { id: initiationId },
            include: {
              initiatedBy: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              },
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
              }
            }
          })

          if (initiationDetails) {
            // Email to initiator
            if (initiationDetails.initiatedBy) {
              const initiatorEmailContent = `
Dear ${initiationDetails.initiatedBy.name},

Your supplier initiation request has been rejected by the Procurement Manager.

<strong>Supplier Details:</strong>
- <strong>Supplier Name:</strong> ${initiationDetails.supplierName}
- <strong>Email:</strong> ${initiationDetails.supplierEmail}
- <strong>Business Unit(s):</strong> ${Array.isArray(initiationDetails.businessUnit) ? initiationDetails.businessUnit.map((unit: string) => unit === 'SCHAUENBURG_SYSTEMS_200' ? 'Schauenburg Systems (Pty) Ltd 300' : 'Schauenburg (Pty) Ltd 200').join(', ') : (initiationDetails.businessUnit === 'SCHAUENBURG_SYSTEMS_200' ? 'Schauenburg Systems (Pty) Ltd 300' : 'Schauenburg (Pty) Ltd 200')}
- <strong>Product/Service Category:</strong> ${initiationDetails.productServiceCategory}
- <strong>Requested by:</strong> ${initiationDetails.requesterName}

<strong>Manager Status:</strong> ✅ Approved
<strong>Procurement Manager Status:</strong> ❌ Rejected

<strong>Rejection Reason:</strong>
${comments || 'No reason provided'}

If you have any questions or would like to discuss this decision, please contact the Procurement Manager.

Best regards,
Schauenburg Systems Procurement System
              `.trim()

              console.log('📧 Sending procurement rejection notification to initiator:', initiationDetails.initiatedBy.email)
              const initiatorEmailResult = await sendEmail({
                to: initiationDetails.initiatedBy.email,
                subject: 'Supplier Initiation Request Rejected by Procurement Manager',
                content: initiatorEmailContent,
                supplierName: initiationDetails.supplierName,
                businessType: initiationDetails.productServiceCategory
              })

              if (initiatorEmailResult.success) {
                console.log('✅ Initiator procurement rejection notification email sent successfully')
              } else {
                console.error('❌ Failed to send initiator procurement rejection notification email:', initiatorEmailResult.message)
              }
            }

            // Email to manager
            if (initiationDetails.managerApproval?.approver) {
              const managerEmailContent = `
Dear ${initiationDetails.managerApproval.approver.name},

A supplier initiation request that you approved has been rejected by the Procurement Manager.

<strong>Supplier Details:</strong>
- <strong>Supplier Name:</strong> ${initiationDetails.supplierName}
- <strong>Email:</strong> ${initiationDetails.supplierEmail}
- <strong>Business Unit(s):</strong> ${Array.isArray(initiationDetails.businessUnit) ? initiationDetails.businessUnit.map((unit: string) => unit === 'SCHAUENBURG_SYSTEMS_200' ? 'Schauenburg Systems (Pty) Ltd 300' : 'Schauenburg (Pty) Ltd 200').join(', ') : (initiationDetails.businessUnit === 'SCHAUENBURG_SYSTEMS_200' ? 'Schauenburg Systems (Pty) Ltd 300' : 'Schauenburg (Pty) Ltd 200')}
- <strong>Product/Service Category:</strong> ${initiationDetails.productServiceCategory}
- <strong>Requested by:</strong> ${initiationDetails.requesterName}

<strong>Manager Status:</strong> ✅ Approved
<strong>Procurement Manager Status:</strong> ❌ Rejected

<strong>Rejection Reason:</strong>
${comments || 'No reason provided'}

The initiator has been notified of this rejection.

Best regards,
Schauenburg Systems Procurement System
              `.trim()

              console.log('📧 Sending procurement rejection notification to manager:', initiationDetails.managerApproval.approver.email)
              const managerEmailResult = await sendEmail({
                to: initiationDetails.managerApproval.approver.email,
                subject: 'Supplier Initiation Request Rejected by Procurement Manager',
                content: managerEmailContent,
                supplierName: initiationDetails.supplierName,
                businessType: initiationDetails.productServiceCategory
              })

              if (managerEmailResult.success) {
                console.log('✅ Manager procurement rejection notification email sent successfully')
              } else {
                console.error('❌ Failed to send manager procurement rejection notification email:', managerEmailResult.message)
              }
            }
          }
        } catch (emailError) {
          console.error('❌ Error sending procurement rejection notifications:', emailError)
          // Don't fail the process if email fails
        }
      }
    }

    // NEW WORKFLOW: Status is updated within the manager approval section above
    // No need for separate status update logic here since supplier email is sent immediately after manager approval
    console.log('✅ Approval processing complete')

    return NextResponse.json({ 
      success: true, 
      message: `Initiation ${action}d successfully` 
    })

  } catch (error) {
    console.error('Error processing approval:', error)
    return NextResponse.json({ 
      error: 'Failed to process approval' 
    }, { status: 500 })
  }
}
