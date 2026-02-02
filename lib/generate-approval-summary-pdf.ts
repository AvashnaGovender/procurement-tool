import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import fs from 'fs'
import path from 'path'

interface SupplierData {
  name: string
  supplierCode: string
  contactName?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  country?: string | null
  website?: string | null
  taxId?: string | null
  dunsNumber?: string | null
}

interface InitiationData {
  supplierName: string
  purchaseType: string
  creditApplication: boolean
  paymentMethod: string
  businessUnit: string | string[]
  annualPurchaseValue?: number | null
  currency?: string | null
  supplierLocation?: string | null
  justification?: string | null
  initiatedBy: {
    name: string
    email: string
  }
  createdAt: Date
}

interface DocumentInfo {
  category: string
  fileName: string
  version: number
  uploadedAt: Date
}

interface ApprovalSummaryData {
  supplier: SupplierData
  initiation: InitiationData
  documents: DocumentInfo[]
  approvedBy: {
    name: string
    email: string
  }
  approvedAt: Date
  creditController?: string | null
}

export async function generateApprovalSummaryPDF(data: ApprovalSummaryData): Promise<Buffer> {
  try {
    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    
    // Embed logo
    const logoPath = path.join(process.cwd(), 'public', 'logo.png')
    const logoImageBytes = fs.readFileSync(logoPath)
    const logoImage = await pdfDoc.embedPng(logoImageBytes)
    const logoDims = logoImage.scale(0.15) // Adjust scale as needed
    
    const pageWidth = 595.28
    const pageHeight = 841.89
    const margin = 50
    const contentWidth = pageWidth - (2 * margin)
    
    let currentPage = pdfDoc.addPage([pageWidth, pageHeight])
    let yPosition = pageHeight - margin
    
    // Draw logo at top center
    const logoX = (pageWidth - logoDims.width) / 2
    currentPage.drawImage(logoImage, {
      x: logoX,
      y: yPosition - logoDims.height,
      width: logoDims.width,
      height: logoDims.height,
    })
    yPosition -= logoDims.height + 20

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

    const drawKeyValue = (key: string, value: string | number | null | undefined) => {
      if (value !== null && value !== undefined) {
        checkNewPage(20)
        drawText(`${key}: ${String(value)}`, 10, font)
      }
    }

    // Title
    yPosition -= 50
    const title = 'SUPPLIER APPROVAL SUMMARY'
    const titleWidth = boldFont.widthOfTextAtSize(title, 20)
    drawText(title, 20, boldFont, rgb(0.118, 0.251, 0.686), (pageWidth - titleWidth) / 2)
    yPosition -= 10
    
    const dateStr = `Approved on ${data.approvedAt.toLocaleDateString()} at ${data.approvedAt.toLocaleTimeString()}`
    const dateWidth = font.widthOfTextAtSize(dateStr, 12)
    drawText(dateStr, 12, font, rgb(0.4, 0.4, 0.4), (pageWidth - dateWidth) / 2)
    yPosition -= 30

    // Supplier Information
    drawSection('SUPPLIER INFORMATION')
    drawKeyValue('Supplier Name', data.supplier.name)
    drawKeyValue('Supplier Code', data.supplier.supplierCode)
    drawKeyValue('Contact Name', data.supplier.contactName)
    drawKeyValue('Contact Email', data.supplier.contactEmail)
    drawKeyValue('Contact Phone', data.supplier.contactPhone)
    drawKeyValue('Address', data.supplier.address)
    
    const locationParts = [data.supplier.city, data.supplier.state, data.supplier.zipCode].filter(Boolean)
    if (locationParts.length > 0) {
      drawKeyValue('Location', locationParts.join(', '))
    }
    
    drawKeyValue('Country', data.supplier.country)
    drawKeyValue('Website', data.supplier.website)
    drawKeyValue('Tax ID', data.supplier.taxId)
    drawKeyValue('DUNS Number', data.supplier.dunsNumber)
    yPosition -= 20

    // Initiation Request Details
    drawSection('INITIATION REQUEST DETAILS')
    drawKeyValue('Requested By', `${data.initiation.initiatedBy.name} (${data.initiation.initiatedBy.email})`)
    drawKeyValue('Request Date', data.initiation.createdAt.toLocaleDateString())
    drawKeyValue('Purchase Type', data.initiation.purchaseType.replace(/_/g, ' '))
    drawKeyValue('Payment Method', data.initiation.paymentMethod)
    
    const businessUnits = Array.isArray(data.initiation.businessUnit)
      ? data.initiation.businessUnit.join(', ')
      : data.initiation.businessUnit
    drawKeyValue('Business Unit(s)', businessUnits)
    
    drawKeyValue('Credit Application Required', data.initiation.creditApplication ? 'Yes' : 'No')
    
    if (data.initiation.annualPurchaseValue) {
      const formattedValue = `${data.initiation.currency || 'USD'} ${data.initiation.annualPurchaseValue.toLocaleString()}`
      drawKeyValue('Annual Purchase Value', formattedValue)
    }
    
    drawKeyValue('Supplier Location', data.initiation.supplierLocation)
    
    if (data.initiation.justification) {
      yPosition -= 10
      drawText('Justification:', 10, font)
      drawWrappedText(data.initiation.justification, 10, font)
    }
    yPosition -= 20

    // Submitted Documents
    drawSection('SUBMITTED DOCUMENTS')
    
    if (data.documents.length === 0) {
      drawText('No documents submitted', 10, font, rgb(0.4, 0.4, 0.4))
    } else {
      const docsByCategory: { [key: string]: DocumentInfo[] } = {}
      data.documents.forEach(doc => {
        if (!docsByCategory[doc.category]) {
          docsByCategory[doc.category] = []
        }
        docsByCategory[doc.category].push(doc)
      })

      Object.keys(docsByCategory).sort().forEach((category, index) => {
        if (index > 0) yPosition -= 10
        
        checkNewPage(40)
        drawText(`${category.replace(/_/g, ' ')}:`, 10, boldFont, rgb(0.118, 0.251, 0.686))
        
        docsByCategory[category].forEach(document => {
          checkNewPage(25)
          drawText(`  • ${document.fileName}`, 9, font)
          drawText(`    Version ${document.version} | Uploaded: ${document.uploadedAt.toLocaleDateString()}`, 8, font, rgb(0.4, 0.4, 0.4))
        })
      })
    }
    yPosition -= 20

    // Approval Details
    drawSection('APPROVAL DETAILS')
    drawKeyValue('Approved By', `${data.approvedBy.name} (${data.approvedBy.email})`)
    drawKeyValue('Approval Date', data.approvedAt.toLocaleDateString())
    drawKeyValue('Approval Time', data.approvedAt.toLocaleTimeString())
    if (data.creditController) {
      drawKeyValue('Credit Controller', data.creditController)
    }
    yPosition -= 30

    // Footer
    yPosition = margin + 20
    const footer = 'This is a system-generated document. All information is current as of the approval date.'
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
    console.error('Error in generateApprovalSummaryPDF:', error)
    throw error
  }
}
