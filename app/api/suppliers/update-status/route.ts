import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { supplierId, status, rejectionReason, signedCreditApplicationFileName, creditController } = body
    
    console.log(`🔐 Update Status Authorization Check:`)
    console.log(`   User: ${session.user.email} (Role: ${session.user.role})`)
    console.log(`   Requested Status: ${status}`)
    console.log(`   Supplier ID: ${supplierId}`)

    if (!supplierId || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing supplierId or status' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['PENDING', 'UNDER_REVIEW', 'AWAITING_FINAL_APPROVAL', 'APPROVED', 'REJECTED', 'SUSPENDED', 'INACTIVE']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Validate rejection reason if status is REJECTED
    if (status === 'REJECTED' && !rejectionReason) {
      return NextResponse.json(
        { success: false, error: 'Rejection reason is required when rejecting a supplier' },
        { status: 400 }
      )
    }

    // Get supplier with onboarding data before updating
    const supplierBeforeUpdate = await prisma.supplier.findUnique({
      where: { id: supplierId },
      select: {
        id: true,
        status: true,
        supplierCode: true,
        airtableData: true,
        onboarding: {
          include: {
            initiation: {
              select: {
                creditApplication: true
              }
            }
          }
        }
      }
    })

    // Check if supplier exists
    if (!supplierBeforeUpdate) {
      console.error(`❌ Supplier not found: ${supplierId}`)
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      )
    }

    console.log(`✅ Supplier found: ${supplierBeforeUpdate.supplierCode} (Status: ${supplierBeforeUpdate.status})`)

    // Authorization check: Only PM can approve suppliers awaiting final approval
    if (status === 'APPROVED' && supplierBeforeUpdate?.status === 'AWAITING_FINAL_APPROVAL') {
      // Check if user is Procurement Manager (ADMIN cannot approve final approvals)
      if (session.user.role !== 'PROCUREMENT_MANAGER') {
        console.log(`❌ Authorization failed: User role ${session.user.role} is not authorized to approve suppliers`)
        return NextResponse.json(
          { 
            success: false, 
            error: 'Unauthorized. Only Procurement Managers can approve suppliers awaiting final approval.' 
          },
          { status: 403 }
        )
      }
      
      const creditApplicationRequired = supplierBeforeUpdate.onboarding?.initiation?.creditApplication || false
      
      if (creditApplicationRequired && !signedCreditApplicationFileName) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Signed Credit Application document is required before approval. Please upload the signed document first.' 
          },
          { status: 400 }
        )
      }
    }

    // Update supplier status (supplier should already exist, we're not creating a new one)
    let supplier
    try {
      supplier = await prisma.supplier.update({
        where: { id: supplierId },
        data: { 
          status,
          approvedAt: status === 'APPROVED' ? new Date() : null
        }
      })
      console.log(`✅ Supplier status updated: ${supplier.supplierCode} -> ${status}`)
    } catch (updateError: any) {
      console.error('❌ Error updating supplier:', updateError)
      console.error('   Error code:', updateError.code)
      console.error('   Error message:', updateError.message)
      console.error('   Error meta:', JSON.stringify(updateError.meta, null, 2))
      
      // Check if it's a unique constraint error on supplierCode (shouldn't happen on update, but just in case)
      if (updateError.code === 'P2002' && updateError.meta?.target?.includes('supplierCode')) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Supplier code conflict: A supplier with code "${supplierBeforeUpdate.supplierCode}" already exists. This should not happen during an update. Please contact support.` 
          },
          { status: 409 }
        )
      }
      
      // Re-throw other errors to be caught by outer catch
      throw updateError
    }

    // Update onboarding record if it exists
    const onboarding = await prisma.supplierOnboarding.findUnique({
      where: { supplierId }
    })

    if (onboarding) {
      await prisma.supplierOnboarding.update({
        where: { id: onboarding.id },
        data: {
          approvalStatus: status === 'APPROVED' ? 'APPROVED' : status === 'REJECTED' ? 'REJECTED' : null,
          approvedAt: status === 'APPROVED' ? new Date() : null,
          rejectedAt: status === 'REJECTED' ? new Date() : null,
          rejectionReason: status === 'REJECTED' ? rejectionReason : null,
          completedAt: status === 'APPROVED' || status === 'REJECTED' ? new Date() : null,
          creditController: status === 'APPROVED' && creditController ? creditController : undefined,
        }
      })

      // Add timeline entry
      await prisma.onboardingTimeline.create({
        data: {
          onboardingId: onboarding.id,
          step: 'REVIEW',
          status: status,
          action: `Status updated to ${status}`,
          description: status === 'REJECTED' 
            ? `Supplier rejected: ${rejectionReason}` 
            : `Supplier status changed to ${status}`,
          performedBy: 'Admin',
        }
      })
    }

    // Send approval email if status is APPROVED
    let emailError: Error | null = null
    let emailSent = false
    if (status === 'APPROVED') {
      try {
        // Get signed credit application file name if available
        // Note: airtableData is on the Supplier model, not SupplierOnboarding
        const signedCreditAppFileName = signedCreditApplicationFileName || 
          (supplierBeforeUpdate?.airtableData as any)?.signedCreditApplication?.fileName || null
        
        // Get onboarding record to access credit application token
        const supplierWithOnboarding = await prisma.supplier.findUnique({
          where: { id: supplier.id },
          include: {
            onboarding: {
              select: {
                creditApplicationToken: true
              }
            }
          }
        })
        
        // Send email to supplier
        await sendApprovalEmail(supplierWithOnboarding || supplier, signedCreditAppFileName)
        emailSent = true
        
        // Send email to initiator and manager if onboarding exists
        if (onboarding && onboarding.initiationId) {
          const initiation = await prisma.supplierInitiation.findUnique({
            where: { id: onboarding.initiationId },
            include: {
              initiatedBy: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              },
              managerApproval: {
                include: {
                  approver: {
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
          
          // Send email to initiator
          if (initiation && initiation.initiatedBy) {
            try {
              await sendInitiatorApprovalEmail(supplier, initiation.initiatedBy)
            } catch (initiatorEmailError) {
              console.error('Failed to send initiator email:', initiatorEmailError)
              // Don't fail if initiator email fails, but log it
            }
          }
          
          // Send email to manager who approved
          if (initiation && initiation.managerApproval && initiation.managerApproval.approver) {
            try {
              await sendManagerApprovalEmail(supplier, initiation.managerApproval.approver)
            } catch (managerEmailError) {
              console.error('Failed to send manager email:', managerEmailError)
              // Don't fail if manager email fails, but log it
            }
          }
          
          // Update initiation status to SUPPLIER_EMAILED if email was sent successfully
          if (emailSent && onboarding.initiationId) {
            try {
              await prisma.supplierInitiation.update({
                where: { id: onboarding.initiationId },
                data: {
                  status: 'SUPPLIER_EMAILED',
                  emailSent: true,
                  emailSentAt: new Date()
                }
              })
              console.log(`✅ Updated initiation status to SUPPLIER_EMAILED for initiation: ${onboarding.initiationId}`)
            } catch (updateError) {
              console.error('Failed to update initiation status:', updateError)
              // Don't fail the request if this update fails
            }
          }
        }
      } catch (err) {
        emailError = err instanceof Error ? err : new Error('Unknown email error')
        console.error('Failed to send approval email:', emailError)
        // Log the error but don't fail the entire request
        // We'll return a warning in the response
      }
    }

    // Send rejection email if status is REJECTED
    if (status === 'REJECTED') {
      try {
        await sendRejectionEmail(supplier, rejectionReason)
        
        // Send email to initiator and manager if onboarding exists
        if (onboarding && onboarding.initiationId) {
          const initiation = await prisma.supplierInitiation.findUnique({
            where: { id: onboarding.initiationId },
            include: {
              initiatedBy: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              },
              managerApproval: {
                include: {
                  approver: {
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
          
          // Send email to initiator
          if (initiation && initiation.initiatedBy) {
            try {
              await sendInitiatorRejectionEmail(supplier, initiation.initiatedBy, rejectionReason)
            } catch (initiatorEmailError) {
              console.error('Failed to send initiator rejection email:', initiatorEmailError)
              // Don't fail if initiator email fails, but log it
            }
          }
          
          // Send email to manager who approved
          if (initiation && initiation.managerApproval && initiation.managerApproval.approver) {
            try {
              await sendManagerRejectionEmail(supplier, initiation.managerApproval.approver, rejectionReason)
            } catch (managerEmailError) {
              console.error('Failed to send manager rejection email:', managerEmailError)
              // Don't fail if manager email fails, but log it
            }
          }
        }
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError)
        // Don't fail the entire request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      supplier,
      emailSent: emailSent,
      emailError: emailError ? emailError.message : null
    })
  } catch (error: any) {
    console.error('❌ Error updating supplier status:', error)
    console.error('   Error type:', error?.constructor?.name)
    console.error('   Error code:', error?.code)
    console.error('   Error message:', error?.message)
    console.error('   Error meta:', JSON.stringify(error?.meta, null, 2))
    console.error('   Error stack:', error?.stack)
    
    // Check if it's a Prisma unique constraint error
    if (error?.code === 'P2002') {
      const field = error?.meta?.target?.[0] || 'unknown field'
      const fieldValue = error?.meta?.target?.includes('supplierCode') 
        ? 'supplierCode' 
        : field
      return NextResponse.json(
        {
          success: false,
          error: `Database constraint violation: A record with this ${fieldValue} already exists. This may indicate a duplicate entry or a race condition.`,
          errorCode: error.code,
          errorDetails: process.env.NODE_ENV === 'development' ? {
            target: error.meta?.target,
            constraint: error.meta?.constraint
          } : undefined
        },
        { status: 409 }
      )
    }
    
    // Check if it's a Prisma record not found error
    if (error?.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: 'Supplier record not found. It may have been deleted.',
          errorCode: error.code
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to update supplier status',
        errorCode: error?.code,
        errorDetails: process.env.NODE_ENV === 'development' ? {
          message: error?.message,
          code: error?.code,
          stack: error?.stack
        } : undefined
      },
      { status: 500 }
    )
  }
}

async function sendApprovalEmail(supplier: any, signedCreditAppFileName: string | null = null) {
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

    // Create approval email content
    const emailSubject = 'Supplier Onboarding Approved - Welcome to Schauenburg Systems'
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
    .success-badge {
      background-color: #10b981;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 18px;
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
      <p class="header-text">Supplier Registration Approved</p>
    </div>
    
    <div class="content">
      <p class="greeting">Dear ${supplier.contactPerson || supplier.companyName},</p>
      
      <div class="success-badge">
        Your supplier registration has been approved!
      </div>
      
      <p>
        We are pleased to inform you that your application to become a supplier for 
        <strong>Schauenburg Systems</strong> has been reviewed and <strong>approved</strong>.
      </p>
      
      <div class="info-box">
        <div class="info-box-title">Your Supplier Details</div>
        <div class="info-item"><strong>Company Name:</strong> ${supplier.companyName}</div>
        <div class="info-item"><strong>Supplier Code:</strong> ${supplier.supplierCode}</div>
        <div class="info-item"><strong>Contact Person:</strong> ${supplier.contactPerson}</div>
        <div class="info-item"><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">APPROVED</span></div>
      </div>
      
      <p>
        <strong>What happens next?</strong>
      </p>
      <ul style="color: #374151; line-height: 1.8;">
        <li>You are now registered as an approved supplier in our system</li>
        <li>Your company will be considered for relevant procurement opportunities</li>
        <li>Our procurement team may contact you regarding specific projects and tenders</li>
        <li>Please ensure your contact information and certifications remain up to date</li>
      </ul>
      
      ${signedCreditAppFileName ? `
      <div class="info-box" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; margin-top: 25px;">
        <div class="info-box-title" style="color: #92400e;">Credit Application - Action Required</div>
        <p style="color: #78350f; margin: 10px 0;">
          Your Credit Application has been reviewed and signed by our Procurement Manager. 
          Please complete the following steps:
        </p>
        <ol style="color: #78350f; margin: 15px 0; padding-left: 20px; line-height: 1.8;">
          <li>Download the signed credit application document using the link below</li>
          <li>Review and sign the document on behalf of your company</li>
          <li>Complete the credit application form to upload the fully signed copy and provide credit account information</li>
        </ol>
        <p style="margin: 15px 0;">
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/suppliers/documents/${supplier.supplierCode}/signedCreditApplication/${encodeURIComponent(signedCreditAppFileName)}" 
             style="display: inline-block; background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">
            Download Signed Credit Application
          </a>
          ${(() => {
            // Get credit application token from onboarding
            const onboarding = supplier.onboarding
            if (onboarding?.creditApplicationToken) {
              return `<a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/credit-application-form?token=${onboarding.creditApplicationToken}" 
             style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Complete Credit Application Form
          </a>`
            }
            return ''
          })()}
        </p>
      </div>
      ` : ''}
      
      <p>
        If you have any questions or need to update your information, please don't hesitate to contact our procurement team.
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
        This is an automated message. Please do not reply directly to this email.
      </p>
    </div>
  </div>
</body>
</html>
    `

    // Send email
    console.log('📧 Sending approval email to:', supplier.contactEmail)
    
    await transporter.sendMail({
      from: `"${smtpConfig.companyName}" <${smtpConfig.fromEmail}>`,
      to: supplier.contactEmail,
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

    console.log('✅ Approval email sent successfully to:', supplier.contactEmail)
  } catch (error) {
    console.error('Error sending approval email:', error)
    throw error
  }
}

async function sendRejectionEmail(supplier: any, rejectionReason: string) {
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

    // Create rejection email content
    const emailSubject = 'Supplier Registration Update - Schauenburg Systems'
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
    .info-box { 
      background-color: #fef2f2; 
      border-left: 4px solid #ef4444; 
      padding: 20px; 
      margin: 25px 0; 
      border-radius: 4px; 
    }
    .info-box-title { 
      font-weight: bold; 
      color: #991b1b; 
      margin-bottom: 10px; 
      font-size: 16px; 
    }
    .info-item { 
      margin: 8px 0; 
      color: #374151; 
    }
    .feedback-box {
      background-color: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .feedback-title {
      font-weight: bold;
      color: #92400e;
      margin-bottom: 10px;
      font-size: 16px;
    }
    .feedback-content {
      color: #1f2937;
      line-height: 1.6;
      white-space: pre-wrap;
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
      .info-box, .feedback-box { 
        padding: 15px; 
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="cid:logo" alt="Schauenburg Systems" class="logo" />
      <p class="header-text">Supplier Registration Update</p>
    </div>
    
    <div class="content">
      <p class="greeting">Dear ${supplier.contactPerson || supplier.companyName},</p>
      
      <p>
        Thank you for your interest in becoming a supplier for <strong>Schauenburg Systems</strong>.
      </p>
      
      <p>
        After careful review of your application, we regret to inform you that we are unable to proceed 
        with your supplier registration at this time.
      </p>
      
      <div class="info-box">
        <div class="info-box-title">Application Details</div>
        <div class="info-item"><strong>Company Name:</strong> ${supplier.companyName}</div>
        <div class="info-item"><strong>Supplier Code:</strong> ${supplier.supplierCode}</div>
        <div class="info-item"><strong>Contact Person:</strong> ${supplier.contactPerson}</div>
        <div class="info-item"><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">NOT APPROVED</span></div>
      </div>
      
      <div class="feedback-box">
        <div class="feedback-title">Feedback from Our Procurement Team</div>
        <div class="feedback-content">${rejectionReason}</div>
      </div>
      
      <p>
        <strong>What you can do:</strong>
      </p>
      <ul style="color: #374151; line-height: 1.8;">
        <li>Review the feedback provided above</li>
        <li>Address the concerns mentioned</li>
        <li>You may reapply once the necessary improvements have been made</li>
        <li>Contact our procurement team if you have any questions or need clarification</li>
      </ul>
      
      <p>
        We appreciate your understanding and thank you for your interest in working with 
        <strong>Schauenburg Systems</strong>. We encourage you to address the feedback provided 
        and consider reapplying in the future.
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
        This is an automated message. If you have questions, please contact our procurement team.
      </p>
    </div>
  </div>
</body>
</html>
    `

    // Send email
    console.log('📧 Sending rejection email to:', supplier.contactEmail)
    
    await transporter.sendMail({
      from: `"${smtpConfig.companyName}" <${smtpConfig.fromEmail}>`,
      to: supplier.contactEmail,
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

    console.log('✅ Rejection email sent successfully to:', supplier.contactEmail)
  } catch (error) {
    console.error('Error sending rejection email:', error)
    throw error
  }
}

async function sendInitiatorApprovalEmail(supplier: any, initiator: { name: string, email: string }) {
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

    // Create initiator approval notification email content
    const emailSubject = `Supplier Approved - You Can Now Proceed with Purchasing: ${supplier.companyName}`
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
    .success-badge {
      background-color: #10b981;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      margin: 30px 0;
    }
    .action-badge {
      background-color: #3b82f6;
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
      <p class="header-text">Supplier Approved - Ready for Purchasing</p>
    </div>
    
    <div class="content">
      <p class="greeting">Dear ${initiator.name},</p>
      
      <div class="success-badge">
        ✅ Supplier Approved Successfully
      </div>
      
      <p>
        Great news! The supplier you initiated has been <strong>approved by the Procurement Manager</strong> 
        and is now ready for purchasing activities.
      </p>
      
      <div class="action-badge">
        🛒 You Can Now Proceed with Purchasing
      </div>
      
      <div class="info-box">
        <div class="info-box-title">Approved Supplier Details</div>
        <div class="info-item"><strong>Company Name:</strong> ${supplier.companyName}</div>
        <div class="info-item"><strong>Supplier Code:</strong> ${supplier.supplierCode}</div>
        <div class="info-item"><strong>Contact Person:</strong> ${supplier.contactPerson}</div>
        <div class="info-item"><strong>Contact Email:</strong> ${supplier.contactEmail}</div>
        <div class="info-item"><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">APPROVED</span></div>
      </div>
      
      <p>
        <strong>What this means:</strong>
      </p>
      <ul style="color: #374151; line-height: 1.8;">
        <li>The supplier has completed all required documentation and verification</li>
        <li>All mandatory documents have been reviewed and approved</li>
        <li>The supplier is now active in our system and ready for procurement activities</li>
        <li>You can proceed with purchasing from this supplier</li>
      </ul>
      
      <p>
        <strong>Next Steps:</strong>
      </p>
      <ul style="color: #374151; line-height: 1.8;">
        <li>You can now proceed with purchase orders and procurement activities with this supplier</li>
        <li>Review the supplier's details and contact information in the system</li>
        <li>Ensure all necessary contracts and agreements are in place before purchasing</li>
        <li>Contact the supplier directly if you need any additional information</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
          <tr>
            <td align="center" style="background-color: #3b82f6; border-radius: 8px; padding: 0;">
              <a href="${supplierDetailUrl}" target="_blank" style="display: inline-block; background-color: #3b82f6; color: #ffffff !important; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none; padding: 15px 40px; border-radius: 8px; border: none;">View Supplier Details</a>
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
        If you have any questions or need assistance with the purchasing process, please contact the Procurement Manager.
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
    console.log('📧 Sending initiator approval notification email to:', initiator.email)
    
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

    console.log('✅ Initiator approval notification email sent successfully to:', initiator.email)
  } catch (error) {
    console.error('Error sending initiator approval notification email:', error)
    throw error
  }
}

async function sendManagerApprovalEmail(supplier: any, manager: { name: string, email: string }) {
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

    // Create manager approval notification email content
    const emailSubject = `Supplier Approved - Procurement Manager Approval Complete: ${supplier.companyName}`
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
    .success-badge {
      background-color: #10b981;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 18px;
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
      <p class="header-text">Supplier Approved - Final Approval Complete</p>
    </div>
    
    <div class="content">
      <p class="greeting">Dear ${manager.name},</p>
      
      <div class="success-badge">
        ✅ Supplier Approved by Procurement Manager
      </div>
      
      <p>
        The supplier initiation request that you approved has now been <strong>approved by the Procurement Manager</strong> 
        and the supplier onboarding process is complete.
      </p>
      
      <div class="info-box">
        <div class="info-box-title">Approved Supplier Details</div>
        <div class="info-item"><strong>Company Name:</strong> ${supplier.companyName}</div>
        <div class="info-item"><strong>Supplier Code:</strong> ${supplier.supplierCode}</div>
        <div class="info-item"><strong>Contact Person:</strong> ${supplier.contactPerson}</div>
        <div class="info-item"><strong>Contact Email:</strong> ${supplier.contactEmail}</div>
        <div class="info-item"><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">APPROVED</span></div>
      </div>
      
      <p>
        <strong>Approval Summary:</strong>
      </p>
      <ul style="color: #374151; line-height: 1.8;">
        <li>✅ Manager Approval: Completed (by you)</li>
        <li>✅ Procurement Manager Approval: Completed</li>
        <li>✅ Supplier Onboarding: Complete</li>
        <li>✅ Supplier Email: Sent to supplier</li>
      </ul>
      
      <p>
        The supplier has been notified of their approval and is now active in the system, ready for procurement activities.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
          <tr>
            <td align="center" style="background-color: #3b82f6; border-radius: 8px; padding: 0;">
              <a href="${supplierDetailUrl}" target="_blank" style="display: inline-block; background-color: #3b82f6; color: #ffffff !important; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none; padding: 15px 40px; border-radius: 8px; border: none;">View Supplier Details</a>
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
    console.log('📧 Sending manager approval notification email to:', manager.email)
    
    await transporter.sendMail({
      from: `"${smtpConfig.companyName}" <${smtpConfig.fromEmail}>`,
      to: manager.email,
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

    console.log('✅ Manager approval notification email sent successfully to:', manager.email)
  } catch (error) {
    console.error('Error sending manager approval notification email:', error)
    throw error
  }
}

async function sendInitiatorRejectionEmail(supplier: any, initiator: { name: string, email: string }, rejectionReason: string) {
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

    // Create initiator rejection notification email content
    const emailSubject = `Supplier Rejected: ${supplier.companyName}`
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
    .rejection-badge {
      background-color: #ef4444;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      margin: 30px 0;
    }
    .info-box { 
      background-color: #fef2f2; 
      border-left: 4px solid #ef4444; 
      padding: 20px; 
      margin: 25px 0; 
      border-radius: 4px; 
    }
    .info-box-title { 
      font-weight: bold; 
      color: #991b1b; 
      margin-bottom: 10px; 
      font-size: 16px; 
    }
    .info-item { 
      margin: 8px 0; 
      color: #374151; 
    }
    .feedback-box {
      background-color: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .feedback-title {
      font-weight: bold;
      color: #92400e;
      margin-bottom: 10px;
      font-size: 16px;
    }
    .feedback-content {
      color: #1f2937;
      line-height: 1.6;
      white-space: pre-wrap;
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
      .info-box, .feedback-box { 
        padding: 15px; 
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="cid:logo" alt="Schauenburg Systems" class="logo" />
      <p class="header-text">Supplier Application Rejected</p>
    </div>
    
    <div class="content">
      <p class="greeting">Dear ${initiator.name},</p>
      
      <div class="rejection-badge">
        ❌ Supplier Application Rejected
      </div>
      
      <p>
        The supplier you initiated has been reviewed by the Procurement Manager and the application has been <strong>rejected</strong>.
      </p>
      
      <div class="info-box">
        <div class="info-box-title">Supplier Details</div>
        <div class="info-item"><strong>Company Name:</strong> ${supplier.companyName}</div>
        <div class="info-item"><strong>Supplier Code:</strong> ${supplier.supplierCode}</div>
        <div class="info-item"><strong>Contact Person:</strong> ${supplier.contactPerson}</div>
        <div class="info-item"><strong>Contact Email:</strong> ${supplier.contactEmail}</div>
        <div class="info-item"><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">REJECTED</span></div>
      </div>
      
      <div class="feedback-box">
        <div class="feedback-title">Rejection Reason from Procurement Manager</div>
        <div class="feedback-content">${rejectionReason}</div>
      </div>
      
      <p>
        <strong>What this means:</strong>
      </p>
      <ul style="color: #374151; line-height: 1.8;">
        <li>The supplier did not meet the required criteria for approval</li>
        <li>The supplier has been notified of the rejection</li>
        <li>You may initiate a new supplier onboarding if the issues are resolved</li>
        <li>Contact the Procurement Manager if you have questions about the rejection</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
          <tr>
            <td align="center" style="background-color: #3b82f6; border-radius: 8px; padding: 0;">
              <a href="${supplierDetailUrl}" target="_blank" style="display: inline-block; background-color: #3b82f6; color: #ffffff !important; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none; padding: 15px 40px; border-radius: 8px; border: none;">View Supplier Details</a>
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
    console.log('📧 Sending initiator rejection notification email to:', initiator.email)
    
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

    console.log('✅ Initiator rejection notification email sent successfully to:', initiator.email)
  } catch (error) {
    console.error('Error sending initiator rejection notification email:', error)
    throw error
  }
}

async function sendManagerRejectionEmail(supplier: any, manager: { name: string, email: string }, rejectionReason: string) {
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

    // Create manager rejection notification email content
    const emailSubject = `Supplier Rejected - Final Approval Declined: ${supplier.companyName}`
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
    .rejection-badge {
      background-color: #ef4444;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      margin: 30px 0;
    }
    .info-box { 
      background-color: #fef2f2; 
      border-left: 4px solid #ef4444; 
      padding: 20px; 
      margin: 25px 0; 
      border-radius: 4px; 
    }
    .info-box-title { 
      font-weight: bold; 
      color: #991b1b; 
      margin-bottom: 10px; 
      font-size: 16px; 
    }
    .info-item { 
      margin: 8px 0; 
      color: #374151; 
    }
    .feedback-box {
      background-color: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .feedback-title {
      font-weight: bold;
      color: #92400e;
      margin-bottom: 10px;
      font-size: 16px;
    }
    .feedback-content {
      color: #1f2937;
      line-height: 1.6;
      white-space: pre-wrap;
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
      .info-box, .feedback-box { 
        padding: 15px; 
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="cid:logo" alt="Schauenburg Systems" class="logo" />
      <p class="header-text">Supplier Application Rejected</p>
    </div>
    
    <div class="content">
      <p class="greeting">Dear ${manager.name},</p>
      
      <div class="rejection-badge">
        ❌ Supplier Application Rejected by Procurement Manager
      </div>
      
      <p>
        The supplier initiation request that you approved has been reviewed by the Procurement Manager and the application has been <strong>rejected</strong>.
      </p>
      
      <div class="info-box">
        <div class="info-box-title">Supplier Details</div>
        <div class="info-item"><strong>Company Name:</strong> ${supplier.companyName}</div>
        <div class="info-item"><strong>Supplier Code:</strong> ${supplier.supplierCode}</div>
        <div class="info-item"><strong>Contact Person:</strong> ${supplier.contactPerson}</div>
        <div class="info-item"><strong>Contact Email:</strong> ${supplier.contactEmail}</div>
        <div class="info-item"><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">REJECTED</span></div>
      </div>
      
      <div class="feedback-box">
        <div class="feedback-title">Rejection Reason from Procurement Manager</div>
        <div class="feedback-content">${rejectionReason}</div>
      </div>
      
      <p>
        <strong>Approval Summary:</strong>
      </p>
      <ul style="color: #374151; line-height: 1.8;">
        <li>✅ Manager Approval: Completed (by you)</li>
        <li>❌ Procurement Manager Approval: Rejected</li>
        <li>❌ Supplier Onboarding: Not Completed</li>
        <li>📧 Supplier Email: Rejection notification sent to supplier</li>
      </ul>
      
      <p>
        The supplier and the initiator have been notified of this rejection.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
          <tr>
            <td align="center" style="background-color: #3b82f6; border-radius: 8px; padding: 0;">
              <a href="${supplierDetailUrl}" target="_blank" style="display: inline-block; background-color: #3b82f6; color: #ffffff !important; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none; padding: 15px 40px; border-radius: 8px; border: none;">View Supplier Details</a>
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
    console.log('📧 Sending manager rejection notification email to:', manager.email)
    
    await transporter.sendMail({
      from: `"${smtpConfig.companyName}" <${smtpConfig.fromEmail}>`,
      to: manager.email,
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

    console.log('✅ Manager rejection notification email sent successfully to:', manager.email)
  } catch (error) {
    console.error('Error sending manager rejection notification email:', error)
    throw error
  }
}

