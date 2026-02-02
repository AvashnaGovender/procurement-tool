import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

interface FinalApprovalPackageData {
  // Supplier Information (from supplier questionnaire)
  supplier: {
    supplierCode: string
    companyName: string
    tradingName?: string | null
    registrationNumber?: string | null
    contactPerson: string
    contactEmail: string
    contactPhone?: string | null
    physicalAddress?: string | null
    postalAddress?: string | null
    natureOfBusiness?: string | null
    productsAndServices?: string | null
    associatedCompany?: string | null
    associatedCompanyRegNo?: string | null
    associatedCompanyBranchName?: string | null
    branchesContactNumbers?: string | null
    bankAccountName?: string | null
    bankName?: string | null
    branchName?: string | null
    branchNumber?: string | null
    accountNumber?: string | null
    typeOfAccount?: string | null
    rpBanking?: string | null
    rpBankingPhone?: string | null
    rpBankingEmail?: string | null
    rpQuality?: string | null
    rpQualityPhone?: string | null
    rpQualityEmail?: string | null
    rpSHE?: string | null
    rpSHEPhone?: string | null
    rpSHEEmail?: string | null
    rpBBBEE?: string | null
    rpBBBEEPhone?: string | null
    rpBBBEEEmail?: string | null
    bbbeeLevel?: string | null
    numberOfEmployees?: number | null
    taxId?: string | null
    vatNumber?: string | null
    qualityManagementCert?: boolean | null
    sheCertification?: boolean | null
    authorizationAgreement?: boolean | null
  }
  
  // Initiation Information (from initiator request)
  initiation: {
    supplierName: string
    supplierEmail: string
    supplierContactPerson: string
    productServiceCategory: string
    requesterName: string
    relationshipDeclaration: string
    processReadUnderstood: boolean
    dueDiligenceCompleted: boolean
    purchaseType: string
    paymentMethod: string
    codReason?: string | null
    annualPurchaseValue?: number | null
    currency?: string | null
    supplierLocation?: string | null
    customCurrency?: string | null
    creditApplication: boolean
    creditApplicationReason?: string | null
    onboardingReason: string
    businessUnit: string | string[]
    initiatedBy: {
      name: string
      email: string
    }
    createdAt: Date
    submittedAt?: Date | null
  }
  
  // Documents submitted
  documents?: Array<{
    category: string
    fileName: string
    version: number
    uploadedAt: Date
  }>
  
  // Credit Controller
  creditController?: string | null
  
  // Generation date
  generatedAt: Date
}

