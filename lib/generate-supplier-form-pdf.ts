import PDFDocument from 'pdfkit'

interface SupplierFormData {
  supplierName?: string
  companyName?: string
  contactPerson?: string
  contactEmail?: string
  contactPhone?: string | null
  physicalAddress?: string | null
  postalAddress?: string | null
  tradingName?: string | null
  registrationNumber?: string | null
  natureOfBusiness?: string | null
  productsAndServices?: string | null
  bankAccountName?: string | null
  bankName?: string | null
  branchName?: string | null
  branchNumber?: string | null
  accountNumber?: string | null
  typeOfAccount?: string | null
  bbbeeLevel?: string | null
  taxId?: string | null
  vatNumber?: string | null
}

export async function generateSupplierFormPDF(data: SupplierFormData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' })
      const chunks: Buffer[] = []

      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // Helper for section headers
      const addSectionHeader = (title: string) => {
        doc.fontSize(14)
           .fillColor('#1e40af')
           .text(title, { underline: true })
           .moveDown(0.5)
           .fillColor('#000000')
           .fontSize(10)
      }

      // Helper for key-value pairs
      const addKeyValue = (key: string, value: string | number | null | undefined) => {
        if (value !== null && value !== undefined && value !== '') {
          doc.fontSize(10)
             .text(`${key}: ${String(value)}`)
        } else {
          doc.fontSize(10)
             .fillColor('#999999')
             .text(`${key}: Not Provided`)
             .fillColor('#000000')
        }
      }

      // Title
      doc.fontSize(20)
         .fillColor('#1e40af')
         .text('SUPPLIER FORM DETAILS', { align: 'center' })
         .moveDown()
         .fontSize(12)
         .fillColor('#666666')
         .text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, { align: 'center' })
         .moveDown(2)
         .fillColor('#000000')

      // Basic Information
      addSectionHeader('BASIC INFORMATION')
      addKeyValue('Supplier Name', data.supplierName)
      addKeyValue('Company Name', data.companyName)
      addKeyValue('Trading Name', data.tradingName)
      addKeyValue('Registration Number', data.registrationNumber)
      addKeyValue('Contact Person', data.contactPerson)
      addKeyValue('Contact Email', data.contactEmail)
      addKeyValue('Contact Phone', data.contactPhone)
      doc.moveDown(1.5)

      // Address Information
      addSectionHeader('ADDRESS INFORMATION')
      if (data.physicalAddress) {
        doc.fontSize(10).text(`Physical Address: ${data.physicalAddress}`, { indent: 20 })
      } else {
        addKeyValue('Physical Address', null)
      }
      doc.moveDown(0.5)
      if (data.postalAddress) {
        doc.fontSize(10).text(`Postal Address: ${data.postalAddress}`, { indent: 20 })
      } else {
        addKeyValue('Postal Address', null)
      }
      doc.moveDown(1.5)

      // Business Details
      addSectionHeader('BUSINESS DETAILS')
      if (data.natureOfBusiness) {
        doc.fontSize(10).text(`Nature of Business: ${data.natureOfBusiness}`, { indent: 20, align: 'justify' })
      } else {
        addKeyValue('Nature of Business', null)
      }
      doc.moveDown(0.5)
      if (data.productsAndServices) {
        doc.fontSize(10).text(`Products and/or Services: ${data.productsAndServices}`, { indent: 20, align: 'justify' })
      } else {
        addKeyValue('Products and/or Services', null)
      }
      doc.moveDown(1.5)

      // Banking Information
      addSectionHeader('BANKING INFORMATION')
      addKeyValue('Bank Account Name', data.bankAccountName)
      addKeyValue('Bank Name', data.bankName)
      addKeyValue('Branch Name', data.branchName)
      addKeyValue('Branch Number', data.branchNumber)
      addKeyValue('Account Number', data.accountNumber)
      addKeyValue('Type of Account', data.typeOfAccount)
      doc.moveDown(1.5)

      // Tax & Compliance
      addSectionHeader('TAX & COMPLIANCE')
      addKeyValue('Tax ID', data.taxId)
      addKeyValue('VAT Number', data.vatNumber)
      addKeyValue('BBBEE Level', data.bbbeeLevel)
      doc.moveDown(2)

      // Footer
      doc.fontSize(8)
         .fillColor('#999999')
         .text('This document is system-generated and contains supplier-provided information.', { align: 'center' })
         .moveDown(0.5)
         .text('SS Supplier Onboarding System', { align: 'center' })

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}
