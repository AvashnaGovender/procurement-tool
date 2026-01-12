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

    const body = await request.json()
    const { supplierId } = body

    if (!supplierId) {
      return NextResponse.json(
        { success: false, error: 'Missing supplierId' },
        { status: 400 }
      )
    }

    // Get supplier with onboarding and initiation data
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      include: {
        onboarding: {
          include: {
            initiation: {
              include: {
                initiatedBy: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      )
    }

    // Verify that the current user is the initiator
    if (supplier.onboarding?.initiation?.initiatedById !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Only the initiator can request final approval' },
        { status: 403 }
      )
    }

    // Check if final approval was already requested (status is AWAITING_FINAL_APPROVAL and timeline shows final approval request)
    if (supplier.status === 'AWAITING_FINAL_APPROVAL' && supplier.onboarding) {
      const recentTimeline = await prisma.onboardingTimeline.findFirst({
        where: {
          onboardingId: supplier.onboarding.id,
          action: 'Final approval requested'
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      if (recentTimeline) {
        return NextResponse.json(
          { success: false, error: 'Final approval has already been requested. Waiting for Procurement Manager approval.' },
          { status: 400 }
        )
      }
    }

    // Find an active Procurement Manager
    const procurementManagers = await prisma.user.findMany({
      where: {
        role: 'PROCUREMENT_MANAGER',
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 1
    })

    if (procurementManagers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No active Procurement Manager found. Please contact your administrator.' },
        { status: 404 }
      )
    }

    const pm = procurementManagers[0]

    // Get credit application status and documents
    const creditApplication = supplier.onboarding?.initiation?.creditApplication || false
    let creditApplicationFiles: Array<{ version: number, fileName: string }> = []
    
    // Find credit application documents from all versions
    if (creditApplication && supplier.airtableData?.allVersions) {
      supplier.airtableData.allVersions.forEach((version: any) => {
        const versionFiles = version.uploadedFiles || {}
        if (versionFiles.creditApplication && Array.isArray(versionFiles.creditApplication)) {
          versionFiles.creditApplication.forEach((fileName: string) => {
            creditApplicationFiles.push({
              version: version.version || 1,
              fileName: fileName
            })
          })
        }
      })
    }

    // Send email to Procurement Manager
    try {
      await sendFinalApprovalRequestEmail(
        supplier,
        pm,
        supplier.onboarding?.initiation?.initiatedBy || null,
        creditApplication,
        creditApplicationFiles
      )
    } catch (emailError) {
      console.error('Failed to send final approval request email:', emailError)
      return NextResponse.json(
        { success: false, error: 'Failed to send email to Procurement Manager' },
        { status: 500 }
      )
    }

    // Update supplier status to indicate final approval has been requested
    await prisma.supplier.update({
      where: { id: supplierId },
      data: {
        status: 'AWAITING_FINAL_APPROVAL'
      }
    })

    // Update onboarding status if it exists
    if (supplier.onboarding) {
      await prisma.supplierOnboarding.update({
        where: { id: supplier.onboarding.id },
        data: {
          overallStatus: 'UNDER_REVIEW',
          currentStep: 'REVIEW'
        }
      })

      // Add timeline entry
      await prisma.onboardingTimeline.create({
        data: {
          onboardingId: supplier.onboarding.id,
          step: 'REVIEW',
          status: 'UNDER_REVIEW',
          action: 'Final approval requested',
          description: `Initiator (${session.user.name || session.user.email}) requested final approval. Email sent to Procurement Manager (${pm.name || pm.email}).`,
          performedBy: session.user.id,
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Final approval request sent successfully',
      pmEmail: pm.email
    })
  } catch (error) {
    console.error('Error requesting final approval:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to request final approval'
      },
      { status: 500 }
    )
  }
}

async function sendFinalApprovalRequestEmail(
  supplier: any,
  pm: any,
  initiator: { name: string, email: string } | null,
  creditApplication: boolean = false,
  creditApplicationFiles: Array<{ version: number, fileName: string }> = []
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

    const supplierDetailUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/supplier-submissions/${supplier.id}`

    // Create final approval request email content
    const emailSubject = `Final Approval Request: ${supplier.companyName} - Supplier Onboarding`
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
      background-color: #10b981;
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
      .info-box { 
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
      <p class="header-text">Final Approval Request</p>
    </div>
    
    <div class="content">
      <p class="greeting">Dear ${pm.name || 'Procurement Manager'},</p>
      
      <div class="action-badge">
        Action Required: Final Approval Request
      </div>
      
      <p>
        A final approval request has been submitted for a supplier onboarding application.
      </p>
      
      <div class="info-box">
        <div class="info-box-title">Supplier Information</div>
        <div class="info-item"><strong>Company Name:</strong> ${supplier.companyName}</div>
        <div class="info-item"><strong>Supplier Code:</strong> ${supplier.supplierCode}</div>
        <div class="info-item"><strong>Contact Person:</strong> ${supplier.contactPerson}</div>
        <div class="info-item"><strong>Contact Email:</strong> ${supplier.contactEmail}</div>
        ${initiator ? `<div class="info-item"><strong>Requested By:</strong> ${initiator.name} (${initiator.email})</div>` : ''}
        <div class="info-item"><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">PENDING FINAL APPROVAL</span></div>
      </div>
      
      <p>
        <strong>What you need to do:</strong>
      </p>
      <ul style="color: #374151; line-height: 1.8;">
        <li>Review the supplier's documentation and information</li>
        <li>Verify all mandatory documents are present and correct</li>
        ${creditApplication && creditApplicationFiles.length > 0 ? '<li><strong>IMPORTANT:</strong> Download, sign, and re-upload the Credit Application document (see details below)</li>' : ''}
        <li>Approve or reject the supplier using the link below</li>
        <li>Contact the initiator if you have any questions</li>
      </ul>
      
      ${creditApplication && creditApplicationFiles.length > 0 ? `
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 4px;">
        <div style="font-weight: bold; color: #92400e; margin-bottom: 10px; font-size: 16px;">
          ⚠️ Credit Application Document Required
        </div>
        <div style="color: #1f2937; line-height: 1.6; margin-bottom: 15px;">
          <p style="margin: 10px 0;">
            This supplier has submitted a <strong>Credit Application</strong> which requires your signature before approval.
          </p>
          <p style="margin: 10px 0; font-weight: bold;">
            Action Required:
          </p>
          <ol style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">
            <li>Download the Credit Application document(s) below</li>
            <li>Review and sign the document(s)</li>
            <li>Re-upload the signed document(s) to the supplier's profile</li>
            <li>Only then proceed with final approval</li>
          </ol>
        </div>
        <div style="margin-top: 15px;">
          <div style="font-weight: bold; color: #92400e; margin-bottom: 10px;">Credit Application Document(s):</div>
          ${creditApplicationFiles.map((file, index) => {
            const downloadUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/supplier-submissions/${supplier.id}/preview/${supplier.supplierCode}/v${file.version}/creditApplication/${encodeURIComponent(file.fileName)}`
            return `
            <div style="margin: 8px 0; padding: 10px; background-color: #ffffff; border-radius: 4px; border: 1px solid #fbbf24;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="color: #374151; font-weight: 500;">${file.fileName}</span>
                <a href="${downloadUrl}" target="_blank" style="display: inline-block; background-color: #f59e0b; color: #ffffff !important; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; text-decoration: none; padding: 8px 16px; border-radius: 4px; margin-left: 10px;">Download</a>
              </div>
              <div style="color: #6b7280; font-size: 12px; margin-top: 5px;">Version ${file.version}</div>
            </div>
            `
          }).join('')}
        </div>
      </div>
      ` : ''}
      
      <div style="text-align: center; margin: 30px 0;">
        <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
          <tr>
            <td align="center" style="background-color: #3b82f6; border-radius: 8px; padding: 0;">
              <a href="${supplierDetailUrl}" target="_blank" style="display: inline-block; background-color: #3b82f6; color: #ffffff !important; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none; padding: 15px 40px; border-radius: 8px; border: none;">Review Supplier</a>
            </td>
          </tr>
        </table>
      </div>
      
      <div style="text-align: center; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 14px; margin: 10px 0;">
          Or copy and paste this link into your browser:
        </p>
        <p style="word-break: break-all; color: #3b82f6; font-size: 13px; padding: 10px; background-color: #f3f4f6; border-radius: 4px;">
          ${supplierDetailUrl}
        </p>
      </div>
      
      <p>
        Please review this supplier application and provide your final approval decision at your earliest convenience.
      </p>
      
      <p style="margin-top: 30px;">
        Best regards,<br/>
        <strong>Schauenburg Systems Procurement System</strong>
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
    console.log('📧 Sending final approval request email to PM:', pm.email)
    
    await transporter.sendMail({
      from: `"${smtpConfig.companyName}" <${smtpConfig.fromEmail}>`,
      to: pm.email,
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

    console.log('✅ Final approval request email sent successfully to:', pm.email)
  } catch (error) {
    console.error('Error sending final approval request email:', error)
    throw error
  }
}

