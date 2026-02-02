import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir, readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import nodemailer from 'nodemailer'
import path from 'path'
import fs from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const token = formData.get('token')?.toString()
    const creditAccountInfo = formData.get('creditAccountInfo')?.toString()
    const signedCreditApplication = formData.get('signedCreditApplication') as File

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      )
    }

    if (!creditAccountInfo || !creditAccountInfo.trim()) {
      return NextResponse.json(
        { success: false, error: 'Credit account information is required' },
        { status: 400 }
      )
    }

    if (!signedCreditApplication) {
      return NextResponse.json(
        { success: false, error: 'Fully signed credit application document is required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (signedCreditApplication.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'Only PDF files are accepted for the Credit Application' },
        { status: 400 }
      )
    }

    // Find onboarding record by token
    const onboarding = await prisma.supplierOnboarding.findUnique({
      where: { creditApplicationToken: token },
      include: {
        supplier: {
          select: {
            id: true,
            supplierCode: true
          }
        }
      }
    })

    if (!onboarding) {
      return NextResponse.json(
        { success: false, error: 'Invalid token or credit application not found' },
        { status: 404 }
      )
    }

    if (onboarding.creditApplicationFormSubmitted) {
      return NextResponse.json(
        { success: false, error: 'Credit application form has already been submitted' },
        { status: 400 }
      )
    }

    if (!onboarding.supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      )
    }

    // Save the fully signed credit application file
    const supplierCode = onboarding.supplier.supplierCode
    const uploadsDir = join(
      process.cwd(),
      'data',
      'uploads',
      'suppliers',
      supplierCode,
      'creditApplication',
      'fullySigned'
    )

    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const bytes = await signedCreditApplication.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const timestamp = Date.now()
    const fileName = `fully-signed-credit-application-${timestamp}.pdf`
    const filePath = join(uploadsDir, fileName)

    await writeFile(filePath, buffer)

    // Update onboarding record
    await prisma.supplierOnboarding.update({
      where: { id: onboarding.id },
      data: {
        creditApplicationFormSubmitted: true,
        creditApplicationFormSubmittedAt: new Date(),
        creditApplicationInfo: creditAccountInfo.trim()
      }
    })

    // Update supplier's airtableData to include fully signed credit application
    const supplier = await prisma.supplier.findUnique({
      where: { id: onboarding.supplier.id },
      select: { airtableData: true }
    })

    if (supplier) {
      const currentAirtableData = (supplier.airtableData as any) || {}
      const updatedAirtableData = {
        ...currentAirtableData,
        fullySignedCreditApplication: {
          fileName: fileName,
          submittedAt: new Date().toISOString(),
          creditAccountInfo: creditAccountInfo.trim()
        }
      }

      await prisma.supplier.update({
        where: { id: onboarding.supplier.id },
        data: {
          airtableData: updatedAirtableData
        }
      })
    }

    // Create timeline entry
    await prisma.onboardingTimeline.create({
      data: {
        onboardingId: onboarding.id,
        step: 'REVIEW',
        status: 'UNDER_REVIEW',
        action: 'Credit application form submitted',
        description: 'Supplier submitted fully signed credit application and credit account information',
        performedBy: 'Supplier',
      }
    })

    // Send email notification to Procurement Managers
    try {
      // Get full supplier details
      const supplierDetails = await prisma.supplier.findUnique({
        where: { id: onboarding.supplier.id },
        include: {
          onboarding: {
            include: {
              initiation: {
                include: {
                  initiatedBy: {
                    select: {
                      name: true,
                      email: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      if (!supplierDetails) {
        throw new Error('Supplier details not found')
      }

      console.log('📋 Supplier details for email:', {
        companyName: supplierDetails.companyName,
        supplierCode: supplierDetails.supplierCode
      })

      // Load SMTP configuration
      const configPath = path.join(process.cwd(), 'data', 'smtp-config.json')
      const configData = fs.readFileSync(configPath, 'utf8')
      const smtpConfig = JSON.parse(configData)

      if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
        throw new Error('SMTP configuration not properly set up')
      }

      // Create transporter
      const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: {
          user: smtpConfig.user,
          pass: smtpConfig.pass
        }
      })

      // Get all Procurement Managers
      const procurementManagers = await prisma.user.findMany({
        where: { role: 'PROCUREMENT_MANAGER' }
      })

      // Fallback to admins if no procurement managers
      const recipients = procurementManagers.length > 0
        ? procurementManagers
        : await prisma.user.findMany({ where: { role: 'ADMIN' } })

      if (recipients.length === 0) {
        console.warn('No procurement managers or admins found to send notification')
      } else {
        // Read the PDF file for attachment
        const pdfBuffer = await readFile(filePath)

        const emailSubject = `Credit Application Submitted - ${supplierDetails.companyName}`
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      margin: 0; 
      padding: 0; 
      font-family: Arial, sans-serif; 
      background-color: #f4f4f4; 
    }
    .email-container { 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: #ffffff; 
    }
    .header { 
      background-color: #ffffff; 
      padding: 40px 30px; 
      text-align: center; 
      border-bottom: 3px solid #1e40af; 
    }
    .logo { 
      max-width: 150px; 
      height: auto; 
      margin-bottom: 20px; 
    }
    .header-text { 
      color: #1e40af; 
      font-size: 24px; 
      font-weight: bold; 
      margin: 0; 
    }
    .content { 
      padding: 40px 30px; 
      color: #333333; 
      line-height: 1.6; 
    }
    .greeting { 
      font-size: 18px; 
      font-weight: bold; 
      color: #1e40af; 
      margin-bottom: 20px; 
    }
    .info-box { 
      background-color: #eff6ff; 
      border-left: 4px solid #3b82f6; 
      padding: 20px; 
      margin: 25px 0; 
      border-radius: 4px; 
    }
    .info-box-title { 
      font-weight: bold; 
      color: #1e40af; 
      margin-bottom: 10px; 
      font-size: 16px; 
    }
    .info-item { 
      margin: 8px 0; 
      color: #374151; 
    }
    .footer { 
      background-color: #f9fafb; 
      padding: 30px; 
      text-align: center; 
      color: #6b7280; 
      font-size: 14px; 
      border-top: 1px solid #e5e7eb; 
    }
    .footer-link { 
      color: #3b82f6; 
      text-decoration: none; 
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="cid:logo" alt="Schauenburg Systems" class="logo" />
      <p class="header-text">Credit Application Submitted</p>
    </div>
    
    <div class="content">
      <p class="greeting">Dear Procurement Manager,</p>
      
      <p>The supplier <strong>${supplierDetails.companyName}</strong> (Code: ${supplierDetails.supplierCode}) has submitted their fully signed credit application and credit account information.</p>
      
      <div class="info-box">
        <div class="info-box-title">Supplier Details</div>
        <div class="info-item"><strong>Company Name:</strong> ${supplierDetails.companyName}</div>
        <div class="info-item"><strong>Supplier Code:</strong> ${supplierDetails.supplierCode}</div>
        <div class="info-item"><strong>Contact Person:</strong> ${supplierDetails.contactPerson}</div>
        <div class="info-item"><strong>Contact Email:</strong> ${supplierDetails.contactEmail}</div>
      </div>
      
      <div class="info-box" style="background-color: #fef3c7; border-left: 4px solid #f59e0b;">
        <div class="info-box-title" style="color: #92400e;">Credit Account Information</div>
        <div style="white-space: pre-wrap; background-color: white; padding: 10px; border-radius: 4px; color: #374151;">${creditAccountInfo.trim()}</div>
      </div>
      
      <div class="info-box" style="background-color: #f0fdf4; border-left: 4px solid #22c55e;">
        <div class="info-box-title" style="color: #15803d;">📎 Attached Document</div>
        <p style="margin: 0; color: #374151;">Fully Signed Credit Application (${fileName})</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
          <tr>
            <td align="center" style="background-color: #3b82f6; border-radius: 8px; padding: 0;">
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/supplier-submissions/${supplierDetails.id}" target="_blank" style="display: inline-block; background-color: #3b82f6; color: #ffffff !important; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none; padding: 15px 40px; border-radius: 8px; border: none;">Review Supplier Details</a>
            </td>
          </tr>
        </table>
      </div>
      
      <p style="margin-top: 30px;">
        Best regards,<br/>
        <strong>Schauenburg Systems Procurement System</strong>
      </p>
    </div>
    
    <div class="footer">
      <p>Schauenburg Systems</p>
      <p>
        <a href="${smtpConfig.companyWebsite || 'https://schauenburg.co.za'}" class="footer-link">${smtpConfig.companyWebsite || 'https://schauenburg.co.za'}</a>
      </p>
      <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
        This is an automated notification from the Supplier Onboarding System.
      </p>
    </div>
  </div>
</body>
</html>
        `

        // Send email to each PM
        for (const pm of recipients) {
          console.log('📧 Sending credit application notification to:', pm.email)
          
          await transporter.sendMail({
            from: `"${smtpConfig.companyName}" <${smtpConfig.fromEmail}>`,
            to: pm.email,
            subject: emailSubject,
            html: emailHtml,
            attachments: [
              {
                filename: 'logo.png',
                path: path.join(process.cwd(), 'public', 'logo.png'),
                cid: 'logo'
              },
              {
                filename: fileName,
                content: pdfBuffer,
                contentType: 'application/pdf'
              }
            ]
          })

          console.log('✅ Credit application notification sent successfully to:', pm.email)
        }
      }
    } catch (emailError) {
      console.error('Error sending credit application notification email:', emailError)
      // Don't fail the submission if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Credit application form submitted successfully'
    })
  } catch (error) {
    console.error('Error submitting credit application form:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit credit application form'
      },
      { status: 500 }
    )
  }
}

