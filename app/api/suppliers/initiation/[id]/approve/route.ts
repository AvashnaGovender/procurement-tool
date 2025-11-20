import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email-sender'

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
    let shouldUpdateManagerApproval = false
    let shouldUpdateProcurementApproval = false

    if (isAdmin || isApprover) {
      // Admin or Approver can act as either role, but must specify which
      if (approverRole === 'MANAGER') {
        shouldUpdateManagerApproval = true
      } else if (approverRole === 'PROCUREMENT_MANAGER') {
        shouldUpdateProcurementApproval = true
      } else {
        // If no role specified, check which approval is pending
        if (initiation.managerApproval?.status === 'PENDING' && canApproveAsManager) {
          shouldUpdateManagerApproval = true
        } else if (initiation.procurementApproval?.status === 'PENDING' && canApproveAsProcurementManager) {
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
        if (canApproveAsProcurementManager && initiation.procurementApproval?.status === 'PENDING') {
          shouldUpdateProcurementApproval = true
        }
      } else {
        // No specific role - default to first pending approval they can handle
        if (canApproveAsManager && initiation.managerApproval?.status === 'PENDING') {
          shouldUpdateManagerApproval = true
        } else if (canApproveAsProcurementManager && initiation.procurementApproval?.status === 'PENDING') {
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
    }

    if (shouldUpdateProcurementApproval && initiation.procurementApproval) {
      await prisma.procurementApproval.update({
        where: { initiationId },
        data: {
          status: action === 'approve' ? 'APPROVED' : 'REJECTED',
          comments,
          approvedAt: new Date()
        }
      })
    }

    // Update initiation status based on approvals
    const updatedInitiation = await prisma.supplierInitiation.findUnique({
      where: { id: initiationId },
      include: {
        managerApproval: true,
        procurementApproval: true
      }
    })

    if (updatedInitiation) {
      let newStatus = initiation.status

      if (action === 'reject') {
        newStatus = 'REJECTED'
        console.log('❌ Initiation rejected')
      } else {
        // Check if both approvals are now complete
        const managerApproved = updatedInitiation.managerApproval?.status === 'APPROVED'
        const procurementApproved = updatedInitiation.procurementApproval?.status === 'APPROVED'

        console.log(`\n📊 Approval Status Check:`)
        console.log(`   Manager Approved: ${managerApproved}`)
        console.log(`   Procurement Approved: ${procurementApproved}`)

        if (managerApproved && procurementApproved) {
          newStatus = 'APPROVED'
          console.log('✅ Both approvals complete - status: APPROVED')
        } else if (managerApproved) {
          newStatus = 'MANAGER_APPROVED'
          console.log('⏳ Manager approved, waiting for procurement - status: MANAGER_APPROVED')
        } else if (procurementApproved) {
          newStatus = 'PROCUREMENT_APPROVED'
          console.log('⏳ Procurement approved, waiting for manager - status: PROCUREMENT_APPROVED')
        }
      }

      await prisma.supplierInitiation.update({
        where: { id: initiationId },
        data: { status: newStatus }
      })

      // If both approvals are complete, create supplier record and trigger email sending
      if (newStatus === 'APPROVED') {
        // Get the initiation details
        const initiationDetails = await prisma.supplierInitiation.findUnique({
          where: { id: initiationId },
          include: {
            onboarding: true
          }
        })

        // IMPORTANT: Check if supplier was already created and email already sent
        // This prevents duplicate emails if the approval endpoint is called multiple times
        if (initiationDetails && !initiationDetails.emailSent && !initiationDetails.onboarding) {
          console.log('📧 Both approvals complete - proceeding with supplier creation and email...')
          // Create a supplier record with AWAITING_DOCS status
          const supplier = await prisma.supplier.create({
            data: {
              supplierCode: `SUP-${Date.now()}`, // Generate unique supplier code
              supplierName: initiationDetails.supplierName,
              contactEmail: initiationDetails.supplierEmail,
              companyName: initiationDetails.supplierName,
              contactPerson: initiationDetails.supplierContactPerson,
              businessType: 'OTHER', // Default, will be updated when supplier submits
              sector: initiationDetails.productServiceCategory, // Store the category from initiation
              status: 'PENDING',
              createdById: initiationDetails.initiatedById
            }
          })

          // Create onboarding record linked to the supplier
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
              initiatedById: initiationDetails.initiatedById
            }
          })

          // Send email to supplier using existing email functionality
          try {
            console.log('📧 Sending supplier onboarding email to:', initiationDetails.supplierEmail)
            
            // Generate onboarding token for the supplier
            const onboardingToken = `init_${initiationId}_${Date.now()}`
            
            // Update the onboarding record with the token
            await prisma.supplierOnboarding.update({
              where: { supplierId: supplier.id },
              data: { onboardingToken }
            })
            
            // Prepare email content  
            const emailSubject = 'Supplier Onboarding - Next Steps'
            const emailContent = `
Dear ${initiationDetails.supplierContactPerson},

Thank you for your interest in becoming a supplier partner with Schauenburg Systems.

Your onboarding request has been reviewed and approved. We're excited to begin working with you!

<strong>Your Request Details:</strong>
- Business Unit: ${initiationDetails.businessUnit === 'SCHAUENBURG_SYSTEMS_200' ? 'Schauenburg Systems 200' : 'Schauenburg (Pty) Ltd 300'}
- Product/Service Category: ${initiationDetails.productServiceCategory}
- Purchase Type: ${initiationDetails.regularPurchase ? 'Regular Purchase' : ''}${initiationDetails.regularPurchase && initiationDetails.onceOffPurchase ? ', ' : ''}${initiationDetails.onceOffPurchase ? 'Once-off Purchase' : ''}
${initiationDetails.annualPurchaseValue ? `- Annual Purchase Value: R${initiationDetails.annualPurchaseValue.toLocaleString()}` : ''}

<strong>Next Step:</strong>
Please complete your supplier registration by clicking the button below. You'll be guided through uploading the required documentation and compliance information.

{formLink}

If you have any questions, please contact our procurement team.

Best regards,
Schauenburg Systems Procurement Team
            `.trim()
            
            // Send the email
            console.log('\n📧 ===== SENDING SUPPLIER ONBOARDING EMAIL =====')
            console.log('   To:', initiationDetails.supplierEmail)
            console.log('   Subject:', emailSubject)
            console.log('   Supplier Name:', initiationDetails.supplierName)
            console.log('   Has Onboarding Token:', !!onboardingToken)
            console.log('================================================\n')
            
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
              console.log('   Message ID:', emailResult.emailId)
            } else {
              console.error('❌ Failed to send supplier onboarding email:', emailResult.message)
            }
            
            // Notify the person who initiated the request
            try {
              const initiator = await prisma.user.findUnique({
                where: { id: initiationDetails.initiatedById }
              })
              
              if (initiator) {
                const approvalsUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/supplier-submissions`
                const initiatorEmailContent = `
Dear ${initiator.name},

Great news! The supplier initiation request you submitted has been approved by both the Manager and Procurement Manager.

<strong>Supplier Details:</strong>
- <strong>Supplier Name:</strong> ${initiationDetails.supplierName}
- <strong>Email:</strong> ${initiationDetails.supplierEmail}
- <strong>Business Unit:</strong> ${initiationDetails.businessUnit === 'SCHAUENBURG_SYSTEMS_200' ? 'Schauenburg Systems 200' : 'Schauenburg (Pty) Ltd 300'}
- <strong>Product/Service Category:</strong> ${initiationDetails.productServiceCategory}

The supplier has been sent an email with instructions to complete their onboarding documentation. You can track the progress of this supplier onboarding in the Supplier Submissions dashboard.

<div style="text-align: center; margin: 30px 0;">
  <a href="${approvalsUrl}" target="_blank" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none; padding: 15px 40px; border-radius: 8px; border: none;">View Supplier Submissions</a>
</div>

Or copy this link to your browser: ${approvalsUrl}

Best regards,
Schauenburg Systems Procurement Team
                `.trim()
                
                console.log('📧 Sending approval notification to initiator:', initiator.email)
                const initiatorEmailResult = await sendEmail({
                  to: initiator.email,
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
              // Don't fail the process if this email fails
            }
          } catch (emailError) {
            console.error('❌ Error sending supplier onboarding email:', emailError)
            // Don't fail the entire process if email fails
          }

          // Update initiation status
          await prisma.supplierInitiation.update({
            where: { id: initiationId },
            data: { 
              status: 'SUPPLIER_EMAILED',
              emailSent: true,
              emailSentAt: new Date()
            }
          })
        } else if (initiationDetails) {
          console.log('⚠️ Skipping supplier creation - email already sent or onboarding record exists')
          console.log(`   emailSent: ${initiationDetails.emailSent}`)
          console.log(`   onboarding exists: ${!!initiationDetails.onboarding}`)
        }
      }
    }

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
