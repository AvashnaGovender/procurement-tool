import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { airtableApiKey, baseId, tableName } = body

    // Validate required fields
    if (!airtableApiKey || !baseId || !tableName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: airtableApiKey, baseId, and tableName' },
        { status: 400 }
      )
    }

    // Fetch data from Airtable
    const airtableUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`
    
    const response = await fetch(airtableUrl, {
      headers: {
        'Authorization': `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { success: false, error: `Airtable API error: ${error}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const records = data.records || []

    console.log(`📥 Found ${records.length} records in Airtable`)

    // Find a system user
    const systemUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!systemUser) {
      return NextResponse.json(
        { success: false, error: 'No admin user found. Please login first to create a user.' },
        { status: 500 }
      )
    }

    // Process each record
    const imported = []
    const updated = []
    const skipped = []
    const errors = []

    for (const record of records) {
      try {
        const fields = record.fields
        const airtableRecordId = record.id

        // Map all 39 Airtable fields
        const airtableData = {
          supplierName: fields['Supplier Name'],
          contactPerson: fields['Contact Person'],
          nameOfBusiness: fields['Name of Business'],
          tradingName: fields['Trading Name'],
          companyRegistrationNo: fields['Company Registration No.'],
          physicalAddress: fields['Physical Address'],
          postalAddress: fields['Postal Address'],
          contactNumber: fields['Contact Number'],
          emailAddress: fields['E-mail Address'],
          natureOfBusiness: fields['Nature of Business'],
          productsAndServices: fields['Products and/or Services'],
          associatedCompany: fields['Associated Company'],
          associatedCompanyRegistrationNo: fields['Associated Company Registration No.'],
          branchesContactNumbers: fields['Branches Contact Numbers (attach information if space is not adequate)'],
          bankAccountName: fields['Bank Account Name'],
          bankName: fields['Bank Name'],
          branchName: fields['Branch Name'],
          branchNumber: fields['Branch Number'],
          accountNumber: fields['Account Number'],
          typeOfAccount: fields['Type of Account'],
          rpBanking: fields['Responsible Person (RP) - Banking'],
          rpBankingPhone: fields['RP Telephone Numbers - Banking'],
          rpBankingEmail: fields['RP e-mail address - Banking'],
          rpQuality: fields['Responsible Person (RP) - Quality Management'],
          rpQualityPhone: fields['RP Telephone Numbers - Quality Management'],
          rpQualityEmail: fields['RP e-mail address - Quality Management'],
          rpSHE: fields['Responsible Person (RP) - SHE'],
          rpSHEPhone: fields['RP Telephone Numbers - SHE'],
          rpSHEEmail: fields['RP e-mail address - SHE'],
          bbbeeStatus: fields['Broad-Based Black Economic Empowerment (BBBEE) Status'],
          numberOfEmployees: fields['Number of Employees'],
          rpBBBEE: fields['Responsible Person (RP) - BBBEE'],
          rpBBBEEPhone: fields['RP Telephone Numbers - BBBEE'],
          rpBBBEEEmail: fields['RP e-mail address - BBBEE'],
          associatedCompanyBranchName: fields['Associated Company Branch Name'],
          qualityManagementCertification: fields['Quality management Certification'],
          sheCertification: fields['Safety, Health and Environment (SHE) Certification'],
          authorizationAgreement: fields['The Supplier hereby authorises the undersigned to act on behalf of the Supplier, and agrees that all the information contained herein is accurate and correct:'],
          field39: fields['Field 39'],
        }

        // Skip if missing required fields
        if (!airtableData.nameOfBusiness || !airtableData.emailAddress) {
          skipped.push({
            airtableId: airtableRecordId,
            reason: 'Missing required fields (Name of Business or E-mail Address)'
          })
          continue
        }

        // Check if already exists
        const existing = await prisma.supplier.findFirst({
          where: {
            OR: [
              { contactEmail: airtableData.emailAddress },
              { airtableRecordId: airtableRecordId }
            ]
          }
        })

        if (existing) {
          // Update existing
          await prisma.supplier.update({
            where: { id: existing.id },
            data: {
              supplierName: airtableData.supplierName,
              contactPerson: airtableData.contactPerson,
              companyName: airtableData.nameOfBusiness,
              tradingName: airtableData.tradingName,
              registrationNumber: airtableData.companyRegistrationNo,
              physicalAddress: airtableData.physicalAddress,
              postalAddress: airtableData.postalAddress,
              contactPhone: airtableData.contactNumber,
              contactEmail: airtableData.emailAddress,
              natureOfBusiness: airtableData.natureOfBusiness,
              productsAndServices: airtableData.productsAndServices,
              associatedCompany: airtableData.associatedCompany,
              associatedCompanyRegNo: airtableData.associatedCompanyRegistrationNo,
              branchesContactNumbers: airtableData.branchesContactNumbers,
              bankAccountName: airtableData.bankAccountName,
              bankName: airtableData.bankName,
              branchName: airtableData.branchName,
              branchNumber: airtableData.branchNumber,
              accountNumber: airtableData.accountNumber,
              typeOfAccount: airtableData.typeOfAccount,
              rpBanking: airtableData.rpBanking,
              rpBankingPhone: airtableData.rpBankingPhone,
              rpBankingEmail: airtableData.rpBankingEmail,
              rpQuality: airtableData.rpQuality,
              rpQualityPhone: airtableData.rpQualityPhone,
              rpQualityEmail: airtableData.rpQualityEmail,
              rpSHE: airtableData.rpSHE,
              rpSHEPhone: airtableData.rpSHEPhone,
              rpSHEEmail: airtableData.rpSHEEmail,
              bbbeeLevel: airtableData.bbbeeStatus,
              numberOfEmployees: airtableData.numberOfEmployees,
              rpBBBEE: airtableData.rpBBBEE,
              rpBBBEEPhone: airtableData.rpBBBEEPhone,
              rpBBBEEEmail: airtableData.rpBBBEEEmail,
              associatedCompanyBranchName: airtableData.associatedCompanyBranchName,
              qualityManagementCert: airtableData.qualityManagementCertification,
              sheCertification: airtableData.sheCertification,
              authorizationAgreement: airtableData.authorizationAgreement,
              field39: airtableData.field39,
              sector: airtableData.natureOfBusiness || 'Other',
              airtableRecordId: airtableRecordId,
              airtableData: airtableData as any,
            }
          })
          updated.push({ airtableId: airtableRecordId, email: airtableData.emailAddress })
        } else {
          // Create new supplier
          const supplierCode = `SUP-${Date.now()}-${Math.random().toString(36).substring(7)}`
          
          const supplier = await prisma.supplier.create({
            data: {
              supplierCode,
              supplierName: airtableData.supplierName,
              contactPerson: airtableData.contactPerson || airtableData.nameOfBusiness,
              companyName: airtableData.nameOfBusiness,
              tradingName: airtableData.tradingName,
              registrationNumber: airtableData.companyRegistrationNo,
              physicalAddress: airtableData.physicalAddress,
              postalAddress: airtableData.postalAddress,
              contactPhone: airtableData.contactNumber,
              contactEmail: airtableData.emailAddress,
              natureOfBusiness: airtableData.natureOfBusiness,
              productsAndServices: airtableData.productsAndServices,
              associatedCompany: airtableData.associatedCompany,
              associatedCompanyRegNo: airtableData.associatedCompanyRegistrationNo,
              branchesContactNumbers: airtableData.branchesContactNumbers,
              bankAccountName: airtableData.bankAccountName,
              bankName: airtableData.bankName,
              branchName: airtableData.branchName,
              branchNumber: airtableData.branchNumber,
              accountNumber: airtableData.accountNumber,
              typeOfAccount: airtableData.typeOfAccount,
              rpBanking: airtableData.rpBanking,
              rpBankingPhone: airtableData.rpBankingPhone,
              rpBankingEmail: airtableData.rpBankingEmail,
              rpQuality: airtableData.rpQuality,
              rpQualityPhone: airtableData.rpQualityPhone,
              rpQualityEmail: airtableData.rpQualityEmail,
              rpSHE: airtableData.rpSHE,
              rpSHEPhone: airtableData.rpSHEPhone,
              rpSHEEmail: airtableData.rpSHEEmail,
              bbbeeLevel: airtableData.bbbeeStatus,
              numberOfEmployees: airtableData.numberOfEmployees,
              rpBBBEE: airtableData.rpBBBEE,
              rpBBBEEPhone: airtableData.rpBBBEEPhone,
              rpBBBEEEmail: airtableData.rpBBBEEEmail,
              associatedCompanyBranchName: airtableData.associatedCompanyBranchName,
              qualityManagementCert: airtableData.qualityManagementCertification,
              sheCertification: airtableData.sheCertification,
              authorizationAgreement: airtableData.authorizationAgreement,
              field39: airtableData.field39,
              businessType: 'OTHER',
              sector: airtableData.natureOfBusiness || 'Other',
              airtableRecordId: airtableRecordId,
              airtableData: airtableData as any,
              status: 'UNDER_REVIEW',
              createdById: systemUser.id,
            }
          })

          imported.push({
            airtableId: airtableRecordId,
            supplierId: supplier.id,
            email: airtableData.emailAddress
          })
        }

      } catch (error) {
        console.error('Error processing record:', error)
        errors.push({
          airtableId: record.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${records.length} records: ${imported.length} imported, ${updated.length} updated, ${skipped.length} skipped, ${errors.length} errors`,
      imported: imported.length,
      updated: updated.length,
      skipped: skipped.length,
      errors: errors.length,
      details: {
        imported,
        updated,
        skipped,
        errors
      }
    })

  } catch (error) {
    console.error('Error importing from Airtable:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to import from Airtable',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

