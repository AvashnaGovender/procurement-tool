import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { supplierId: string } }
) {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: params.supplierId },
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

