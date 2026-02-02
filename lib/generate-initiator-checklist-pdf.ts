import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

interface InitiatorChecklistData {
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
  creditApplication: boolean
  creditApplicationReason?: string | null
  onboardingReason: string
  justification?: string | null
  businessUnit: string | string[]
  initiatedBy: {
    name: string
    email: string
  }
  createdAt: Date
}

export async function generateInitiatorChecklistPDF(data: InitiatorChecklistData): Promise<Buffer> {
  try {
    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    
    const pageWidth = 595.28
    const pageHeight = 841.89
    const margin = 50
    const contentWidth = pageWidth - (2 * margin)
    
    let currentPage = pdfDoc.addPage([pageWidth, pageHeight])
    let yPosition = pageHeight - margin

    const checkNewPage = (requiredSpace: number = 50) => {
      if (yPosition - requiredSpace < margin) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight])
        yPosition = pageHeight - margin
      }
    }

    const drawText = (text: string, size: number, textFont: any, color = rgb(0, 0, 0), x = margin) => {
      currentPage.drawText(text, { x, y: yPosition, size, font: textFont, color })
      yPosition -= size + 5
    }

    const drawWrappedText = (text: string, size: number, textFont: any, maxWidth = contentWidth) => {
      const words = text.split(' ')
      let line = ''
      
      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word
        const testWidth = textFont.widthOfTextAtSize(testLine, size)
        
        if (testWidth > maxWidth && line) {
          checkNewPage(size + 5)
          currentPage.drawText(line, { x: margin, y: yPosition, size, font: textFont })
          yPosition -= size + 5
          line = word
        } else {
          line = testLine
        }
      }
      
      if (line) {
        checkNewPage(size + 5)
        currentPage.drawText(line, { x: margin, y: yPosition, size, font: textFont })
        yPosition -= size + 5
      }
    }

    const drawSection = (title: string) => {
      checkNewPage(30)
      yPosition -= 10
      drawText(title, 14, boldFont, rgb(0.118, 0.251, 0.686))
      yPosition -= 5
    }

    const drawKeyValue = (key: string, value: string | number | boolean | null | undefined) => {
      if (value !== null && value !== undefined) {
        checkNewPage(20)
        const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)
        drawText(`${key}: ${displayValue}`, 10, font)
      }
    }

    // Title
    yPosition -= 50
    const title = 'INITIATOR CHECKLIST & REQUIREMENTS'
    const titleWidth = boldFont.widthOfTextAtSize(title, 20)
    drawText(title, 20, boldFont, rgb(0.118, 0.251, 0.686), (pageWidth - titleWidth) / 2)
    yPosition -= 10
    
    const dateStr = `Submitted on ${data.createdAt.toLocaleDateString()} at ${data.createdAt.toLocaleTimeString()}`
    const dateWidth = font.widthOfTextAtSize(dateStr, 12)
    drawText(dateStr, 12, font, rgb(0.4, 0.4, 0.4), (pageWidth - dateWidth) / 2)
    yPosition -= 30

    // Initiator Information
    drawSection('INITIATED BY')
    drawKeyValue('Name', data.initiatedBy.name)
    drawKeyValue('Email', data.initiatedBy.email)
    drawKeyValue('Date', data.createdAt.toLocaleDateString())
    yPosition -= 20

    // Supplier Information
    drawSection('SUPPLIER INFORMATION')
    drawKeyValue('Supplier Name', data.supplierName)
    drawKeyValue('Contact Person', data.supplierContactPerson)
    drawKeyValue('Email', data.supplierEmail)
    drawKeyValue('Product/Service Category', data.productServiceCategory)
    drawKeyValue('Requester Name', data.requesterName)
    yPosition -= 20

    // Business Units
    drawSection('BUSINESS UNIT(S)')
    const businessUnits = Array.isArray(data.businessUnit) ? data.businessUnit.join(', ') : data.businessUnit
    drawText(businessUnits, 10, font)
    yPosition -= 20

    // Pre-Onboarding Checklist
    drawSection('PRE-ONBOARDING CHECKLIST')
    drawText(`${data.processReadUnderstood ? '☑' : '☐'} I have read and understand the supplier onboarding process`, 10, font)
    drawText(`${data.dueDiligenceCompleted ? '☑' : '☐'} I have completed due diligence on this supplier`, 10, font)
    yPosition -= 20

    // Relationship Declaration
    drawSection('RELATIONSHIP DECLARATION')
    drawWrappedText(data.relationshipDeclaration, 10, font)
    yPosition -= 20

    // Purchase Details
    drawSection('PURCHASE DETAILS')
    drawKeyValue('Purchase Type', data.purchaseType.replace(/_/g, ' '))
    drawKeyValue('Payment Method', data.paymentMethod)
    
    if (data.paymentMethod === 'COD' && data.codReason) {
      yPosition -= 10
      drawText('COD Reason:', 10, font)
      drawWrappedText(data.codReason, 10, font)
    }

    if (data.purchaseType === 'REGULAR' && data.annualPurchaseValue) {
      const symbol = data.supplierLocation === 'LOCAL' ? 'R' : (data.currency || 'USD')
      let valueRange = ''
      if (data.annualPurchaseValue <= 100000) {
        valueRange = `${symbol}0 - ${symbol}100,000`
      } else if (data.annualPurchaseValue <= 500000) {
        valueRange = `${symbol}100,000 - ${symbol}500,000`
      } else if (data.annualPurchaseValue <= 1000000) {
        valueRange = `${symbol}500,000 - ${symbol}1,000,000`
      } else {
        valueRange = `${symbol}1,000,000+`
      }
      drawKeyValue('Annual Purchase Value Range', valueRange)
    }

    drawKeyValue('Supplier Location', data.supplierLocation)
    if (data.supplierLocation === 'FOREIGN') {
      drawKeyValue('Currency', data.currency)
    }
    yPosition -= 20

    // Credit Application
    drawSection('CREDIT APPLICATION')
    drawKeyValue('Credit Application Required', data.creditApplication)
    if (data.creditApplicationReason) {
      yPosition -= 10
      drawText('Reason:', 10, font)
      drawWrappedText(data.creditApplicationReason, 10, font)
    }
    yPosition -= 20

    // Justification
    drawSection('ONBOARDING JUSTIFICATION')
    if (data.onboardingReason) {
      drawWrappedText(data.onboardingReason, 10, font)
    }
    if (data.justification) {
      yPosition -= 10
      drawText('Additional Justification:', 10, font)
      drawWrappedText(data.justification, 10, font)
    }
    yPosition -= 30

    // Footer
    yPosition = margin + 20
    const footer = 'This checklist was completed by the initiator during the supplier onboarding request.'
    const footerWidth = font.widthOfTextAtSize(footer, 8)
    currentPage.drawText(footer, {
      x: (pageWidth - footerWidth) / 2,
      y: yPosition,
      size: 8,
      font,
      color: rgb(0.6, 0.6, 0.6)
    })
    yPosition -= 12
    
    const footer2 = 'SS Supplier Onboarding System'
    const footer2Width = font.widthOfTextAtSize(footer2, 8)
    currentPage.drawText(footer2, {
      x: (pageWidth - footer2Width) / 2,
      y: yPosition,
      size: 8,
      font,
      color: rgb(0.6, 0.6, 0.6)
    })

    const pdfBytes = await pdfDoc.save()
    return Buffer.from(pdfBytes)
  } catch (error) {
    console.error('Error in generateInitiatorChecklistPDF:', error)
    throw error
  }
}