export async function generateFinalApprovalPackagePDF(data: FinalApprovalPackageData): Promise<Buffer> {
  try {
    const pdfDoc = await PDFDocument.create()
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    
    const pageWidth = 595.28 // A4 width in points
    const pageHeight = 841.89 // A4 height in points
    const margin = 50
    const contentWidth = pageWidth - (2 * margin)
    
    let currentPage = pdfDoc.addPage([pageWidth, pageHeight])
    let yPosition = pageHeight - margin

    // Helper functions for pdf-lib
    const checkNewPage = (requiredSpace: number = 50) => {
      if (yPosition - requiredSpace < margin) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight])
        yPosition = pageHeight - margin
        return true
      }
      return false
    }

    const drawText = (text: string, size: number, font: any, color = rgb(0, 0, 0), x = margin) => {
      currentPage.drawText(text, {
        x,
        y: yPosition,
        size,
        font,
        color
      })
      yPosition -= size + 5
    }

    const drawSectionHeader = (title: string) => {
      checkNewPage(30)
      yPosition -= 10
      drawText(title, 14, timesRomanBoldFont, rgb(0.118, 0.251, 0.686))
      yPosition -= 5
    }

    const drawKeyValue = (key: string, value: string | number | boolean | null | undefined) => {
      if (value !== null && value !== undefined && value !== '') {
        checkNewPage(20)
        const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)
        drawText(`${key}: ${displayValue}`, 10, timesRomanFont)
      }
    }

    const drawCheckbox = (label: string, checked: boolean) => {
      checkNewPage(20)
      drawText(`${checked ? '☑' : '☐'} ${label}`, 10, timesRomanFont)
    }

    // ===== COVER PAGE =====
    drawText('FINAL APPROVAL PACKAGE', 24, timesRomanBoldFont, rgb(0.118, 0.251, 0.686), pageWidth / 2 - 150)
    yPosition -= 10
    drawText('Supplier Onboarding Documentation', 16, timesRomanFont, rgb(0.118, 0.251, 0.686), pageWidth / 2 - 130)
    yPosition -= 20
    drawText(`Generated on ${data.generatedAt.toLocaleDateString()} at ${data.generatedAt.toLocaleTimeString()}`, 12, timesRomanFont, rgb(0.4, 0.4, 0.4), pageWidth / 2 - 150)
    yPosition -= 40

    // Supplier summary box
    const boxY = yPosition - 100
    currentPage.drawRectangle({
      x: margin,
      y: boxY,
      width: contentWidth,
      height: 120,
      borderColor: rgb(0.118, 0.251, 0.686),
      borderWidth: 2
    })
    
    yPosition -= 20
    drawKeyValue('Supplier Code', data.supplier.supplierCode)
    drawKeyValue('Company Name', data.supplier.companyName)
    drawKeyValue('Contact Person', data.supplier.contactPerson)
    drawKeyValue('Contact Email', data.supplier.contactEmail)
    if (data.creditController) {
      drawKeyValue('Assigned Credit Controller', data.creditController)
    }
    yPosition -= 40

    // Helper to draw wrapped text
    const drawWrappedText = (text: string, size: number, font: any, maxWidth = contentWidth, color = rgb(0, 0, 0)) => {
      const words = text.split(' ')
      let line = ''
      
      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word
        const testWidth = font.widthOfTextAtSize(testLine, size)
        
        if (testWidth > maxWidth && line) {
          checkNewPage(size + 5)
          currentPage.drawText(line, {
            x: margin,
            y: yPosition,
            size,
            font,
            color
          })
          yPosition -= size + 5
          line = word
        } else {
          line = testLine
        }
      }
      
      if (line) {
        checkNewPage(size + 5)
        currentPage.drawText(line, {
          x: margin,
          y: yPosition,
          size,
          font,
          color
        })
        yPosition -= size + 5
      }
    }

    // ===== PAGE 1: COVER PAGE =====
    yPosition -= 100
    drawText('FINAL APPROVAL PACKAGE', 24, timesRomanBoldFont, rgb(0.118, 0.251, 0.686), pageWidth / 2 - 150)
    yPosition -= 10
    drawText('Supplier Onboarding Documentation', 16, timesRomanFont, rgb(0.118, 0.251, 0.686), pageWidth / 2 - 130)
    yPosition -= 30
    
    const dateText = `Generated on ${data.generatedAt.toLocaleDateString()} at ${data.generatedAt.toLocaleTimeString()}`
    const dateWidth = timesRomanFont.widthOfTextAtSize(dateText, 10)
    drawText(dateText, 10, timesRomanFont, rgb(0.4, 0.4, 0.4), (pageWidth - dateWidth) / 2)
    yPosition -= 40

    // Supplier summary box
    const boxY = yPosition - 110
    currentPage.drawRectangle({
      x: margin,
      y: boxY,
      width: contentWidth,
      height: 110,
      borderColor: rgb(0.118, 0.251, 0.686),
      borderWidth: 2
    })
    
    yPosition -= 15
    drawKeyValue('Supplier Code', data.supplier.supplierCode)
    drawKeyValue('Company Name', data.supplier.companyName)
    drawKeyValue('Contact Person', data.supplier.contactPerson)
    drawKeyValue('Contact Email', data.supplier.contactEmail)
    if (data.creditController) {
      drawKeyValue('Assigned Credit Controller', data.creditController)
    }

    // ===== PAGE 2: INITIATOR REQUEST DETAILS =====
    currentPage = pdfDoc.addPage([pageWidth, pageHeight])
    yPosition = pageHeight - margin - 50
    
    const section1Title = 'SECTION 1: INITIATOR REQUEST'
    const section1Width = timesRomanBoldFont.widthOfTextAtSize(section1Title, 18)
    drawText(section1Title, 18, timesRomanBoldFont, rgb(0.118, 0.251, 0.686), (pageWidth - section1Width) / 2)
    yPosition -= 30

    drawSectionHeader('INITIATED BY')
    drawKeyValue('Name', data.initiation.initiatedBy.name)
    drawKeyValue('Email', data.initiation.initiatedBy.email)
    drawKeyValue('Request Date', data.initiation.createdAt.toLocaleDateString())
    if (data.initiation.submittedAt) {
      drawKeyValue('Submitted Date', new Date(data.initiation.submittedAt).toLocaleDateString())
    }
    yPosition -= 20

    drawSectionHeader('SUPPLIER DETAILS (AS INITIATED)')
    drawKeyValue('Supplier Name', data.initiation.supplierName)
    drawKeyValue('Contact Person', data.initiation.supplierContactPerson)
    drawKeyValue('Email', data.initiation.supplierEmail)
    drawKeyValue('Product/Service Category', data.initiation.productServiceCategory)
    drawKeyValue('Requester Name', data.initiation.requesterName)
    yPosition -= 20

    drawSectionHeader('BUSINESS UNIT(S)')
    const businessUnits = Array.isArray(data.initiation.businessUnit) 
      ? data.initiation.businessUnit.map(unit => 
          unit === 'SCHAUENBURG_SYSTEMS_200' 
            ? 'Schauenburg Systems (Pty) Ltd 300' 
            : 'Schauenburg (Pty) Ltd 200'
        ).join(', ')
      : (data.initiation.businessUnit === 'SCHAUENBURG_SYSTEMS_200' 
          ? 'Schauenburg Systems (Pty) Ltd 300' 
          : 'Schauenburg (Pty) Ltd 200')
    drawText(businessUnits, 10, timesRomanFont)
    yPosition -= 20

    drawSectionHeader('PRE-ONBOARDING CHECKLIST')
    drawCheckbox('I have read and understand the supplier onboarding process', data.initiation.processReadUnderstood)
    drawCheckbox('I have completed due diligence on this supplier', data.initiation.dueDiligenceCompleted)
    yPosition -= 20

    drawSectionHeader('RELATIONSHIP DECLARATION')
    drawWrappedText(data.initiation.relationshipDeclaration, 10, timesRomanFont)
    yPosition -= 20

    drawSectionHeader('PURCHASE DETAILS')
    drawKeyValue('Purchase Type', data.initiation.purchaseType.replace(/_/g, ' '))
    drawKeyValue('Payment Method', data.initiation.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Account (AC)')
    
    if (data.initiation.paymentMethod === 'COD' && data.initiation.codReason) {
      yPosition -= 10
      drawWrappedText(`COD Reason: ${data.initiation.codReason}`, 10, timesRomanFont)
    }

    drawKeyValue('Supplier Location', data.initiation.supplierLocation === 'LOCAL' ? 'Local' : data.initiation.supplierLocation === 'FOREIGN' ? 'Foreign' : 'Not specified')
    
    if (data.initiation.supplierLocation === 'FOREIGN' && data.initiation.currency) {
      drawKeyValue('Currency', data.initiation.customCurrency || data.initiation.currency)
    }

    if (data.initiation.purchaseType === 'REGULAR' && data.initiation.annualPurchaseValue) {
      const symbol = data.initiation.supplierLocation === 'LOCAL' ? 'R' : (data.initiation.currency || 'USD')
      let valueRange = ''
      if (data.initiation.annualPurchaseValue <= 100000) {
        valueRange = `${symbol}0 - ${symbol}100,000`
      } else if (data.initiation.annualPurchaseValue <= 500000) {
        valueRange = `${symbol}100,000 - ${symbol}500,000`
      } else if (data.initiation.annualPurchaseValue <= 1000000) {
        valueRange = `${symbol}500,000 - ${symbol}1,000,000`
      } else {
        valueRange = `${symbol}1,000,000+`
      }
      drawKeyValue('Annual Purchase Value Range', valueRange)
    }
    yPosition -= 20

    drawSectionHeader('CREDIT APPLICATION')
    drawKeyValue('Credit Application Required', data.initiation.creditApplication)
    if (data.initiation.creditApplicationReason) {
      yPosition -= 10
      drawWrappedText(`Reason: ${data.initiation.creditApplicationReason}`, 10, timesRomanFont)
    }
    yPosition -= 20

    drawSectionHeader('ONBOARDING JUSTIFICATION')
    if (data.initiation.onboardingReason) {
      drawWrappedText(data.initiation.onboardingReason, 10, timesRomanFont)
    }
    yPosition -= 30

    // ===== PAGE 3: SUPPLIER QUESTIONNAIRE DETAILS =====
    currentPage = pdfDoc.addPage([pageWidth, pageHeight])
    yPosition = pageHeight - margin - 50
    
    const section2Title = 'SECTION 2: SUPPLIER QUESTIONNAIRE'
    const section2Width = timesRomanBoldFont.widthOfTextAtSize(section2Title, 18)
    drawText(section2Title, 18, timesRomanBoldFont, rgb(0.118, 0.251, 0.686), (pageWidth - section2Width) / 2)
    yPosition -= 30

    drawSectionHeader('BASIC INFORMATION')
    drawKeyValue('Supplier Name', data.supplier.companyName)
    drawKeyValue('Trading Name', data.supplier.tradingName)
    drawKeyValue('Registration Number', data.supplier.registrationNumber)
    drawKeyValue('Contact Person', data.supplier.contactPerson)
    drawKeyValue('Contact Email', data.supplier.contactEmail)
    drawKeyValue('Contact Phone', data.supplier.contactPhone)
    yPosition -= 20

    drawSectionHeader('ADDRESS INFORMATION')
    if (data.supplier.physicalAddress) {
      drawText('Physical Address:', 10, timesRomanFont)
      drawWrappedText(data.supplier.physicalAddress, 10, timesRomanFont)
      yPosition -= 10
    }
    if (data.supplier.postalAddress) {
      drawText('Postal Address:', 10, timesRomanFont)
      drawWrappedText(data.supplier.postalAddress, 10, timesRomanFont)
    }
    yPosition -= 20

    drawSectionHeader('BUSINESS DETAILS')
    if (data.supplier.natureOfBusiness) {
      drawText('Nature of Business:', 10, timesRomanFont)
      drawWrappedText(data.supplier.natureOfBusiness, 10, timesRomanFont)
      yPosition -= 10
    }
    if (data.supplier.productsAndServices) {
      drawText('Products and/or Services:', 10, timesRomanFont)
      drawWrappedText(data.supplier.productsAndServices, 10, timesRomanFont)
    }
    drawKeyValue('Number of Employees', data.supplier.numberOfEmployees)
    yPosition -= 20

    if (data.supplier.associatedCompany || data.supplier.associatedCompanyRegNo) {
      drawSectionHeader('ASSOCIATED COMPANIES')
      drawKeyValue('Associated Company', data.supplier.associatedCompany)
      drawKeyValue('Registration Number', data.supplier.associatedCompanyRegNo)
      drawKeyValue('Branch Name', data.supplier.associatedCompanyBranchName)
      drawKeyValue('Contact Numbers', data.supplier.branchesContactNumbers)
      yPosition -= 20
    }

    drawSectionHeader('BANKING INFORMATION')
    drawKeyValue('Bank Account Name', data.supplier.bankAccountName)
    drawKeyValue('Bank Name', data.supplier.bankName)
    drawKeyValue('Branch Name', data.supplier.branchName)
    drawKeyValue('Branch Number', data.supplier.branchNumber)
    drawKeyValue('Account Number', data.supplier.accountNumber)
    drawKeyValue('Type of Account', data.supplier.typeOfAccount)
    yPosition -= 20

    drawSectionHeader('RESPONSIBLE PERSONS')
    
    if (data.supplier.rpBanking || data.supplier.rpBankingPhone || data.supplier.rpBankingEmail) {
      drawText('Banking Contact', 12, timesRomanBoldFont, rgb(0.231, 0.510, 0.965))
      drawKeyValue('  Name', data.supplier.rpBanking)
      drawKeyValue('  Phone', data.supplier.rpBankingPhone)
      drawKeyValue('  Email', data.supplier.rpBankingEmail)
      yPosition -= 10
    }

    if (data.supplier.rpQuality || data.supplier.rpQualityPhone || data.supplier.rpQualityEmail) {
      checkNewPage(60)
      drawText('Quality Management Contact', 12, timesRomanBoldFont, rgb(0.231, 0.510, 0.965))
      drawKeyValue('  Name', data.supplier.rpQuality)
      drawKeyValue('  Phone', data.supplier.rpQualityPhone)
      drawKeyValue('  Email', data.supplier.rpQualityEmail)
      yPosition -= 10
    }

    if (data.supplier.rpSHE || data.supplier.rpSHEPhone || data.supplier.rpSHEEmail) {
      checkNewPage(60)
      drawText('Safety, Health & Environment Contact', 12, timesRomanBoldFont, rgb(0.231, 0.510, 0.965))
      drawKeyValue('  Name', data.supplier.rpSHE)
      drawKeyValue('  Phone', data.supplier.rpSHEPhone)
      drawKeyValue('  Email', data.supplier.rpSHEEmail)
      yPosition -= 10
    }

    if (data.supplier.rpBBBEE || data.supplier.rpBBBEEPhone || data.supplier.rpBBBEEEmail) {
      checkNewPage(60)
      drawText('BBBEE Contact', 12, timesRomanBoldFont, rgb(0.231, 0.510, 0.965))
      drawKeyValue('  Name', data.supplier.rpBBBEE)
      drawKeyValue('  Phone', data.supplier.rpBBBEEPhone)
      drawKeyValue('  Email', data.supplier.rpBBBEEEmail)
      yPosition -= 10
    }
    yPosition -= 10

    drawSectionHeader('TAX & COMPLIANCE')
    drawKeyValue('Tax ID', data.supplier.taxId)
    drawKeyValue('VAT Number', data.supplier.vatNumber)
    drawKeyValue('BBBEE Level', data.supplier.bbbeeLevel)
    yPosition -= 20

    drawSectionHeader('CERTIFICATIONS & AGREEMENTS')
    drawCheckbox('Quality Management Certification', data.supplier.qualityManagementCert || false)
    drawCheckbox('SHE Certification', data.supplier.sheCertification || false)
    drawCheckbox('Authorization Agreement Signed', data.supplier.authorizationAgreement || false)
    yPosition -= 30

    // ===== DOCUMENTS PAGE =====
    if (data.documents && data.documents.length > 0) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight])
      yPosition = pageHeight - margin - 50
      
      const section3Title = 'SECTION 3: SUBMITTED DOCUMENTS'
      const section3Width = timesRomanBoldFont.widthOfTextAtSize(section3Title, 18)
      drawText(section3Title, 18, timesRomanBoldFont, rgb(0.118, 0.251, 0.686), (pageWidth - section3Width) / 2)
      yPosition -= 30

      // Group documents by category
      const docsByCategory: { [key: string]: typeof data.documents } = {}
      data.documents.forEach(document => {
        if (!docsByCategory[document.category]) {
          docsByCategory[document.category] = []
        }
        docsByCategory[document.category].push(document)
      })

      // Display documents by category
      Object.keys(docsByCategory).sort().forEach((category, index) => {
        if (index > 0) yPosition -= 15
        
        checkNewPage(50)
        drawText(category.replace(/_/g, ' ').toUpperCase(), 12, timesRomanBoldFont, rgb(0.231, 0.510, 0.965))
        
        docsByCategory[category].forEach(document => {
          checkNewPage(30)
          drawText(`  • ${document.fileName}`, 10, timesRomanFont)
          drawText(`    Version ${document.version} | Uploaded: ${document.uploadedAt.toLocaleDateString()}`, 9, timesRomanFont, rgb(0.4, 0.4, 0.4))
        })
      })
    }

    // ===== FINAL PAGE: APPROVAL INFORMATION =====
    currentPage = pdfDoc.addPage([pageWidth, pageHeight])
    yPosition = pageHeight - margin - 50
    
    const approvalTitle = 'APPROVAL INFORMATION'
    const approvalWidth = timesRomanBoldFont.widthOfTextAtSize(approvalTitle, 18)
    drawText(approvalTitle, 18, timesRomanBoldFont, rgb(0.118, 0.251, 0.686), (pageWidth - approvalWidth) / 2)
    yPosition -= 30

    drawSectionHeader('CREDIT CONTROLLER ASSIGNMENT')
    if (data.creditController) {
      drawKeyValue('Assigned Credit Controller', data.creditController)
    } else {
      drawText('Not yet assigned', 10, timesRomanFont, rgb(0.6, 0.6, 0.6))
    }
    yPosition -= 30

    drawSectionHeader('APPROVAL STATUS')
    drawKeyValue('Status', 'AWAITING FINAL APPROVAL')
    drawKeyValue('Generated By', 'System (Final Approval Request)')
    yPosition -= 50

    // Footer
    yPosition = margin + 30
    const footer1 = 'This package contains all supplier onboarding information for final approval decision.'
    const footer1Width = timesRomanFont.widthOfTextAtSize(footer1, 8)
    currentPage.drawText(footer1, {
      x: (pageWidth - footer1Width) / 2,
      y: yPosition,
      size: 8,
      font: timesRomanFont,
      color: rgb(0.6, 0.6, 0.6)
    })
    yPosition -= 12
    
    const footer2 = 'All information is current as of the generation date listed on the cover page.'
    const footer2Width = timesRomanFont.widthOfTextAtSize(footer2, 8)
    currentPage.drawText(footer2, {
      x: (pageWidth - footer2Width) / 2,
      y: yPosition,
      size: 8,
      font: timesRomanFont,
      color: rgb(0.6, 0.6, 0.6)
    })
    yPosition -= 12
    
    const footer3 = 'SS Supplier Onboarding System'
    const footer3Width = timesRomanFont.widthOfTextAtSize(footer3, 8)
    currentPage.drawText(footer3, {
      x: (pageWidth - footer3Width) / 2,
      y: yPosition,
      size: 8,
      font: timesRomanFont,
      color: rgb(0.6, 0.6, 0.6)
    })

    const pdfBytes = await pdfDoc.save()
    return Buffer.from(pdfBytes)
  } catch (error) {
    console.error('Error in generateFinalApprovalPackagePDF:', error)
    throw error
  }
}
