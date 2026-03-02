import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import path from 'path'
import { loadAdminSmtpConfig, getMailTransporter, getFromAddress, getEnvelope, sendMailAndCheck } from '@/lib/smtp-admin'
import { generateApprovalSummaryPDF } from '@/lib/generate-approval-summary-pdf'
import { generateSupplierFormPDF } from '@/lib/generate-supplier-form-pdf'
import { generateInitiatorChecklistPDF } from '@/lib/generate-initiator-checklist-pdf'
import { readdir, readFile } from 'fs/promises'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only PMs can resend approval pack
    if (session?.user?.role !== 'PROCUREMENT_MANAGER') {
      return NextResponse.json(
        { success: false, error: 'Only Procurement Managers can resend approval packages' },
        { status: 403 }
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

    // Get supplier with all related data
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

    if (!supplier.onboarding?.initiation) {
      return NextResponse.json(
        { success: false, error: 'No initiation found for this supplier' },
        { status: 400 }
      )
    }

    // Get PM user details
    const pmUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true }
    })

    if (!pmUser) {
      return NextResponse.json(
        { success: false, error: 'PM user not found' },
        { status: 404 }
      )
    }

    // Send the approval package
    await sendPMApprovalPackage(
      supplier, 
      supplier.onboarding.initiation, 
      pmUser, 
      supplier.onboarding.creditController
    )

    return NextResponse.json({
      success: true,
      message: 'Approval package resent successfully'
    })
  } catch (error) {
    console.error('Error resending approval package:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to resend approval package'
      },
      { status: 500 }
    )
  }
}

