import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const templatesPath = path.join(process.cwd(), 'data', 'email-templates.json')

const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

const getDefaultTemplates = () => ({
  onboarding: {
    subject: "Welcome to Schauenburg Systems - Supplier Onboarding",
    content: `Dear {supplierName},

Thank you for your interest in becoming a supplier partner with Schauenburg Systems. We're excited to begin the onboarding process with you.

To complete your supplier registration, please click the link below to access our supplier portal and complete the registration form with your company details.

{formLink}

If you have any questions or need assistance, please don't hesitate to contact our procurement team.

Best regards,
Schauenburg Systems Procurement Team`
  },
  revision: {
    subject: "Action Required: Supplier Registration Revisions - Schauenburg Systems",
    content: `Dear {supplierName},

After reviewing your application, our procurement team has identified some items that require updates or additional information.

Required Revisions:
{revisionNotes}

Please review the requirements and update your submission using the link below:

{formLink}

We appreciate your cooperation in providing the necessary updates.

Best regards,
Schauenburg Systems Procurement Team`
  },
  approval: {
    subject: "Supplier Onboarding Approved - Welcome to Schauenburg Systems",
    content: `Dear {supplierName},

We are pleased to inform you that your application to become a supplier for Schauenburg Systems has been reviewed and approved.

Your Supplier Details:
- Company Name: {companyName}
- Supplier Code: {supplierCode}
- Status: APPROVED

You are now registered as an approved supplier in our system. Our procurement team may contact you regarding specific projects and tenders.

Best regards,
Schauenburg Systems Procurement Team`
  },
  rejection: {
    subject: "Supplier Registration Update - Schauenburg Systems",
    content: `Dear {supplierName},

Thank you for your interest in becoming a supplier for Schauenburg Systems.

After careful review of your application, we regret to inform you that we are unable to proceed with your supplier registration at this time.

Feedback:
{rejectionReason}

You may address the concerns mentioned and consider reapplying in the future. If you have any questions, please contact our procurement team.

Best regards,
Schauenburg Systems Procurement Team`
  },
  confirmation: {
    subject: "Supplier Onboarding Submission Received - Schauenburg Systems",
    content: `Dear {supplierName},

Thank you for submitting your supplier onboarding application. We have successfully received your information and documentation.

Submission Summary:
- Supplier Code: {supplierCode}
- Company: {companyName}
- Documents Submitted: {documentCount} files
- Submission Date: {submissionDate}

What Happens Next:
1. Review - Our procurement team will review your submission
2. Verification - We will verify your documents and credentials
3. Approval - Once approved, you will be added to our supplier database
4. Notification - You will receive an email with your approval status

Estimated Processing Time: 1-2 business days

Best regards,
Schauenburg Systems Procurement Team`
  }
})

// Load templates from file
const loadTemplates = () => {
  try {
    ensureDataDir()
    if (fs.existsSync(templatesPath)) {
      const data = fs.readFileSync(templatesPath, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading email templates:', error)
  }
  
  return getDefaultTemplates()
}

// Save templates to file
const saveTemplates = (templates: any) => {
  try {
    ensureDataDir()
    fs.writeFileSync(templatesPath, JSON.stringify(templates, null, 2))
    return true
  } catch (error) {
    console.error('Error saving email templates:', error)
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    const templates = loadTemplates()
    return NextResponse.json({
      success: true,
      templates
    })
  } catch (error) {
    console.error('Error in GET /api/settings/email-templates:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load email templates'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { templates } = body

    if (!templates) {
      return NextResponse.json(
        { success: false, error: 'Templates data is required' },
        { status: 400 }
      )
    }

    const saved = saveTemplates(templates)

    if (saved) {
      return NextResponse.json({
        success: true,
        message: 'Email templates saved successfully'
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to save email templates' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in POST /api/settings/email-templates:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save email templates'
      },
      { status: 500 }
    )
  }
}

