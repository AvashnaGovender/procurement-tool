export type PurchaseType = 'REGULAR' | 'ONCE_OFF' | 'SHARED_IP'
export type PaymentMethod = 'COD' | 'AC'

const NEW_PURCHASE_TYPES = ['COD', 'COD_IP_SHARED', 'CREDIT_TERMS', 'CREDIT_TERMS_IP_SHARED'] as const

/**
 * Maps purchase type (including new 4-category: COD, COD_IP_SHARED, CREDIT_TERMS, CREDIT_TERMS_IP_SHARED)
 * to legacy PurchaseType and PaymentMethod for document logic.
 */
export function toLegacyPurchaseInfo(
  purchaseType: string,
  paymentMethod?: PaymentMethod | string | null
): { purchaseType: PurchaseType; paymentMethod: PaymentMethod } {
  if (purchaseType === 'COD' || purchaseType === 'COD_IP_SHARED') {
    return {
      purchaseType: purchaseType === 'COD' ? 'REGULAR' : 'SHARED_IP',
      paymentMethod: 'COD'
    }
  }
  if (purchaseType === 'CREDIT_TERMS' || purchaseType === 'CREDIT_TERMS_IP_SHARED') {
    return {
      purchaseType: purchaseType === 'CREDIT_TERMS' ? 'REGULAR' : 'SHARED_IP',
      paymentMethod: 'AC'
    }
  }
  return {
    purchaseType: purchaseType as PurchaseType,
    paymentMethod: (paymentMethod === 'COD' ? 'COD' : 'AC') as PaymentMethod
  }
}

/**
 * Get display label for purchase type (supports legacy and new 4-category types).
 */
export function getPurchaseTypeDisplayName(purchaseType: string | null | undefined): string {
  if (!purchaseType) return ''
  const labels: Record<string, string> = {
    COD: 'COD',
    COD_IP_SHARED: 'COD IP Shared',
    CREDIT_TERMS: 'Credit Terms',
    CREDIT_TERMS_IP_SHARED: 'Credit Terms IP Shared',
    REGULAR: 'Regular Purchase',
    ONCE_OFF: 'Once-off Purchase',
    SHARED_IP: 'Shared IP'
  }
  return labels[purchaseType] ?? purchaseType.replace(/_/g, ' ')
}

/**
 * Get the list of required documents based on purchase type, credit application status, and payment method
 * @param purchaseType - The type of purchase (REGULAR, ONCE_OFF, SHARED_IP, or COD, COD_IP_SHARED, CREDIT_TERMS, CREDIT_TERMS_IP_SHARED)
 * @param creditApplication - Whether credit application is required
 * @param paymentMethod - The payment method (COD or AC) - optional when using new 4-category purchase types
 * @returns Array of document keys that are required
 */
export function getRequiredDocuments(
  purchaseType: PurchaseType | string,
  creditApplication: boolean,
  paymentMethod?: PaymentMethod | string | null
): string[] {
  const legacy = NEW_PURCHASE_TYPES.includes(purchaseType as any)
    ? toLegacyPurchaseInfo(purchaseType)
    : { purchaseType: purchaseType as PurchaseType, paymentMethod: (paymentMethod === 'COD' ? 'COD' : 'AC') as PaymentMethod }
  const { purchaseType: pt, paymentMethod: pm } = legacy
  console.log('🔍 getRequiredDocuments called with:', { purchaseType, creditApplication, paymentMethod, resolved: { pt, pm } })
  
  // Base mandatory documents for all suppliers
  let baseDocs = [
    'cipcCertificate',      // CIPC Certificate (Company Registration)
    'bbbeeScorecard',       // BBBEE Scorecard Report or Affidavit
    'taxClearance',         // Tax Clearance Certificate
    'bankConfirmation',     // Bank Confirmation Letter
  ]

  // Add NDA only for SHARED_IP purchase type (and only if payment method is NOT COD)
  const shouldAddNDA = pt === 'SHARED_IP' && pm !== 'COD'
  console.log('   Should add NDA?', shouldAddNDA, '(purchaseType === SHARED_IP:', pt === 'SHARED_IP', 'paymentMethod !== COD:', pm !== 'COD', ')')
  
  if (shouldAddNDA) {
    baseDocs.push('nda')                  // Non-Disclosure Agreement
    console.log('   ✅ NDA added to required documents')
  } else {
    console.log('   ❌ NDA NOT added - purchase type is', pt, 'not SHARED_IP')
  }

  // Add Credit Application only if payment is Account AND initiator requested credit
  // (If initiator chose "No credit" with a reason, do not require the form)
  if (pm !== 'COD' && creditApplication) {
    baseDocs.push('creditApplication')    // Credit Application Form
  }

  // Optional documents that may be included
  const optionalDocs = [
    'vatCertificate',       // VAT Registration Certificate (if applicable)
  ]

  // Return all documents (base + optional)
  const allDocs = [...baseDocs, ...optionalDocs]
  console.log('   📋 Final required documents:', allDocs)
  return allDocs
}

