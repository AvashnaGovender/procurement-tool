import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { supplierId, status, rejectionReason } = body

    if (!supplierId || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing supplierId or status' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED', 'INACTIVE']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Validate rejection reason if status is REJECTED
    if (status === 'REJECTED' && !rejectionReason) {
      return NextResponse.json(
        { success: false, error: 'Rejection reason is required when rejecting a supplier' },
        { status: 400 }
      )
    }

    const supplier = await prisma.supplier.update({
      where: { id: supplierId },
      data: { 
        status,
        approvedAt: status === 'APPROVED' ? new Date() : null
      }
    })

    // Update onboarding record if it exists
    const onboarding = await prisma.supplierOnboarding.findUnique({
      where: { supplierId }
    })

    if (onboarding) {
      await prisma.supplierOnboarding.update({
        where: { id: onboarding.id },
        data: {
          approvalStatus: status === 'APPROVED' ? 'APPROVED' : status === 'REJECTED' ? 'REJECTED' : null,
          approvedAt: status === 'APPROVED' ? new Date() : null,
          rejectedAt: status === 'REJECTED' ? new Date() : null,
          rejectionReason: status === 'REJECTED' ? rejectionReason : null,
          completedAt: status === 'APPROVED' || status === 'REJECTED' ? new Date() : null,
        }
      })

      // Add timeline entry
      await prisma.onboardingTimeline.create({
        data: {
          onboardingId: onboarding.id,
          step: 'REVIEW',
          status: status,
          action: `Status updated to ${status}`,
          description: status === 'REJECTED' 
            ? `Supplier rejected: ${rejectionReason}` 
            : `Supplier status changed to ${status}`,
          performedBy: 'Admin',
        }
      })
    }

    // Send approval email if status is APPROVED
    if (status === 'APPROVED') {
      try {
        await sendApprovalEmail(supplier)
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError)
        // Don't fail the entire request if email fails
      }
    }

    // Send rejection email if status is REJECTED
    if (status === 'REJECTED') {
      try {
        await sendRejectionEmail(supplier, rejectionReason)
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError)
        // Don't fail the entire request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      supplier
    })
  } catch (error) {
    console.error('Error updating supplier status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update supplier status'
      },
      { status: 500 }
    )
  }
}

async function sendApprovalEmail(supplier: any) {
  try {
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

    // Create approval email content
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
    @media only screen and (max-width: 600px) {
      .content { 
        padding: 30px 20px; 
      }
      .header { 
        padding: 30px 20px; 
      }
      .header-text { 
        font-size: 20px; 
      }
      .greeting { 
        font-size: 16px; 
      }
      .info-box { 
        padding: 15px; 
      }
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

    // Send email
    console.log('📧 Sending approval email to:', supplier.contactEmail)
    
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

    console.log('✅ Approval email sent successfully to:', supplier.contactEmail)
  } catch (error) {
    console.error('Error sending approval email:', error)
    throw error
  }
}

async function sendRejectionEmail(supplier: any, rejectionReason: string) {
  try {
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

    // Create rejection email content
    const emailSubject = 'Supplier Registration Update - Schauenburg Systems'
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
    .info-box { 
      background-color: #fef2f2; 
      border-left: 4px solid #ef4444; 
      padding: 20px; 
      margin: 25px 0; 
      border-radius: 4px; 
    }
    .info-box-title { 
      font-weight: bold; 
      color: #991b1b; 
      margin-bottom: 10px; 
      font-size: 16px; 
    }
    .info-item { 
      margin: 8px 0; 
      color: #374151; 
    }
    .feedback-box {
      background-color: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .feedback-title {
      font-weight: bold;
      color: #92400e;
      margin-bottom: 10px;
      font-size: 16px;
    }
    .feedback-content {
      color: #1f2937;
      line-height: 1.6;
      white-space: pre-wrap;
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
    @media only screen and (max-width: 600px) {
      .content { 
        padding: 30px 20px; 
      }
      .header { 
        padding: 30px 20px; 
      }
      .header-text { 
        font-size: 20px; 
      }
      .greeting { 
        font-size: 16px; 
      }
      .info-box, .feedback-box { 
        padding: 15px; 
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="cid:logo" alt="Schauenburg Systems" class="logo" />
      <p class="header-text">Supplier Registration Update</p>
    </div>
    
    <div class="content">
      <p class="greeting">Dear ${supplier.contactPerson || supplier.companyName},</p>
      
      <p>
        Thank you for your interest in becoming a supplier for <strong>Schauenburg Systems</strong>.
      </p>
      
      <p>
        After careful review of your application, we regret to inform you that we are unable to proceed 
        with your supplier registration at this time.
      </p>
      
      <div class="info-box">
        <div class="info-box-title">Application Details</div>
        <div class="info-item"><strong>Company Name:</strong> ${supplier.companyName}</div>
        <div class="info-item"><strong>Supplier Code:</strong> ${supplier.supplierCode}</div>
        <div class="info-item"><strong>Contact Person:</strong> ${supplier.contactPerson}</div>
        <div class="info-item"><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">NOT APPROVED</span></div>
      </div>
      
      <div class="feedback-box">
        <div class="feedback-title">Feedback from Our Procurement Team</div>
        <div class="feedback-content">${rejectionReason}</div>
      </div>
      
      <p>
        <strong>What you can do:</strong>
      </p>
      <ul style="color: #374151; line-height: 1.8;">
        <li>Review the feedback provided above</li>
        <li>Address the concerns mentioned</li>
        <li>You may reapply once the necessary improvements have been made</li>
        <li>Contact our procurement team if you have any questions or need clarification</li>
      </ul>
      
      <p>
        We appreciate your understanding and thank you for your interest in working with 
        <strong>Schauenburg Systems</strong>. We encourage you to address the feedback provided 
        and consider reapplying in the future.
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
        This is an automated message. If you have questions, please contact our procurement team.
      </p>
    </div>
  </div>
</body>
</html>
    `

    // Send email
    console.log('📧 Sending rejection email to:', supplier.contactEmail)
    
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

    console.log('✅ Rejection email sent successfully to:', supplier.contactEmail)
  } catch (error) {
    console.error('Error sending rejection email:', error)
    throw error
  }
}

