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
      nameOfBusiness: formData.get('nameOfBusiness')?.toString() || '',
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
    }

    // Validate required fields
    if (!supplierData.nameOfBusiness || !supplierData.emailAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: Name of Business and Email Address are required' },
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
        const { generateSupplierCode } = await import('@/lib/generate-supplier-code')
        const supplierId = existingSupplier?.supplierCode || await generateSupplierCode()
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
      'companyRegistration', 'cm29Directors', 'shareholderCerts', 'proofOfShareholding',
      'bbbeeAccreditation', 'bbbeeScorecard', 'taxClearance', 'vatCertificate',
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
      companyName: supplierData.nameOfBusiness,
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
        description: `${supplierData.nameOfBusiness} submitted onboarding form with ${Object.keys(uploadedFiles).length} document categories`,
        performedBy: supplierData.contactPerson,
        metadata: {
          source: 'custom-form',
          documentsCategories: Object.keys(uploadedFiles),
          totalFiles: Object.values(uploadedFiles).reduce((acc, files) => acc + files.length, 0)
        } as any
      }
    })

    console.log(`✅ Supplier created: ${supplier.id} (${supplier.companyName})`)

    // Get initiator email for notifications
    // Priority: 1) Initiator from onboarding, 2) Logged-in user, 3) Fallback to system admin
    let recipientEmail = null
    let recipientName = null
    
    try {
      // First, try to get the initiator from the onboarding record
      if (existingOnboarding?.initiatedById) {
        const initiator = await prisma.user.findUnique({
          where: { id: existingOnboarding.initiatedById }
        })
        
        if (initiator) {
          recipientEmail = initiator.email
          recipientName = initiator.name || initiator.email.split('@')[0]
          console.log('📧 Using initiator email for notifications:', recipientEmail)
        }
      }
      
      // Fallback: Try to get logged-in user (if supplier is logged in)
      if (!recipientEmail) {
        const session = await getServerSession(authOptions)
        
        if (session?.user?.email) {
          recipientEmail = session.user.email
          recipientName = session.user.name || session.user.email.split('@')[0]
          console.log('📧 Using logged-in user email for notifications:', recipientEmail)
        }
      }
      
      // Last resort: Get first admin user
      if (!recipientEmail) {
        const adminUser = await prisma.user.findFirst({
          where: { role: 'ADMIN', isActive: true }
        })
        
        if (adminUser) {
          recipientEmail = adminUser.email
          recipientName = adminUser.name || 'Admin'
          console.log('📧 Using admin email as fallback for notifications:', recipientEmail)
        }
      }
    } catch (error) {
      console.log('⚠️ Could not determine recipient email, will use system default')
    }

    // Send email notifications
    try {
      console.log('📧 Attempting to send email notifications...')
      await sendEmailNotifications(supplier, supplierData, uploadedFiles, recipientEmail, recipientName, existingOnboarding)
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
  adminEmail: string | null,
  adminName: string | null,
  onboarding: any = null
) {
  try {
    console.log('📧 sendEmailNotifications called')
    console.log('Admin email:', adminEmail)
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

    // Determine recipient email (use initiator/logged-in user's email or fallback to company email)
    const recipientEmail = adminEmail || smtpConfig.fromEmail
    const senderName = adminName || smtpConfig.companyName || 'Procurement Team'
    
    console.log('\n📧 ===== SENDING EMAIL TO INITIATOR =====')
    console.log('   Recipient Email:', recipientEmail)
    console.log('   Recipient Name:', senderName)
    console.log('   Supplier:', supplierData.nameOfBusiness)
    console.log('   Total Files:', totalFiles)
    console.log('==========================================\n')
    
    // Check if this is a revision
    const isRevision = onboarding?.revisionCount > 0
    const revisionNotes = onboarding?.revisionNotes || null

    // Get base URL for email links
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    // 1. Send notification to initiator (person who created the supplier initiation request)
    const adminNotification = {
      from: smtpConfig.fromEmail,
      to: recipientEmail, // Send to initiator's email
      subject: isRevision 
        ? `Supplier Revision Submitted: ${supplierData.nameOfBusiness} (Revision ${onboarding.revisionCount})`
        : `Supplier Documents Received: ${supplierData.nameOfBusiness}`,
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
              background: #f8f9fa;
              border-left: 4px solid #0047AB;
              padding: 20px;
              margin: 25px 0;
            }
            
            .info-section h2 {
              margin: 0 0 15px 0;
              color: #0047AB;
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
              background: #0047AB;
              color: white;
              padding: 14px 40px;
              text-decoration: none;
              font-weight: 600;
              font-size: 16px;
            }
            
            .footer {
              background: #f8f9fa;
              text-align: center;
              padding: 25px 30px;
              color: #666;
              font-size: 12px;
              border-top: 3px solid #0047AB;
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
                    <td class="header" style="background-color: #0047AB; padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; font-size: 26px; font-weight: 600; color: #ffffff; line-height: 1.2;">${isRevision ? 'Revised Supplier Submission' : 'New Supplier Onboarding Submission'}</h1>
                      <p style="margin: 10px 0 0 0; font-size: 14px; color: #ffffff; opacity: 0.9;">Schauenburg Systems Procurement</p>
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
                              <p style="margin: 0 0 15px 0; color: #856404; font-weight: 600;">The supplier has updated their submission based on your revision request.</p>
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
                        <p>A new supplier has completed the onboarding form and submitted their documentation for review.</p>
                      `}
                      
                      <!-- Company Information -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #f8f9fa; border-left: 4px solid #0047AB; margin: 25px 0;">
                        <tr>
                          <td style="padding: 20px;">
                            <h2 style="margin: 0 0 15px 0; color: #0047AB; font-size: 18px; font-weight: 600;">Company Information</h2>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                              <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                                  <span style="font-weight: 600; color: #0047AB; display: inline-block; min-width: 160px;">Company Name:</span>
                                  <span style="color: #333;">${supplierData.nameOfBusiness}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                                  <span style="font-weight: 600; color: #0047AB; display: inline-block; min-width: 160px;">Trading Name:</span>
                                  <span style="color: #333;">${supplierData.tradingName || 'N/A'}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                                  <span style="font-weight: 600; color: #0047AB; display: inline-block; min-width: 160px;">Registration No:</span>
                                  <span style="color: #333;">${supplierData.companyRegistrationNo}</span>
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
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #f8f9fa; border-left: 4px solid #0047AB; margin: 25px 0;">
                        <tr>
                          <td style="padding: 20px;">
                            <h2 style="margin: 0 0 15px 0; color: #0047AB; font-size: 18px; font-weight: 600;">Contact Details</h2>
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
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #f8f9fa; border-left: 4px solid #0047AB; margin: 25px 0;">
                        <tr>
                          <td style="padding: 20px;">
                            <h2 style="margin: 0 0 15px 0; color: #0047AB; font-size: 18px; font-weight: 600;">Submission Details</h2>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                              ${isRevision ? `
                                <tr>
                                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                                    <span style="font-weight: 600; color: #0047AB; display: inline-block; min-width: 160px;">Submission Type:</span>
                                    <span style="color: #ffc107; font-weight: 600;">Revision ${onboarding.revisionCount}</span>
                                  </td>
                                </tr>
                              ` : ''}
                              <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                                  <span style="font-weight: 600; color: #0047AB; display: inline-block; min-width: 160px;">Documents Submitted:</span>
                                  <span style="color: #333;">${totalFiles} files in ${Object.keys(uploadedFiles).length} categories</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                                  <span style="font-weight: 600; color: #0047AB; display: inline-block; min-width: 160px;">Categories:</span>
                                  <span style="color: #333; font-size: 13px;">${documentCategories}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0;">
                                  <span style="font-weight: 600; color: #0047AB; display: inline-block; min-width: 160px;">Submission Date:</span>
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
                            <a href="${baseUrl}/suppliers/onboard?tab=review" style="display: inline-block; background: #0047AB; color: white; padding: 14px 40px; text-decoration: none; font-weight: 600; font-size: 16px;">
                              Review Submission in Dashboard
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
                    <td class="footer" style="background: #f8f9fa; text-align: center; padding: 25px 30px; color: #666; font-size: 12px; border-top: 3px solid #0047AB;">
                      <p style="margin: 5px 0;">This is an automated notification from Schauenburg Systems Procurement System.</p>
                      <p style="margin: 10px 0 0 0; color: #999;">© ${new Date().getFullYear()} Schauenburg Systems. All rights reserved.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    }

    console.log('📧 Sending admin notification...')
    console.log('📨 Sending email to initiator...')
    console.log('   From:', adminNotification.from)
    console.log('   To:', adminNotification.to)
    console.log('   Subject:', adminNotification.subject)
    
    const adminResult = await transporter.sendMail(adminNotification)
    
    console.log(`✅ Initiator notification email sent successfully!`)
    console.log('   To:', recipientEmail)
    console.log('   Message ID:', adminResult.messageId)
    console.log('   Response:', adminResult.response)

    // 2. Send auto-reply to supplier
    const supplierEmail = {
      from: `Schauenburg Systems Procurement Team <${smtpConfig.fromEmail}>`,
      replyTo: recipientEmail, // Allow supplier to reply directly to the admin
      to: supplierData.emailAddress,
      subject: `Supplier Onboarding Submission Received - Schauenburg Systems`,
      attachments: [
        {
          filename: 'logo.png',
          path: join(process.cwd(), 'public', 'logo.png'),
          cid: 'logo'
        }
      ],
      html: `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Supplier Onboarding Confirmation</title>
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
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
            }
            
            .header {
              background: #ffffff;
              color: #1e40af;
              padding: 50px 30px;
              text-align: center;
              border-bottom: 3px solid #1e40af;
            }
            
            .header h1 {
              margin: 0;
              font-size: 32px;
              font-weight: 600;
              color: #1e40af;
              line-height: 1.2;
            }
            
            .header p {
              margin: 15px 0 0 0;
              font-size: 16px;
              color: #666;
            }
            
            .content {
              background: white;
              padding: 40px 30px;
              color: #333333;
              line-height: 1.6;
              font-size: 16px;
            }
            
            .info-box {
              background: #f8f9fa;
              padding: 20px;
              margin: 25px 0;
              border-left: 4px solid #0047AB;
            }
            
            .info-box h3 {
              margin-top: 0;
              color: #0047AB;
              font-size: 18px;
            }
            
            .highlight-box {
              background: #e3f2fd;
              border: 2px solid #0047AB;
              padding: 18px;
              margin: 25px 0;
              text-align: center;
            }
            
            .highlight-box strong {
              color: #0047AB;
              font-size: 18px;
            }
            
            .footer {
              background: #f8f9fa;
              text-align: center;
              padding: 30px;
              color: #666;
              font-size: 13px;
              border-top: 3px solid #0047AB;
            }
            
            .footer a {
              color: #0047AB;
              text-decoration: none;
            }
            
            .footer p {
              margin: 8px 0;
            }
            
            a {
              color: #0047AB;
            }
            
            h3 {
              color: #0047AB;
              margin-top: 30px;
              font-size: 20px;
            }
            
            p {
              margin: 15px 0;
              font-size: 15px;
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
                font-size: 24px !important;
              }
              .content {
                padding: 30px 20px !important;
              }
              .info-box {
                padding: 15px !important;
              }
              .highlight-box {
                padding: 15px !important;
              }
              .highlight-box strong {
                font-size: 16px !important;
              }
              h3 {
                font-size: 18px !important;
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
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container" style="background-color: #ffffff;">
                  <!-- Header -->
                  <tr>
                    <td class="header" style="background: #ffffff; color: #0047AB; padding: 50px 30px; text-align: center; border-bottom: 3px solid #0047AB;">
                      <img src="cid:logo" alt="Schauenburg Systems" style="max-width: 180px; height: auto; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;" />
                      <h1 style="margin: 0; font-size: 32px; font-weight: 600; color: #0047AB; line-height: 1.2;">Thank You</h1>
                      <p style="margin: 15px 0 0 0; font-size: 16px; color: #666;">Your supplier onboarding submission has been received</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td class="content" style="background: white; padding: 40px 30px; color: #333333; line-height: 1.6; font-size: 16px;">
                      <p style="margin: 15px 0; font-size: 15px;">Dear ${supplierData.contactPerson},</p>
                      
                      <p style="margin: 15px 0; font-size: 15px;">Thank you for submitting your supplier onboarding application for <strong>${supplierData.nameOfBusiness}</strong>. We have successfully received your information and documentation.</p>
                      
                      <!-- Submission Summary -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #f8f9fa; border-left: 4px solid #0047AB; margin: 25px 0;">
                        <tr>
                          <td style="padding: 20px;">
                            <h3 style="margin-top: 0; color: #0047AB; font-size: 18px;">Submission Summary</h3>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                              <tr>
                                <td style="padding: 8px 0; font-size: 15px;">
                                  <strong>Supplier Code:</strong> ${supplier.supplierCode}
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; font-size: 15px;">
                                  <strong>Company:</strong> ${supplierData.nameOfBusiness}
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; font-size: 15px;">
                                  <strong>Contact Email:</strong> ${supplierData.emailAddress}
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; font-size: 15px;">
                                  <strong>Documents Submitted:</strong> ${totalFiles} files
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; font-size: 15px;">
                                  <strong>Submission Date:</strong> ${new Date().toLocaleString()}
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <h3 style="color: #0047AB; margin-top: 30px; font-size: 20px;">What Happens Next</h3>
                      
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
                        <tr>
                          <td style="padding: 18px 0; font-size: 15px; padding-left: 50px; position: relative;">
                            <span style="background: #0047AB; color: white; width: 32px; height: 32px; border-radius: 50%; display: inline-block; text-align: center; line-height: 32px; font-weight: bold; font-size: 16px; position: absolute; left: 0; top: 18px;">1</span>
                            <strong>Review</strong> - Our procurement team will review your submission
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 18px 0; font-size: 15px; padding-left: 50px; position: relative;">
                            <span style="background: #0047AB; color: white; width: 32px; height: 32px; border-radius: 50%; display: inline-block; text-align: center; line-height: 32px; font-weight: bold; font-size: 16px; position: absolute; left: 0; top: 18px;">2</span>
                            <strong>Verification</strong> - We will verify your documents and credentials
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 18px 0; font-size: 15px; padding-left: 50px; position: relative;">
                            <span style="background: #0047AB; color: white; width: 32px; height: 32px; border-radius: 50%; display: inline-block; text-align: center; line-height: 32px; font-weight: bold; font-size: 16px; position: absolute; left: 0; top: 18px;">3</span>
                            <strong>Approval</strong> - Once approved, you will be added to our supplier database
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 18px 0; font-size: 15px; padding-left: 50px; position: relative;">
                            <span style="background: #0047AB; color: white; width: 32px; height: 32px; border-radius: 50%; display: inline-block; text-align: center; line-height: 32px; font-weight: bold; font-size: 16px; position: absolute; left: 0; top: 18px;">4</span>
                            <strong>Notification</strong> - You will receive an email with your approval status
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Highlight Box -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #e3f2fd; border: 2px solid #0047AB; margin: 25px 0;">
                        <tr>
                          <td style="padding: 18px; text-align: center;">
                            <strong style="color: #0047AB; font-size: 18px;">Estimated Processing Time: 1-2 business days</strong>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 15px 0; font-size: 15px;">If we need any additional information or clarification, we will contact you at the email address or phone number you provided.</p>
                      
                      <p style="margin: 15px 0; font-size: 15px;">Should you have any questions in the meantime, please contact us at <a href="mailto:${recipientEmail}" style="color: #0047AB;">${recipientEmail}</a></p>
                      
                      <p style="margin-top: 40px; margin-bottom: 5px; font-size: 15px;">Best regards,</p>
                      <p style="margin: 5px 0; color: #0047AB; font-weight: 600; font-size: 16px;">Schauenburg Systems Procurement Team</p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td class="footer" style="background: #f8f9fa; text-align: center; padding: 30px; color: #666; font-size: 13px; border-top: 3px solid #0047AB;">
                      <p style="margin: 8px 0;">This is an automated confirmation email.</p>
                      <p style="margin: 8px 0;">Questions? Reply to this email to contact our procurement team.</p>
                      <p style="margin: 15px 0;">
                        <a href="${smtpConfig.companyWebsite || '#'}" style="color: #0047AB; text-decoration: none; font-weight: 600;">Visit our website</a>
                      </p>
                      <p style="margin-top: 15px; color: #999; font-size: 11px;">© ${new Date().getFullYear()} Schauenburg Systems. All rights reserved.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    }

    console.log('📧 Sending supplier auto-reply...')
    console.log('Supplier email details:', {
      from: supplierEmail.from,
      to: supplierEmail.to,
      replyTo: supplierEmail.replyTo,
      subject: supplierEmail.subject
    })
    const supplierResult = await transporter.sendMail(supplierEmail)
    console.log(`✅ Supplier auto-reply email sent (Reply-To: ${recipientEmail})`)
    console.log('Supplier email result:', supplierResult)

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

