import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir, readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { sendEmail } from '@/lib/email-sender'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const token = formData.get('token')?.toString()
    const creditAccountInfo = formData.get('creditAccountInfo')?.toString()
    const signedCreditApplication = formData.get('signedCreditApplication') as File

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      )
    }

    if (!creditAccountInfo || !creditAccountInfo.trim()) {
      return NextResponse.json(
        { success: false, error: 'Credit account information is required' },
        { status: 400 }
      )
    }

    if (!signedCreditApplication) {
      return NextResponse.json(
        { success: false, error: 'Fully signed credit application document is required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (signedCreditApplication.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'Only PDF files are accepted for the Credit Application' },
        { status: 400 }
      )
    }

    // Find onboarding record by token
    const onboarding = await prisma.supplierOnboarding.findUnique({
      where: { creditApplicationToken: token },
      include: {
        supplier: {
          select: {
            id: true,
            supplierCode: true
          }
        }
      }
    })

    if (!onboarding) {
      return NextResponse.json(
        { success: false, error: 'Invalid token or credit application not found' },
        { status: 404 }
      )
    }

    if (onboarding.creditApplicationFormSubmitted) {
      return NextResponse.json(
        { success: false, error: 'Credit application form has already been submitted' },
        { status: 400 }
      )
    }

    if (!onboarding.supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      )
    }

    // Save the fully signed credit application file
    const supplierCode = onboarding.supplier.supplierCode
    const uploadsDir = join(
      process.cwd(),
      'data',
      'uploads',
      'suppliers',
      supplierCode,
      'creditApplication',
      'fullySigned'
    )

    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const bytes = await signedCreditApplication.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const timestamp = Date.now()
    const fileName = `fully-signed-credit-application-${timestamp}.pdf`
    const filePath = join(uploadsDir, fileName)

    await writeFile(filePath, buffer)

    // Update onboarding record
    await prisma.supplierOnboarding.update({
      where: { id: onboarding.id },
      data: {
        creditApplicationFormSubmitted: true,
        creditApplicationFormSubmittedAt: new Date(),
        creditApplicationInfo: creditAccountInfo.trim()
      }
    })

    // Update supplier's airtableData to include fully signed credit application
    const supplier = await prisma.supplier.findUnique({
      where: { id: onboarding.supplier.id },
      select: { airtableData: true }
    })

    if (supplier) {
      const currentAirtableData = (supplier.airtableData as any) || {}
      const updatedAirtableData = {
        ...currentAirtableData,
        fullySignedCreditApplication: {
          fileName: fileName,
          submittedAt: new Date().toISOString(),
          creditAccountInfo: creditAccountInfo.trim()
        }
      }

      await prisma.supplier.update({
        where: { id: onboarding.supplier.id },
        data: {
          airtableData: updatedAirtableData
        }
      })
    }

    // Create timeline entry
    await prisma.onboardingTimeline.create({
      data: {
        onboardingId: onboarding.id,
        step: 'REVIEW',
        status: 'UNDER_REVIEW',
        action: 'Credit application form submitted',
        description: 'Supplier submitted fully signed credit application and credit account information',
        performedBy: 'Supplier',
      }
    })

    // Send email notification to Procurement Managers
    try {
      // Get full supplier details
      const supplierDetails = await prisma.supplier.findUnique({
        where: { id: onboarding.supplier.id },
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

      if (!supplierDetails) {
        throw new Error('Supplier details not found')
      }

      // Get all Procurement Managers
      const procurementManagers = await prisma.user.findMany({
        where: { role: 'PROCUREMENT_MANAGER' }
      })

      // Fallback to admins if no procurement managers
      const recipients = procurementManagers.length > 0
        ? procurementManagers
        : await prisma.user.findMany({ where: { role: 'ADMIN' } })

      if (recipients.length === 0) {
        console.warn('No procurement managers or admins found to send notification')
      } else {
        // Read the PDF file for attachment
        const pdfBuffer = await readFile(filePath)

        // Send email to each PM
        for (const pm of recipients) {
          await sendEmail({
            to: pm.email,
            subject: `Credit Application Submitted - ${supplierDetails.name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1e40af;">Credit Application Submitted</h2>
                
                <p>Hello ${pm.name},</p>
                
                <p>The supplier <strong>${supplierDetails.name}</strong> (Code: ${supplierDetails.supplierCode}) has submitted their fully signed credit application and credit account information.</p>
                
                <div style="background-color: #f3f4f6; border-left: 4px solid #1e40af; padding: 15px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #1e40af;">Credit Account Information:</h3>
                  <div style="white-space: pre-wrap; font-family: monospace; background-color: white; padding: 10px; border-radius: 4px;">${creditAccountInfo.trim()}</div>
                </div>
                
                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #92400e;">Attached Document:</h3>
                  <p style="margin: 5px 0; color: #78350f;">📎 Fully Signed Credit Application (${fileName})</p>
                </div>
                
                <p style="margin-top: 25px;">
                  <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/approvals?tab=reviews" 
                     style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    Review in Dashboard
                  </a>
                </p>
                
                <p style="margin-top: 30px; color: #6b7280;">
                  Best regards,<br/>
                  <strong>SS Supplier Onboarding System</strong>
                </p>
              </div>
            `,
            attachments: [
              {
                filename: fileName,
                content: pdfBuffer,
                contentType: 'application/pdf'
              }
            ]
          })
        }
      }
    } catch (emailError) {
      console.error('Error sending credit application notification email:', emailError)
      // Don't fail the submission if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Credit application form submitted successfully'
    })
  } catch (error) {
    console.error('Error submitting credit application form:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit credit application form'
      },
      { status: 500 }
    )
  }
}

