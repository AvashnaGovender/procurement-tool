import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    console.log('Starting SMTP connection test...')
    
    // Load SMTP configuration
    const configPath = path.join(process.cwd(), 'data', 'smtp-config.json')
    
    if (!fs.existsSync(configPath)) {
      return NextResponse.json({
        success: false,
        error: 'SMTP configuration file not found. Please configure SMTP settings first.'
      }, { status: 400 })
    }
    
    const configData = fs.readFileSync(configPath, 'utf8')
    const emailConfig = JSON.parse(configData)
    
    console.log('Configuration loaded:', {
      host: emailConfig.host,
      port: emailConfig.port,
      user: emailConfig.user,
      fromEmail: emailConfig.fromEmail,
      hasPassword: !!emailConfig.pass
    })
    
    // Validate required config fields
    const requiredFields = ['host', 'port', 'user', 'fromEmail', 'pass']
    const missingFields = requiredFields.filter(field => !emailConfig[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}. Please fill in all SMTP settings.`
      }, { status: 400 })
    }
    
    // Try to connect to SMTP server
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
    
    // Verify connection
    await transporter.verify()
    
    console.log('✅ SMTP connection successful!')
    
    return NextResponse.json({
      success: true,
      message: 'SMTP connection successful! Email settings are working correctly.',
      config: {
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        user: emailConfig.user,
        fromEmail: emailConfig.fromEmail,
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