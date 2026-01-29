import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email-sender'
import { getRequiredDocuments } from '@/lib/document-requirements'
import { BusinessUnit, InitiationStatus } from '@prisma/client'

// Helper function to format annual purchase value as a range
function formatAnnualPurchaseValue(value: number | null): string {
  if (!value) return ''
  
  if (value <= 100000) {
    return 'R0 - R100,000'
  } else if (value <= 500000) {
    return 'R100,000 - R500,000'
  } else if (value <= 1000000) {
    return 'R500,000 - R1,000,000'
  } else {
    return 'R1,000,000+'
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Starting supplier initiation API call')
    
    const session = await getServerSession(authOptions)
    console.log('Session:', session?.user?.id ? 'Authenticated' : 'Not authenticated')
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized',
        message: 'You must be logged in to submit a supplier initiation'
      }, { status: 401 })
    }

    let body
    try {
      body = await request.json()
      console.log('Request body:', JSON.stringify(body, null, 2))
    } catch (parseError) {
      console.error('Error parsing request body:', parseError)
      return NextResponse.json({ 
        success: false,
        error: 'Invalid request body',
        message: 'The request body could not be parsed. Please check your input and try again.'
      }, { status: 400 })
    }
    const {
      id, // Optional: if provided, update existing draft
      businessUnit,
      processReadUnderstood,
      dueDiligenceCompleted,
      supplierName,
      supplierEmail,
      supplierContactPerson,
      productServiceCategory,
      requesterName,
      relationshipDeclaration,
      purchaseType,
      paymentMethod,
      codReason,
      annualPurchaseValue,
      creditApplication,
      creditApplicationReason,
      onboardingReason,
      supplierLocation,
      currency,
      customCurrency
    } = body

    // Validate required fields
    // businessUnit should be an array with at least one item
    const businessUnitsRaw = Array.isArray(businessUnit) ? businessUnit : (businessUnit ? [businessUnit] : [])
    
    // Validate and cast to BusinessUnit enum
    console.log('Raw businessUnitsRaw:', businessUnitsRaw)
    console.log('BusinessUnit enum:', BusinessUnit)
    console.log('BusinessUnit.SCHAUENBURG_SYSTEMS_200:', BusinessUnit.SCHAUENBURG_SYSTEMS_200)
    console.log('BusinessUnit.SCHAUENBURG_PTY_LTD_300:', BusinessUnit.SCHAUENBURG_PTY_LTD_300)
    
    const businessUnits = businessUnitsRaw
      .map(unit => {
        const unitStr = String(unit).trim()
        console.log('Processing unit:', unitStr, 'Type:', typeof unit)
        // Map string values to BusinessUnit enum - use actual enum constants
        if (unitStr === 'SCHAUENBURG_SYSTEMS_200' || unitStr === BusinessUnit.SCHAUENBURG_SYSTEMS_200) {
          console.log('Returning SCHAUENBURG_SYSTEMS_200')
          return BusinessUnit.SCHAUENBURG_SYSTEMS_200
        } else if (unitStr === 'SCHAUENBURG_PTY_LTD_300' || unitStr === BusinessUnit.SCHAUENBURG_PTY_LTD_300) {
          console.log('Returning SCHAUENBURG_PTY_LTD_300')
          return BusinessUnit.SCHAUENBURG_PTY_LTD_300
        }
        console.log('No match for unit:', unitStr)
        return null
      })
      .filter((unit): unit is BusinessUnit => unit !== null)
    
    console.log('Final businessUnits:', businessUnits)
    console.log('businessUnits types:', businessUnits.map(u => typeof u))
    
    if (!businessUnits || businessUnits.length === 0 || !processReadUnderstood || !dueDiligenceCompleted || 
        !supplierName || !supplierEmail || !supplierContactPerson || !productServiceCategory || !requesterName || 
        !relationshipDeclaration || !onboardingReason) {
      console.error('Validation failed - Missing required fields:', {
        businessUnits: businessUnits.length,
        processReadUnderstood,
        dueDiligenceCompleted,
        supplierName: !!supplierName,
        supplierEmail: !!supplierEmail,
        supplierContactPerson: !!supplierContactPerson,
        productServiceCategory: !!productServiceCategory,
        requesterName: !!requesterName,
        relationshipDeclaration: !!relationshipDeclaration,
        onboardingReason: !!onboardingReason
      })
      return NextResponse.json({ 
        success: false,
        error: 'Missing required fields',
        message: 'Please complete all required fields before submitting'
      }, { status: 400 })
    }

    // Validate that a purchase type is selected
    if (!purchaseType || !['REGULAR', 'ONCE_OFF', 'SHARED_IP'].includes(purchaseType)) {
      console.error('Validation failed - Invalid purchase type:', purchaseType)
      return NextResponse.json({ 
        success: false,
        error: 'Please select a purchase type',
        message: 'Please select a valid purchase type (Regular or Shared IP)'
      }, { status: 400 })
    }

    // Validate payment method is selected
    if (!paymentMethod || !['COD', 'AC'].includes(paymentMethod)) {
      console.error('Validation failed - Invalid payment method:', paymentMethod)
      return NextResponse.json({ 
        success: false,
        error: 'Please select a payment method',
        message: 'Please select a valid payment method (COD or A/C)'
      }, { status: 400 })
    }

    // Validate COD reason if COD is selected
    if (paymentMethod === 'COD' && !codReason) {
      console.error('Validation failed - COD reason required')
      return NextResponse.json({ 
        success: false,
        error: 'COD reason required',
        message: 'Please provide a reason for requiring COD payment'
      }, { status: 400 })
    }

    // Validate annual purchase value if regular purchase is selected
    if (purchaseType === 'REGULAR' && !annualPurchaseValue) {
      console.error('Validation failed - Invalid annual purchase value:', annualPurchaseValue)
      return NextResponse.json({ 
        success: false,
        error: 'Please select an annual purchase value for regular purchases',
        message: 'Annual purchase value is required for regular purchases'
      }, { status: 400 })
    }

    // Convert annual purchase value range to number
    let annualPurchaseValueNumber: number | null = null
    if (annualPurchaseValue) {
      // Check if it's already a number (for backward compatibility)
      if (typeof annualPurchaseValue === 'number') {
        annualPurchaseValueNumber = annualPurchaseValue
      } else if (typeof annualPurchaseValue === 'string' && !isNaN(parseFloat(annualPurchaseValue)) && isFinite(parseFloat(annualPurchaseValue))) {
        // If it's a numeric string, parse it
        annualPurchaseValueNumber = parseFloat(annualPurchaseValue)
      } else {
        // Convert string range to number
        switch (annualPurchaseValue) {
          case "0-100k":
            annualPurchaseValueNumber = 100000
            break
          case "100k-500k":
            annualPurchaseValueNumber = 500000
            break
          case "500k-1M":
            annualPurchaseValueNumber = 1000000
            break
          case "1M+":
            annualPurchaseValueNumber = 2000000
            break
          default:
            annualPurchaseValueNumber = null
        }
      }
    }

    // Validate credit application reason if credit application is not selected (not required for Once-off Purchase)
    if (purchaseType !== 'ONCE_OFF' && !creditApplication && !creditApplicationReason) {
      console.error('Validation failed - Missing credit application reason')
      return NextResponse.json({ 
        success: false,
        error: 'Please provide a reason for not requiring credit application',
        message: 'If credit application is not selected, please provide a reason'
      }, { status: 400 })
    }

    // Check for duplicate suppliers
    // 1. Check if supplier already exists in the Supplier table
    const existingSupplier = await prisma.supplier.findFirst({
      where: {
        OR: [
          { supplierName: { equals: supplierName, mode: 'insensitive' } },
          { contactEmail: { equals: supplierEmail, mode: 'insensitive' } },
          { companyName: { equals: supplierName, mode: 'insensitive' } }
        ]
      }
    })

    if (existingSupplier) {
      console.error('Validation failed - Duplicate supplier found:', {
        supplierName,
        supplierEmail,
        existingSupplierId: existingSupplier.id,
        existingSupplierCode: existingSupplier.supplierCode
      })
      return NextResponse.json({ 
        success: false,
        error: 'Duplicate supplier',
        message: `A supplier with the name "${supplierName}" or email "${supplierEmail}" already exists in the system (Supplier Code: ${existingSupplier.supplierCode}). Please use the existing supplier record instead.`
      }, { status: 400 })
    }

    // 2. Check if there's an active initiation for this supplier (not DRAFT or REJECTED)
    // Exclude the current initiation if we're updating an existing one
    const activeInitiationWhere: any = {
      AND: [
        {
          OR: [
            { supplierName: { equals: supplierName, mode: 'insensitive' } },
            { supplierEmail: { equals: supplierEmail, mode: 'insensitive' } }
          ]
        },
        {
          status: {
            notIn: ['DRAFT', 'REJECTED'] as any
          }
        }
      ]
    }

    // If updating an existing initiation, exclude it from the duplicate check
    if (id) {
      activeInitiationWhere.AND.push({
        id: { not: id }
      })
    }

    const activeInitiation = await prisma.supplierInitiation.findFirst({
      where: activeInitiationWhere,
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (activeInitiation) {
      console.error('Validation failed - Active initiation found for supplier:', {
        supplierName,
        supplierEmail,
        existingInitiationId: activeInitiation.id,
        existingStatus: activeInitiation.status
      })
      
      const statusDisplay = activeInitiation.status.replace(/_/g, ' ')
      return NextResponse.json({ 
        success: false,
        error: 'Duplicate initiation',
        message: `An active supplier initiation already exists for "${supplierName}" with status: ${statusDisplay}. Please wait for the current initiation to be completed or rejected before creating a new one.`
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
      console.error('User not found:', session.user.id)
      return NextResponse.json({ 
        success: false,
        error: 'User not found',
        message: 'Your user account could not be found. Please contact support.'
      }, { status: 404 })
    }

    console.log('Current user:', currentUser.email, 'Manager:', currentUser.manager?.email || 'None')

    // If ID is provided, update existing draft (only if it's a DRAFT or REJECTED status)
    let initiation
    if (id) {
      const existingInitiation = await prisma.supplierInitiation.findUnique({
        where: { id }
      })

      if (!existingInitiation) {
        return NextResponse.json({ 
          success: false,
          error: 'Initiation not found',
          message: 'The initiation you are trying to submit does not exist.'
        }, { status: 404 })
      }

      // Only allow submitting if it's a draft or rejected
      if (existingInitiation.status !== 'DRAFT' && existingInitiation.status !== 'REJECTED') {
        return NextResponse.json({ 
          success: false,
          error: 'Cannot submit',
          message: 'This initiation has already been submitted and can only be resubmitted if it was rejected.'
        }, { status: 403 })
      }

      // Ensure user owns this initiation
      if (existingInitiation.initiatedById !== session.user.id) {
        return NextResponse.json({ 
          success: false,
          error: 'Unauthorized',
          message: 'You can only submit your own initiations.'
        }, { status: 403 })
      }

      // Update existing initiation to SUBMITTED
      console.log('Updating existing initiation to SUBMITTED...')
      
      // Delete old approval records before creating new ones
      console.log('Deleting old approval records...')
      await prisma.managerApproval.deleteMany({
        where: { initiationId: id }
      })
      await prisma.procurementApproval.deleteMany({
        where: { initiationId: id }
      })
      console.log('✅ Old approval records deleted')
      
      initiation = await prisma.supplierInitiation.update({
        where: { id },
        data: {
          businessUnit: businessUnits,
          processReadUnderstood,
          dueDiligenceCompleted,
          supplierName,
          supplierEmail,
          supplierContactPerson,
          productServiceCategory,
          requesterName,
          relationshipDeclaration,
          purchaseType: purchaseType as 'REGULAR' | 'ONCE_OFF' | 'SHARED_IP',
          paymentMethod: paymentMethod || null,
          codReason: paymentMethod === 'COD' ? codReason : null,
          annualPurchaseValue: annualPurchaseValueNumber,
          creditApplication,
          creditApplicationReason: creditApplication ? null : creditApplicationReason,
          regularPurchase: purchaseType === 'REGULAR',
          onceOffPurchase: purchaseType === 'ONCE_OFF',
          onboardingReason,
          supplierLocation: supplierLocation || null,
          currency: currency || null,
          customCurrency: customCurrency || null,
          status: 'SUBMITTED',
          submittedAt: new Date()
        }
      })
      console.log('Initiation updated and submitted:', initiation.id)
    } else {
      // Create new supplier initiation
      console.log('Creating supplier initiation...')
      initiation = await prisma.supplierInitiation.create({
        data: {
          businessUnit: businessUnits,
          processReadUnderstood,
          dueDiligenceCompleted,
          supplierName,
          supplierEmail,
          supplierContactPerson,
          productServiceCategory,
          requesterName,
          relationshipDeclaration,
          purchaseType: purchaseType as 'REGULAR' | 'ONCE_OFF' | 'SHARED_IP',
          paymentMethod: paymentMethod || null,
          codReason: paymentMethod === 'COD' ? codReason : null,
          annualPurchaseValue: annualPurchaseValueNumber,
          creditApplication,
          creditApplicationReason: creditApplication ? null : creditApplicationReason,
          regularPurchase: purchaseType === 'REGULAR',
          onceOffPurchase: purchaseType === 'ONCE_OFF',
          onboardingReason,
          supplierLocation: supplierLocation || null,
          currency: currency || null,
          customCurrency: customCurrency || null,
          initiatedById: session.user.id,
          status: 'SUBMITTED',
          submittedAt: new Date()
        }
      })
      console.log('Initiation created:', initiation.id)
    }

    // Create approval record for the user's assigned manager
    // NOTE: Procurement approval will be created only after manager approves (sequential workflow)
    let assignedManager = null

    // Use the user's assigned manager if they have one
    // NOTE: The assigned manager doesn't need to have the "MANAGER" role
    // Any active user who is set as someone's manager can approve their initiations
    if (currentUser.managerId && currentUser.manager && currentUser.manager.isActive) {
      assignedManager = currentUser.manager
      console.log('✅ Using assigned manager:', assignedManager.email, '(Role:', assignedManager.role + ')')
      
      await prisma.managerApproval.create({
        data: {
          initiationId: initiation.id,
          approverId: assignedManager.id,
          status: 'PENDING'
        }
      })
      console.log('✅ Manager approval record created for:', assignedManager.email)
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

    // Check for active delegations for manager
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

    console.log(`📋 Manager has ${managerDelegations.length} active delegation(s)`)

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
- <strong>Business Unit(s):</strong> ${businessUnits.map(unit => unit === 'SCHAUENBURG_SYSTEMS_200' ? 'Schauenburg Systems (Pty) Ltd 300' : 'Schauenburg (Pty) Ltd 200').join(', ')}
- <strong>Product/Service Category:</strong> ${productServiceCategory}
- <strong>Requested by:</strong> ${requesterName}
- <strong>Purchase Type:</strong> ${purchaseType === 'REGULAR' ? 'Regular Purchase' : purchaseType === 'ONCE_OFF' ? 'Once-off Purchase' : 'Shared IP'}
${annualPurchaseValueNumber ? `- <strong>Annual Purchase Value:</strong> ${formatAnnualPurchaseValue(annualPurchaseValueNumber)}` : ''}
- <strong>Payment Method:</strong> ${paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Account (AC)'}
${paymentMethod === 'COD' && codReason ? `- <strong>COD Reason:</strong> ${codReason}` : ''}
- <strong>Credit Application:</strong> ${creditApplication ? 'Yes' : 'No'}${!creditApplication && creditApplicationReason ? ` (Reason: ${creditApplicationReason})` : ''}

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
- <strong>Business Unit(s):</strong> ${businessUnits.map(unit => unit === 'SCHAUENBURG_SYSTEMS_200' ? 'Schauenburg Systems (Pty) Ltd 300' : 'Schauenburg (Pty) Ltd 200').join(', ')}
- <strong>Product/Service Category:</strong> ${productServiceCategory}
- <strong>Requested by:</strong> ${requesterName}
- <strong>Purchase Type:</strong> ${purchaseType === 'REGULAR' ? 'Regular Purchase' : purchaseType === 'ONCE_OFF' ? 'Once-off Purchase' : 'Shared IP'}
${annualPurchaseValueNumber ? `- <strong>Annual Purchase Value:</strong> ${formatAnnualPurchaseValue(annualPurchaseValueNumber)}` : ''}
- <strong>Payment Method:</strong> ${paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Account (AC)'}
${paymentMethod === 'COD' && codReason ? `- <strong>COD Reason:</strong> ${codReason}` : ''}
- <strong>Credit Application:</strong> ${creditApplication ? 'Yes' : 'No'}${!creditApplication && creditApplicationReason ? ` (Reason: ${creditApplicationReason})` : ''}

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
      
      console.log('✅ Manager approval notification emails processed')
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
    
    // Return a properly formatted error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      success: false,
      error: `Failed to create supplier initiation: ${errorMessage}`,
      message: errorMessage
    }, { status: 500 })
  }
}
