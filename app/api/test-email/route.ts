import { NextResponse } from 'next/server'
import { loadAdminSmtpConfig, getMailTransporter, getFromAddress } from '@/lib/smtp-admin'

export async function GET() {
  try {
    console.log('Starting SMTP connection test (admin config)...')
    const emailConfig = loadAdminSmtpConfig()
    const transporter = getMailTransporter(emailConfig)
    await transporter.verify()
    console.log('✅ SMTP connection successful!')
    const port = Number(emailConfig.port) || 587
    return NextResponse.json({
      success: true,
      message: 'SMTP connection successful! Email settings are working correctly.',
      config: {
        host: emailConfig.host,
        port,
        user: emailConfig.user,
        fromEmail: getFromAddress(emailConfig),
        companyName: emailConfig.companyName
      }
    })
    
  } catch (error) {
    console.error('❌ SMTP connection test failed:', error)
    
    let errorMessage = 'Failed to connect to SMTP server'
    
    if (error instanceof Error) {
      if (error.message.includes('EAUTH')) {
        errorMessage = 'Authentication failed. Please check your username and password.'
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Connection refused. Please check your SMTP host and port.'
      } else if (error.message.includes('ETIMEDOUT') || error.message.includes('ENOTFOUND')) {
        errorMessage = 'Cannot reach SMTP server. Please check your host name.'
      } else if (error.message.includes('wrong version number') || (error as NodeJS.ErrnoException).code === 'ESOCKET') {
        errorMessage = 'SSL/connection error: for port 587 use STARTTLS (do not use SSL from the start). The app now does this automatically—try the test again.'
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      } : undefined
    }, { status: 500 })
  }
}