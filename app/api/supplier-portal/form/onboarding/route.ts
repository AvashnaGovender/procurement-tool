import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/supplier-portal/session'
import { validateMagicLinkToken } from '@/lib/supplier-portal/token'
import { getRequiredDocuments } from '@/lib/document-requirements'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ success: false, error: 'token is required' }, { status: 400 })
    }

    // Validate magic link
    const tokenResult = await validateMagicLinkToken(token, 'onboarding')
    if (!tokenResult.valid) {
      return NextResponse.json(
        { success: false, error: tokenResult.message, code: tokenResult.code },
        { status: 401 }
      )
    }

    // Validate supplier session is scoped to this onboarding record
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value
    if (!sessionToken) {
      return NextResponse.json({ success: false, error: 'Authentication required', code: 'NO_SESSION' }, { status: 401 })
    }

    const session = await validateSession(sessionToken, tokenResult.onboarding.id)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Session expired or invalid', code: 'INVALID_SESSION' }, { status: 401 })
    }

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
            paymentMethod: true,
          },
        },
      },
    })

    if (!onboarding) {
      return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 })
    }

    const supplier = onboarding.supplier || {}

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

    const uploadedFiles = supplier.airtableData?.uploadedFiles || {}
    const purchaseType = onboarding.initiation?.purchaseType || 'REGULAR'
    const creditApplication = onboarding.initiation?.creditApplication || false
    const paymentMethod = onboarding.initiation?.paymentMethod || null
    const requiredDocuments = getRequiredDocuments(purchaseType as any, creditApplication, paymentMethod)

    return NextResponse.json({
      success: true,
      formData,
      uploadedFiles,
      revisionNotes: onboarding.revisionNotes,
      isRevision: onboarding.revisionRequested,
      documentsToRevise: onboarding.documentsToRevise || [],
      purchaseType,
      creditApplication,
      paymentMethod,
      requiredDocuments,
    })
  } catch (error) {
    console.error('Supplier portal form/onboarding error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch form data' }, { status: 500 })
  }
}
