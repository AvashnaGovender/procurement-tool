import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir, readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import nodemailer from 'nodemailer'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extract onboarding token if provided
    const onboardingToken = formData.get('onboardingToken')?.toString() || null

    // Extract all form fields
    const supplierData = {
      supplierName: formData.get('supplierName')?.toString() || '',
      contactPerson: formData.get('contactPerson')?.toString() || '',
      tradingName: formData.get('tradingName')?.toString() || '',
      companyRegistrationNo: formData.get('companyRegistrationNo')?.toString() || '',
      physicalAddress: formData.get('physicalAddress')?.toString() || '',
      postalAddress: formData.get('postalAddress')?.toString() || '',
      contactNumber: formData.get('contactNumber')?.toString() || '',
      emailAddress: formData.get('emailAddress')?.toString() || '',
      natureOfBusiness: formData.get('natureOfBusiness')?.toString() || '',
      productsAndServices: formData.get('productsAndServices')?.toString() || '',
      associatedCompany: formData.get('associatedCompany')?.toString() || '',
      associatedCompanyRegistrationNo: formData.get('associatedCompanyRegistrationNo')?.toString() || '',
      branchesContactNumbers: formData.get('branchesContactNumbers')?.toString() || '',
      bankAccountName: formData.get('bankAccountName')?.toString() || '',
      bankName: formData.get('bankName')?.toString() || '',
      branchName: formData.get('branchName')?.toString() || '',
      branchNumber: formData.get('branchNumber')?.toString() || '',
      accountNumber: formData.get('accountNumber')?.toString() || '',
      typeOfAccount: formData.get('typeOfAccount')?.toString() || '',
      rpBanking: formData.get('rpBanking')?.toString() || '',
      rpBankingPhone: formData.get('rpBankingPhone')?.toString() || '',
      rpBankingEmail: formData.get('rpBankingEmail')?.toString() || '',
      rpQuality: formData.get('rpQuality')?.toString() || '',
      rpQualityPhone: formData.get('rpQualityPhone')?.toString() || '',
      rpQualityEmail: formData.get('rpQualityEmail')?.toString() || '',
      rpSHE: formData.get('rpSHE')?.toString() || '',
      rpSHEPhone: formData.get('rpSHEPhone')?.toString() || '',
      rpSHEEmail: formData.get('rpSHEEmail')?.toString() || '',
      bbbeeStatus: formData.get('bbbeeStatus')?.toString() || '',
      numberOfEmployees: formData.get('numberOfEmployees')?.toString() || '0',
      rpBBBEE: formData.get('rpBBBEE')?.toString() || '',
      rpBBBEEPhone: formData.get('rpBBBEEPhone')?.toString() || '',
      rpBBBEEEmail: formData.get('rpBBBEEEmail')?.toString() || '',
      associatedCompanyBranchName: formData.get('associatedCompanyBranchName')?.toString() || '',
      qualityManagementCert: formData.get('qualityManagementCert') === 'true',
      sheCertification: formData.get('sheCertification') === 'true',
      authorizationAgreement: formData.get('authorizationAgreement') === 'true',
      field39: formData.get('field39')?.toString() || '',
      vatRegistered: formData.get('vatRegistered') === 'true',
    }

    // Validate required fields
    if (!supplierData.supplierName || !supplierData.emailAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: Supplier Name and Email Address are required' },
        { status: 400 }
      )
    }

    // Check if this is linked to an onboarding process
    let existingOnboarding = null
    let existingSupplier = null
    
    if (onboardingToken) {
      // Find onboarding record by token
      existingOnboarding = await prisma.supplierOnboarding.findUnique({
        where: { onboardingToken },
        include: { supplier: true }
      })
      
      if (existingOnboarding) {
        existingSupplier = existingOnboarding.supplier
      }
    } else {
      // Check if supplier already exists (for non-linked submissions)
      existingSupplier = await prisma.supplier.findFirst({
        where: { contactEmail: supplierData.emailAddress }
      })

      if (existingSupplier) {
        return NextResponse.json(
          { success: false, error: 'A supplier with this email address already exists' },
          { status: 400 }
        )
      }
    }

    // Find system user for creation
    const systemUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!systemUser) {
      return NextResponse.json(
        { success: false, error: 'System error: No admin user found' },
        { status: 500 }
      )
    }

        // Process file uploads
        const uploadedFiles: { [key: string]: string[] } = {}
        const uploadsDir = join(process.cwd(), 'data', 'uploads', 'suppliers')

        // Create uploads directory if it doesn't exist
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true })
        }

        // Use existing supplier code if available, otherwise generate new one
        const supplierId = existingSupplier?.supplierCode || `SUP-${Date.now()}-${Math.random().toString(36).substring(7)}`
        const supplierDir = join(uploadsDir, supplierId)
        
        // Determine version number for file uploads
        let versionNumber = 1
        if (existingOnboarding && existingOnboarding.revisionCount > 0) {
          versionNumber = existingOnboarding.revisionCount + 1
        }
        
        // Create versioned directory for this submission
        const versionDir = join(supplierDir, `v${versionNumber}`)
        await mkdir(versionDir, { recursive: true })
        
        console.log('📁 Using supplier folder:', supplierId)
        console.log('📁 Version:', versionNumber)

    // File categories
    const fileCategories = [
      'cipcCertificate', 'companyRegistration', 'cm29Directors', 'shareholderCerts', 'proofOfShareholding',
      'bbbeeScorecard', 'bbbeeAccreditation', 'taxClearance', 'vatCertificate',
      'bankConfirmation', 'nda', 'healthSafety', 'creditApplication',
      'qualityCert', 'goodStanding', 'sectorRegistrations', 'organogram', 'companyProfile'
    ]

    // Process each file category
    for (const category of fileCategories) {
      const categoryFiles: string[] = []
      const categoryDir = join(versionDir, category)
      
      // Check if there are files for this category
      let fileIndex = 0
      let file = formData.get(`${category}[${fileIndex}]`)
      
      while (file) {
        if (file instanceof File) {
          // Validate file type - only accept PDF files
          const fileExtension = file.name.toLowerCase().split('.').pop()
          const mimeType = file.type.toLowerCase()
          
          if (fileExtension !== 'pdf' && mimeType !== 'application/pdf') {
            return NextResponse.json(
              { 
                success: false, 
                error: `Invalid file type for ${category}. Only PDF files are accepted. File "${file.name}" is not a PDF.` 
              },
              { status: 400 }
            )
          }

          // Create category directory if it doesn't exist
          if (!existsSync(categoryDir)) {
            await mkdir(categoryDir, { recursive: true })
          }

          // Save file
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)
          const fileName = `${Date.now()}-${file.name}`
          const filePath = join(categoryDir, fileName)
          
          await writeFile(filePath, buffer)
          categoryFiles.push(fileName)
          
          console.log(`✅ Saved file: v${versionNumber}/${category}/${fileName}`)
        }
        
        fileIndex++
        file = formData.get(`${category}[${fileIndex}]`)
      }
      
      if (categoryFiles.length > 0) {
        uploadedFiles[category] = categoryFiles
      }
    }

    // Create or update supplier record
    const supplierCode = existingSupplier?.supplierCode || supplierId
    
    const supplierPayload = {
      supplierName: supplierData.supplierName,
      contactPerson: supplierData.contactPerson,
      companyName: supplierData.supplierName,
      tradingName: supplierData.tradingName,
      registrationNumber: supplierData.companyRegistrationNo,
      physicalAddress: supplierData.physicalAddress,
      postalAddress: supplierData.postalAddress,
      contactPhone: supplierData.contactNumber,
      contactEmail: supplierData.emailAddress,
      natureOfBusiness: supplierData.natureOfBusiness,
      productsAndServices: supplierData.productsAndServices,
      associatedCompany: supplierData.associatedCompany,
      associatedCompanyRegNo: supplierData.associatedCompanyRegistrationNo,
      branchesContactNumbers: supplierData.branchesContactNumbers,
      bankAccountName: supplierData.bankAccountName,
      bankName: supplierData.bankName,
      branchName: supplierData.branchName,
      branchNumber: supplierData.branchNumber,
      accountNumber: supplierData.accountNumber,
      typeOfAccount: supplierData.typeOfAccount,
      rpBanking: supplierData.rpBanking,
      rpBankingPhone: supplierData.rpBankingPhone,
      rpBankingEmail: supplierData.rpBankingEmail,
      rpQuality: supplierData.rpQuality,
      rpQualityPhone: supplierData.rpQualityPhone,
      rpQualityEmail: supplierData.rpQualityEmail,
      rpSHE: supplierData.rpSHE,
      rpSHEPhone: supplierData.rpSHEPhone,
      rpSHEEmail: supplierData.rpSHEEmail,
      bbbeeLevel: supplierData.bbbeeStatus,
      numberOfEmployees: parseInt(supplierData.numberOfEmployees) || 0,
      rpBBBEE: supplierData.rpBBBEE,
      rpBBBEEPhone: supplierData.rpBBBEEPhone,
      rpBBBEEEmail: supplierData.rpBBBEEEmail,
      associatedCompanyBranchName: supplierData.associatedCompanyBranchName,
      qualityManagementCert: supplierData.qualityManagementCert,
      sheCertification: supplierData.sheCertification,
      authorizationAgreement: supplierData.authorizationAgreement,
      field39: supplierData.field39,
      businessType: (existingOnboarding?.businessType || 'OTHER') as any,
      sector: supplierData.natureOfBusiness || existingOnboarding?.sector || 'Other',
      airtableData: {
        uploadedFiles,
        submissionDate: new Date().toISOString(),
        source: 'custom-form',
        onboardingToken: onboardingToken || undefined,
        version: versionNumber,
        vatRegistered: supplierData.vatRegistered,
        allVersions: existingSupplier?.airtableData?.allVersions 
          ? [...existingSupplier.airtableData.allVersions, { version: versionNumber, uploadedFiles, date: new Date().toISOString() }]
          : [{ version: versionNumber, uploadedFiles, date: new Date().toISOString() }]
      } as any,
      status: 'UNDER_REVIEW' as any,
    }
    
    let supplier
    if (existingSupplier) {
      // Update existing supplier
      supplier = await prisma.supplier.update({
        where: { id: existingSupplier.id },
        data: supplierPayload
      })
    } else {
      // Create new supplier
      supplier = await prisma.supplier.create({
        data: {
          ...supplierPayload,
          supplierCode,
          createdById: systemUser.id,
        }
      })
    }

    // Create or update onboarding record
    let onboarding
    if (existingOnboarding) {
      // Update existing onboarding workflow
      onboarding = await prisma.supplierOnboarding.update({
        where: { id: existingOnboarding.id },
        data: {
          supplierFormSubmitted: true,
          supplierFormSubmittedAt: new Date(),
          documentsUploaded: Object.keys(uploadedFiles).length > 0,
          documentsUploadedAt: Object.keys(uploadedFiles).length > 0 ? new Date() : null,
          supplierResponseData: {
            ...supplierData,
            uploadedFiles
          } as any,
          currentStep: 'REVIEW',
          overallStatus: 'DOCUMENTS_RECEIVED',
          approvalStatus: 'PENDING', // Set approval status to PENDING so it shows in initiator's view
          revisionRequested: false, // Reset revision flag when supplier resubmits
          revisionNotes: null, // Clear previous revision notes
          documentsToRevise: [], // Clear documents to revise list
        }
      })
    } else {
      // Create new onboarding record (for standalone submissions without workflow)
      onboarding = await prisma.supplierOnboarding.create({
        data: {
          supplier: {
            connect: { id: supplier.id }
          },
          initiatedBy: {
            connect: { id: systemUser.id }
          },
          contactName: supplierData.contactPerson,
          contactEmail: supplierData.emailAddress,
          businessType: 'OTHER',
          sector: supplierData.natureOfBusiness || 'Other',
          currentStep: 'REVIEW',
          overallStatus: 'DOCUMENTS_RECEIVED',
          emailSent: false,
          supplierFormSubmitted: true,
          supplierFormSubmittedAt: new Date(),
          documentsUploaded: Object.keys(uploadedFiles).length > 0,
          documentsUploadedAt: Object.keys(uploadedFiles).length > 0 ? new Date() : null,
          supplierResponseData: {
            ...supplierData,
            uploadedFiles
          } as any,
          requiredDocuments: [],
        }
      })
    }

    // Create timeline entry
    await prisma.onboardingTimeline.create({
      data: {
        onboardingId: onboarding.id,
        step: 'PENDING_SUPPLIER_RESPONSE',
        status: 'DOCUMENTS_RECEIVED',
        action: 'Supplier form submitted',
        description: `${supplierData.supplierName} submitted onboarding form with ${Object.keys(uploadedFiles).length} document categories`,
        performedBy: supplierData.contactPerson,
        metadata: {
          source: 'custom-form',
          documentsCategories: Object.keys(uploadedFiles),
          totalFiles: Object.values(uploadedFiles).reduce((acc, files) => acc + files.length, 0)
        } as any
      }
    })

    console.log(`✅ Supplier created: ${supplier.id} (${supplier.companyName})`)

    // Get Procurement Manager emails for notifications
    // When supplier uploads documents, ONLY PM should be notified, NOT the initiator
    let recipientEmails: string[] = []
    let recipientNames: string[] = []
    
    try {
      // Get all Procurement Managers
      const procurementManagers = await prisma.user.findMany({
        where: { 
          role: 'PROCUREMENT_MANAGER',
          isActive: true 
        },
        select: {
          email: true,
          name: true
        }
      })
      
      if (procurementManagers.length > 0) {
        recipientEmails = procurementManagers.map(pm => pm.email)
        recipientNames = procurementManagers.map(pm => pm.name || pm.email.split('@')[0])
        console.log('📧 Found Procurement Managers for notifications:', recipientEmails)
      } else {
        console.log('⚠️ No Procurement Managers found, falling back to Admin users')
        // Fallback: Get admin users
        const adminUsers = await prisma.user.findMany({
          where: { 
            role: 'ADMIN',
            isActive: true 
          },
          select: {
            email: true,
            name: true
          }
        })
        
        if (adminUsers.length > 0) {
          recipientEmails = adminUsers.map(admin => admin.email)
          recipientNames = adminUsers.map(admin => admin.name || 'Admin')
          console.log('📧 Using admin emails as fallback for notifications:', recipientEmails)
        }
      }
    } catch (error) {
      console.log('⚠️ Could not determine recipient emails, will use system default')
    }

    // Send email notifications
    try {
      console.log('📧 Attempting to send email notifications to Procurement Managers...')
      await sendEmailNotifications(supplier, supplierData, uploadedFiles, recipientEmails, recipientNames, existingOnboarding)
      console.log('✅ Email notifications sent successfully')
    } catch (emailError) {
      console.error('⚠️ Email notification failed (form still submitted):')
      console.error(emailError)
      if (emailError instanceof Error) {
        console.error('Error message:', emailError.message)
        console.error('Error stack:', emailError.stack)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Supplier onboarding form submitted successfully',
      supplierId: supplier.id,
      supplierCode: supplier.supplierCode,
    })

  } catch (error) {
    console.error('❌ Error submitting supplier form:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit form',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function sendEmailNotifications(
  supplier: any,
  supplierData: any,
  uploadedFiles: { [key: string]: string[] },
  pmEmails: string[],
  pmNames: string[],
  onboarding: any = null
) {
  try {
    console.log('📧 sendEmailNotifications called')
    console.log('PM emails:', pmEmails.join(', '))
    console.log('Supplier email:', supplierData.emailAddress)
    
    // Load SMTP configuration
    const configPath = join(process.cwd(), 'data', 'smtp-config.json')
    const configData = await readFile(configPath, 'utf8')
    const smtpConfig = JSON.parse(configData)

    console.log('SMTP Config loaded:', {
      host: smtpConfig.host,
      port: smtpConfig.port,
      user: smtpConfig.user,
      hasPassword: !!smtpConfig.pass
    })

    if (!smtpConfig || !smtpConfig.host) {
      console.log('⚠️ SMTP not configured, skipping email notifications')
      return
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.user || smtpConfig.username,
        pass: smtpConfig.pass || smtpConfig.password,
      },
    })

    const totalFiles = Object.values(uploadedFiles).reduce((acc, files) => acc + files.length, 0)
    const documentCategories = Object.keys(uploadedFiles).join(', ')

    // Use Procurement Manager emails or fallback to company email
    const recipientEmails = pmEmails.length > 0 ? pmEmails : [smtpConfig.fromEmail]
    const recipientNamesStr = pmNames.length > 0 ? pmNames.join(', ') : 'Procurement Team'
    
    console.log('\n📧 ===== SENDING EMAIL TO PROCUREMENT MANAGERS =====')
    console.log('   Recipient Emails:', recipientEmails.join(', '))
    console.log('   Recipient Names:', recipientNamesStr)
    console.log('   Supplier:', supplierData.supplierName)
    console.log('   Total Files:', totalFiles)
    console.log('====================================================\n')
    
    // Check if this is a revision
    const isRevision = onboarding?.revisionCount > 0
    const revisionNotes = onboarding?.revisionNotes || null

    // Get base URL for email links
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    // 1. Send notification to Procurement Managers (NOT initiator)
    const pmNotification = {
      from: smtpConfig.fromEmail,
      to: recipientEmails.join(', '), // Send to all Procurement Managers
      subject: isRevision 
        ? `Supplier Revision Submitted: ${supplierData.supplierName} (Revision ${onboarding.revisionCount})`
        : `Supplier Documents Received: ${supplierData.supplierName}`,
      html: `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Supplier Onboarding Notification</title>
          <style type="text/css">
            /* Reset styles for email clients */
            body, table, td, p, a, li, blockquote {
              -webkit-text-size-adjust: 100%;
              -ms-text-size-adjust: 100%;
            }
            table, td {
              mso-table-lspace: 0pt;
              mso-table-rspace: 0pt;
            }
            img {
              -ms-interpolation-mode: bicubic;
              border: 0;
              height: auto;
              line-height: 100%;
              outline: none;
              text-decoration: none;
            }
            
            /* Main styles */
            body {
              height: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
            }
            
            .email-container {
              max-width: 650px;
              margin: 0 auto;
              background-color: #ffffff;
            }
            
            .header {
              background-color: #ffffff;
              padding: 40px 30px;
              text-align: center;
              border-bottom: 3px solid #1e40af;
            }
            
            .header h1 {
              margin: 0;
              font-size: 26px;
              font-weight: 600;
              color: #1e40af;
              line-height: 1.2;
            }
            
            .header p {
              margin: 10px 0 0 0;
              font-size: 14px;
              color: #64748b;
              opacity: 0.9;
            }
            
            .content {
              background: white;
              padding: 40px 30px;
              color: #333333;
              line-height: 1.6;
              font-size: 16px;
            }
            
            .info-section {
              background: #eff6ff;
              border-left: 4px solid #3b82f6;
              padding: 20px;
              margin: 25px 0;
              border-radius: 4px;
            }
            
            .info-section h2 {
              margin: 0 0 15px 0;
              color: #1e40af;
              font-size: 18px;
              font-weight: 600;
            }
            
            .info-row {
              margin: 12px 0;
              padding: 10px 0;
              border-bottom: 1px solid #e0e0e0;
            }
            
            .info-row:last-child {
              border-bottom: none;
            }
            
            .label {
              font-weight: 600;
              color: #0047AB;
              display: inline-block;
              min-width: 160px;
            }
            
            .value {
              color: #333;
            }
            
            .button-container {
              text-align: center;
              margin: 30px 0;
            }
            
            .button {
              display: inline-block;
              background: #3b82f6;
              color: white;
              padding: 15px 40px;
              text-decoration: none;
              font-weight: bold;
              font-size: 16px;
              border-radius: 8px;
            }
            
            .footer {
              background: #f9fafb;
              text-align: center;
              padding: 30px;
              color: #6b7280;
              font-size: 14px;
              border-top: 1px solid #e5e7eb;
            }
            
            .footer p {
              margin: 5px 0;
            }
            
            /* Mobile styles */
            @media only screen and (max-width: 600px) {
              .email-container {
                width: 100% !important;
              }
              .header {
                padding: 30px 20px !important;
              }
              .header h1 {
                font-size: 22px !important;
              }
              .content {
                padding: 30px 20px !important;
              }
              .info-section {
                padding: 15px !important;
              }
              .info-section h2 {
                font-size: 16px !important;
              }
              .label {
                min-width: auto !important;
                display: block !important;
                margin-bottom: 5px !important;
              }
              .button {
                padding: 12px 30px !important;
                font-size: 14px !important;
              }
              .footer {
                padding: 20px !important;
              }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
            <tr>
              <td align="center" style="padding: 20px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="650" class="email-container" style="background-color: #ffffff;">
                  <!-- Header -->
                  <tr>
                    <td class="header" style="background-color: #ffffff; padding: 40px 30px; text-align: center; border-bottom: 3px solid #1e40af;">
                      <img src="cid:logo" alt="Schauenburg Systems" class="logo" style="max-width: 150px; height: auto; margin-bottom: 20px;" />
                      <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #1e40af; line-height: 1.2;">${isRevision ? 'Revised Supplier Submission' : 'New Supplier Onboarding Submission'}</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td class="content" style="background: white; padding: 40px 30px; color: #333333; line-height: 1.6; font-size: 16px;">
                      ${isRevision ? `
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #fff3cd; border: 2px solid #ffc107; margin-bottom: 25px;">
                          <tr>
                            <td style="padding: 20px;">
                              <h3 style="margin: 0 0 10px 0; color: #856404; font-size: 18px;">🔄 Revision Submission (Version ${onboarding.revisionCount + 1})</h3>
                              <p style="margin: 0 0 15px 0; color: #856404; font-weight: 600;">The supplier has updated their submission based on your revision request. Please review the changes.</p>
                              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: white;">
                                <tr>
                                  <td style="padding: 15px;">
                                    <p style="margin: 0 0 8px 0; font-weight: 600; color: #333;">Original Revision Request:</p>
                                    <p style="margin: 0; color: #666; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${revisionNotes}</p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      ` : `
                        <p>A supplier has completed the onboarding form and submitted their documentation for your review.</p>
                      `}
                      
                      <!-- Company Information -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #eff6ff; border-left: 4px solid #3b82f6; margin: 25px 0; border-radius: 4px;">
                        <tr>
                          <td style="padding: 20px;">
                            <h2 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px; font-weight: 600;">Company Information</h2>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                              <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                                  <span style="font-weight: 600; color: #1e40af; display: inline-block; min-width: 160px;">Company Name:</span>
                                  <span style="color: #333;">${supplierData.supplierName}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                                  <span style="font-weight: 600; color: #0047AB; display: inline-block; min-width: 160px;">Trading Name:</span>
                                  <span style="color: #333;">${supplierData.tradingName || 'N/A'}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0;">
                                  <span style="font-weight: 600; color: #0047AB; display: inline-block; min-width: 160px;">Supplier Code:</span>
                                  <span style="color: #333;">${supplier.supplierCode}</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Contact Details -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #eff6ff; border-left: 4px solid #3b82f6; margin: 25px 0; border-radius: 4px;">
                        <tr>
                          <td style="padding: 20px;">
                            <h2 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px; font-weight: 600;">Contact Details</h2>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                              <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                                  <span style="font-weight: 600; color: #0047AB; display: inline-block; min-width: 160px;">Contact Person:</span>
                                  <span style="color: #333;">${supplierData.contactPerson}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                                  <span style="font-weight: 600; color: #0047AB; display: inline-block; min-width: 160px;">Email:</span>
                                  <span style="color: #333;">${supplierData.emailAddress}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0;">
                                  <span style="font-weight: 600; color: #0047AB; display: inline-block; min-width: 160px;">Phone:</span>
                                  <span style="color: #333;">${supplierData.contactNumber}</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Submission Details -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #eff6ff; border-left: 4px solid #3b82f6; margin: 25px 0; border-radius: 4px;">
                        <tr>
                          <td style="padding: 20px;">
                            <h2 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px; font-weight: 600;">Submission Details</h2>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                              ${isRevision ? `
                                <tr>
                                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                                    <span style="font-weight: 600; color: #1e40af; display: inline-block; min-width: 160px;">Submission Type:</span>
                                    <span style="color: #ffc107; font-weight: 600;">Revision ${onboarding.revisionCount}</span>
                                  </td>
                                </tr>
                              ` : ''}
                              <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                                  <span style="font-weight: 600; color: #1e40af; display: inline-block; min-width: 160px;">Documents Submitted:</span>
                                  <span style="color: #333;">${totalFiles} files in ${Object.keys(uploadedFiles).length} categories</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                                  <span style="font-weight: 600; color: #1e40af; display: inline-block; min-width: 160px;">Categories:</span>
                                  <span style="color: #333; font-size: 13px;">${documentCategories}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0;">
                                  <span style="font-weight: 600; color: #1e40af; display: inline-block; min-width: 160px;">Submission Date:</span>
                                  <span style="color: #333;">${new Date().toLocaleString()}</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Button -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${baseUrl}/admin/approvals?tab=reviews" style="display: inline-block; background: #3b82f6; color: white; padding: 15px 40px; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 8px;">
                              Review Document Submission
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin-top: 30px; font-size: 14px; color: #666;">
                        ${isRevision 
                          ? 'Please review the updated submission and the changes made based on your revision request.' 
                          : 'Please review the submission and verify all documents within 1-2 business days.'
                        }
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td class="footer" style="background: #f9fafb; text-align: center; padding: 30px; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0;">Schauenburg Systems</p>
                      <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
                        This is an automated notification from the Supplier Onboarding System.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: 'logo.png',
          path: join(process.cwd(), 'public', 'logo.png'),
          cid: 'logo'
        }
      ]
    }

    console.log('📧 Sending Procurement Manager notification...')
    console.log('📨 Sending email to Procurement Managers...')
    console.log('   From:', pmNotification.from)
    console.log('   To:', pmNotification.to)
    console.log('   Subject:', pmNotification.subject)
    
    const pmResult = await transporter.sendMail(pmNotification)
    
    console.log(`✅ Procurement Manager notification email sent successfully!`)
    console.log('   To:', recipientEmails.join(', '))
    console.log('   Message ID:', pmResult.messageId)
    console.log('   Response:', pmResult.response)

    // Supplier thank you email removed - suppliers only receive initial onboarding email and final approval email
    console.log('📧 Skipping supplier thank you email (only initial and approval emails are sent)')

  } catch (error) {
    console.error('❌ Error sending emails:')
    console.error(error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    throw error
  }
}

