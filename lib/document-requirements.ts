export type PurchaseType = 'REGULAR' | 'ONCE_OFF' | 'SHARED_IP'
export type PaymentMethod = 'COD' | 'AC'

/**
 * Get the list of required documents based on purchase type, credit application status, and payment method
 * @param purchaseType - The type of purchase (REGULAR, ONCE_OFF, SHARED_IP)
 * @param creditApplication - Whether credit application is required
 * @param paymentMethod - The payment method (COD or AC)
 * @returns Array of document keys that are required
 */
export function getRequiredDocuments(
  purchaseType: PurchaseType,
  creditApplication: boolean,
  paymentMethod?: PaymentMethod | string | null
): string[] {
  console.log('🔍 getRequiredDocuments called with:', { purchaseType, creditApplication, paymentMethod })
  
  // Base mandatory documents for all suppliers
  let baseDocs = [
    'cipcCertificate',      // CIPC Certificate (Company Registration)
    'bbbeeScorecard',       // BBBEE Scorecard Report or Affidavit
    'taxClearance',         // Tax Clearance Certificate
    'bankConfirmation',     // Bank Confirmation Letter
  ]

  // Add NDA only for SHARED_IP purchase type (and only if payment method is NOT COD)
  const shouldAddNDA = purchaseType === 'SHARED_IP' && paymentMethod !== 'COD'
  console.log('   Should add NDA?', shouldAddNDA, '(purchaseType === SHARED_IP:', purchaseType === 'SHARED_IP', 'paymentMethod !== COD:', paymentMethod !== 'COD', ')')
  
  if (shouldAddNDA) {
    baseDocs.push('nda')                  // Non-Disclosure Agreement
    console.log('   ✅ NDA added to required documents')
  } else {
    console.log('   ❌ NDA NOT added - purchase type is', purchaseType, 'not SHARED_IP')
  }

  // Add Credit Application only if payment method is NOT COD
  if (paymentMethod !== 'COD') {
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
 * @param purchaseType - The type of purchase (REGULAR, ONCE_OFF, SHARED_IP)
 * @param creditApplication - Whether credit application is required
 * @param paymentMethod - The payment method (COD or AC)
 * @returns Array of mandatory document keys
 */
export function getMandatoryDocuments(
  purchaseType: PurchaseType,
  creditApplication: boolean,
  paymentMethod?: PaymentMethod | string | null
): string[] {
  // Base mandatory documents
  let mandatoryDocs = [
    'cipcCertificate',      // CIPC Certificate (Company Registration)
    'bbbeeScorecard',       // BBBEE Scorecard Report or Affidavit
    'taxClearance',         // Tax Clearance Certificate
    'bankConfirmation',     // Bank Confirmation Letter
  ]

  // Add NDA only for SHARED_IP purchase type (and only if payment method is NOT COD)
  if (purchaseType === 'SHARED_IP' && paymentMethod !== 'COD') {
    mandatoryDocs.push('nda')                  // Non-Disclosure Agreement
  }

  // Add Credit Application only if payment method is NOT COD
  if (paymentMethod !== 'COD') {
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
    'bbbeeScorecard': 'BBBEE Scorecard Report or Affidavit',
    'taxClearance': 'Tax Clearance Certificate',
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
 * @param purchaseType - The type of purchase
 * @param creditApplication - Whether credit application is required
 * @param paymentMethod - The payment method (COD or AC)
 * @returns Whether the document is mandatory
 */
export function isDocumentMandatory(
  key: string,
  purchaseType: PurchaseType,
  creditApplication: boolean,
  paymentMethod?: PaymentMethod | string | null
): boolean {
  const mandatoryDocs = getMandatoryDocuments(purchaseType, creditApplication, paymentMethod)
  return mandatoryDocs.includes(key)
}
