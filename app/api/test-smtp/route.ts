import { NextResponse } from 'next/server'
import { loadEmailConfig } from '@/lib/email-config'

export async function GET() {
  try {
    const emailConfig = await loadEmailConfig()
    
    console.log('Testing SMTP connection with config:', {
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      user: emailConfig.user
    })
    
    const nodemailer = require('nodemailer')
    
    const transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.pass
      }
    })
    
    // Test connection
    await transporter.verify()
    
    return NextResponse.json({
      success: true,
      message: 'SMTP connection successful',
      config: {
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        user: emailConfig.user,
        hasPassword: !!emailConfig.pass
      }
    })
    
  } catch (error) {
    console.error('SMTP connection test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        code: (error as any)?.code,
        command: (error as any)?.command,
        response: (error as any)?.response
      }
    }, { status: 500 })
  }
}
