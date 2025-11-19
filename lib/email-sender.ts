import fs from 'fs'
import path from 'path'
import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  content: string
  supplierName: string
  businessType: string
  onboardingToken?: string
  simulate?: boolean
}

interface EmailResult {
  success: boolean
  message: string
  emailId?: string
  simulation?: boolean
}

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const { to, subject, content, supplierName, businessType, simulate, onboardingToken } = options

  console.log('📧 sendEmail() called with:', { to, subject, supplierName, businessType, hasToken: !!onboardingToken })

  // Validate required fields
  if (!to || !supplierName || !businessType) {
    return {
      success: false,
      message: 'Missing required fields: to, supplierName, and businessType are required'
    }
  }

  // SIMULATION MODE - bypass SMTP for testing (if enabled)
  if (simulate === true) {
    console.log('SIMULATION MODE: Email would be sent to:', to)
    console.log('Subject:', subject || 'Supplier Onboarding')
    console.log('Supplier Name:', supplierName)
    console.log('Business Type:', businessType)
    
    return { 
      success: true, 
      message: 'Email simulated successfully (no actual email sent)',
      emailId: `simulated-${Date.now()}`,
      simulation: true
    }
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
    return {
      success: false,
      message: 'Email service not configured. Please configure SMTP settings first in the Email Settings dialog.'
    }
  }
  
  // Validate email configuration
  if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
    console.error('Invalid email configuration:', { 
      host: smtpConfig.host, 
      user: smtpConfig.user, 
      hasPass: !!smtpConfig.pass 
    })
    return {
      success: false,
      message: 'Email service not properly configured. Please check SMTP settings.'
    }
  }
  
  // Use provided content (already templated from frontend)
  const emailSubject = subject || 'Supplier Onboarding - Welcome'
  
  // Determine if this is an approval email (manager/procurement approval)
  const isApprovalEmail = emailSubject.toLowerCase().includes('approval required') || 
                          emailSubject.toLowerCase().includes('approval pending')
  
  // Replace form link with onboarding-specific link if token is provided
  let emailContent = content
  
  // First, convert ALL newlines to <br /> before any HTML replacement
  // This ensures the text content is properly formatted FIRST
  emailContent = emailContent.replace(/\n/g, '<br />\n')
  
  if (onboardingToken) {
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const formUrl = `${baseUrl}/supplier-onboarding-form?token=${onboardingToken}`
    
    console.log('🔗 Generated onboarding form URL:', formUrl)
    
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
  }
  console.log('========================')
  
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port || 587,
    secure: smtpConfig.secure !== undefined ? smtpConfig.secure : false,
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.pass,
    },
    tls: {
      rejectUnauthorized: false
    }
  })

  try {
    console.log('Attempting to send email via SMTP...')
    console.log('SMTP Config:', {
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      user: smtpConfig.user
    })

    // Verify connection
    console.log('🔍 Verifying SMTP connection...')
    await transporter.verify()
    console.log('✅ SMTP connection verified successfully')

    // Create mobile-friendly HTML email with Schauenburg branding
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
              <p class="header-text" style="color: #1e40af; font-size: 24px; font-weight: bold; margin: 0; line-height: 1.2;">${isApprovalEmail ? 'Onboarding Supplier Approval Required' : 'Welcome to Schauenburg Systems'}</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="content" style="padding: 40px 30px; color: #333333; line-height: 1.6; font-size: 16px;">
              ${emailContent}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="footer" style="background-color: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0;">Schauenburg Systems</p>
              <p style="margin: 0 0 10px 0;">
                <a href="${smtpConfig.companyWebsite || 'https://schauenburg.co.za'}" class="footer-link" style="color: #3b82f6; text-decoration: underline; font-weight: normal;">Visit our website</a>
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
      from: `"${smtpConfig.companyName || 'Schauenburg Systems'}" <${smtpConfig.fromEmail || smtpConfig.user}>`,
      to: to,
      subject: emailSubject,
      html: htmlContent,
      attachments: [
        {
          filename: 'logo.png',
          path: path.join(process.cwd(), 'public', 'logo.png'),
          cid: 'logo'
        }
      ]
    }

    console.log('📧 Sending email...')
    console.log('Email details:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    })

    const info = await transporter.sendMail(mailOptions)

    console.log('✅ Email sent successfully!')
    console.log('Message ID:', info.messageId)
    console.log('Response:', info.response)

    return {
      success: true,
      message: 'Email sent successfully',
      emailId: info.messageId
    }
  } catch (error: any) {
    console.error('❌ Failed to send email:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      command: error.command
    })
    
    return {
      success: false,
      message: `Failed to send email: ${error.message}`
    }
  }
}

