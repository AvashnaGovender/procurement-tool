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
      select: {
        id: true,
        supplierCode: true,
        
        // Basic Information
        supplierName: true,
        contactPerson: true,
        companyName: true,
        tradingName: true,
        registrationNumber: true,
        
        // Address
        physicalAddress: true,
        postalAddress: true,
        
        // Contact
        contactPhone: true,
        contactEmail: true,
        
        // Business Details
        natureOfBusiness: true,
        productsAndServices: true,
        associatedCompany: true,
        associatedCompanyRegNo: true,
        branchesContactNumbers: true,
        
        // Banking Information
        bankAccountName: true,
        bankName: true,
        branchName: true,
        branchNumber: true,
        accountNumber: true,
        typeOfAccount: true,
        
        // Responsible Person - Banking
        rpBanking: true,
        rpBankingPhone: true,
        rpBankingEmail: true,
        
        // Responsible Person - Quality Management
        rpQuality: true,
        rpQualityPhone: true,
        rpQualityEmail: true,
        
        // Responsible Person - SHE
        rpSHE: true,
        rpSHEPhone: true,
        rpSHEEmail: true,
        
        // BBBEE & Employment
        bbbeeLevel: true,
        numberOfEmployees: true,
        
        // Responsible Person - BBBEE
        rpBBBEE: true,
        rpBBBEEPhone: true,
        rpBBBEEEmail: true,
        
        // Other Fields
        associatedCompanyBranchName: true,
        qualityManagementCert: true,
        sheCertification: true,
        authorizationAgreement: true,
        field39: true,
        
        // Status & Metadata
        status: true,
        createdAt: true,
        airtableData: true,
      }
    })

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      )
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

