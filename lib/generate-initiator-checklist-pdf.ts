import PDFDocument from 'pdfkit'

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
      const addKeyValue = (key: string, value: string | number | boolean | null | undefined) => {
        if (value !== null && value !== undefined) {
          doc.font('Helvetica-Bold')
             .text(`${key}: `, { continued: true })
             .font('Helvetica')
             .text(typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value))
        }
      }

      // Helper for checkboxes
      const addCheckbox = (label: string, checked: boolean) => {
        doc.font('Helvetica')
           .text(`${checked ? '☑' : '☐'} ${label}`)
      }

      // Title
      doc.fontSize(20)
         .fillColor('#1e40af')
         .text('INITIATOR CHECKLIST & REQUIREMENTS', { align: 'center' })
         .moveDown()
         .fontSize(12)
         .fillColor('#666666')
         .text(`Submitted on ${data.createdAt.toLocaleDateString()} at ${data.createdAt.toLocaleTimeString()}`, { align: 'center' })
         .moveDown(2)
         .fillColor('#000000')

      // Initiator Information
      addSectionHeader('INITIATED BY')
      addKeyValue('Name', data.initiatedBy.name)
      addKeyValue('Email', data.initiatedBy.email)
      addKeyValue('Date', data.createdAt.toLocaleDateString())
      doc.moveDown(1.5)

      // Supplier Information
      addSectionHeader('SUPPLIER INFORMATION')
      addKeyValue('Supplier Name', data.supplierName)
      addKeyValue('Contact Person', data.supplierContactPerson)
      addKeyValue('Email', data.supplierEmail)
      addKeyValue('Product/Service Category', data.productServiceCategory)
      addKeyValue('Requester Name', data.requesterName)
      doc.moveDown(1.5)

      // Business Units
      addSectionHeader('BUSINESS UNIT(S)')
      const businessUnits = Array.isArray(data.businessUnit) ? data.businessUnit.join(', ') : data.businessUnit
      doc.font('Helvetica').text(businessUnits)
      doc.moveDown(1.5)

      // Pre-Onboarding Checklist
      addSectionHeader('PRE-ONBOARDING CHECKLIST')
      addCheckbox('I have read and understand the supplier onboarding process', data.processReadUnderstood)
      addCheckbox('I have completed due diligence on this supplier', data.dueDiligenceCompleted)
      doc.moveDown(1.5)

      // Relationship Declaration
      addSectionHeader('RELATIONSHIP DECLARATION')
      doc.font('Helvetica').text(data.relationshipDeclaration)
      doc.moveDown(1.5)

      // Purchase Details
      addSectionHeader('PURCHASE DETAILS')
      addKeyValue('Purchase Type', data.purchaseType.replace(/_/g, ' '))
      addKeyValue('Payment Method', data.paymentMethod)
      
      if (data.paymentMethod === 'COD' && data.codReason) {
        doc.moveDown(0.5)
        doc.font('Helvetica-Bold').text('COD Reason:')
        doc.font('Helvetica').text(data.codReason, { indent: 20, align: 'justify' })
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
        addKeyValue('Annual Purchase Value Range', valueRange)
      }

      addKeyValue('Supplier Location', data.supplierLocation)
      if (data.supplierLocation === 'FOREIGN') {
        addKeyValue('Currency', data.currency)
      }
      doc.moveDown(1.5)

      // Credit Application
      addSectionHeader('CREDIT APPLICATION')
      addKeyValue('Credit Application Required', data.creditApplication)
      if (data.creditApplicationReason) {
        doc.moveDown(0.5)
        doc.font('Helvetica-Bold').text('Reason:')
        doc.font('Helvetica').text(data.creditApplicationReason, { indent: 20, align: 'justify' })
      }
      doc.moveDown(1.5)

      // Justification
      addSectionHeader('ONBOARDING JUSTIFICATION')
      if (data.onboardingReason) {
        doc.font('Helvetica').text(data.onboardingReason, { align: 'justify' })
      }
      if (data.justification) {
        doc.moveDown(0.5)
        doc.font('Helvetica-Bold').text('Additional Justification:')
        doc.font('Helvetica').text(data.justification, { align: 'justify' })
      }
      doc.moveDown(2)

      // Footer
      doc.fontSize(8)
         .fillColor('#999999')
         .text('This checklist was completed by the initiator during the supplier onboarding request.', { align: 'center' })
         .moveDown(0.5)
         .text('SS Supplier Onboarding System', { align: 'center' })

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}
