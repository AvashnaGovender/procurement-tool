import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  console.log('🚀 /api/send-email POST endpoint called!')
  try {
    const body = await request.json()
    console.log('📧 Email request received:', { to: body.to, subject: body.subject })
    const { to, subject, content, supplierName, businessType, simulate, onboardingToken } = body

    // Determine if this is an approval email (manager/procurement approval)
    const emailSubject = subject || 'Supplier Onboarding'
    const isApprovalEmail = emailSubject.toLowerCase().includes('approval required') || 
                            emailSubject.toLowerCase().includes('approval pending') ||
                            emailSubject.toLowerCase().includes('approval for onboarding')

    // Validate required fields
    if (!to || !supplierName || !businessType) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: to, supplierName, and businessType are required' },
        { status: 400 }
      )
    }

    // SIMULATION MODE - bypass SMTP for testing (if enabled)
    if (simulate === true) {
      console.log('SIMULATION MODE: Email would be sent to:', to)
      console.log('Subject:', subject || 'Supplier Onboarding')
      console.log('Supplier Name:', supplierName)
      console.log('Business Type:', businessType)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Email simulated successfully (no actual email sent)',
        emailId: `simulated-${Date.now()}`,
        simulation: true
      })
    }

    // Load SMTP configuration from settings file
    let smtpConfig
    
    try {
      const configPath = path.join(process.cwd(), 'data', 'smtp-config.json')
      const configData = fs.readFileSync(configPath, 'utf8')
      smtpConfig = JSON.parse(configData)
      
      if (!smtpConfig) {
        throw new Error('SMTP configuration not found')
      }
    } catch (error) {
      console.error('Failed to load SMTP config:', error)
      return NextResponse.json(
        { success: false, message: 'Email service not configured. Please configure SMTP settings first in the Email Settings dialog.' },
        { status: 500 }
      )
    }
    
    // Validate email configuration
    if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
      console.error('Invalid email configuration:', { 
        host: smtpConfig.host, 
        user: smtpConfig.user, 
        hasPass: !!smtpConfig.pass 
      })
      return NextResponse.json(
        { success: false, message: 'Email service not properly configured. Please check SMTP settings.' },
        { status: 500 }
      )
    }
    
    // Use provided content (already templated from frontend)
    // emailSubject already defined above
    
    // Replace form link with onboarding-specific link if token is provided
    let emailContent = content
    
    // First, convert ALL newlines to <br /> before any HTML replacement
    // This ensures the text content is properly formatted FIRST
    emailContent = emailContent.replace(/\n/g, '<br />\n')
    
    if (onboardingToken) {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const formUrl = `${baseUrl}/supplier-onboarding-form?token=${onboardingToken}`
      
      // Create a clean HTML button with no newlines inside it
      const formLinkHtml = `<div style="text-align: center; margin: 30px 0;"><a href="${formUrl}" target="_blank" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none; padding: 15px 40px; border-radius: 8px; border: none;">Complete Registration Form</a></div>`
      
      // Replace {formLink} placeholder ONLY (remove other replacements that might cause duplicates)
      emailContent = emailContent
        .replace(/{formLink}/g, formLinkHtml)
        .replace(/\{formLink\}/g, formLinkHtml)
        .replace(/\[Supplier Registration Portal Link\]/g, formLinkHtml)
    }
    
    console.log('=== EMAIL SENDING DEBUG ===')
    console.log('To:', to)
    console.log('Subject:', emailSubject)
    console.log('Original content length:', content.length)
    console.log('Processed content length:', emailContent.length)
    console.log('Token included:', !!onboardingToken)
    console.log('Content preview (first 200 chars):', emailContent.substring(0, 200))
    if (onboardingToken) {
      console.log('Form link included:', emailContent.includes('supplier-onboarding-form'))
      console.log('Has {formLink} placeholder before processing:', content.includes('{formLink}'))
      console.log('Has {formLink} placeholder after processing:', emailContent.includes('{formLink}'))
      console.log('HTML button content:', emailContent.includes('<table cellpadding="0"'))
      console.log('Full HTML button preview:', emailContent.match(/<table cellpadding="0".*?<\/table>/s)?.[0]?.substring(0, 200))
      console.log('FULL EMAIL CONTENT:')
      console.log('==================')
      console.log(emailContent)
      console.log('==================')
    }
    console.log('==========================')
    
    // Send email via configured service
    const emailResult = await sendEmailViaService({
      to,
      subject: emailSubject,
      content: emailContent,
      supplierName,
      businessType,
      config: smtpConfig
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully',
      emailId: emailResult.id 
    })

  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to send email', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// This function would integrate with your chosen email service
