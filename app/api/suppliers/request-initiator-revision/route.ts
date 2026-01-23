import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only PM can request revision from initiator
    if (session.user.role !== 'PROCUREMENT_MANAGER') {
      return NextResponse.json(
        { success: false, error: 'Only Procurement Managers can request revision from initiator' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { supplierId, revisionNotes } = body

    if (!supplierId || !revisionNotes) {
      return NextResponse.json(
        { success: false, error: 'Missing supplierId or revisionNotes' },
        { status: 400 }
      )
    }

    // Get supplier details
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId }
    })

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      )
    }

    // Get onboarding record with initiation
    const onboarding = await prisma.supplierOnboarding.findUnique({
      where: { supplierId },
      include: {
        initiation: {
          include: {
            initiatedBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!onboarding || !onboarding.initiation) {
      return NextResponse.json(
        { success: false, error: 'Onboarding or initiation record not found' },
        { status: 404 }
      )
    }

    const initiation = onboarding.initiation
    const initiator = initiation.initiatedBy

    if (!initiator) {
      return NextResponse.json(
        { success: false, error: 'Initiator not found' },
        { status: 404 }
      )
    }

    // Update initiation status to allow editing (set to REJECTED so initiator can edit)
    await prisma.supplierInitiation.update({
      where: { id: initiation.id },
      data: {
        status: 'REJECTED',
        // Store revision notes in a comment field or we could add a new field
        // For now, we'll use the procurement approval comments if it exists
      }
    })

    // Update procurement approval with comments if it exists
    if (onboarding.initiation.procurementApproval) {
      await prisma.procurementApproval.update({
        where: { initiationId: initiation.id },
        data: {
          comments: revisionNotes,
          status: 'REJECTED'
        }
      })
    }

    // Update onboarding status
    await prisma.supplierOnboarding.update({
      where: { id: onboarding.id },
      data: {
        overallStatus: 'REVISION_NEEDED',
        currentStep: 'REVISION_REQUESTED',
        revisionRequested: true,
        revisionCount: { increment: 1 },
        revisionNotes: `Initiator revision requested: ${revisionNotes}`,
        revisionRequestedAt: new Date(),
      }
    })

    // Add timeline entry
    await prisma.onboardingTimeline.create({
      data: {
        onboardingId: onboarding.id,
        step: 'REVIEW',
        status: 'REVISION_NEEDED',
        action: 'Revision requested from initiator',
        description: `Procurement Manager requested revision from initiator: ${revisionNotes}`,
        performedBy: 'Procurement Manager',
      }
    })

    // Send email to initiator (NOT to supplier)
    try {
      await sendInitiatorRevisionRequestEmail(
        supplier,
        initiator,
        revisionNotes,
        initiation.id
      )
    } catch (emailError) {
      console.error('Failed to send initiator revision request email:', emailError)
      // Don't fail the entire request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Revision request sent to initiator successfully'
    })
  } catch (error) {
    console.error('Error requesting initiator revision:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to request revision from initiator'
      },
      { status: 500 }
    )
  }
}

