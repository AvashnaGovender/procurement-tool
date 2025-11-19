import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email-sender'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting supplier initiation API call')
    
    const session = await getServerSession(authOptions)
    console.log('Session:', session?.user?.id ? 'Authenticated' : 'Not authenticated')
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Request body:', body)
    const {
      businessUnit,
      processReadUnderstood,
      dueDiligenceCompleted,
      supplierName,
      supplierEmail,
      supplierContactPerson,
      productServiceCategory,
      requesterName,
      relationshipDeclaration,
      regularPurchase,
      annualPurchaseValue,
      creditApplication,
      creditApplicationReason,
      onceOffPurchase,
      onboardingReason
    } = body

    // Validate required fields
    if (!businessUnit || !processReadUnderstood || !dueDiligenceCompleted || 
        !supplierName || !supplierEmail || !supplierContactPerson || !productServiceCategory || !requesterName || 
        !relationshipDeclaration || !onboardingReason) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Validate that at least one purchase type is selected
    if (!regularPurchase && !onceOffPurchase) {
      return NextResponse.json({ 
        error: 'Please select at least one purchase type (Regular or Once-off)' 
      }, { status: 400 })
    }

    // Validate annual purchase value if regular purchase is selected
    if (regularPurchase && (!annualPurchaseValue || parseFloat(annualPurchaseValue) <= 0)) {
      return NextResponse.json({ 
        error: 'Please enter a valid annual purchase value for regular purchases' 
      }, { status: 400 })
    }

    // Validate credit application reason if credit application is not selected
    if (!creditApplication && !creditApplicationReason) {
      return NextResponse.json({ 
        error: 'Please provide a reason for not requiring credit application' 
      }, { status: 400 })
    }

    // Get the current user with their manager relationship
    console.log('Fetching user with manager relationship...')
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        manager: true
      }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('Current user:', currentUser.email, 'Manager:', currentUser.manager?.email || 'None')

    // Create the supplier initiation
    console.log('Creating supplier initiation...')
    const initiation = await prisma.supplierInitiation.create({
      data: {
        businessUnit,
        processReadUnderstood,
        dueDiligenceCompleted,
        supplierName,
        supplierEmail,
        supplierContactPerson,
        productServiceCategory,
        requesterName,
        relationshipDeclaration,
        regularPurchase,
        annualPurchaseValue: annualPurchaseValue ? parseFloat(annualPurchaseValue) : null,
        creditApplication,
        creditApplicationReason: creditApplication ? null : creditApplicationReason,
        onceOffPurchase,
        onboardingReason,
        initiatedById: session.user.id,
        status: 'SUBMITTED'
      }
    })
    console.log('Initiation created:', initiation.id)

    // Create approval records for the user's assigned manager and a procurement manager
    let assignedManager = null
    let assignedProcurementManager = null

    // Use the user's assigned manager if they have one
    if (currentUser.managerId && currentUser.manager && currentUser.manager.isActive) {
      assignedManager = currentUser.manager
      console.log('Using assigned manager:', assignedManager.email)
      
      await prisma.managerApproval.create({
        data: {
          initiationId: initiation.id,
          approverId: assignedManager.id,
          status: 'PENDING'
        }
      })
    } else {
      // Fallback: Find any active manager if user doesn't have one assigned
      console.log('No manager assigned to user, looking for any active manager...')
      const fallbackManagers = await prisma.user.findMany({
        where: {
          role: 'MANAGER',
          isActive: true
        },
        take: 1
      })
      
      if (fallbackManagers.length > 0) {
        assignedManager = fallbackManagers[0]
        console.log('Using fallback manager:', assignedManager.email)
        
        await prisma.managerApproval.create({
          data: {
            initiationId: initiation.id,
            approverId: assignedManager.id,
            status: 'PENDING'
          }
        })
      } else {
        console.warn('⚠️ No manager found for approval!')
      }
    }

    // Find an active procurement manager
    const procurementManagers = await prisma.user.findMany({
      where: {
        role: 'PROCUREMENT_MANAGER',
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 1
    })

    if (procurementManagers.length > 0) {
      assignedProcurementManager = procurementManagers[0]
      console.log('Using procurement manager:', assignedProcurementManager.email)
      
      await prisma.procurementApproval.create({
        data: {
          initiationId: initiation.id,
          approverId: procurementManagers[0].id,
          status: 'PENDING'
        }
      })
    } else {
      console.warn('⚠️ No procurement manager found for approval!')
    }

    // Check for active delegations
    const now = new Date()
    const managerDelegations = assignedManager ? await prisma.userDelegation.findMany({
      where: {
        delegatorId: assignedManager.id,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
        OR: [
          { delegationType: 'ALL_APPROVALS' },
          { delegationType: 'MANAGER_APPROVALS' }
        ]
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
    }) : []
    
    const procurementDelegations = assignedProcurementManager ? await prisma.userDelegation.findMany({
      where: {
        delegatorId: assignedProcurementManager.id,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
        OR: [
          { delegationType: 'ALL_APPROVALS' },
          { delegationType: 'PROCUREMENT_APPROVALS' }
        ]
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
    }) : []

    console.log(`📋 Manager has ${managerDelegations.length} active delegation(s)`)
    console.log(`📋 Procurement Manager has ${procurementDelegations.length} active delegation(s)`)

    // Send approval emails to managers
    try {
      console.log('📧 Sending approval emails to managers...')
      
      // Manager approval email
      const approvalsUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/approvals`
      const managerEmailContent = `
Dear Manager,

A new supplier initiation request has been submitted and requires your approval.

<strong>Request Details:</strong>
- <strong>Supplier:</strong> ${supplierName}
- <strong>Email:</strong> ${supplierEmail}
- <strong>Business Unit:</strong> ${businessUnit === 'SCHAUENBURG_SYSTEMS_200' ? 'Schauenburg Systems 200' : 'Schauenburg (Pty) Ltd 300'}
- <strong>Product/Service Category:</strong> ${productServiceCategory}
- <strong>Requested by:</strong> ${requesterName}
- <strong>Purchase Type:</strong> ${regularPurchase ? 'Regular Purchase' : ''}${regularPurchase && onceOffPurchase ? ', ' : ''}${onceOffPurchase ? 'Once-off Purchase' : ''}
${annualPurchaseValue ? `- <strong>Annual Purchase Value:</strong> R${parseFloat(annualPurchaseValue).toLocaleString()}` : ''}

<strong>Reason for Onboarding:</strong>
${onboardingReason}

Please click the button below to review and approve this request:

<div style="text-align: center; margin: 30px 0;">
  <a href="${approvalsUrl}" target="_blank" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none; padding: 15px 40px; border-radius: 8px; border: none;">Review & Approve Request</a>
</div>

Or copy this link to your browser: ${approvalsUrl}

Best regards,
Schauenburg Systems Procurement System
      `.trim()
      
      // Send manager approval email to assigned manager
      if (assignedManager) {
        console.log('📧 Sending manager approval email to:', assignedManager.email)
        const managerEmailResult = await sendEmail({
          to: assignedManager.email,
          subject: 'Supplier Approval Required - New Onboarding Request',
          content: managerEmailContent,
          supplierName: supplierName,
          businessType: productServiceCategory
        })
        console.log('Manager email result:', managerEmailResult)
      }
      
      // Send manager approval email to delegates
      for (const delegation of managerDelegations) {
        const delegateEmailContent = `
Dear ${delegation.delegate.name},

You are receiving this email because ${assignedManager?.name || 'a manager'} has delegated their approval authority to you.

A new supplier initiation request has been submitted and requires approval.

<strong>Request Details:</strong>
- <strong>Supplier:</strong> ${supplierName}
- <strong>Email:</strong> ${supplierEmail}
- <strong>Business Unit:</strong> ${businessUnit === 'SCHAUENBURG_SYSTEMS_200' ? 'Schauenburg Systems 200' : 'Schauenburg (Pty) Ltd 300'}
- <strong>Product/Service Category:</strong> ${productServiceCategory}
- <strong>Requested by:</strong> ${requesterName}
- <strong>Purchase Type:</strong> ${regularPurchase ? 'Regular Purchase' : ''}${regularPurchase && onceOffPurchase ? ', ' : ''}${onceOffPurchase ? 'Once-off Purchase' : ''}
${annualPurchaseValue ? `- <strong>Annual Purchase Value:</strong> R${parseFloat(annualPurchaseValue).toLocaleString()}` : ''}

<strong>Reason for Onboarding:</strong>
${onboardingReason}

<strong>Note:</strong> You are acting as a delegate for ${assignedManager?.name || 'the manager'}.

Please click the button below to review and approve this request:

<div style="text-align: center; margin: 30px 0;">
  <a href="${approvalsUrl}" target="_blank" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none; padding: 15px 40px; border-radius: 8px; border: none;">Review & Approve Request</a>
</div>

Or copy this link to your browser: ${approvalsUrl}

Best regards,
Schauenburg Systems Procurement System
        `.trim()
        
        console.log('📧 Sending manager approval email to delegate:', delegation.delegate.email)
        const delegateEmailResult = await sendEmail({
          to: delegation.delegate.email,
          subject: 'Supplier Approval Required - New Onboarding Request (Delegated)',
          content: delegateEmailContent,
          supplierName: supplierName,
          businessType: productServiceCategory
        })
        console.log('Delegate email result:', delegateEmailResult)
      }
      
      // Procurement approval email
      const procurementEmailContent = `
Dear Procurement Manager,

A new supplier initiation request has been submitted and requires your approval.

<strong>Request Details:</strong>
- <strong>Supplier:</strong> ${supplierName}
- <strong>Email:</strong> ${supplierEmail}
- <strong>Business Unit:</strong> ${businessUnit === 'SCHAUENBURG_SYSTEMS_200' ? 'Schauenburg Systems 200' : 'Schauenburg (Pty) Ltd 300'}
- <strong>Product/Service Category:</strong> ${productServiceCategory}
- <strong>Requested by:</strong> ${requesterName}
- <strong>Purchase Type:</strong> ${regularPurchase ? 'Regular Purchase' : ''}${regularPurchase && onceOffPurchase ? ', ' : ''}${onceOffPurchase ? 'Once-off Purchase' : ''}
${annualPurchaseValue ? `- <strong>Annual Purchase Value:</strong> R${parseFloat(annualPurchaseValue).toLocaleString()}` : ''}

<strong>Reason for Onboarding:</strong>
${onboardingReason}

Please click the button below to review and approve this request:

<div style="text-align: center; margin: 30px 0;">
  <a href="${approvalsUrl}" target="_blank" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none; padding: 15px 40px; border-radius: 8px; border: none;">Review & Approve Request</a>
</div>

Or copy this link to your browser: ${approvalsUrl}

Best regards,
Schauenburg Systems Procurement System
      `.trim()
      
      // Send procurement approval email to assigned procurement manager
      if (assignedProcurementManager) {
        console.log('📧 Sending procurement approval email to:', assignedProcurementManager.email)
        const procurementEmailResult = await sendEmail({
          to: assignedProcurementManager.email,
          subject: 'Supplier Approval Required - New Onboarding Request',
          content: procurementEmailContent,
          supplierName: supplierName,
          businessType: productServiceCategory
        })
        console.log('Procurement email result:', procurementEmailResult)
        
        if (procurementEmailResult.success) {
          console.log('✅ Procurement approval email sent successfully')
        } else {
          console.error('❌ Failed to send procurement approval email:', procurementEmailResult.message)
        }
      }
      
      // Send procurement approval email to delegates
      for (const delegation of procurementDelegations) {
        const delegateEmailContent = `
Dear ${delegation.delegate.name},

You are receiving this email because ${assignedProcurementManager?.name || 'a procurement manager'} has delegated their approval authority to you.

A new supplier initiation request has been submitted and requires approval.

<strong>Request Details:</strong>
- <strong>Supplier:</strong> ${supplierName}
- <strong>Email:</strong> ${supplierEmail}
- <strong>Business Unit:</strong> ${businessUnit === 'SCHAUENBURG_SYSTEMS_200' ? 'Schauenburg Systems 200' : 'Schauenburg (Pty) Ltd 300'}
- <strong>Product/Service Category:</strong> ${productServiceCategory}
- <strong>Requested by:</strong> ${requesterName}
- <strong>Purchase Type:</strong> ${regularPurchase ? 'Regular Purchase' : ''}${regularPurchase && onceOffPurchase ? ', ' : ''}${onceOffPurchase ? 'Once-off Purchase' : ''}
${annualPurchaseValue ? `- <strong>Annual Purchase Value:</strong> R${parseFloat(annualPurchaseValue).toLocaleString()}` : ''}

<strong>Reason for Onboarding:</strong>
${onboardingReason}

<strong>Note:</strong> You are acting as a delegate for ${assignedProcurementManager?.name || 'the procurement manager'}.

Please click the button below to review and approve this request:

<div style="text-align: center; margin: 30px 0;">
  <a href="${approvalsUrl}" target="_blank" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none; padding: 15px 40px; border-radius: 8px; border: none;">Review & Approve Request</a>
</div>

Or copy this link to your browser: ${approvalsUrl}

Best regards,
Schauenburg Systems Procurement System
        `.trim()
        
        console.log('📧 Sending procurement approval email to delegate:', delegation.delegate.email)
        const delegateEmailResult = await sendEmail({
          to: delegation.delegate.email,
          subject: 'Supplier Approval Required - New Onboarding Request (Delegated)',
          content: delegateEmailContent,
          supplierName: supplierName,
          businessType: productServiceCategory
        })
        console.log('Delegate email result:', delegateEmailResult)
      }
      
      console.log('✅ Approval notification emails processed')
    } catch (emailError) {
      console.error('❌ Error sending approval emails:', emailError)
      // Don't fail the entire process if email fails
    }
    
    return NextResponse.json({ 
      success: true, 
      initiationId: initiation.id,
      message: 'Supplier initiation submitted successfully. Approval emails have been sent to managers.'
    })

  } catch (error) {
    console.error('Error creating supplier initiation:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return NextResponse.json({ 
      error: `Failed to create supplier initiation: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
