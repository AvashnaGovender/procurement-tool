import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import fs from 'fs'
import path from 'path'

interface SupplierFormData {
  supplierName?: string
  companyName?: string
  contactPerson?: string
  contactEmail?: string
  contactPhone?: string | null
  physicalAddress?: string | null
  postalAddress?: string | null
  tradingName?: string | null
  bbbeeLevel?: string | null
  vatRegistered?: boolean
}

export async function generateSupplierFormPDF(data: SupplierFormData): Promise<Buffer> {
  try {
    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    
    // Embed logo
    const logoPath = path.join(process.cwd(), 'public', 'logo.png')
    const logoImageBytes = fs.readFileSync(logoPath)
    const logoImage = await pdfDoc.embedPng(logoImageBytes)
    const logoDims = logoImage.scale(1.05) // 3x bigger than 0.35
    
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
      checkNewPage(20)
      if (value !== null && value !== undefined && value !== '') {
        drawText(`${key}: ${String(value)}`, 10, font)
      } else {
        drawText(`${key}: Not Provided`, 10, font, rgb(0.6, 0.6, 0.6))
      }
    }

    // Title
    yPosition -= 50
    const title = 'SUPPLIER FORM DETAILS'
    const titleWidth = boldFont.widthOfTextAtSize(title, 20)
    drawText(title, 20, boldFont, rgb(0.118, 0.251, 0.686), (pageWidth - titleWidth) / 2)
    yPosition -= 10
    
    const dateStr = `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`
    const dateWidth = font.widthOfTextAtSize(dateStr, 12)
    drawText(dateStr, 12, font, rgb(0.4, 0.4, 0.4), (pageWidth - dateWidth) / 2)
    yPosition -= 30

    // Basic Information
    drawSection('BASIC INFORMATION')
    drawKeyValue('Supplier Name', data.supplierName)
    drawKeyValue('Company Name', data.companyName)
    drawKeyValue('Trading Name', data.tradingName)
    drawKeyValue('Contact Person', data.contactPerson)
    drawKeyValue('Contact Email', data.contactEmail)
    drawKeyValue('Contact Phone', data.contactPhone)
    yPosition -= 20

    // Address Information
    drawSection('ADDRESS INFORMATION')
    if (data.physicalAddress) {
      drawText('Physical Address:', 10, font)
      drawWrappedText(data.physicalAddress, 10, font)
      yPosition -= 10
    } else {
      drawKeyValue('Physical Address', null)
    }
    if (data.postalAddress) {
      drawText('Postal Address:', 10, font)
      drawWrappedText(data.postalAddress, 10, font)
    } else {
      drawKeyValue('Postal Address', null)
    }
    yPosition -= 20

    // BBBEE Level
    drawSection('BBBEE LEVEL')
    drawKeyValue('BBBEE Level', data.bbbeeLevel)
    yPosition -= 20

    // VAT Registered
    drawSection('TAX / VAT')
    drawKeyValue('VAT Registered', data.vatRegistered === true ? 'Yes' : data.vatRegistered === false ? 'No' : 'Not provided')
    yPosition -= 30

    // Footer
    yPosition = margin + 20
    const footer = 'This document is system-generated and contains supplier-provided information.'
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
    console.error('Error in generateSupplierFormPDF:', error)
    throw error
  }
}
