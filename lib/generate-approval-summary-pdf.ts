import PDFDocument from 'pdfkit'
import { Readable } from 'stream'

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
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' })
      const chunks: Buffer[] = []

      // Collect PDF data
      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // Helper function for section headers
      const addSectionHeader = (title: string) => {
        doc.fontSize(14)
           .fillColor('#1e40af')
           .text(title, { underline: true })
           .moveDown(0.5)
           .fillColor('#000000')
           .fontSize(10)
      }

      // Helper function for key-value pairs
      const addKeyValue = (key: string, value: string | number | null | undefined) => {
        if (value !== null && value !== undefined) {
          doc.font('Helvetica-Bold')
             .text(`${key}: `, { continued: true })
             .font('Helvetica')
             .text(String(value))
        }
      }

      // Title
      doc.fontSize(20)
         .fillColor('#1e40af')
         .text('SUPPLIER APPROVAL SUMMARY', { align: 'center' })
         .moveDown()
         .fontSize(12)
         .fillColor('#666666')
         .text(`Approved on ${data.approvedAt.toLocaleDateString()} at ${data.approvedAt.toLocaleTimeString()}`, { align: 'center' })
         .moveDown(2)
         .fillColor('#000000')

      // Supplier Information Section
      addSectionHeader('SUPPLIER INFORMATION')
      addKeyValue('Supplier Name', data.supplier.name)
      addKeyValue('Supplier Code', data.supplier.supplierCode)
      addKeyValue('Contact Name', data.supplier.contactName)
      addKeyValue('Contact Email', data.supplier.contactEmail)
      addKeyValue('Contact Phone', data.supplier.contactPhone)
      addKeyValue('Address', data.supplier.address)
      
      const locationParts = [data.supplier.city, data.supplier.state, data.supplier.zipCode].filter(Boolean)
      if (locationParts.length > 0) {
        addKeyValue('Location', locationParts.join(', '))
      }
      
      addKeyValue('Country', data.supplier.country)
      addKeyValue('Website', data.supplier.website)
      addKeyValue('Tax ID', data.supplier.taxId)
      addKeyValue('DUNS Number', data.supplier.dunsNumber)
      doc.moveDown(1.5)

      // Initiation Request Details Section
      addSectionHeader('INITIATION REQUEST DETAILS')
      addKeyValue('Requested By', `${data.initiation.initiatedBy.name} (${data.initiation.initiatedBy.email})`)
      addKeyValue('Request Date', data.initiation.createdAt.toLocaleDateString())
      addKeyValue('Purchase Type', data.initiation.purchaseType.replace(/_/g, ' '))
      addKeyValue('Payment Method', data.initiation.paymentMethod)
      
      // Handle business unit (can be string or array)
      const businessUnits = Array.isArray(data.initiation.businessUnit)
        ? data.initiation.businessUnit.join(', ')
        : data.initiation.businessUnit
      addKeyValue('Business Unit(s)', businessUnits)
      
      addKeyValue('Credit Application Required', data.initiation.creditApplication ? 'Yes' : 'No')
      
      if (data.initiation.annualPurchaseValue) {
        const formattedValue = `${data.initiation.currency || 'USD'} ${data.initiation.annualPurchaseValue.toLocaleString()}`
        addKeyValue('Annual Purchase Value', formattedValue)
      }
      
      addKeyValue('Supplier Location', data.initiation.supplierLocation)
      
      if (data.initiation.justification) {
        doc.font('Helvetica-Bold')
           .text('Justification: ')
           .font('Helvetica')
           .text(data.initiation.justification, { align: 'justify' })
      }
      doc.moveDown(1.5)

      // Submitted Documents Section
      addSectionHeader('SUBMITTED DOCUMENTS')
      
      if (data.documents.length === 0) {
        doc.text('No documents submitted', { italic: true })
      } else {
        // Group documents by category
        const docsByCategory: { [key: string]: DocumentInfo[] } = {}
        data.documents.forEach(doc => {
          if (!docsByCategory[doc.category]) {
            docsByCategory[doc.category] = []
          }
          docsByCategory[doc.category].push(doc)
        })

        // Display documents by category
        Object.keys(docsByCategory).sort().forEach((category, index) => {
          if (index > 0) doc.moveDown(0.5)
          
          doc.font('Helvetica-Bold')
             .fillColor('#1e40af')
             .text(`${category.replace(/_/g, ' ')}:`)
             .fillColor('#000000')
             .font('Helvetica')
          
          docsByCategory[category].forEach(document => {
            doc.fontSize(9)
               .text(`  • ${document.fileName}`, { indent: 20 })
               .fontSize(8)
               .fillColor('#666666')
               .text(`    Version ${document.version} | Uploaded: ${document.uploadedAt.toLocaleDateString()}`, { indent: 20 })
               .fillColor('#000000')
               .fontSize(10)
          })
        })
      }
      doc.moveDown(1.5)

      // Approval Details Section
      addSectionHeader('APPROVAL DETAILS')
      addKeyValue('Approved By', `${data.approvedBy.name} (${data.approvedBy.email})`)
      addKeyValue('Approval Date', data.approvedAt.toLocaleDateString())
      addKeyValue('Approval Time', data.approvedAt.toLocaleTimeString())
      if (data.creditController) {
        addKeyValue('Credit Controller', data.creditController)
      }
      doc.moveDown(2)

      // Footer
      doc.fontSize(8)
         .fillColor('#999999')
         .text('This is a system-generated document. All information is current as of the approval date.', { align: 'center' })
         .moveDown(0.5)
         .text('SS Supplier Onboarding System', { align: 'center' })

      // Finalize the PDF
      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}
