import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'

async function testEmailSend() {
  try {
    console.log('📧 Testing email sending...')
    
    // Load SMTP config
    const configPath = path.join(process.cwd(), 'data', 'smtp-config.json')
    const configData = fs.readFileSync(configPath, 'utf8')
    const config = JSON.parse(configData)
    
    console.log('SMTP Config:', {
      host: config.host,
      port: config.port,
      user: config.user,
      secure: config.secure
    })
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass
      }
    })
    
    // Verify connection
    console.log('🔍 Verifying SMTP connection...')
    await transporter.verify()
    console.log('✅ SMTP connection verified successfully')
    
    // Send test email
    console.log('📧 Sending test email...')
    const result = await transporter.sendMail({
      from: `"${config.companyName}" <${config.fromEmail}>`,
      to: config.user, // Send to yourself
      subject: 'Test Email - Procurement System',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from the procurement system.</p>
        <p>If you received this, email sending is working correctly!</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `
    })
    
    console.log('✅ Email sent successfully!')
    console.log('Result:', {
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
      response: result.response
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
  }
}

testEmailSend()