async function sendInitiatorRevisionRequestEmail(
  supplier: any,
  initiator: { name: string, email: string },
  revisionNotes: string,
  initiationId: string
) {
  try {
    // Load SMTP configuration
    const configPath = path.join(process.cwd(), 'data', 'smtp-config.json')
    const configData = fs.readFileSync(configPath, 'utf8')
    const smtpConfig = JSON.parse(configData)

    if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
      throw new Error('SMTP configuration not properly set up')
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass
      }
    })

    const initiationEditUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/suppliers/onboard?initiationId=${initiationId}`
    const supplierDetailUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/supplier-submissions/${supplier.id}`

    // Create initiator revision request email content
    const emailSubject = `Action Required: Revision Requested for Supplier Initiation - ${supplier.companyName}`
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      margin: 0; 
      padding: 0; 
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
    }
    .greeting { 
      font-size: 18px; 
      font-weight: bold; 
      color: #1e40af; 
      margin-bottom: 20px; 
    }
    .action-badge {
      background-color: #f59e0b;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      text-align: center;
      margin: 30px 0;
    }
    .info-box { 
      background-color: #eff6ff; 
      border-left: 4px solid #3b82f6; 
      padding: 20px; 
      margin: 25px 0; 
      border-radius: 4px; 
    }
    .info-box-title { 
      font-weight: bold; 
      color: #1e40af; 
      margin-bottom: 10px; 
      font-size: 16px; 
    }
    .info-item { 
      margin: 8px 0; 
      color: #374151; 
    }
    .revision-box {
      background-color: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .revision-title {
      font-weight: bold;
      color: #92400e;
      margin-bottom: 10px;
      font-size: 16px;
    }
    .revision-content {
      color: #1f2937;
      line-height: 1.6;
      white-space: pre-wrap;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      color: white;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      text-align: center;
      margin: 20px 0;
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
    @media only screen and (max-width: 600px) {
      .content { 
        padding: 30px 20px; 
      }
      .header { 
        padding: 30px 20px; 
      }
      .header-text { 
        font-size: 20px; 
      }
      .greeting { 
        font-size: 16px; 
      }
      .info-box, .revision-box { 
        padding: 15px; 
      }
      .cta-button {
        display: block;
        margin: 20px 0;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="cid:logo" alt="Schauenburg Systems" class="logo" />
      <p class="header-text">Revision Request - Supplier Initiation</p>
    </div>
    
    <div class="content">
      <p class="greeting">Dear ${initiator.name},</p>
      
      <div class="action-badge">
        ⚠️ Action Required: Please Review and Update Supplier Initiation
      </div>
      
      <p>
        The Procurement Manager has reviewed the supplier initiation you submitted and has requested 
        some revisions before proceeding with the final approval process.
      </p>
      
      <p>
        <strong>Important:</strong> The supplier has <strong>NOT</strong> been notified of this revision request. 
        This gives you an opportunity to review and correct the initiation details before the supplier is involved.
      </p>
      
      <div class="info-box">
        <div class="info-box-title">Supplier Details</div>
        <div class="info-item"><strong>Company Name:</strong> ${supplier.companyName}</div>
        <div class="info-item"><strong>Supplier Code:</strong> ${supplier.supplierCode}</div>
        <div class="info-item"><strong>Contact Person:</strong> ${supplier.contactPerson}</div>
        <div class="info-item"><strong>Contact Email:</strong> ${supplier.contactEmail}</div>
        <div class="info-item"><strong>Status:</strong> <span style="color: #f59e0b; font-weight: bold;">REVISION REQUESTED</span></div>
      </div>
      
      <div class="revision-box">
        <div class="revision-title">Revision Notes from Procurement Manager</div>
        <div class="revision-content">${revisionNotes}</div>
      </div>
      
      <p>
        <strong>What you need to do:</strong>
      </p>
      <ul style="color: #374151; line-height: 1.8;">
        <li>Review the revision notes from the Procurement Manager</li>
        <li>Edit the supplier initiation form to address the requested changes</li>
        <li>Resubmit the initiation for approval</li>
        <li>Once you resubmit, the approval process will continue</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
          <tr>
            <td align="center" style="background-color: #3b82f6; border-radius: 8px; padding: 0;">
              <a href="${initiationEditUrl}" target="_blank" style="display: inline-block; background-color: #3b82f6; color: #ffffff !important; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none; padding: 15px 40px; border-radius: 8px; border: none;">Edit Supplier Initiation</a>
            </td>
          </tr>
        </table>
      </div>
      
      <div style="text-align: center; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 14px; margin: 10px 0;">
          Or copy and paste this link into your browser:
        </p>
        <p style="word-break: break-all; color: #3b82f6; font-size: 13px; padding: 10px; background-color: #f3f4f6; border-radius: 4px;">
          ${initiationEditUrl}
        </p>
      </div>
      
      <p>
        You can also view the supplier details in the system:
      </p>
      
      <div style="text-align: center; margin: 20px 0;">
        <a href="${supplierDetailUrl}" target="_blank" style="color: #3b82f6; text-decoration: underline;">
          View Supplier Details
        </a>
      </div>
      
      <p>
        Once you have made the necessary changes and resubmitted, the Procurement Manager will review 
        the updated initiation and proceed with the approval process.
      </p>
      
      <p style="margin-top: 30px;">
        Best regards,<br/>
        <strong>Schauenburg Systems Procurement Team</strong>
      </p>
    </div>
    
    <div class="footer">
      <p>Schauenburg Systems</p>
      <p>
        <a href="${smtpConfig.companyWebsite}" class="footer-link">${smtpConfig.companyWebsite}</a>
      </p>
      <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
        This is an automated notification from the Supplier Onboarding System.
      </p>
    </div>
  </div>
</body>
</html>
    `

    // Send email
    console.log('📧 Sending initiator revision request email to:', initiator.email)
    
    await transporter.sendMail({
      from: `"${smtpConfig.companyName}" <${smtpConfig.fromEmail}>`,
      to: initiator.email,
      subject: emailSubject,
      html: emailHtml,
      attachments: [
        {
          filename: 'logo.png',
          path: path.join(process.cwd(), 'public', 'logo.png'),
          cid: 'logo'
        }
      ]
    })

    console.log('✅ Initiator revision request email sent successfully to:', initiator.email)
  } catch (error) {
    console.error('Error sending initiator revision request email:', error)
    throw error
  }
}

