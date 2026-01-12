import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    // Check admin or PM authorization
    if (session.user.role !== 'ADMIN' && session.user.role !== 'PROCUREMENT_MANAGER') {
      return NextResponse.json(
        { success: false, error: 'Forbidden. Only administrators and procurement managers can resend emails.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { supplierId } = body

    if (!supplierId) {
      return NextResponse.json(
        { success: false, error: 'Supplier ID is required' },
        { status: 400 }
      )
    }

    // Get supplier with onboarding data
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      include: {
        onboarding: {
          include: {
            initiation: {
              include: {
                initiatedBy: {
                  select: {
                    id: true,
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

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      )
    }

    // Check if supplier is approved
    if (supplier.status !== 'APPROVED') {
      return NextResponse.json(
        { success: false, error: 'Can only resend approval emails for approved suppliers.' },
        { status: 400 }
      )
    }

    // Get signed credit application file name if available
    const signedCreditAppFileName = (supplier.airtableData as any)?.signedCreditApplication?.fileName || null

    // Load SMTP configuration
    const configPath = path.join(process.cwd(), 'data', 'smtp-config.json')
    const configData = fs.readFileSync(configPath, 'utf8')
    const smtpConfig = JSON.parse(configData)

    if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
      return NextResponse.json(
        { success: false, error: 'SMTP configuration not properly set up' },
        { status: 500 }
      )
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

    // Create approval email content (same as in update-status route)
    const emailSubject = 'Supplier Onboarding Approved - Welcome to Schauenburg Systems'
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
      line-height: 1.2; 
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
    .success-badge {
      background-color: #10b981;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      margin: 30px 0;
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
      <p class="header-text">Supplier Registration Approved</p>
    </div>
    
    <div class="content">
      <p class="greeting">Dear ${supplier.contactPerson || supplier.companyName},</p>
      
      <div class="success-badge">
        Your supplier registration has been approved!
      </div>
      
      <p>
        We are pleased to inform you that your application to become a supplier for 
        <strong>Schauenburg Systems</strong> has been reviewed and <strong>approved</strong>.
      </p>
      
      <div class="info-box">
        <div class="info-box-title">Your Supplier Details</div>
        <div class="info-item"><strong>Company Name:</strong> ${supplier.companyName}</div>
        <div class="info-item"><strong>Supplier Code:</strong> ${supplier.supplierCode}</div>
        <div class="info-item"><strong>Contact Person:</strong> ${supplier.contactPerson}</div>
        <div class="info-item"><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">APPROVED</span></div>
      </div>
      
      <p>
        <strong>What happens next?</strong>
      </p>
      <ul style="color: #374151; line-height: 1.8;">
        <li>You are now registered as an approved supplier in our system</li>
        <li>Your company will be considered for relevant procurement opportunities</li>
        <li>Our procurement team may contact you regarding specific projects and tenders</li>
        <li>Please ensure your contact information and certifications remain up to date</li>
      </ul>
      
      ${signedCreditAppFileName ? `
      <div class="info-box" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; margin-top: 25px;">
        <div class="info-box-title" style="color: #92400e;">Signed Credit Application Document</div>
        <p style="color: #78350f; margin: 10px 0;">
          Your Credit Application has been reviewed and signed by our Procurement Manager. 
          Please download the signed document using the link below:
        </p>
        <p style="margin: 15px 0;">
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/suppliers/documents/${supplier.supplierCode}/signedCreditApplication/${encodeURIComponent(signedCreditAppFileName)}" 
             style="display: inline-block; background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Download Signed Credit Application
          </a>
        </p>
      </div>
      ` : ''}
      
      <p>
        If you have any questions or need to update your information, please don't hesitate to contact our procurement team.
      </p>
      
      <p style="margin-top: 30px;">
        Best regards,<br/>
        <strong>Schauenburg Systems Procurement Team</strong>
      </p>
    </div>
    
    <div class="footer">
      <p>Schauenburg Systems</p>
      <p>
        <a href="${smtpConfig.companyWebsite}" class="footer-link">${smtpConfig.companyWebsite}</a>
      </p>
      <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
        This is an automated message. Please do not reply directly to this email.
      </p>
    </div>
  </div>
</body>
</html>
    `

    // Send email to supplier
    console.log('📧 Resending approval email to:', supplier.contactEmail)
    
    await transporter.sendMail({
      from: `"${smtpConfig.companyName}" <${smtpConfig.fromEmail}>`,
      to: supplier.contactEmail,
      subject: emailSubject,
      html: emailHtml,
      attachments: [
        {
          filename: 'logo.png',
          path: path.join(process.cwd(), 'public', 'logo.png'),
          cid: 'logo'
        }
      ]
    })

    console.log('✅ Approval email resent successfully to:', supplier.contactEmail)

    // Send email to initiator if onboarding exists
    if (supplier.onboarding?.initiation?.initiatedBy) {
      try {
        const initiator = supplier.onboarding.initiation.initiatedBy
        const supplierDetailUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/supplier-submissions/${supplier.id}`

        const initiatorEmailSubject = `Supplier Approved - You Can Now Proceed with Purchasing: ${supplier.companyName}`
        const initiatorEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background-color: #ffffff; padding: 40px 30px; text-align: center; border-bottom: 3px solid #1e40af; }
    .logo { max-width: 150px; height: auto; margin-bottom: 20px; }
    .header-text { color: #1e40af; font-size: 24px; font-weight: bold; margin: 0; }
    .content { padding: 40px 30px; color: #333333; line-height: 1.6; }
    .greeting { font-size: 18px; font-weight: bold; color: #1e40af; margin-bottom: 20px; }
    .success-badge { background-color: #10b981; color: white; padding: 12px 24px; border-radius: 8px; font-size: 18px; font-weight: bold; text-align: center; margin: 30px 0; }
    .action-badge { background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; font-size: 16px; font-weight: bold; text-align: center; margin: 30px 0; }
    .info-box { background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 4px; }
    .info-box-title { font-weight: bold; color: #1e40af; margin-bottom: 10px; font-size: 16px; }
    .info-item { margin: 8px 0; color: #374151; }
    .footer { background-color: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="cid:logo" alt="Schauenburg Systems" class="logo" />
      <p class="header-text">Supplier Approved - Ready for Purchasing</p>
    </div>
    <div class="content">
      <p class="greeting">Dear ${initiator.name},</p>
      <div class="success-badge">✅ Supplier Approved Successfully</div>
      <p>Great news! The supplier you initiated has been <strong>approved by the Procurement Manager</strong> and is now ready for purchasing activities.</p>
      <div class="action-badge">🛒 You Can Now Proceed with Purchasing</div>
      <div class="info-box">
        <div class="info-box-title">Approved Supplier Details</div>
        <div class="info-item"><strong>Company Name:</strong> ${supplier.companyName}</div>
        <div class="info-item"><strong>Supplier Code:</strong> ${supplier.supplierCode}</div>
        <div class="info-item"><strong>Contact Person:</strong> ${supplier.contactPerson}</div>
        <div class="info-item"><strong>Contact Email:</strong> ${supplier.contactEmail}</div>
        <div class="info-item"><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">APPROVED</span></div>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${supplierDetailUrl}" target="_blank" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none; padding: 15px 40px; border-radius: 8px;">View Supplier Details</a>
      </div>
      <p style="margin-top: 30px;">Best regards,<br/><strong>Schauenburg Systems Procurement Team</strong></p>
    </div>
    <div class="footer">
      <p>Schauenburg Systems</p>
      <p><a href="${smtpConfig.companyWebsite}" style="color: #3b82f6; text-decoration: none;">${smtpConfig.companyWebsite}</a></p>
    </div>
  </div>
</body>
</html>
        `

        await transporter.sendMail({
          from: `"${smtpConfig.companyName}" <${smtpConfig.fromEmail}>`,
          to: initiator.email,
          subject: initiatorEmailSubject,
          html: initiatorEmailHtml,
          attachments: [
            {
              filename: 'logo.png',
              path: path.join(process.cwd(), 'public', 'logo.png'),
              cid: 'logo'
            }
          ]
        })

        console.log('✅ Initiator approval notification email resent successfully to:', initiator.email)
      } catch (initiatorEmailError) {
        console.error('Failed to send initiator email:', initiatorEmailError)
        // Don't fail if initiator email fails
      }
    }

    // Update initiation status if it exists
    if (supplier.onboarding?.initiationId) {
      try {
        await prisma.supplierInitiation.update({
          where: { id: supplier.onboarding.initiationId },
          data: {
            status: 'SUPPLIER_EMAILED',
            emailSent: true,
            emailSentAt: new Date()
          }
        })
        console.log(`✅ Updated initiation status to SUPPLIER_EMAILED for initiation: ${supplier.onboarding.initiationId}`)
      } catch (updateError) {
        console.error('Failed to update initiation status:', updateError)
        // Don't fail if this update fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Approval email resent successfully'
    })
  } catch (error) {
    console.error('Error resending approval email:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to resend approval email'
      },
      { status: 500 }
    )
  }
}

