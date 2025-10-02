import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, content, supplierName, businessType, simulate, onboardingToken } = body

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
    const emailSubject = subject || 'Supplier Onboarding - Welcome'
    
    // Replace form link with onboarding-specific link if token is provided
    let emailContent = content
    if (onboardingToken) {
      const formUrl = `http://localhost:3000/supplier-onboarding-form?token=${onboardingToken}`
      // Email-safe button with table-based layout for better compatibility
      const formLinkHtml = `
<table cellpadding="0" cellspacing="0" border="0" style="margin: 25px 0;">
  <tr>
    <td align="center" style="background-color: #3b82f6; border-radius: 8px; padding: 0;">
      <a href="${formUrl}" target="_blank" style="display: inline-block; background-color: #3b82f6; color: #ffffff !important; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none; padding: 15px 40px; border-radius: 8px; border: none;">Complete Registration Form</a>
    </td>
  </tr>
</table>`
      
      // Replace {formLink} placeholder with HTML link button
      emailContent = emailContent
        .replace(/{formLink}/g, formLinkHtml)
        .replace(/\{formLink\}/g, formLinkHtml)
        .replace(/https?:\/\/forms\.office\.com[^\s]*/g, formLinkHtml)
        .replace(/https?:\/\/airtable\.com[^\s]*/g, formLinkHtml)
        .replace(/http:\/\/localhost:3000\/supplier-onboarding-form[^\s]*/g, formLinkHtml)
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
    
        // Create professional HTML email
        const htmlContent = `
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
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); 
      padding: 40px 30px; 
      text-align: center; 
    }
    .logo { 
      max-width: 150px; 
      height: auto; 
      margin-bottom: 20px; 
    }
    .header-text { 
      color: #ffffff; 
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
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      color: #ffffff !important;
      padding: 15px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      font-size: 16px;
      text-align: center;
      margin: 20px 0;
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
      .cta-button {
        display: block;
        margin: 20px 0;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="cid:logo" alt="Schauenburg Systems" class="logo" />
      <p class="header-text">Welcome to Schauenburg Systems</p>
    </div>
    
    <div class="content">
      ${content.replace(/\n/g, '<br>')}
    </div>
    
    <div class="footer">
      <p>Schauenburg Systems</p>
      <p>
        <a href="${config.companyWebsite || '#'}" class="footer-link">${config.companyWebsite || 'Visit our website'}</a>
      </p>
      <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
        If you have questions, please contact our procurement team.
      </p>
    </div>
  </div>
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