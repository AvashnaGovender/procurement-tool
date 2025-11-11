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

    // Create approval records for manager and procurement manager
    // Find users with manager roles (prefer MANAGER role, then others)
    let managers = await prisma.user.findMany({
      where: {
        role: 'MANAGER',
        isActive: true
      },
      take: 1
    })
    
    // If no MANAGER found, fallback to ADMIN or APPROVER
    if (managers.length === 0) {
      managers = await prisma.user.findMany({
        where: {
          role: {
            in: ['ADMIN', 'APPROVER']
          },
          isActive: true
        },
        take: 1
      })
    }

    const procurementManagers = await prisma.user.findMany({
      where: {
        role: 'PROCUREMENT_MANAGER',
        isActive: true
      },
      orderBy: {
        createdAt: 'desc' // Get the most recently created procurement manager
      },
      take: 1
    })

    let assignedManager = null
    let assignedProcurementManager = null

    if (managers.length > 0) {
      assignedManager = managers[0]
      await prisma.managerApproval.create({
        data: {
          initiationId: initiation.id,
          approverId: managers[0].id,
          status: 'PENDING'
        }
      })
    }

    if (procurementManagers.length > 0) {
      assignedProcurementManager = procurementManagers[0]
      await prisma.procurementApproval.create({
        data: {
          initiationId: initiation.id,
          approverId: procurementManagers[0].id,
          status: 'PENDING'
        }
      })
    }

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
      
      // Send manager approval email
      if (assignedManager) {
        console.log('📧 Sending manager approval email to:', assignedManager.email)
        const managerEmailResult = await sendEmail({
          to: assignedManager.email,
          subject: 'Onboarding Supplier Approval Required',
          content: managerEmailContent,
          supplierName: supplierName,
          businessType: productServiceCategory
        })
        console.log('Manager email result:', managerEmailResult)
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
      
      // Send procurement approval email
      if (assignedProcurementManager) {
        console.log('📧 Sending procurement approval email to:', assignedProcurementManager.email)
        const procurementEmailResult = await sendEmail({
          to: assignedProcurementManager.email,
          subject: 'Approval for Onboarding New Supplier',
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
