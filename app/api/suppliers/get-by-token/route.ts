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
            creditApplication: true,
            supplierContactPerson: true,
            productServiceCategory: true,
            paymentMethod: true
          }
        }
      }
    })

    if (!onboarding) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 404 }
      )
    }

    const supplier = onboarding.supplier || {}

    // Map supplier data to form fields
    // If supplier doesn't exist yet, use initiation data
    const formData = {
      supplierName: supplier.supplierName || '',
      contactPerson: supplier.contactPerson || onboarding.initiation?.supplierContactPerson || '',
      tradingName: supplier.tradingName || '',
      companyRegistrationNo: supplier.registrationNumber || '',
      physicalAddress: supplier.physicalAddress || '',
      postalAddress: supplier.postalAddress || '',
      contactNumber: supplier.contactPhone || '',
      emailAddress: supplier.contactEmail || '',
      natureOfBusiness: supplier.natureOfBusiness || supplier.productsAndServices || onboarding.initiation?.productServiceCategory || '',
      productsAndServices: supplier.productsAndServices || supplier.natureOfBusiness || '',
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
      bbbeeLevel: supplier.bbbeeLevel || '',
      qualityCertification: supplier.qualityManagementCert ? 'Yes' : 'No',
      qualityCertificationText: (supplier.airtableData as { qualityCertificationText?: string } | null)?.qualityCertificationText || '',
      healthSafetyCertification: supplier.sheCertification ? 'Yes' : 'No',
      healthSafetyCertificationText: (supplier.airtableData as { healthSafetyCertificationText?: string } | null)?.healthSafetyCertificationText || '',
      numberOfEmployees: supplier.numberOfEmployees?.toString() || '',
      rpBBBEE: supplier.rpBBBEE || '',
      rpBBBEEPhone: supplier.rpBBBEEPhone || '',
      rpBBBEEEmail: supplier.rpBBBEEEmail || '',
      associatedCompanyBranchName: supplier.associatedCompanyBranchName || '',
      authorizationAgreement: supplier.authorizationAgreement || false,
      field39: supplier.field39 || '',
      vatRegistered: (supplier.airtableData as { vatRegistered?: boolean } | null)?.vatRegistered ?? false,
      noCreditApplicationProcess: (supplier.airtableData as { noCreditApplicationProcess?: boolean } | null)?.noCreditApplicationProcess ?? false,
      postalSameAsPhysical: (supplier.airtableData as { postalSameAsPhysical?: boolean } | null)?.postalSameAsPhysical ?? false,
    }

    // Get uploaded files info from airtableData if available
    const uploadedFiles = supplier.airtableData?.uploadedFiles || {}

    // Get purchase type, credit application status, and payment method from initiation
    const purchaseType = onboarding.initiation?.purchaseType || 'REGULAR'
    const creditApplication = onboarding.initiation?.creditApplication || false
    const paymentMethod = onboarding.initiation?.paymentMethod || null
    
    console.log('📋 Document Requirements Calculation:')
    console.log('   Purchase Type:', purchaseType)
    console.log('   Credit Application:', creditApplication)
    console.log('   Payment Method:', paymentMethod)
    
    // ALWAYS calculate requiredDocuments fresh based on current purchaseType, creditApplication, and paymentMethod
    // This ensures we use the latest document requirements logic
    const requiredDocuments = getRequiredDocuments(purchaseType as any, creditApplication, paymentMethod)
    
    console.log('   Required Documents:', requiredDocuments)
    console.log('   Includes NDA?', requiredDocuments.includes('nda'))

    return NextResponse.json({
      success: true,
      formData,
      uploadedFiles,
      revisionNotes: onboarding.revisionNotes,
      isRevision: onboarding.revisionRequested,
      documentsToRevise: onboarding.documentsToRevise || [],
      purchaseType,
      creditApplication,
      paymentMethod: onboarding.initiation?.paymentMethod || null,
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