async function sendPMApprovalPackage(
  supplier: any,
  initiation: any,
  pmUser: { name: string; email: string },
  creditController?: string | null
) {
  try {
    console.log('📦 Preparing comprehensive approval package for PM:', pmUser.email)

    const smtpConfig = loadAdminSmtpConfig()
    const transporter = getMailTransporter(smtpConfig)

    // Generate PDFs
    console.log('📄 Generating approval summary PDF...')
    const airtableResend = (supplier.airtableData || {}) as { vatRegistered?: boolean; qualityCertificationText?: string; healthSafetyCertificationText?: string }
    const approvalSummaryPDF = await generateApprovalSummaryPDF({
      supplier: {
        name: supplier.companyName || supplier.supplierName || 'Unknown',
        supplierCode: supplier.supplierCode,
        contactName: supplier.contactPerson,
        contactEmail: supplier.contactEmail,
        contactPhone: supplier.contactPhone,
        address: supplier.physicalAddress,
        physicalAddress: supplier.physicalAddress,
        postalAddress: supplier.postalAddress,
        city: null,
        state: null,
        zipCode: null,
        country: null,
        website: null,
        taxId: supplier.taxId,
        dunsNumber: null,
        tradingName: supplier.tradingName,
        natureOfBusiness: supplier.natureOfBusiness,
        productsAndServices: supplier.productsAndServices,
        bbbeeLevel: supplier.bbbeeLevel,
        qualityCertification: supplier.qualityManagementCert ? 'Yes' : (supplier.qualityManagementCert === false ? 'No' : null),
        qualityCertificationText: airtableResend.qualityCertificationText,
        healthSafetyCertification: supplier.sheCertification ? 'Yes' : (supplier.sheCertification === false ? 'No' : null),
        healthSafetyCertificationText: airtableResend.healthSafetyCertificationText,
        vatRegistered: airtableResend.vatRegistered
      },
      initiation: {
        supplierName: initiation.supplierName,
        purchaseType: initiation.purchaseType,
        creditApplication: initiation.creditApplication,
        paymentMethod: initiation.paymentMethod,
        businessUnit: initiation.businessUnit,
        annualPurchaseValue: initiation.annualPurchaseValue,
        currency: initiation.currency,
        supplierLocation: initiation.supplierLocation,
        justification: initiation.onboardingReason,
        initiatedBy: initiation.initiatedBy,
        createdAt: new Date(initiation.createdAt)
      },
      documents: [],
      approvedBy: pmUser,
      approvedAt: new Date(),
      creditController
    })

    console.log('📄 Generating supplier form PDF...')
    const supplierFormPDF = await generateSupplierFormPDF({
      supplierName: supplier.supplierName || supplier.companyName,
      companyName: supplier.companyName,
      contactPerson: supplier.contactPerson,
      contactEmail: supplier.contactEmail,
      contactPhone: supplier.contactPhone,
      physicalAddress: supplier.physicalAddress,
      postalAddress: supplier.postalAddress,
      tradingName: supplier.tradingName,
      natureOfBusiness: supplier.natureOfBusiness,
      productsAndServices: supplier.productsAndServices,
      bbbeeLevel: supplier.bbbeeLevel,
      qualityCertification: supplier.qualityManagementCert ? 'Yes' : (supplier.qualityManagementCert === false ? 'No' : null),
      qualityCertificationText: airtableResend.qualityCertificationText,
      healthSafetyCertification: supplier.sheCertification ? 'Yes' : (supplier.sheCertification === false ? 'No' : null),
      healthSafetyCertificationText: airtableResend.healthSafetyCertificationText,
      vatRegistered: airtableResend.vatRegistered
    })

    console.log('📄 Generating initiator checklist PDF...')
    const initiatorChecklistPDF = await generateInitiatorChecklistPDF({
      supplierName: initiation.supplierName,
      supplierEmail: initiation.supplierEmail,
      supplierContactPerson: initiation.supplierContactPerson,
      productServiceCategory: initiation.productServiceCategory,
      requesterName: initiation.requesterName,
      relationshipDeclaration: initiation.relationshipDeclaration,
      processReadUnderstood: initiation.processReadUnderstood,
      dueDiligenceCompleted: initiation.dueDiligenceCompleted,
      purchaseType: initiation.purchaseType,
      paymentMethod: initiation.paymentMethod,
      codReason: initiation.codReason,
      annualPurchaseValue: initiation.annualPurchaseValue,
      currency: initiation.currency,
      supplierLocation: initiation.supplierLocation,
      creditApplication: initiation.creditApplication,
      creditApplicationReason: initiation.creditApplicationReason,
      onboardingReason: initiation.onboardingReason,
      justification: initiation.justification,
      businessUnit: initiation.businessUnit,
      initiatedBy: initiation.initiatedBy,
      createdAt: new Date(initiation.createdAt)
    })

    console.log('✅ All PDFs generated successfully')

    // Prepare attachments
    const attachments: any[] = [
      {
        filename: 'logo.png',
        path: path.join(process.cwd(), 'public', 'logo.png'),
        cid: 'logo'
      },
      {
        filename: `Approval-Summary-${supplier.supplierCode}.pdf`,
        content: approvalSummaryPDF,
        contentType: 'application/pdf'
      },
      {
        filename: `Supplier-Form-${supplier.supplierCode}.pdf`,
        content: supplierFormPDF,
        contentType: 'application/pdf'
      },
      {
        filename: `Initiator-Checklist-${supplier.supplierCode}.pdf`,
        content: initiatorChecklistPDF,
        contentType: 'application/pdf'
      }
    ]

    // Collect all supplier document files
    const documentsList: any[] = []
    const documentsPath = path.join(process.cwd(), 'data', 'uploads', 'suppliers', supplier.supplierCode)
    
    console.log('🔍 Looking for documents at path:', documentsPath)
    console.log('🔍 Path exists:', fs.existsSync(documentsPath))
    
    try {
      if (fs.existsSync(documentsPath)) {
        console.log('📂 Collecting supplier documents from:', documentsPath)
        
        // Get all version directories
        const versions = await readdir(documentsPath)
        console.log('📁 Found versions:', versions)
        
        for (const version of versions) {
          const versionPath = path.join(documentsPath, version)
          const stat = fs.statSync(versionPath)
          
          if (stat.isDirectory() && version.startsWith('v')) {
            // Get all category directories
            const categories = await readdir(versionPath)
            
            for (const category of categories) {
              const categoryPath = path.join(versionPath, category)
              const catStat = fs.statSync(categoryPath)
              
              if (catStat.isDirectory()) {
                // Get all files in this category
                const files = await readdir(categoryPath)
                
                for (const file of files) {
                  const filePath = path.join(categoryPath, file)
                  const fileBuffer = await readFile(filePath)
                  
                  attachments.push({
                    filename: `${category}_${file}`,
                    content: fileBuffer
                  })
                  
                  documentsList.push({
                    category: category,
                    fileName: file,
                    version: parseInt(version.replace('v', '')),
                    uploadedAt: fs.statSync(filePath).mtime
                  })
                }
              }
            }
          }
        }
        
        console.log(`📎 Collected ${documentsList.length} supplier documents`)
      } else {
        console.log('⚠️ No supplier documents directory found at:', documentsPath)
      }
    } catch (docError) {
      console.error('Error collecting documents:', docError)
      // Continue even if document collection fails
    }

    // Create email content
    const supplierDetailUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/supplier-submissions/${supplier.id}`
    
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background-color: #ffffff; padding: 40px 30px; text-align: center; border-bottom: 3px solid #1e40af; }
    .logo { max-width: 150px; height: auto; margin-bottom: 20px; }
    .header-text { color: #1e40af; font-size: 24px; font-weight: bold; margin: 0; }
    .content { padding: 40px 30px; color: #333333; line-height: 1.6; }
    .info-box { background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 4px; }
    .info-box-title { font-weight: bold; color: #1e40af; margin-bottom: 10px; font-size: 16px; }
    .info-item { margin: 8px 0; color: #374151; }
    .footer { background-color: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="cid:logo" alt="Schauenburg Systems" class="logo" />
      <p class="header-text">Supplier Approval Package</p>
    </div>
    
    <div class="content">
      <p style="font-size: 18px; font-weight: bold; color: #1e40af;">Dear ${pmUser.name},</p>
      
      <p>Please find attached the comprehensive approval package for:</p>
      
      <div class="info-box">
        <div class="info-box-title">Supplier Information</div>
        <div class="info-item"><strong>Company Name:</strong> ${supplier.companyName}</div>
        <div class="info-item"><strong>Supplier Code:</strong> ${supplier.supplierCode}</div>
        <div class="info-item"><strong>Contact Person:</strong> ${supplier.contactPerson}</div>
        <div class="info-item"><strong>Contact Email:</strong> ${supplier.contactEmail}</div>
        ${creditController ? `<div class="info-item"><strong>Assigned Credit Controller:</strong> ${creditController}</div>` : ''}
      </div>
      
      <div class="info-box" style="background-color: #f0fdf4; border-left: 4px solid #22c55e;">
        <div class="info-box-title" style="color: #15803d;">📎 Attached Documents</div>
        <ul style="margin: 10px 0; padding-left: 20px; color: #374151;">
          <li><strong>Generated PDFs (3):</strong>
            <ul style="margin: 5px 0; padding-left: 20px;">
              <li>Approval Summary PDF</li>
              <li>Supplier Form PDF</li>
              <li>Initiator Checklist PDF</li>
            </ul>
          </li>
          ${documentsList.length > 0 ? `
          <li style="margin-top: 10px;"><strong>Supplier Documents (${documentsList.length}):</strong>
            <ul style="margin: 5px 0; padding-left: 20px;">
              ${documentsList.map(doc => `<li>${doc.category}: ${doc.fileName}</li>`).join('')}
            </ul>
          </li>
          ` : ''}
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${supplierDetailUrl}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Supplier Details</a>
      </div>
      
      <p style="margin-top: 30px;">
        Best regards,<br/>
        <strong>Schauenburg Systems Procurement System</strong>
      </p>
    </div>
    
    <div class="footer">
      <p>Schauenburg Systems</p>
      <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
        This is an automated notification from the Supplier Onboarding System.
      </p>
    </div>
  </div>
</body>
</html>
    `

    const fromAddress = getFromAddress(smtpConfig)
    console.log(`📧 Sending approval package to PM: ${pmUser.email}`)
    await sendMailAndCheck(transporter, {
      from: fromAddress,
      envelope: getEnvelope(smtpConfig, pmUser.email),
      to: pmUser.email,
      subject: `Supplier Approval Package - ${supplier.companyName || supplier.supplierName} (${supplier.supplierCode})`,
      html: emailHtml,
      attachments: attachments
    }, 'Resend approval pack to PM')
  } catch (error) {
    console.error('Error sending PM approval package:', error)
    throw error
  }
}
