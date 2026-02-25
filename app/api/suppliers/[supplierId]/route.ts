import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ supplierId: string }> }
) {
  try {
    const { supplierId } = await params
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      include: {
        onboarding: {
          include: {
            initiation: {
              include: {
                initiatedBy: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    managerId: true,
                    manager: {
                      select: {
                        id: true,
                        name: true,
                        email: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      )
    }

    // Load initiator + manager from DB using onboarding.initiationId so we never rely on nested include shape
    const onboarding = (supplier as any).onboarding
    const initiationId = onboarding?.initiationId ?? onboarding?.initiation?.id
    if (initiationId && onboarding?.initiation) {
      const initiationRow = await prisma.supplierInitiation.findUnique({
        where: { id: initiationId },
        select: { initiatedById: true }
      })
      const initiatedById = initiationRow?.initiatedById ?? (onboarding.initiation as any)?.initiatedById ?? (onboarding.initiation as any)?.initiatedBy?.id
      if (initiatedById) {
        const userWithManager = await prisma.user.findUnique({
          where: { id: initiatedById },
          select: {
            id: true,
            name: true,
            email: true,
            managerId: true,
            manager: {
              select: { id: true, name: true, email: true }
            }
          }
        })
        if (userWithManager) {
          let manager = userWithManager.manager
          if (!manager && userWithManager.managerId) {
            const managerUser = await prisma.user.findUnique({
              where: { id: userWithManager.managerId },
              select: { id: true, name: true, email: true }
            })
            if (managerUser) manager = managerUser
          }
          ;(supplier as any).onboarding.initiation.initiatedBy = {
            id: userWithManager.id,
            name: userWithManager.name,
            email: userWithManager.email,
            managerId: userWithManager.managerId,
            manager: manager
              ? { id: manager.id, name: manager.name, email: manager.email }
              : null
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      supplier
    })
  } catch (error) {
    console.error('Error fetching supplier:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch supplier'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ supplierId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has permission to update suppliers
    const canUpdate = ['ADMIN', 'PROCUREMENT_MANAGER', 'PROCUREMENT_SPECIALIST'].includes(session.user.role)
    
    if (!canUpdate) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { supplierId } = await params
    const body = await request.json()

    // Update supplier with provided data
    const updatedSupplier = await prisma.supplier.update({
      where: { id: supplierId },
      data: {
        // Basic Information
        supplierName: body.supplierName,
        contactPerson: body.contactPerson,
        companyName: body.companyName,
        tradingName: body.tradingName,
        registrationNumber: body.registrationNumber,
        
        // Address
        physicalAddress: body.physicalAddress,
        postalAddress: body.postalAddress,
        
        // Contact
        contactPhone: body.contactPhone,
        contactEmail: body.contactEmail,
        
        // Business Details
        natureOfBusiness: body.natureOfBusiness,
        productsAndServices: body.productsAndServices,
        associatedCompany: body.associatedCompany,
        associatedCompanyRegNo: body.associatedCompanyRegNo,
        branchesContactNumbers: body.branchesContactNumbers,
        associatedCompanyBranchName: body.associatedCompanyBranchName,
        
        // Banking Information
        bankAccountName: body.bankAccountName,
        bankName: body.bankName,
        branchName: body.branchName,
        branchNumber: body.branchNumber,
        accountNumber: body.accountNumber,
        typeOfAccount: body.typeOfAccount,
        
        // Responsible Person - Banking
        rpBanking: body.rpBanking,
        rpBankingPhone: body.rpBankingPhone,
        rpBankingEmail: body.rpBankingEmail,
        
        // Responsible Person - Quality Management
        rpQuality: body.rpQuality,
        rpQualityPhone: body.rpQualityPhone,
        rpQualityEmail: body.rpQualityEmail,
        
        // Responsible Person - SHE
        rpSHE: body.rpSHE,
        rpSHEPhone: body.rpSHEPhone,
        rpSHEEmail: body.rpSHEEmail,
        
        // BBBEE & Employment
        bbbeeLevel: body.bbbeeLevel,
        numberOfEmployees: body.numberOfEmployees ? parseInt(body.numberOfEmployees) : null,
        
        // Responsible Person - BBBEE
        rpBBBEE: body.rpBBBEE,
        rpBBBEEPhone: body.rpBBBEEPhone,
        rpBBBEEEmail: body.rpBBBEEEmail,
        
        // Other Fields
        qualityManagementCert: body.qualityManagementCert,
        sheCertification: body.sheCertification,
        authorizationAgreement: body.authorizationAgreement,
        field39: body.field39,
      }
    })

    return NextResponse.json({
      success: true,
      supplier: updatedSupplier
    })
  } catch (error) {
    console.error('Error updating supplier:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update supplier'
      },
      { status: 500 }
    )
  }
}

