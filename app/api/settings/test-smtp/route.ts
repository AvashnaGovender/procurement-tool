import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const config = await request.json()
    
    // Validate required fields
    if (!config.host || !config.user || !config.pass) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: host, user, and pass are required'
      })
    }

    // Test SMTP connection using nodemailer
    const nodemailer = require('nodemailer')
    
    console.log('Testing SMTP configuration:', {
      host: config.host,
      port: config.port,
      user: config.user,
      secure: config.secure
    })

    const transporter = nodemailer.createTransporter({
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