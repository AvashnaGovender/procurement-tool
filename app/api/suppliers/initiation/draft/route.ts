import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BusinessUnit, InitiationStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized',
        message: 'You must be logged in to save a draft'
      }, { status: 401 })
    }

    const body = await request.json()
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
      relationshipDeclarationOther,
      purchaseType,
      paymentMethod,
      codReason,
      annualPurchaseValue,
      creditApplication,
      creditApplicationReason,
      onceOffPurchase,
      regularPurchase,
      onboardingReason
    } = body

    // Validate required fields for draft (more lenient than submission)
    const businessUnitsRaw = Array.isArray(businessUnit) ? businessUnit : (businessUnit ? [businessUnit] : [])
    const businessUnits: BusinessUnit[] = businessUnitsRaw
      .map(unit => {
        const unitStr = String(unit).trim()
        // Map string values to BusinessUnit enum - use actual enum constants
        if (unitStr === 'SCHAUENBURG_SYSTEMS_200' || unitStr === BusinessUnit.SCHAUENBURG_SYSTEMS_200) {
          return BusinessUnit.SCHAUENBURG_SYSTEMS_200
        } else if (unitStr === 'SCHAUENBURG_PTY_LTD_300' || unitStr === BusinessUnit.SCHAUENBURG_PTY_LTD_300) {
          return BusinessUnit.SCHAUENBURG_PTY_LTD_300
        }
        return null
      })
      .filter((unit): unit is BusinessUnit => unit !== null)

    // Combine relationship declaration
    const relationshipDeclarationValue = relationshipDeclaration === "OTHER" 
      ? relationshipDeclarationOther 
      : relationshipDeclaration

    // Convert annual purchase value range to number
    let annualPurchaseValueNumber: number | null = null
    if (annualPurchaseValue) {
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

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!currentUser) {
      return NextResponse.json({ 
        success: false,
        error: 'User not found',
        message: 'Your user account could not be found. Please contact support.'
      }, { status: 404 })
    }

    // If ID is provided, update existing draft (only if it's a DRAFT or REJECTED status)
    if (id) {
      const existingInitiation = await prisma.supplierInitiation.findUnique({
        where: { id }
      })

      if (!existingInitiation) {
        return NextResponse.json({ 
          success: false,
          error: 'Initiation not found'
        }, { status: 404 })
      }

      // Only allow editing if it's a draft or rejected
      if (existingInitiation.status !== 'DRAFT' && existingInitiation.status !== 'REJECTED') {
        return NextResponse.json({ 
          success: false,
          error: 'Cannot edit',
          message: 'This initiation has been submitted and can only be edited if it was rejected.'
        }, { status: 403 })
      }

      // Ensure user owns this initiation
      if (existingInitiation.initiatedById !== session.user.id) {
        return NextResponse.json({ 
          success: false,
          error: 'Unauthorized',
          message: 'You can only edit your own initiations.'
        }, { status: 403 })
      }

      // Update existing draft
      const updated = await prisma.supplierInitiation.update({
        where: { id },
        data: {
          businessUnit: businessUnits.length > 0 ? businessUnits : existingInitiation.businessUnit,
          processReadUnderstood: processReadUnderstood ?? existingInitiation.processReadUnderstood,
          dueDiligenceCompleted: dueDiligenceCompleted ?? existingInitiation.dueDiligenceCompleted,
          supplierName: supplierName || existingInitiation.supplierName,
          supplierEmail: supplierEmail ?? existingInitiation.supplierEmail,
          supplierContactPerson: supplierContactPerson ?? existingInitiation.supplierContactPerson,
          productServiceCategory: productServiceCategory || existingInitiation.productServiceCategory,
          requesterName: requesterName || existingInitiation.requesterName,
          relationshipDeclaration: relationshipDeclarationValue || existingInitiation.relationshipDeclaration,
          purchaseType: purchaseType ? (purchaseType as 'REGULAR' | 'ONCE_OFF' | 'SHARED_IP') : existingInitiation.purchaseType,
          paymentMethod: paymentMethod ?? existingInitiation.paymentMethod,
          codReason: paymentMethod === 'COD' ? (codReason ?? existingInitiation.codReason) : null,
          annualPurchaseValue: annualPurchaseValueNumber ?? existingInitiation.annualPurchaseValue,
          creditApplication: creditApplication ?? existingInitiation.creditApplication,
          creditApplicationReason: creditApplication ? null : (creditApplicationReason ?? existingInitiation.creditApplicationReason),
          regularPurchase: regularPurchase ?? (purchaseType === 'REGULAR' ? true : existingInitiation.regularPurchase),
          onceOffPurchase: onceOffPurchase ?? existingInitiation.onceOffPurchase,
          onboardingReason: onboardingReason || existingInitiation.onboardingReason,
          status: 'DRAFT' // Keep as draft
        }
      })

      return NextResponse.json({ 
        success: true, 
        initiationId: updated.id,
        message: 'Draft saved successfully'
      })
    }

    // Create new draft
    const initiation = await prisma.supplierInitiation.create({
      data: {
        businessUnit: businessUnits.length > 0 ? businessUnits : [BusinessUnit.SCHAUENBURG_SYSTEMS_200],
        processReadUnderstood: processReadUnderstood || false,
        dueDiligenceCompleted: dueDiligenceCompleted || false,
        supplierName: supplierName || '',
        supplierEmail: supplierEmail || '',
        supplierContactPerson: supplierContactPerson || '',
        productServiceCategory: productServiceCategory || '',
        requesterName: requesterName || currentUser.name || '',
        relationshipDeclaration: relationshipDeclarationValue || '',
        purchaseType: purchaseType ? (purchaseType as 'REGULAR' | 'ONCE_OFF' | 'SHARED_IP') : 'REGULAR',
        paymentMethod: paymentMethod || null,
        codReason: paymentMethod === 'COD' ? codReason : null,
        annualPurchaseValue: annualPurchaseValueNumber,
        creditApplication: creditApplication || false,
        creditApplicationReason: creditApplication ? null : creditApplicationReason,
        regularPurchase: regularPurchase ?? (purchaseType === 'REGULAR'),
        onceOffPurchase: onceOffPurchase || false,
        onboardingReason: onboardingReason || '',
        initiatedById: session.user.id,
        status: 'DRAFT'
      }
    })

    return NextResponse.json({ 
      success: true, 
      initiationId: initiation.id,
      message: 'Draft saved successfully'
    })

  } catch (error) {
    console.error('Error saving draft:', error)
    return NextResponse.json({ 
      success: false,
      error: `Failed to save draft: ${error instanceof Error ? error.message : 'Unknown error'}`,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    // If ID is provided, get specific draft
    if (id) {
      const initiation = await prisma.supplierInitiation.findUnique({
        where: { id },
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

      if (!initiation) {
        return NextResponse.json({ 
          success: false,
          error: 'Initiation not found'
        }, { status: 404 })
      }

      // Only allow viewing if user owns it
      if (initiation.initiatedById !== session.user.id) {
        return NextResponse.json({ 
          success: false,
          error: 'Unauthorized'
        }, { status: 403 })
      }

      // Convert annual purchase value back to range
      let annualPurchaseValueRange: string | null = null
      if (initiation.annualPurchaseValue) {
        const value = initiation.annualPurchaseValue
        if (value <= 100000) {
          annualPurchaseValueRange = "0-100k"
        } else if (value <= 500000) {
          annualPurchaseValueRange = "100k-500k"
        } else if (value <= 1000000) {
          annualPurchaseValueRange = "500k-1M"
        } else {
          annualPurchaseValueRange = "1M+"
        }
      }

      // Determine relationship declaration and "Other" value
      const relationshipOptions = ["NONE", "NO_EXISTING_RELATIONSHIP", "PREVIOUS_SUPPLIER", "CURRENT_SUPPLIER", "RELATED_PARTY", "FAMILY_MEMBER", "BUSINESS_PARTNER"]
      const isOther = !relationshipOptions.includes(initiation.relationshipDeclaration)
      const relationshipDeclaration = isOther ? "OTHER" : initiation.relationshipDeclaration
      const relationshipDeclarationOther = isOther ? initiation.relationshipDeclaration : ""

      return NextResponse.json({
        success: true,
        initiation: {
          ...initiation,
          annualPurchaseValue: annualPurchaseValueRange,
          relationshipDeclaration,
          relationshipDeclarationOther
        }
      })
    }

    // Get all drafts and rejected initiations for the user
    const initiations = await prisma.supplierInitiation.findMany({
      where: {
        OR: [
          {
            initiatedById: session.user.id,
            status: {
              in: ['DRAFT', 'REJECTED'] as any
            }
          },
          // Also allow loading by specific ID if user owns it
          {
            id: body.draftId,
            initiatedById: session.user.id,
            status: 'REJECTED' as any
          }
        ]
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      initiations
    })

  } catch (error) {
    console.error('Error fetching drafts:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch drafts'
    }, { status: 500 })
  }
}

