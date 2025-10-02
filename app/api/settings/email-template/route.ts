import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const templatePath = path.join(process.cwd(), 'data', 'email-template.json')

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.dirname(templatePath)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Load template from file
const loadTemplate = () => {
  try {
    ensureDataDir()
    if (fs.existsSync(templatePath)) {
      const data = fs.readFileSync(templatePath, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading email template:', error)
  }
  
  // Return default template
  return {
    subject: "Supplier Onboarding - Welcome to Our Procurement System",
    content: `Dear {supplierName},

Thank you for your interest in becoming a supplier partner with {companyName}. We're excited to begin the onboarding process with your {businessType} business.

To complete your supplier registration, please:

1. Click the link below to access our supplier portal
2. Complete the registration form with your company details
3. Upload all required documents
4. Review and sign our Non-Disclosure Agreement (NDA)

[Supplier Registration Portal Link]

Required documents for {businessType} businesses:
• Company Registration Documents (CM1/CK1/CK2)
• Copy of CM29 - List of Directors
• Shareholder Certificates and Proof of Shareholding
• BBBEE Accreditation / Letter from your Auditor
• Tax Clearance Certificate (Not older than 3 months)
• Bank Confirmation Letter (Not older than 3 months)
• Non-Disclosure Agreement (NDA) (Initial all pages)
• Health and Safety Policy
• Updated Company Organogram
• Company Profile

If you have any questions or need assistance, please don't hesitate to contact our procurement team.

Best regards,
Procurement Team
{companyName}
{companyWebsite}`
  }
}

// Save template to file
const saveTemplate = (template: any) => {
  try {
    ensureDataDir()
    fs.writeFileSync(templatePath, JSON.stringify(template, null, 2))
    return true
  } catch (error) {
    console.error('Error saving email template:', error)
    return false
  }
}

export async function GET() {
  try {
    const template = loadTemplate()
    return NextResponse.json({
      success: true,
      template: template
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to load email template' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const template = await request.json()
    
    // Validate required fields
    if (!template.subject || !template.content) {
      return NextResponse.json(
        { error: 'Missing required fields: subject and content are required' },
        { status: 400 }
      )
    }

    // Save template
    const success = saveTemplate(template)
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Email template saved successfully' 
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to save email template' },
        { status: 500 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request data' },
      { status: 400 }
    )
  }
} 