async function sendEmailViaService({ 
  to, 
  subject, 
  content, 
  supplierName, 
  businessType,
  config
}: {
  to: string
  subject: string
  content: string
  supplierName: string
  businessType: string
  config: any
}) {
  // Determine if this is an approval email (manager/procurement approval)
  const isApprovalEmail = subject.toLowerCase().includes('approval required') || 
                          subject.toLowerCase().includes('approval pending')
  
  // Send email using Nodemailer
  const nodemailer = require('nodemailer')
  
  try {
    console.log('Creating transporter with config:', {
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.user
    })
    
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass
      }
    })
    
    // Verify connection configuration
    console.log('🔍 Verifying SMTP connection...')
    await transporter.verify()
    console.log('✅ SMTP connection verified successfully')
    
        // Debug: Log the content being inserted into the template
        console.log('=== EMAIL TEMPLATE DEBUG ===')
        console.log('Content being inserted into template:', content.substring(0, 300))
        console.log('Content contains HTML table:', content.includes('<table'))
        console.log('Content contains HTML anchor:', content.includes('<a href'))
        console.log('Content contains formLink placeholder:', content.includes('{formLink}'))
        console.log('Content contains formLink HTML:', content.includes('<table cellpadding="0"'))
        console.log('FULL CONTENT FOR TEMPLATE:')
        console.log('=========================')
        console.log(content)
        console.log('=========================')
        console.log('================================')
        
        // Create mobile-friendly HTML email (Outlook compatible)
        const htmlContent = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Schauenburg Systems - Supplier Onboarding</title>
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
      background-color: #ffffff;
      padding: 40px 30px;
      text-align: center;
      border-bottom: 3px solid #1e40af;
    }
    
    .logo {
      max-width: 150px;
      height: auto;
      margin-bottom: 20px;
      display: block;
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
      font-size: 16px;
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
    
    /* Mobile styles */
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
      }
      .content {
        padding: 30px 20px !important;
      }
      .header {
        padding: 30px 20px !important;
      }
      .header-text {
        font-size: 20px !important;
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
            <td class="header" style="background-color: #ffffff; padding: 40px 30px; text-align: center; border-bottom: 3px solid #1e40af;">
              <img src="cid:logo" alt="Schauenburg Systems" class="logo" style="max-width: 150px; height: auto; margin-bottom: 20px; display: block;" />
              <p class="header-text" style="color: #1e40af; font-size: 24px; font-weight: bold; margin: 0; line-height: 1.2;">${isApprovalEmail ? 'Supplier Approval Required' : 'Welcome to Schauenburg Systems'}</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="content" style="padding: 40px 30px; color: #333333; line-height: 1.6; font-size: 16px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="footer" style="background-color: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0;">Schauenburg Systems</p>
              <p style="margin: 0 0 10px 0;">
                <a href="${config.companyWebsite || 'https://schauenburg.co.za'}" class="footer-link" style="color: #3b82f6; text-decoration: underline; font-weight: normal;">Visit our website</a>
              </p>
              <p style="margin: 15px 0 0 0; font-size: 12px; color: #9ca3af;">
                If you have questions, please contact our procurement team.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `
        
        const mailOptions = {
          from: `"${config.companyName || 'Schauenburg Systems'}" <${config.fromEmail}>`,
          to: to,
          subject: subject,
          html: htmlContent,
          attachments: [
            {
              filename: 'logo.png',
              path: path.join(process.cwd(), 'public', 'logo.png'),
              cid: 'logo'
            }
          ]
        }
    
    console.log('📧 Sending onboarding email...')
    console.log('Email details:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    })
    
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Email sent successfully!')
    console.log('Email result:', {
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
      response: result.response
    })
    
    return {
      id: result.messageId,
      status: 'sent',
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Failed to send email:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as any)?.code,
      command: (error as any)?.command
    })
    throw new Error(`SMTP error: ${error instanceof Error ? error.message : 'Unknown SMTP error'}`)
  }
} 