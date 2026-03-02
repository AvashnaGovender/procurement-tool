import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json()
    // Trim so leading/trailing spaces don't break connection (e.g. " smtp.host.com")
    const config = {
      ...raw,
      host: typeof raw.host === 'string' ? raw.host.trim() : raw.host,
      user: typeof raw.user === 'string' ? raw.user.trim() : raw.user,
      pass: typeof raw.pass === 'string' ? raw.pass.trim() : raw.pass,
    }
    
    // Validate required fields
    if (!config.host || !config.user || !config.pass) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: host, user, and pass are required'
      })
    }

    // Test SMTP connection using nodemailer
    const nodemailer = require('nodemailer')
    
    // Port 465 = implicit SSL; 587/25 = STARTTLS (secure: false for STARTTLS)
    const port = Number(config.port) || 587
    const useSecure = port === 465

    console.log('Testing SMTP configuration:', {
      host: config.host,
      port,
      user: config.user,
      secure: useSecure
    })

    const transporter = nodemailer.createTransporter({
      host: config.host,
      port,
      secure: useSecure,
      auth: {
        user: config.user,
        pass: config.pass
      }
    })

    // Verify connection configuration
    await transporter.verify()
    
    return NextResponse.json({
      success: true,
      message: 'SMTP connection test successful! Email server is properly configured.'
    })

  } catch (error) {
    console.error('SMTP test error:', error)
    return NextResponse.json({
      success: false,
      message: 'An error occurred while testing the SMTP configuration'
    })
  }
} 