/**
 * Get the list of mandatory documents (excluding optional ones)
 * @param purchaseType - The type of purchase (REGULAR, ONCE_OFF, SHARED_IP, or COD, COD_IP_SHARED, CREDIT_TERMS, CREDIT_TERMS_IP_SHARED)
 * @param creditApplication - Whether credit application is required
 * @param paymentMethod - The payment method (COD or AC) - optional when using new 4-category purchase types
 * @returns Array of mandatory document keys
 */
export function getMandatoryDocuments(
  purchaseType: PurchaseType | string,
  creditApplication: boolean,
  paymentMethod?: PaymentMethod | string | null
): string[] {
  const legacy = NEW_PURCHASE_TYPES.includes(purchaseType as any)
    ? toLegacyPurchaseInfo(purchaseType)
    : { purchaseType: purchaseType as PurchaseType, paymentMethod: (paymentMethod === 'COD' ? 'COD' : 'AC') as PaymentMethod }
  const { purchaseType: pt, paymentMethod: pm } = legacy

  // Base mandatory documents
  let mandatoryDocs = [
    'cipcCertificate',      // CIPC Certificate (Company Registration)
    'bbbeeScorecard',       // BBBEE Scorecard Report or Affidavit
    'taxClearance',         // Tax Clearance Certificate
    'bankConfirmation',     // Bank Confirmation Letter
  ]

  // Add NDA only for SHARED_IP purchase type (and only if payment method is NOT COD)
  if (pt === 'SHARED_IP' && pm !== 'COD') {
    mandatoryDocs.push('nda')                  // Non-Disclosure Agreement
  }

  // Add Credit Application only if payment is Account AND initiator requested credit
  if (pm !== 'COD' && creditApplication) {
    mandatoryDocs.push('creditApplication')    // Credit Application Form
  }

  return mandatoryDocs
}

/**
 * Get the display name for a document key
 * @param key - The document key
 * @returns The human-readable display name
 */
export function getDocumentDisplayName(key: string): string {
  const displayNames: Record<string, string> = {
    'cipcCertificate': 'CIPC Certificate (Company Registration)',
    'companyRegistration': 'CIPC Certificate (Company Registration)',
    'bbbeeScorecard': 'BBBEE Scorecard Report or Affidavit',
    'bbbeeAccreditation': 'BBBEE Scorecard Report or Affidavit',
    'taxClearance': 'Tax Clearance Certificate',
    'goodStanding': 'Tax Clearance / Letter of Good Standing',
    'vatCertificate': 'VAT Registration Certificate',
    'bankConfirmation': 'Bank Confirmation Letter',
    'nda': 'Non-Disclosure Agreement (NDA) - Signed',
    'creditApplication': 'Credit Application Form',
  }
  
  return displayNames[key] || key
}

/**
 * Check if a document is mandatory
 * @param key - The document key
 * @param purchaseType - The type of purchase (legacy or new 4-category)
 * @param creditApplication - Whether credit application is required
 * @param paymentMethod - The payment method (COD or AC) - optional when using new 4-category purchase types
 * @returns Whether the document is mandatory
 */
export function isDocumentMandatory(
  key: string,
  purchaseType: PurchaseType | string,
  creditApplication: boolean,
  paymentMethod?: PaymentMethod | string | null
): boolean {
  const mandatoryDocs = getMandatoryDocuments(purchaseType, creditApplication, paymentMethod)
  return mandatoryDocs.includes(key)
}
