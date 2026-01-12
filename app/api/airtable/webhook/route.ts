import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('📥 Received Airtable webhook:', JSON.stringify(body, null, 2))

    // Airtable automation sends data in this format:
    // { fields: { "Field Name": "value", ... }, id: "recXXXX" }
    const fields = body.fields || body
    const airtableRecordId = body.id || 'unknown'

    // Map all Airtable fields (excluding attachments)
    const airtableData = {
      // Basic Information
      supplierName: fields['Supplier Name'],
      contactPerson: fields['Contact Person'],
      nameOfBusiness: fields['Name of Business'],
      tradingName: fields['Trading Name'],
      companyRegistrationNo: fields['Company Registration No.'],
      
      // Address
      physicalAddress: fields['Physical Address'],
      postalAddress: fields['Postal Address'],
      
      // Contact
      contactNumber: fields['Contact Number'],
      emailAddress: fields['E-mail Address'],
      
      // Business Details
      natureOfBusiness: fields['Nature of Business'],
      productsAndServices: fields['Products and/or Services'],
      associatedCompany: fields['Associated Company'],
      associatedCompanyRegistrationNo: fields['Associated Company Registration No.'],
      branchesContactNumbers: fields['Branches Contact Numbers (attach information if space is not adequate)'],
      
      // Banking Information
      bankAccountName: fields['Bank Account Name'],
      bankName: fields['Bank Name'],
      branchName: fields['Branch Name'],
      branchNumber: fields['Branch Number'],
      accountNumber: fields['Account Number'],
      typeOfAccount: fields['Type of Account'],
      
      // Responsible Person - Banking
      rpBanking: fields['Responsible Person (RP) - Banking'],
      rpBankingPhone: fields['RP Telephone Numbers - Banking'],
      rpBankingEmail: fields['RP e-mail address - Banking'],
      
      // Responsible Person - Quality Management
      rpQuality: fields['Responsible Person (RP) - Quality Management'],
      rpQualityPhone: fields['RP Telephone Numbers - Quality Management'],
      rpQualityEmail: fields['RP e-mail address - Quality Management'],
      
      // Responsible Person - SHE
      rpSHE: fields['Responsible Person (RP) - SHE'],
      rpSHEPhone: fields['RP Telephone Numbers - SHE'],
      rpSHEEmail: fields['RP e-mail address - SHE'],
      
      // BBBEE & Employment
      bbbeeStatus: fields['Broad-Based Black Economic Empowerment (BBBEE) Status'],
      numberOfEmployees: fields['Number of Employees'],
      
      // Responsible Person - BBBEE
      rpBBBEE: fields['Responsible Person (RP) - BBBEE'],
      rpBBBEEPhone: fields['RP Telephone Numbers - BBBEE'],
      rpBBBEEEmail: fields['RP e-mail address - BBBEE'],
      
      // Other
      associatedCompanyBranchName: fields['Associated Company Branch Name'],
      qualityManagementCertification: fields['Quality management Certification'],
      sheCertification: fields['Safety, Health and Environment (SHE) Certification'],
      authorizationAgreement: fields['The Supplier hereby authorises the undersigned to act on behalf of the Supplier, and agrees that all the information contained herein is accurate and correct:'],
      field39: fields['Field 39'],
      
      // Metadata
      submittedAt: new Date().toISOString(),
      airtableRecordId,
    }

    // Validate required fields
    if (!airtableData.nameOfBusiness || !airtableData.emailAddress) {
      console.error('❌ Missing required fields:', { 
        nameOfBusiness: airtableData.nameOfBusiness, 
        emailAddress: airtableData.emailAddress 
      })
      return NextResponse.json(
        { success: false, error: 'Missing required fields: Name of Business and E-mail Address are required' },
        { status: 400 }
      )
    }

    // Check if supplier already exists (by email or Airtable record ID)
    const existingSupplier = await prisma.supplier.findFirst({
      where: {
        OR: [
          { contactEmail: airtableData.emailAddress },
          { airtableRecordId: airtableRecordId }
        ]
      }
    })

    if (existingSupplier) {
      console.log('ℹ️ Supplier already exists:', existingSupplier.id)
      
      // Update existing supplier with ALL fields
      const updated = await prisma.supplier.update({
        where: { id: existingSupplier.id },
        data: {
          // Basic Information (Fields 1-5)
          supplierName: airtableData.supplierName,
          contactPerson: airtableData.contactPerson,
          companyName: airtableData.nameOfBusiness,
          tradingName: airtableData.tradingName,
          registrationNumber: airtableData.companyRegistrationNo,
          
          // Address (Fields 6-7)
          physicalAddress: airtableData.physicalAddress,
          postalAddress: airtableData.postalAddress,
          
          // Contact (Fields 8-9)
          contactPhone: airtableData.contactNumber,
          contactEmail: airtableData.emailAddress,
          
          // Business Details (Fields 10-14)
          natureOfBusiness: airtableData.natureOfBusiness,
          productsAndServices: airtableData.productsAndServices,
          associatedCompany: airtableData.associatedCompany,
          associatedCompanyRegNo: airtableData.associatedCompanyRegistrationNo,
          branchesContactNumbers: airtableData.branchesContactNumbers,
          
          // Banking Information (Fields 15-20)
          bankAccountName: airtableData.bankAccountName,
          bankName: airtableData.bankName,
          branchName: airtableData.branchName,
          branchNumber: airtableData.branchNumber,
          accountNumber: airtableData.accountNumber,
          typeOfAccount: airtableData.typeOfAccount,
          
          // Responsible Person - Banking (Fields 21-23)
          rpBanking: airtableData.rpBanking,
          rpBankingPhone: airtableData.rpBankingPhone,
          rpBankingEmail: airtableData.rpBankingEmail,
          
          // Responsible Person - Quality Management (Fields 24-26)
          rpQuality: airtableData.rpQuality,
          rpQualityPhone: airtableData.rpQualityPhone,
          rpQualityEmail: airtableData.rpQualityEmail,
          
          // Responsible Person - SHE (Fields 27-29)
          rpSHE: airtableData.rpSHE,
          rpSHEPhone: airtableData.rpSHEPhone,
          rpSHEEmail: airtableData.rpSHEEmail,
          
          // BBBEE & Employment (Fields 30-31)
          bbbeeLevel: airtableData.bbbeeStatus,
          numberOfEmployees: airtableData.numberOfEmployees,
          
          // Responsible Person - BBBEE (Fields 32-34)
          rpBBBEE: airtableData.rpBBBEE,
          rpBBBEEPhone: airtableData.rpBBBEEPhone,
          rpBBBEEEmail: airtableData.rpBBBEEEmail,
          
          // Other Fields (Fields 35-39)
          associatedCompanyBranchName: airtableData.associatedCompanyBranchName,
          qualityManagementCert: airtableData.qualityManagementCertification,
          sheCertification: airtableData.sheCertification,
          authorizationAgreement: airtableData.authorizationAgreement,
          field39: airtableData.field39,
          
          // Legacy/Computed Fields
          sector: airtableData.natureOfBusiness || 'Other',
          
          // Airtable Integration
          airtableRecordId: airtableRecordId,
          airtableData: airtableData as any,
        }
      })

      // Update onboarding status if exists
      const onboarding = await prisma.supplierOnboarding.findUnique({
        where: { supplierId: existingSupplier.id }
      })

      if (onboarding) {
        await prisma.supplierOnboarding.update({
          where: { id: onboarding.id },
          data: {
            supplierFormSubmitted: true,
            supplierFormSubmittedAt: new Date(),
            currentStep: 'REVIEW',
            overallStatus: 'DOCUMENTS_RECEIVED',
          }
        })

        // Add timeline entry
        await prisma.onboardingTimeline.create({
          data: {
            onboardingId: onboarding.id,
            step: 'PENDING_SUPPLIER_RESPONSE',
            status: 'DOCUMENTS_RECEIVED',
            action: 'Supplier form submitted via Airtable',
            description: `Form data received for ${supplierData.companyName}`,
            performedBy: 'Airtable Webhook',
            metadata: { airtableRecordId }
          }
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Supplier updated successfully',
        supplierId: updated.id,
        action: 'updated'
      })
    }

    // Create new supplier if doesn't exist
    // Find a system user to assign as creator
    const systemUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!systemUser) {
      return NextResponse.json(
        { success: false, error: 'No admin user found. Please create at least one admin user first.' },
        { status: 500 }
      )
    }

    // Generate alphanumeric sequential supplier code
    const { generateSupplierCode } = await import('@/lib/generate-supplier-code')
    const supplierCode = await generateSupplierCode()

    // Create supplier and onboarding with ALL 39 fields
    const result = await prisma.$transaction(async (tx) => {
      const supplier = await tx.supplier.create({
        data: {
          supplierCode,
          
          // Basic Information (Fields 1-5)
          supplierName: airtableData.supplierName,
          contactPerson: airtableData.contactPerson || airtableData.nameOfBusiness,
          companyName: airtableData.nameOfBusiness,
          tradingName: airtableData.tradingName,
          registrationNumber: airtableData.companyRegistrationNo,
          
          // Address (Fields 6-7)
          physicalAddress: airtableData.physicalAddress,
          postalAddress: airtableData.postalAddress,
          
          // Contact (Fields 8-9)
          contactPhone: airtableData.contactNumber,
          contactEmail: airtableData.emailAddress,
          
          // Business Details (Fields 10-14)
          natureOfBusiness: airtableData.natureOfBusiness,
          productsAndServices: airtableData.productsAndServices,
          associatedCompany: airtableData.associatedCompany,
          associatedCompanyRegNo: airtableData.associatedCompanyRegistrationNo,
          branchesContactNumbers: airtableData.branchesContactNumbers,
          
          // Banking Information (Fields 15-20)
          bankAccountName: airtableData.bankAccountName,
          bankName: airtableData.bankName,
          branchName: airtableData.branchName,
          branchNumber: airtableData.branchNumber,
          accountNumber: airtableData.accountNumber,
          typeOfAccount: airtableData.typeOfAccount,
          
          // Responsible Person - Banking (Fields 21-23)
          rpBanking: airtableData.rpBanking,
          rpBankingPhone: airtableData.rpBankingPhone,
          rpBankingEmail: airtableData.rpBankingEmail,
          
          // Responsible Person - Quality Management (Fields 24-26)
          rpQuality: airtableData.rpQuality,
          rpQualityPhone: airtableData.rpQualityPhone,
          rpQualityEmail: airtableData.rpQualityEmail,
          
          // Responsible Person - SHE (Fields 27-29)
          rpSHE: airtableData.rpSHE,
          rpSHEPhone: airtableData.rpSHEPhone,
          rpSHEEmail: airtableData.rpSHEEmail,
          
          // BBBEE & Employment (Fields 30-31)
          bbbeeLevel: airtableData.bbbeeStatus,
          numberOfEmployees: airtableData.numberOfEmployees,
          
          // Responsible Person - BBBEE (Fields 32-34)
          rpBBBEE: airtableData.rpBBBEE,
          rpBBBEEPhone: airtableData.rpBBBEEPhone,
          rpBBBEEEmail: airtableData.rpBBBEEEmail,
          
          // Other Fields (Fields 35-39)
          associatedCompanyBranchName: airtableData.associatedCompanyBranchName,
          qualityManagementCert: airtableData.qualityManagementCertification,
          sheCertification: airtableData.sheCertification,
          authorizationAgreement: airtableData.authorizationAgreement,
          field39: airtableData.field39,
          
          // Legacy/Computed Fields
          businessType: 'OTHER',
          sector: airtableData.natureOfBusiness || 'Other',
          
          // Airtable Integration
          airtableRecordId: airtableRecordId,
          airtableData: airtableData as any,
          
          // Status
          status: 'UNDER_REVIEW',
          createdById: systemUser.id,
        }
      })

      const onboarding = await tx.supplierOnboarding.create({
        data: {
          supplierId: supplier.id,
          contactName: airtableData.contactPerson || airtableData.nameOfBusiness,
          contactEmail: airtableData.emailAddress,
          businessType: 'OTHER',
          sector: airtableData.natureOfBusiness || 'Other',
          currentStep: 'REVIEW',
          overallStatus: 'DOCUMENTS_RECEIVED',
          emailSent: false,
          supplierFormSubmitted: true,
          supplierFormSubmittedAt: new Date(),
          supplierResponseData: airtableData as any,
          initiatedById: systemUser.id,
          requiredDocuments: [],
        }
      })

      // Add timeline entry
      await tx.onboardingTimeline.create({
        data: {
          onboardingId: onboarding.id,
          step: 'PENDING_SUPPLIER_RESPONSE',
          status: 'DOCUMENTS_RECEIVED',
          action: 'Supplier form submitted via Airtable',
          description: `New supplier ${supplierData.companyName} submitted onboarding form`,
          performedBy: 'Airtable Webhook',
          metadata: { airtableRecordId }
        }
      })

      return { supplier, onboarding }
    })

    console.log('✅ Supplier created from Airtable:', result.supplier.id)

    return NextResponse.json({
      success: true,
      message: 'Supplier created successfully from Airtable',
      supplierId: result.supplier.id,
      onboardingId: result.onboarding.id,
      action: 'created'
    })

  } catch (error) {
    console.error('❌ Error processing Airtable webhook:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process Airtable webhook',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to verify webhook is working
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Airtable webhook endpoint is active',
    endpoint: '/api/airtable/webhook',
    method: 'POST'
  })
}

