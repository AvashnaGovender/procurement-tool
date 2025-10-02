import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir, readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import nodemailer from 'nodemailer'
import { createClient } from '@/lib/supabase/server'

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

    // Get authenticated user for email notifications
    let adminEmail = null
    let adminName = null
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user?.email) {
        adminEmail = user.email
        
        // Try to get user's name from database
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { name: true }
        })
        adminName = dbUser?.name || user.email.split('@')[0]
      }
    } catch (error) {
      console.log('Could not get authenticated user, using default email')
    }

    // Send email notifications
    try {
      console.log('📧 Attempting to send email notifications...')
      await sendEmailNotifications(supplier, supplierData, uploadedFiles, adminEmail, adminName, existingOnboarding)
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

    // Determine recipient email (use logged-in user's email or fallback to company email)
    const recipientEmail = adminEmail || smtpConfig.fromEmail
    const senderName = adminName || smtpConfig.companyName || 'Procurement Team'
    
    // Check if this is a revision
    const isRevision = onboarding?.revisionCount > 0
    const revisionNotes = onboarding?.revisionNotes || null

    // 1. Send notification to admin (logged-in user who will process this)
    const adminNotification = {
      from: smtpConfig.fromEmail,
      to: recipientEmail, // Send to logged-in user's email
      subject: isRevision 
        ? `Revision Submitted: ${supplierData.nameOfBusiness} (Revision ${onboarding.revisionCount})`
        : `New Supplier Onboarding Submission: ${supplierData.nameOfBusiness}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 650px; margin: 0 auto; background: white; }
            .header { 
              background: #0047AB; 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
            }
            .header h1 {
              margin: 0;
              font-size: 26px;
              font-weight: 600;
            }
            .header p {
              margin: 10px 0 0 0;
              font-size: 14px;
              opacity: 0.9;
            }
            .content { 
              background: white; 
              padding: 40px 30px; 
            }
            .info-section {
              background: #f8f9fa;
              border-left: 4px solid #0047AB;
              padding: 20px;
              margin: 25px 0;
              border-radius: 5px;
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
            .button { 
              display: inline-block; 
              background: #0047AB; 
              color: white; 
              padding: 14px 40px; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 30px 0 20px 0;
              font-weight: 600;
              font-size: 16px;
            }
            .button:hover {
              background: #003380;
            }
            .button-container {
              text-align: center;
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
            @media only screen and (max-width: 600px) {
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
        <body>
          <div class="container">
            <div class="header">
              <h1>${isRevision ? 'Revised Supplier Submission' : 'New Supplier Onboarding Submission'}</h1>
              <p>Schauenburg Systems Procurement</p>
            </div>
            <div class="content">
              ${isRevision ? `
                <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 5px; padding: 20px; margin-bottom: 25px;">
                  <h3 style="margin: 0 0 10px 0; color: #856404; font-size: 18px;">🔄 Revision Submission (Version ${onboarding.revisionCount + 1})</h3>
                  <p style="margin: 0 0 15px 0; color: #856404; font-weight: 600;">The supplier has updated their submission based on your revision request.</p>
                  <div style="background: white; border-radius: 5px; padding: 15px; margin-top: 15px;">
                    <p style="margin: 0 0 8px 0; font-weight: 600; color: #333;">Original Revision Request:</p>
                    <p style="margin: 0; color: #666; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${revisionNotes}</p>
                  </div>
                </div>
              ` : `
                <p>A new supplier has completed the onboarding form and submitted their documentation for review.</p>
              `}
              
              <div class="info-section">
                <h2>Company Information</h2>
                <div class="info-row">
                  <span class="label">Company Name:</span>
                  <span class="value">${supplierData.nameOfBusiness}</span>
                </div>
                <div class="info-row">
                  <span class="label">Trading Name:</span>
                  <span class="value">${supplierData.tradingName || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="label">Registration No:</span>
                  <span class="value">${supplierData.companyRegistrationNo}</span>
                </div>
                <div class="info-row">
                  <span class="label">Supplier Code:</span>
                  <span class="value">${supplier.supplierCode}</span>
                </div>
              </div>

              <div class="info-section">
                <h2>Contact Details</h2>
                <div class="info-row">
                  <span class="label">Contact Person:</span>
                  <span class="value">${supplierData.contactPerson}</span>
                </div>
                <div class="info-row">
                  <span class="label">Email:</span>
                  <span class="value">${supplierData.emailAddress}</span>
                </div>
                <div class="info-row">
                  <span class="label">Phone:</span>
                  <span class="value">${supplierData.contactNumber}</span>
                </div>
              </div>

              <div class="info-section">
                <h2>Business Details</h2>
                <div class="info-row">
                  <span class="label">Nature of Business:</span>
                  <span class="value">${supplierData.natureOfBusiness}</span>
                </div>
                <div class="info-row">
                  <span class="label">BBBEE Status:</span>
                  <span class="value">${supplierData.bbbeeStatus}</span>
                </div>
                <div class="info-row">
                  <span class="label">Number of Employees:</span>
                  <span class="value">${supplierData.numberOfEmployees}</span>
                </div>
              </div>

              <div class="info-section">
                <h2>Submission Details</h2>
                ${isRevision ? `
                  <div class="info-row">
                    <span class="label">Submission Type:</span>
                    <span class="value" style="color: #ffc107; font-weight: 600;">Revision ${onboarding.revisionCount}</span>
                  </div>
                ` : ''}
                <div class="info-row">
                  <span class="label">Documents Submitted:</span>
                  <span class="value">${totalFiles} files in ${Object.keys(uploadedFiles).length} categories</span>
                </div>
                <div class="info-row">
                  <span class="label">Categories:</span>
                  <span class="value" style="font-size: 13px;">${documentCategories}</span>
                </div>
                <div class="info-row">
                  <span class="label">Submission Date:</span>
                  <span class="value">${new Date().toLocaleString()}</span>
                </div>
              </div>
              
              <div class="button-container">
                <a href="http://localhost:3000/suppliers/onboard?tab=review" class="button">
                  Review Submission in Dashboard
                </a>
              </div>

              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                ${isRevision 
                  ? 'Please review the updated submission and the changes made based on your revision request.' 
                  : 'Please review the submission and verify all documents within 1-2 business days.'
                }
              </p>
            </div>
            <div class="footer">
              <p>This is an automated notification from Schauenburg Systems Procurement System.</p>
              <p style="margin-top: 10px; color: #999;">© ${new Date().getFullYear()} Schauenburg Systems. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }

    console.log('📧 Sending admin notification...')
    console.log('Admin email details:', {
      from: adminNotification.from,
      to: adminNotification.to,
      subject: adminNotification.subject
    })
    const adminResult = await transporter.sendMail(adminNotification)
    console.log(`✅ Admin notification email sent to: ${recipientEmail}`)
    console.log('Admin email result:', adminResult)

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
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { 
              background: #ffffff; 
              color: #0047AB; 
              padding: 50px 30px; 
              text-align: center; 
              border-bottom: 3px solid #0047AB;
            }
            .header h1 {
              margin: 0;
              font-size: 32px;
              font-weight: 600;
              color: #0047AB;
            }
            .header p {
              margin: 15px 0 0 0;
              font-size: 16px;
              color: #666;
            }
            .content { 
              background: white; 
              padding: 40px 30px; 
            }
            .info-box { 
              background: #f8f9fa; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 25px 0; 
              border-left: 4px solid #0047AB; 
            }
            .info-box h3 {
              margin-top: 0;
              color: #0047AB;
              font-size: 18px;
            }
            .info-box ul {
              list-style: none;
              padding-left: 0;
              margin: 15px 0 0 0;
            }
            .info-box li {
              margin: 10px 0;
              padding-left: 25px;
              position: relative;
              font-size: 15px;
            }
            .info-box li:before {
              content: "•";
              color: #0047AB;
              font-weight: bold;
              position: absolute;
              left: 0;
              font-size: 18px;
            }
            .steps {
              counter-reset: step-counter;
              list-style: none;
              padding-left: 0;
              margin: 20px 0;
            }
            .steps li {
              counter-increment: step-counter;
              margin: 18px 0;
              padding-left: 50px;
              position: relative;
              font-size: 15px;
              min-height: 32px;
              line-height: 1.5;
            }
            .steps li:before {
              content: counter(step-counter);
              background: #0047AB;
              color: white;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              position: absolute;
              left: 0;
              top: 0;
              font-weight: bold;
              font-size: 16px;
              flex-shrink: 0;
            }
            @media only screen and (max-width: 600px) {
              .header {
                padding: 30px 20px !important;
              }
              .header h1 {
                font-size: 24px !important;
              }
              .content {
                padding: 30px 20px !important;
              }
              .steps li {
                padding-left: 45px !important;
                font-size: 14px !important;
              }
              .steps li:before {
                width: 28px !important;
                height: 28px !important;
                font-size: 14px !important;
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
            .highlight-box {
              background: #e3f2fd;
              border: 2px solid #0047AB;
              padding: 18px;
              border-radius: 8px;
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
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="cid:logo" alt="Schauenburg Systems" style="max-width: 180px; height: auto; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;" />
              <h1>Thank You</h1>
              <p>Your supplier onboarding submission has been received</p>
            </div>
            <div class="content">
              <p>Dear ${supplierData.contactPerson},</p>
              
              <p>Thank you for submitting your supplier onboarding application for <strong>${supplierData.nameOfBusiness}</strong>. We have successfully received your information and documentation.</p>
              
              <div class="info-box">
                <h3>Submission Summary</h3>
                <ul>
                  <li><strong>Supplier Code:</strong> ${supplier.supplierCode}</li>
                  <li><strong>Company:</strong> ${supplierData.nameOfBusiness}</li>
                  <li><strong>Contact Email:</strong> ${supplierData.emailAddress}</li>
                  <li><strong>Documents Submitted:</strong> ${totalFiles} files</li>
                  <li><strong>Submission Date:</strong> ${new Date().toLocaleString()}</li>
                </ul>
              </div>
              
              <h3>What Happens Next</h3>
              <ol class="steps">
                <li><strong>Review</strong> - Our procurement team will review your submission</li>
                <li><strong>Verification</strong> - We will verify your documents and credentials</li>
                <li><strong>Approval</strong> - Once approved, you will be added to our supplier database</li>
                <li><strong>Notification</strong> - You will receive an email with your approval status</li>
              </ol>
              
              <div class="highlight-box">
                <strong>Estimated Processing Time: 1-2 business days</strong>
              </div>
              
              <p>If we need any additional information or clarification, we will contact you at the email address or phone number you provided.</p>
              
              <p>Should you have any questions in the meantime, please contact us at <a href="mailto:${recipientEmail}">${recipientEmail}</a></p>
              
              <p style="margin-top: 40px; margin-bottom: 5px;">Best regards,</p>
              <p style="margin: 5px 0; color: #0047AB; font-weight: 600; font-size: 16px;">Schauenburg Systems Procurement Team</p>
            </div>
            <div class="footer">
              <p>This is an automated confirmation email.</p>
              <p>Questions? Reply to this email to contact our procurement team.</p>
              <p style="margin: 15px 0;">
                <a href="${smtpConfig.companyWebsite || '#'}" style="font-weight: 600;">Visit our website</a>
              </p>
              <p style="margin-top: 15px; color: #999; font-size: 11px;">© ${new Date().getFullYear()} Schauenburg Systems. All rights reserved.</p>
            </div>
          </div>
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

