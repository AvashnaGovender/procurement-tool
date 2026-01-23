import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRequiredDocuments } from '@/lib/document-requirements'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      )
    }

    // Find onboarding record by token
    const onboarding = await prisma.supplierOnboarding.findUnique({
      where: { onboardingToken: token },
      include: {
        supplier: true,
        initiation: {
          select: {
            purchaseType: true,
            creditApplication: true
          }
        }
      }
    })

    if (!onboarding || !onboarding.supplier) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 404 }
      )
    }

    const supplier = onboarding.supplier

    // Map supplier data to form fields
    const formData = {
      supplierName: supplier.supplierName || '',
      contactPerson: supplier.contactPerson || '',
      nameOfBusiness: supplier.companyName || '',
      tradingName: supplier.tradingName || '',
      companyRegistrationNo: supplier.registrationNumber || '',
      physicalAddress: supplier.physicalAddress || '',
      postalAddress: supplier.postalAddress || '',
      contactNumber: supplier.contactPhone || '',
      emailAddress: supplier.contactEmail || '',
      natureOfBusiness: supplier.natureOfBusiness || '',
      productsAndServices: supplier.productsAndServices || '',
      associatedCompany: supplier.associatedCompany || '',
      associatedCompanyRegistrationNo: supplier.associatedCompanyRegNo || '',
      branchesContactNumbers: supplier.branchesContactNumbers || '',
      bankAccountName: supplier.bankAccountName || '',
      bankName: supplier.bankName || '',
      branchName: supplier.branchName || '',
      branchNumber: supplier.branchNumber || '',
      accountNumber: supplier.accountNumber || '',
      typeOfAccount: supplier.typeOfAccount || '',
      rpBanking: supplier.rpBanking || '',
      rpBankingPhone: supplier.rpBankingPhone || '',
      rpBankingEmail: supplier.rpBankingEmail || '',
      rpQuality: supplier.rpQuality || '',
      rpQualityPhone: supplier.rpQualityPhone || '',
      rpQualityEmail: supplier.rpQualityEmail || '',
      rpSHE: supplier.rpSHE || '',
      rpSHEPhone: supplier.rpSHEPhone || '',
      rpSHEEmail: supplier.rpSHEEmail || '',
      bbbeeStatus: supplier.bbbeeLevel || '',
      numberOfEmployees: supplier.numberOfEmployees?.toString() || '',
      rpBBBEE: supplier.rpBBBEE || '',
      rpBBBEEPhone: supplier.rpBBBEEPhone || '',
      rpBBBEEEmail: supplier.rpBBBEEEmail || '',
      associatedCompanyBranchName: supplier.associatedCompanyBranchName || '',
      qualityManagementCert: supplier.qualityManagementCert || false,
      sheCertification: supplier.sheCertification || false,
      authorizationAgreement: supplier.authorizationAgreement || false,
      field39: supplier.field39 || '',
    }

    // Get uploaded files info from airtableData if available
    const uploadedFiles = supplier.airtableData?.uploadedFiles || {}

    // Get purchase type and credit application status
    const purchaseType = onboarding.initiation?.purchaseType || onboarding.requiredDocuments.length > 0 
      ? (onboarding.requiredDocuments.includes('nda') ? 'SHARED_IP' : 
         onboarding.requiredDocuments.length <= 2 ? 'ONCE_OFF' : 'REGULAR')
      : null
    
    const creditApplication = onboarding.initiation?.creditApplication || false
    
    // Use stored requiredDocuments if available, otherwise calculate from purchaseType and creditApplication
    const requiredDocuments = onboarding.requiredDocuments.length > 0 
      ? onboarding.requiredDocuments 
      : (purchaseType ? getRequiredDocuments(purchaseType as any, creditApplication) : [])

    return NextResponse.json({
      success: true,
      formData,
      uploadedFiles,
      revisionNotes: onboarding.revisionNotes,
      isRevision: onboarding.revisionRequested,
      documentsToRevise: onboarding.documentsToRevise || [],
      purchaseType,
      creditApplication,
      requiredDocuments
    })
  } catch (error) {
    console.error('Error fetching supplier data:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch supplier data'
      },
      { status: 500 }
    )
  }
}

