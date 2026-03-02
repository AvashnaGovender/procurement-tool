import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import path from 'path'
import { loadAdminSmtpConfig, getMailTransporter, getFromAddress } from '@/lib/smtp-admin'
import { generateFinalApprovalPackagePDF } from '@/lib/generate-final-approval-package-pdf'

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

    // Get supplier details
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      include: {
        onboarding: {
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
        }
      }
    })

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      )
    }

    // Check if user is the initiator
    if (supplier.onboarding?.initiation?.initiatedById !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Only the initiator can request final approval' },
        { status: 403 }
      )
    }

    // Update supplier status to AWAITING_FINAL_APPROVAL
    await prisma.supplier.update({
      where: { id: supplierId },
      data: { 
        status: 'AWAITING_FINAL_APPROVAL'
      }
    })

    // Update onboarding record if it exists
    if (supplier.onboarding) {
      // If there's an initiation and it was rejected, reset it back to submitted status
      if (supplier.onboarding.initiationId) {
        await prisma.supplierInitiation.update({
          where: { id: supplier.onboarding.initiationId },
          data: {
            status: 'SUBMITTED',
            submittedAt: new Date()
          }
        })
      }

      await prisma.supplierOnboarding.update({
        where: { id: supplier.onboarding.id },
        data: {
          currentStep: 'AWAITING_FINAL_APPROVAL',
          overallStatus: 'AWAITING_FINAL_APPROVAL',
          revisionRequested: false, // Clear revision flag when requesting final approval
          revisionNotes: null
        }
      })

      // Add timeline entry
      await prisma.onboardingTimeline.create({
        data: {
          onboardingId: supplier.onboarding.id,
          step: 'REVIEW',
          status: 'AWAITING_FINAL_APPROVAL',
          action: 'Final approval requested',
          description: `Final approval requested by ${session.user.name || 'Initiator'}`,
          performedBy: session.user.name || 'Initiator',
        }
      })
    }

    // Send notification email to Procurement Manager
    try {
      await sendFinalApprovalRequestEmail(supplier, session.user.name || 'Initiator')
    } catch (emailError) {
      console.error('Failed to send final approval request email:', emailError)
      // Don't fail the entire request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Final approval request sent successfully'
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

async function sendFinalApprovalRequestEmail(supplier: any, requesterName: string) {
  try {
    const smtpConfig = loadAdminSmtpConfig()
    const transporter = getMailTransporter(smtpConfig)

    // Get all Procurement Managers
    const procurementManagers = await prisma.user.findMany({
      where: { role: 'PROCUREMENT_MANAGER' },
      select: { email: true, name: true }
    })

    if (procurementManagers.length === 0) {
      console.warn('No Procurement Managers found to send final approval request email')
      return
    }

    const supplierDetailUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/supplier-submissions/${supplier.id}`

    // Generate comprehensive PDF with all information
    console.log('📄 Generating final approval package PDF...')
    console.log('📋 Supplier data available:', {
      hasOnboarding: !!supplier.onboarding,
      hasInitiation: !!supplier.onboarding?.initiation,
      hasInitiatedBy: !!supplier.onboarding?.initiation?.initiatedBy,
      supplierCode: supplier.supplierCode,
      companyName: supplier.companyName
    })
    
    // Get documents from airtableData
    const documents = supplier.airtableData?.allVersions?.flatMap((version: any) => 
      Object.entries(version.documents || {}).map(([category, files]: [string, any]) => 
        Array.isArray(files) ? files.map((file: any) => ({
          category,
          fileName: file.filename || file.name || 'Unknown',
          version: version.version || 1,
          uploadedAt: file.uploadedAt ? new Date(file.uploadedAt) : new Date()
        })) : []
      ).flat()
    ).flat() || []

    console.log(`📄 Found ${documents.length} documents to include in PDF`)

    let pdfBuffer: Buffer
    try {
      pdfBuffer = await generateFinalApprovalPackagePDF({
        supplier: {
          supplierCode: supplier.supplierCode,
          companyName: supplier.companyName,
          tradingName: supplier.tradingName,
          registrationNumber: supplier.registrationNumber,
          contactPerson: supplier.contactPerson,
          contactEmail: supplier.contactEmail,
          contactPhone: supplier.contactPhone,
          physicalAddress: supplier.physicalAddress,
          postalAddress: supplier.postalAddress,
          natureOfBusiness: supplier.natureOfBusiness,
          productsAndServices: supplier.productsAndServices,
          associatedCompany: supplier.associatedCompany,
          associatedCompanyRegNo: supplier.associatedCompanyRegNo,
          associatedCompanyBranchName: supplier.associatedCompanyBranchName,
          branchesContactNumbers: supplier.branchesContactNumbers,
          bankAccountName: supplier.bankAccountName,
          bankName: supplier.bankName,
          branchName: supplier.branchName,
          branchNumber: supplier.branchNumber,
          accountNumber: supplier.accountNumber,
          typeOfAccount: supplier.typeOfAccount,
          rpBanking: supplier.rpBanking,
          rpBankingPhone: supplier.rpBankingPhone,
          rpBankingEmail: supplier.rpBankingEmail,
          rpQuality: supplier.rpQuality,
          rpQualityPhone: supplier.rpQualityPhone,
          rpQualityEmail: supplier.rpQualityEmail,
          rpSHE: supplier.rpSHE,
          rpSHEPhone: supplier.rpSHEPhone,
          rpSHEEmail: supplier.rpSHEEmail,
          rpBBBEE: supplier.rpBBBEE,
          rpBBBEEPhone: supplier.rpBBBEEPhone,
          rpBBBEEEmail: supplier.rpBBBEEEmail,
          bbbeeLevel: supplier.bbbeeLevel,
          numberOfEmployees: supplier.numberOfEmployees,
          taxId: supplier.taxId,
          vatNumber: supplier.vatNumber,
          qualityManagementCert: supplier.qualityManagementCert,
          sheCertification: supplier.sheCertification,
          authorizationAgreement: supplier.authorizationAgreement,
        },
        initiation: {
          supplierName: supplier.onboarding?.initiation?.supplierName || supplier.companyName,
          supplierEmail: supplier.onboarding?.initiation?.supplierEmail || supplier.contactEmail,
          supplierContactPerson: supplier.onboarding?.initiation?.supplierContactPerson || supplier.contactPerson,
          productServiceCategory: supplier.onboarding?.initiation?.productServiceCategory || 'Not specified',
          requesterName: supplier.onboarding?.initiation?.requesterName || 'Unknown',
          relationshipDeclaration: supplier.onboarding?.initiation?.relationshipDeclaration || 'Not specified',
          processReadUnderstood: supplier.onboarding?.initiation?.processReadUnderstood || false,
          dueDiligenceCompleted: supplier.onboarding?.initiation?.dueDiligenceCompleted || false,
          purchaseType: supplier.onboarding?.initiation?.purchaseType || 'REGULAR',
          paymentMethod: supplier.onboarding?.initiation?.paymentMethod || 'AC',
          codReason: supplier.onboarding?.initiation?.codReason,
          annualPurchaseValue: supplier.onboarding?.initiation?.annualPurchaseValue,
          currency: supplier.onboarding?.initiation?.currency,
          supplierLocation: supplier.onboarding?.initiation?.supplierLocation,
          customCurrency: supplier.onboarding?.initiation?.customCurrency,
          creditApplication: supplier.onboarding?.initiation?.creditApplication || false,
          creditApplicationReason: supplier.onboarding?.initiation?.creditApplicationReason,
          onboardingReason: supplier.onboarding?.initiation?.onboardingReason || 'Not specified',
          businessUnit: supplier.onboarding?.initiation?.businessUnit || [],
          initiatedBy: {
            name: supplier.onboarding?.initiation?.initiatedBy?.name || 'Unknown',
            email: supplier.onboarding?.initiation?.initiatedBy?.email || 'Unknown'
          },
          createdAt: supplier.onboarding?.initiation?.createdAt ? new Date(supplier.onboarding.initiation.createdAt) : new Date(),
          submittedAt: supplier.onboarding?.initiation?.submittedAt ? new Date(supplier.onboarding.initiation.submittedAt) : null
        },
        documents,
        creditController: supplier.onboarding?.creditController,
        generatedAt: new Date()
      })
      
      console.log('✅ PDF generated successfully, size:', pdfBuffer.length, 'bytes')
      console.log('📎 PDF will be attached as:', `Final-Approval-Package-${supplier.supplierCode}.pdf`)
    } catch (pdfError) {
      console.error('❌ Error generating PDF:', pdfError)
      throw new Error(`PDF generation failed: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`)
    }

    // Create final approval request email content
    const emailSubject = `Final Approval Required: Supplier ${supplier.companyName}`
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
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="cid:logo" alt="Schauenburg Systems" class="logo" />
      <p class="header-text">Final Approval Required</p>
    </div>
    
    <div class="content">
      <p class="greeting">Dear Procurement Manager,</p>
      
      <div class="action-badge">
        🔔 Action Required: Final Approval
      </div>
      
      <p>
        A supplier has completed the initial review process and is now ready for your final approval.
      </p>
      
      <div class="info-box">
        <div class="info-box-title">Supplier Details</div>
        <div class="info-item"><strong>Company Name:</strong> ${supplier.companyName}</div>
        <div class="info-item"><strong>Supplier Code:</strong> ${supplier.supplierCode}</div>
        <div class="info-item"><strong>Contact Person:</strong> ${supplier.contactPerson}</div>
        <div class="info-item"><strong>Contact Email:</strong> ${supplier.contactEmail}</div>
        <div class="info-item"><strong>Requested by:</strong> ${requesterName}</div>
        <div class="info-item"><strong>Status:</strong> <span style="color: #f59e0b; font-weight: bold;">AWAITING FINAL APPROVAL</span></div>
      </div>
      
      <div class="info-box" style="background-color: #f0fdf4; border-left: 4px solid #22c55e;">
        <div class="info-box-title" style="color: #15803d;">📎 Complete Package Attached</div>
        <p style="margin: 0; color: #374151;">
          A comprehensive PDF containing <strong>all initiator request details and supplier questionnaire responses</strong> is attached to this email for your review.
        </p>
      </div>
      
      <p>
        <strong>What you need to do:</strong>
      </p>
      <ul style="color: #374151; line-height: 1.8;">
        <li><strong>Review the attached PDF</strong> with complete supplier information</li>
        <li>Review the supplier's documents and information in the system</li>
        <li>Verify all compliance requirements are met</li>
        <li>Approve or reject the supplier application</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
          <tr>
            <td align="center" style="background-color: #3b82f6; border-radius: 8px; padding: 0;">
              <a href="${supplierDetailUrl}" target="_blank" style="display: inline-block; background-color: #3b82f6; color: #ffffff !important; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none; padding: 15px 40px; border-radius: 8px; border: none;">Review & Approve Supplier</a>
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

    const fromAddress = getFromAddress(smtpConfig)
    for (const pm of procurementManagers) {
      console.log('📧 Sending final approval request email to:', pm.email)
      console.log('📎 Attaching PDF:', `Final-Approval-Package-${supplier.supplierCode}.pdf`, `(${pdfBuffer.length} bytes)`)
      
      await transporter.sendMail({
        from: fromAddress,
        to: pm.email,
        subject: emailSubject,
        html: emailHtml,
        attachments: [
          {
            filename: 'logo.png',
            path: path.join(process.cwd(), 'public', 'logo.png'),
            cid: 'logo'
          },
          {
            filename: `Final-Approval-Package-${supplier.supplierCode}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      })

      console.log('✅ Final approval request email sent successfully to:', pm.email)
      console.log('📧 Email included 2 attachments: logo.png and PDF')
    }
  } catch (error) {
    console.error('Error sending final approval request email:', error)
    throw error
  }
}
