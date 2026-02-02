import PDFDocument from 'pdfkit'

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
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' })
      const chunks: Buffer[] = []

      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // Helper for section headers
      const addSectionHeader = (title: string, newPage: boolean = false) => {
        if (newPage && doc.y > 100) {
          doc.addPage()
        }
        doc.fontSize(14)
           .fillColor('#1e40af')
           .text(title, { underline: true })
           .moveDown(0.5)
           .fillColor('#000000')
           .fontSize(10)
      }

      // Helper for subsection headers
      const addSubsectionHeader = (title: string) => {
        doc.fontSize(12)
           .fillColor('#3b82f6')
           .text(title)
           .moveDown(0.3)
           .fillColor('#000000')
           .fontSize(10)
      }

      // Helper for key-value pairs
      const addKeyValue = (key: string, value: string | number | boolean | null | undefined, indent: number = 0) => {
        if (value !== null && value !== undefined && value !== '') {
          doc.font('Helvetica-Bold')
             .text(`${key}: `, { indent, continued: true })
             .font('Helvetica')
             .text(typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value))
        }
      }

      // Helper for checkboxes
      const addCheckbox = (label: string, checked: boolean) => {
        doc.font('Helvetica')
           .text(`${checked ? '☑' : '☐'} ${label}`)
      }

      // Helper for text blocks
      const addTextBlock = (title: string, content: string | null | undefined, indent: number = 20) => {
        if (content) {
          doc.font('Helvetica-Bold').text(`${title}:`)
          doc.font('Helvetica').text(content, { indent, align: 'justify' })
        }
      }

      // ===== COVER PAGE =====
      doc.fontSize(24)
         .fillColor('#1e40af')
         .text('FINAL APPROVAL PACKAGE', { align: 'center' })
         .moveDown()
         .fontSize(16)
         .text('Supplier Onboarding Documentation', { align: 'center' })
         .moveDown(2)
         .fontSize(12)
         .fillColor('#666666')
         .text(`Generated on ${data.generatedAt.toLocaleDateString()} at ${data.generatedAt.toLocaleTimeString()}`, { align: 'center' })
         .moveDown(3)
         .fillColor('#000000')

      // Supplier summary box on cover
      doc.fontSize(11)
         .fillColor('#000000')
      
      const boxY = doc.y
      doc.rect(50, boxY, doc.page.width - 100, 140)
         .lineWidth(2)
         .strokeColor('#1e40af')
         .stroke()
      
      doc.moveDown(0.5)
      addKeyValue('Supplier Code', data.supplier.supplierCode, 20)
      addKeyValue('Company Name', data.supplier.companyName, 20)
      addKeyValue('Contact Person', data.supplier.contactPerson, 20)
      addKeyValue('Contact Email', data.supplier.contactEmail, 20)
      if (data.creditController) {
        addKeyValue('Assigned Credit Controller', data.creditController, 20)
      }
      doc.moveDown(2)

      // ===== PAGE 2: INITIATOR REQUEST DETAILS =====
      doc.addPage()
      
      doc.fontSize(18)
         .fillColor('#1e40af')
         .text('SECTION 1: INITIATOR REQUEST', { align: 'center' })
         .moveDown(2)
         .fillColor('#000000')

      // Initiated By
      addSectionHeader('INITIATED BY')
      addKeyValue('Name', data.initiation.initiatedBy.name)
      addKeyValue('Email', data.initiation.initiatedBy.email)
      addKeyValue('Request Date', data.initiation.createdAt.toLocaleDateString())
      if (data.initiation.submittedAt) {
        addKeyValue('Submitted Date', new Date(data.initiation.submittedAt).toLocaleDateString())
      }
      doc.moveDown(1.5)

      // Supplier Details (from initiator)
      addSectionHeader('SUPPLIER DETAILS (AS INITIATED)')
      addKeyValue('Supplier Name', data.initiation.supplierName)
      addKeyValue('Contact Person', data.initiation.supplierContactPerson)
      addKeyValue('Email', data.initiation.supplierEmail)
      addKeyValue('Product/Service Category', data.initiation.productServiceCategory)
      addKeyValue('Requester Name', data.initiation.requesterName)
      doc.moveDown(1.5)

      // Business Units
      addSectionHeader('BUSINESS UNIT(S)')
      const businessUnits = Array.isArray(data.initiation.businessUnit) 
        ? data.initiation.businessUnit.map(unit => 
            unit === 'SCHAUENBURG_SYSTEMS_200' 
              ? 'Schauenburg Systems (Pty) Ltd 300' 
              : 'Schauenburg (Pty) Ltd 200'
          ).join(', ')
        : (data.initiation.businessUnit === 'SCHAUENBURG_SYSTEMS_200' 
            ? 'Schauenburg Systems (Pty) Ltd 300' 
            : 'Schauenburg (Pty) Ltd 200')
      doc.font('Helvetica').text(businessUnits)
      doc.moveDown(1.5)

      // Pre-Onboarding Checklist
      addSectionHeader('PRE-ONBOARDING CHECKLIST')
      addCheckbox('I have read and understand the supplier onboarding process', data.initiation.processReadUnderstood)
      addCheckbox('I have completed due diligence on this supplier', data.initiation.dueDiligenceCompleted)
      doc.moveDown(1.5)

      // Relationship Declaration
      addSectionHeader('RELATIONSHIP DECLARATION')
      doc.font('Helvetica').text(data.initiation.relationshipDeclaration)
      doc.moveDown(1.5)

      // Purchase Details
      addSectionHeader('PURCHASE DETAILS')
      addKeyValue('Purchase Type', data.initiation.purchaseType.replace(/_/g, ' '))
      addKeyValue('Payment Method', data.initiation.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Account (AC)')
      
      if (data.initiation.paymentMethod === 'COD' && data.initiation.codReason) {
        doc.moveDown(0.5)
        addTextBlock('COD Reason', data.initiation.codReason)
      }

      addKeyValue('Supplier Location', data.initiation.supplierLocation === 'LOCAL' ? 'Local' : data.initiation.supplierLocation === 'FOREIGN' ? 'Foreign' : 'Not specified')
      
      if (data.initiation.supplierLocation === 'FOREIGN' && data.initiation.currency) {
        addKeyValue('Currency', data.initiation.customCurrency || data.initiation.currency)
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
        addKeyValue('Annual Purchase Value Range', valueRange)
      }
      doc.moveDown(1.5)

      // Credit Application
      addSectionHeader('CREDIT APPLICATION')
      addKeyValue('Credit Application Required', data.initiation.creditApplication)
      if (data.initiation.creditApplicationReason) {
        doc.moveDown(0.5)
        addTextBlock('Reason', data.initiation.creditApplicationReason)
      }
      doc.moveDown(1.5)

      // Onboarding Justification
      addSectionHeader('ONBOARDING JUSTIFICATION')
      if (data.initiation.onboardingReason) {
        doc.font('Helvetica').text(data.initiation.onboardingReason, { align: 'justify' })
      }
      doc.moveDown(2)

      // ===== PAGE 3: SUPPLIER QUESTIONNAIRE DETAILS =====
      doc.addPage()
      
      doc.fontSize(18)
         .fillColor('#1e40af')
         .text('SECTION 2: SUPPLIER QUESTIONNAIRE', { align: 'center' })
         .moveDown(2)
         .fillColor('#000000')

      // Basic Information
      addSectionHeader('BASIC INFORMATION')
      addKeyValue('Supplier Name', data.supplier.companyName)
      addKeyValue('Trading Name', data.supplier.tradingName)
      addKeyValue('Registration Number', data.supplier.registrationNumber)
      addKeyValue('Contact Person', data.supplier.contactPerson)
      addKeyValue('Contact Email', data.supplier.contactEmail)
      addKeyValue('Contact Phone', data.supplier.contactPhone)
      doc.moveDown(1.5)

      // Address Information
      addSectionHeader('ADDRESS INFORMATION')
      if (data.supplier.physicalAddress) {
        addTextBlock('Physical Address', data.supplier.physicalAddress)
        doc.moveDown(0.5)
      }
      if (data.supplier.postalAddress) {
        addTextBlock('Postal Address', data.supplier.postalAddress)
      }
      doc.moveDown(1.5)

      // Business Details
      addSectionHeader('BUSINESS DETAILS')
      if (data.supplier.natureOfBusiness) {
        addTextBlock('Nature of Business', data.supplier.natureOfBusiness)
        doc.moveDown(0.5)
      }
      if (data.supplier.productsAndServices) {
        addTextBlock('Products and/or Services', data.supplier.productsAndServices)
      }
      addKeyValue('Number of Employees', data.supplier.numberOfEmployees)
      doc.moveDown(1.5)

      // Associated Companies
      if (data.supplier.associatedCompany || data.supplier.associatedCompanyRegNo) {
        addSectionHeader('ASSOCIATED COMPANIES')
        addKeyValue('Associated Company', data.supplier.associatedCompany)
        addKeyValue('Registration Number', data.supplier.associatedCompanyRegNo)
        addKeyValue('Branch Name', data.supplier.associatedCompanyBranchName)
        addKeyValue('Contact Numbers', data.supplier.branchesContactNumbers)
        doc.moveDown(1.5)
      }

      // Banking Information
      addSectionHeader('BANKING INFORMATION')
      addKeyValue('Bank Account Name', data.supplier.bankAccountName)
      addKeyValue('Bank Name', data.supplier.bankName)
      addKeyValue('Branch Name', data.supplier.branchName)
      addKeyValue('Branch Number', data.supplier.branchNumber)
      addKeyValue('Account Number', data.supplier.accountNumber)
      addKeyValue('Type of Account', data.supplier.typeOfAccount)
      doc.moveDown(1.5)

      // Responsible Persons
      addSectionHeader('RESPONSIBLE PERSONS')
      
      if (data.supplier.rpBanking || data.supplier.rpBankingPhone || data.supplier.rpBankingEmail) {
        addSubsectionHeader('Banking Contact')
        addKeyValue('Name', data.supplier.rpBanking, 20)
        addKeyValue('Phone', data.supplier.rpBankingPhone, 20)
        addKeyValue('Email', data.supplier.rpBankingEmail, 20)
        doc.moveDown(0.5)
      }

      if (data.supplier.rpQuality || data.supplier.rpQualityPhone || data.supplier.rpQualityEmail) {
        addSubsectionHeader('Quality Management Contact')
        addKeyValue('Name', data.supplier.rpQuality, 20)
        addKeyValue('Phone', data.supplier.rpQualityPhone, 20)
        addKeyValue('Email', data.supplier.rpQualityEmail, 20)
        doc.moveDown(0.5)
      }

      if (data.supplier.rpSHE || data.supplier.rpSHEPhone || data.supplier.rpSHEEmail) {
        addSubsectionHeader('Safety, Health & Environment Contact')
        addKeyValue('Name', data.supplier.rpSHE, 20)
        addKeyValue('Phone', data.supplier.rpSHEPhone, 20)
        addKeyValue('Email', data.supplier.rpSHEEmail, 20)
        doc.moveDown(0.5)
      }

      if (data.supplier.rpBBBEE || data.supplier.rpBBBEEPhone || data.supplier.rpBBBEEEmail) {
        addSubsectionHeader('BBBEE Contact')
        addKeyValue('Name', data.supplier.rpBBBEE, 20)
        addKeyValue('Phone', data.supplier.rpBBBEEPhone, 20)
        addKeyValue('Email', data.supplier.rpBBBEEEmail, 20)
        doc.moveDown(0.5)
      }
      doc.moveDown(1)

      // Tax & Compliance
      addSectionHeader('TAX & COMPLIANCE')
      addKeyValue('Tax ID', data.supplier.taxId)
      addKeyValue('VAT Number', data.supplier.vatNumber)
      addKeyValue('BBBEE Level', data.supplier.bbbeeLevel)
      doc.moveDown(1.5)

      // Certifications
      addSectionHeader('CERTIFICATIONS & AGREEMENTS')
      addCheckbox('Quality Management Certification', data.supplier.qualityManagementCert || false)
      addCheckbox('SHE Certification', data.supplier.sheCertification || false)
      addCheckbox('Authorization Agreement Signed', data.supplier.authorizationAgreement || false)
      doc.moveDown(2)

      // ===== DOCUMENTS PAGE =====
      if (data.documents && data.documents.length > 0) {
        doc.addPage()
        
        doc.fontSize(18)
           .fillColor('#1e40af')
           .text('SECTION 3: SUBMITTED DOCUMENTS', { align: 'center' })
           .moveDown(2)
           .fillColor('#000000')

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
          if (index > 0) doc.moveDown(1)
          
          addSubsectionHeader(category.replace(/_/g, ' ').toUpperCase())
          
          docsByCategory[category].forEach(document => {
            doc.fontSize(10)
               .font('Helvetica')
               .text(`  • ${document.fileName}`, { indent: 20 })
               .fontSize(9)
               .fillColor('#666666')
               .text(`    Version ${document.version} | Uploaded: ${document.uploadedAt.toLocaleDateString()}`, { indent: 20 })
               .fillColor('#000000')
               .fontSize(10)
          })
        })
      }

      // ===== FINAL PAGE: APPROVAL INFORMATION =====
      doc.addPage()
      
      doc.fontSize(18)
         .fillColor('#1e40af')
         .text('APPROVAL INFORMATION', { align: 'center' })
         .moveDown(2)
         .fillColor('#000000')

      addSectionHeader('CREDIT CONTROLLER ASSIGNMENT')
      if (data.creditController) {
        addKeyValue('Assigned Credit Controller', data.creditController)
      } else {
        doc.font('Helvetica').fillColor('#999999').text('Not yet assigned')
        doc.fillColor('#000000')
      }
      doc.moveDown(2)

      addSectionHeader('APPROVAL STATUS')
      addKeyValue('Status', 'AWAITING FINAL APPROVAL')
      addKeyValue('Generated By', 'System (Final Approval Request)')
      doc.moveDown(3)

      // Footer
      doc.fontSize(8)
         .fillColor('#999999')
         .text('This package contains all supplier onboarding information for final approval decision.', { align: 'center' })
         .moveDown(0.5)
         .text('All information is current as of the generation date listed on the cover page.', { align: 'center' })
         .moveDown(0.5)
         .text('SS Supplier Onboarding System', { align: 'center' })

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}
