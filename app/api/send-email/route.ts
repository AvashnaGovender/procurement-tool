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
      // Replace any existing form links
      emailContent = emailContent
        .replace(/https?:\/\/forms\.office\.com[^\s]*/g, formUrl)
        .replace(/https?:\/\/airtable\.com[^\s]*/g, formUrl)
        .replace(/http:\/\/localhost:3000\/supplier-onboarding-form/g, formUrl)
    }
    
    console.log('Sending email to:', to)
    console.log('Subject:', emailSubject)
    console.log('Content length:', emailContent.length)
    
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
    await transporter.verify()
    console.log('SMTP connection verified successfully')
    
    const mailOptions = {
      from: config.fromEmail,
      to: to,
      subject: subject,
      text: content,
      html: content.replace(/\n/g, '<br>')
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', result.messageId)
    
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